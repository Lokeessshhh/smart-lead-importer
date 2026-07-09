import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
const modelName = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

const groq = new Groq({ apiKey: apiKey || 'dummy_key' });

/**
 * Call Groq completions API with exponential backoff retry logic.
 */
async function callGroqWithRetry(params, maxRetries = 5) {
  let attempt = 0;
  let delay = 1500; // start with 1.5 seconds delay

  while (attempt < maxRetries) {
    try {
      const completion = await groq.chat.completions.create(params);
      return completion;
    } catch (error) {
      attempt++;
      const isRateLimit = 
        error.status === 429 || 
        (error.message && error.message.toLowerCase().includes('rate limit')) ||
        (error.message && error.message.toLowerCase().includes('429'));

      if (isRateLimit && attempt < maxRetries) {
        // Exponential backoff with jitter
        const jitter = Math.random() * 300;
        const currentDelay = delay * Math.pow(2, attempt - 1) + jitter;
        console.warn(`[Groq] Rate limit hit. Retrying attempt ${attempt}/${maxRetries} in ${Math.round(currentDelay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      } else {
        console.error(`[Groq] Error on attempt ${attempt}/${maxRetries}:`, error.message || error);
        throw error;
      }
    }
  }
}

/**
 * Helper to clean prefixes and suffixes from names
 * @param {string} name 
 * @returns {string}
 */
function cleanName(name) {
  if (!name) return name;
  let cleaned = name
    .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.|Dr|Mr|Mrs|Ms|Prof)\s+/i, '')
    .trim();
  
  // Remove suffix titles at the end (e.g. ", Jr.", " Sr.")
  cleaned = cleaned
    .replace(/,\s*(Jr\.|Sr\.|Jr|Sr)$/i, '')
    .replace(/\s+(Jr\.|Sr\.|Jr|Sr)$/i, '')
    .trim();
  
  return cleaned;
}

/**
 * Extract CRM records from a list of raw rows using Groq LLM.
 * @param {Array<string>} headers - Headers of the CSV
 * @param {Array<Object>} rows - Array of CSV rows as key-value pairs
 * @returns {Promise<Array<Object>>} - The mapped and filtered records
 */
export async function extractBatch(headers, rows) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not defined in the backend environment variables. Please check your config.");
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  // Prepend row index to each row to prevent row/note contamination
  const rowsWithIndex = rows.map((row, index) => ({
    __row_index: index,
    ...row
  }));

  const systemPrompt = `You are an AI-powered CRM data ingestion assistant for GrowEasy.
Your task is to map raw contact/lead records into the standard GrowEasy CRM format.

GrowEasy CRM Target Fields:
1. "created_at": Date/time when the lead was created. MUST be parseable by JavaScript's "new Date(created_at)" (e.g. "YYYY-MM-DD HH:MM:SS" or ISO 8601). If missing or invalid, default to the current timestamp.
2. "name": Full name of the lead. Normalize the casing of names to Title Case / Proper Casing (e.g. "PRIYA SINGH" should be mapped to "Priya Singh"). Do not map phone numbers or numerical strings to the name field; if the input name is a phone number or only digits, set the name field to null.
3. "email": Primary email address. Email must contain an "@" symbol. Never place phone numbers or only-digit strings in this column.
4. "country_code": Country code (e.g. "+91", "+1").
5. "mobile_without_country_code": Mobile number excluding country code.
6. "company": Company name.
7. "city": City name.
8. "state": State name.
9. "country": Country name.
10. "lead_owner": Lead owner's email address or name.
11. "crm_status": crm_status MUST be one of these exact strings with underscores — no spaces, no variations:
    - GOOD_LEAD_FOLLOW_UP
    - DID_NOT_CONNECT
    - BAD_LEAD
    - SALE_DONE

    Return crm_status exactly as shown above. Never use spaces. Use underscores only.
    Example of expected JSON mapping output: { "crm_status": "GOOD_LEAD_FOLLOW_UP" }

    Never output "UNKNOWN", "NEW", "PENDING" or any value other than these four. If not specified, or if the input status cannot be mapped confidently to one of these four, you MUST default to "GOOD_LEAD_FOLLOW_UP".
12. "crm_note": Notes or remarks. Include follow-up notes, additional context, and extra emails/phone numbers that did not fit the primary fields.
13. "data_source": Lead source. MUST be strictly one of:
    - "leads_on_demand"
    - "meridian_tower"
    - "eden_park"
    - "varah_swamy"
    - "sarjapur_plots"
    If the source in the CSV is Facebook, Google, LinkedIn, Organic, or any other value not in this exact list, you MUST leave it blank (empty string ""). Never output other source names.
14. "possession_time": Property possession time (if applicable, e.g. for real estate). Map handover timelines or possession columns (e.g. "Ready Now", "Ready", "Immediate", "2 years", "1 Year") here.
15. "description": Any additional information or description.

CRITICAL MAPPING RULES:
1. No cross-field pollution: Do not place a phone number in the "email" or "name" fields. Keep them blank/null if no correct value is available.
2. Recover misplaced phone numbers: If a phone number / mobile number is incorrectly supplied in the "name" or "email" columns of the CSV (and the actual mobile column is empty), extract that number into the "mobile_without_country_code" field. Do not discard it. Set the "name" and "email" fields to null/blank accordingly so they don't remain polluted.
3. Name Casing: Normalize names to Title Case (Proper Case), lowercase letters after uppercase first letters (e.g. "RAJESH PATEL" -> "Rajesh Patel").
4. Underscored Statuses: Keep status string underscores intact. Never replace underscores with spaces.
5. Handover / Possession Info: Columns indicating possession timeline or handover time (e.g. 'Ready Now', 'Ready', 'Immediate', '2 years') belong strictly in "possession_time". Never copy or stuff these possession values into "crm_note" or "description".
6. Do not duplicate values: Ensure that the same note or text is not repeated in both the "crm_note" and "description" fields. Keep them distinct. If you place a text in the "description" field, leave it out of "crm_note".
7. Multiple Emails: Set the first email address in the "email" field. Append any additional email addresses to the "crm_note" field.
8. Multiple Phones: Set the first mobile number in the "mobile_without_country_code" field. Append additional numbers to the "crm_note" field.
9. Skip Check: If a row has NEITHER a valid email address NOR a mobile number, you must mark it as "skipped" and provide a skip reason. Do not import it.
10. Line Breaks: Ensure the crm_note, description, etc. do not contain raw unescaped line breaks. Replace any newlines inside string values with "\\n".
11. Row Index Matching: You MUST include the "__row_index" of the input row as "row_index" in the output record.
12. JSON mode: You must reply with a valid JSON object containing a "records" array. Do not include markdown codeblocks or text before/after.

Each record in the returned "records" array must have this structure:
{
  "row_index": number (must match the __row_index of the input row exactly),
  "status": "imported" | "skipped",
  "skip_reason": "string describing reason if skipped, or null",
  "mapped_record": {
    "created_at": "YYYY-MM-DD HH:MM:SS or ISO string",
    "name": "string",
    "email": "string",
    "country_code": "string",
    "mobile_without_country_code": "string",
    "company": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "lead_owner": "string",
    "crm_status": "GOOD_LEAD_FOLLOW_UP" | "DID_NOT_CONNECT" | "BAD_LEAD" | "SALE_DONE",
    "crm_note": "string",
    "data_source": "leads_on_demand" | "meridian_tower" | "eden_park" | "varah_swamy" | "sarjapur_plots" | "",
    "possession_time": "string",
    "description": "string"
  }
}`;

  const userPrompt = `CSV Columns: ${JSON.stringify(headers)}

Raw Rows to Map (with __row_index prepended):
${JSON.stringify(rowsWithIndex, null, 2)}

Perform the extraction and return the JSON object matching the requested schema. Ensure you apply the rules strictly and match the row_index for each row.`;

  const response = await callGroqWithRetry({
    model: modelName,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1, // low temperature for precise, non-creative extraction
    response_format: { type: "json_object" },
    max_completion_tokens: 4096
  });

  const content = response.choices[0].message.content;
  try {
    const result = JSON.parse(content);
    const parsedRecords = result.records || [];

    // Map and align back to input indices to prevent row cross-contamination
    const alignedRecords = new Array(rows.length);

    const STATUS_MAP = {
      "GOOD LEAD FOLLOW UP": "GOOD_LEAD_FOLLOW_UP",
      "DID NOT CONNECT": "DID_NOT_CONNECT",
      "BAD LEAD": "BAD_LEAD",
      "SALE DONE": "SALE_DONE",
      "GOOD_LEAD_FOLLOW_UP": "GOOD_LEAD_FOLLOW_UP",
      "DID_NOT_CONNECT": "DID_NOT_CONNECT",
      "BAD_LEAD": "BAD_LEAD",
      "SALE_DONE": "SALE_DONE"
    };

    const ALLOWED_SOURCES = [
      "leads_on_demand",
      "meridian_tower",
      "eden_park",
      "varah_swamy",
      "sarjapur_plots"
    ];

    parsedRecords.forEach((recWrapper) => {
      const idx = recWrapper.row_index;
      if (idx !== undefined && idx >= 0 && idx < rows.length) {
        // Apply casing and cleaning corrections on name
        if (recWrapper.mapped_record) {
          let name = recWrapper.mapped_record.name;
          if (name) {
            recWrapper.mapped_record.name = cleanName(name);
          }

          // Normalize CRM status
          let status = recWrapper.mapped_record.crm_status;
          console.log("Before map:", status);
          if (status) {
            const normalizedKey = status.toString().toUpperCase().trim().replace(/_/g, ' ');
            recWrapper.mapped_record.crm_status = STATUS_MAP[normalizedKey] || "GOOD_LEAD_FOLLOW_UP";
          } else {
            recWrapper.mapped_record.crm_status = "GOOD_LEAD_FOLLOW_UP";
          }
          console.log("After map:", recWrapper.mapped_record.crm_status);

          // Normalize and validate data source
          let ds = recWrapper.mapped_record.data_source;
          if (ds) {
            const normalizedDs = ds.toString().toLowerCase().trim().replace(/[\s-]/g, '_');
            recWrapper.mapped_record.data_source = ALLOWED_SOURCES.includes(normalizedDs) ? normalizedDs : "";
          } else {
            recWrapper.mapped_record.data_source = "";
          }
        }
        
        alignedRecords[idx] = recWrapper;
      }
    });

    // Fill in any gaps (if AI missed a row)
    for (let i = 0; i < rows.length; i++) {
      if (!alignedRecords[i]) {
        console.warn(`[Test] Row index ${i} was missing in AI output. Creating default skip record.`);
        alignedRecords[i] = {
          row_index: i,
          status: "skipped",
          skip_reason: "AI failed to return mapping for this row.",
          mapped_record: null
        };
      }
    }

    return alignedRecords;
  } catch (error) {
    console.error("Failed to parse JSON response from Groq:", content);
    throw new Error("Invalid JSON returned by Groq: " + error.message);
  }
}
