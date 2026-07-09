import fs from 'fs';
import dotenv from 'dotenv';
import Papa from 'papaparse';
import { extractBatch } from './services/extractService.js';

dotenv.config();

async function runHardCSVTest() {
  const filePath = "C:\\Users\\rosha\\Downloads\\groweasy_test_hard.csv";
  console.log(`[Test] Reading hard CSV file from: ${filePath}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`[Test] ❌ File not found at path: ${filePath}`);
    return;
  }

  const csvContent = fs.readFileSync(filePath, 'utf-8');
  
  Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    complete: async (results) => {
      const headers = results.meta.fields || [];
      const rows = results.data || [];
      
      console.log(`[Test] Parsed ${rows.length} rows and ${headers.length} columns.`);
      console.log(`[Test] Sending to Groq AI in batches of 20...`);
      
      try {
        const mappedRecords = [];
        const BATCH_SIZE = 20;
        
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batchRows = rows.slice(i, i + BATCH_SIZE);
          console.log(`[Test] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
          const batchResult = await extractBatch(headers, batchRows);
          mappedRecords.push(...batchResult);
        }
        
        console.log("\n[Test] Mapped CRM Records:\n");
        console.log(JSON.stringify(mappedRecords, null, 2));
        
        // Print Summary stats
        const imported = mappedRecords.filter(r => r.status === 'imported');
        const skipped = mappedRecords.filter(r => r.status === 'skipped');
        console.log(`\n[Test] Summary:`);
        console.log(`- Total Rows: ${rows.length}`);
        console.log(`- Imported: ${imported.length}`);
        console.log(`- Skipped: ${skipped.length}`);
        
        console.log("\n[Test] Checking specific validation cases:");
        
        // Check 1: PRIYA SINGH Normalization
        const priya = imported.find(r => r.mapped_record && r.mapped_record.email === 'priya.singh@example.com');
        if (priya) {
          console.log(`- PRIYA SINGH Casing: "${priya.mapped_record.name}" (Expected: "Priya Singh")`);
          console.log(`- PRIYA SINGH Status: "${priya.mapped_record.crm_status}" (Expected: "SALE_DONE")`);
          console.log(`- PRIYA SINGH Data Source (Facebook Ads): "${priya.mapped_record.data_source}" (Expected: "")`);
        }
        
        // Check 2: Polluted Row 10 (which has 9432109876 in the CSV)
        const phonePolluted = imported.find(r => r.mapped_record && r.mapped_record.mobile_without_country_code === '9432109876');
        if (phonePolluted) {
          console.log(`- Phone only record Name: "${phonePolluted.mapped_record.name}" (Expected: null or empty)`);
          console.log(`- Phone only record Email: "${phonePolluted.mapped_record.email}" (Expected: null or empty)`);
        }

        // Check 3: Handover Time / possession_time
        const sarah = imported.find(r => r.mapped_record && r.mapped_record.email === 'sarah.johnson@example.com');
        if (sarah) {
          console.log(`- Sarah Possession: "${sarah.mapped_record.possession_time}" (Expected: "Ready Now")`);
          console.log(`- Sarah Note contains possession: ${sarah.mapped_record.crm_note && sarah.mapped_record.crm_note.includes("Ready Now") ? "Yes" : "No"} (Expected: No)`);
          console.log(`- Sarah Description contains possession: ${sarah.mapped_record.description && sarah.mapped_record.description.includes("Ready Now") ? "Yes" : "No"} (Expected: No)`);
        }
        
      } catch (err) {
        console.error("[Test] ❌ Error running extraction:", err);
      }
    },
    error: (err) => {
      console.error("[Test] ❌ Error parsing CSV:", err);
    }
  });
}

runHardCSVTest();
