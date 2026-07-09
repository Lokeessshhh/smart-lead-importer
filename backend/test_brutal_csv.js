import fs from 'fs';
import dotenv from 'dotenv';
import Papa from 'papaparse';
import { extractBatch } from './services/extractService.js';

dotenv.config();

async function runBrutalCSVTest() {
  const filePath = "C:\\Users\\rosha\\Downloads\\groweasy_test_brutal.csv";
  console.log(`[Test] Reading brutal CSV file from: ${filePath}...`);

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
        
        console.log("\n[Test] Checking specific edge cases from groweasy_test_brutal.csv:");
        
        // 1. Vikram Malhotra Name and Status check
        const vikram = imported.find(r => r.mapped_record && r.mapped_record.email === 'vikram.malhotra@gmail.com');
        if (vikram) {
          console.log(`- Vikram Malhotra Name Casing & Prefix Clean: "${vikram.mapped_record.name}" (Expected: "Vikram Malhotra")`);
          console.log(`- Vikram Malhotra Status: "${vikram.mapped_record.crm_status}" (Expected: "GOOD_LEAD_FOLLOW_UP" or similar enum)`);
        }
        
        // 2. Pooja Sharma-Gupta Title Prefix check
        const pooja = imported.find(r => r.mapped_record && r.mapped_record.email && r.mapped_record.email.includes('dr.pooja@gmail.com'));
        if (pooja) {
          console.log(`- Pooja Sharma-Gupta Name Casing & Prefix Clean: "${pooja.mapped_record.name}" (Expected: "Pooja Sharma-Gupta")`);
        }
        
        // 3. Harshvardhan Singhania Jr. Title Suffix check
        const harsh = imported.find(r => r.mapped_record && r.mapped_record.email === 'harsh.s@singhania.com');
        if (harsh) {
          console.log(`- Harshvardhan Singhania Jr. Name Suffix Clean: "${harsh.mapped_record.name}" (Expected: "Harshvardhan Singhania")`);
        }

        // 4. Verification that non-allowed sources are empty (Facebook, Eden Park, etc.)
        if (vikram) {
          console.log(`- Vikram Data Source (Facebook): "${vikram.mapped_record.data_source}" (Expected: "")`);
        }
        const lakshman = imported.find(r => r.mapped_record && r.mapped_record.name && r.mapped_record.name.includes("Lakshman Rao"));
        if (lakshman) {
          console.log(`- Lakshman Rao Data Source (Sarjapur Plots): "${lakshman.mapped_record.data_source}" (Expected: "sarjapur_plots")`);
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

runBrutalCSVTest();
