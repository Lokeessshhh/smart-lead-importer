import dotenv from 'dotenv';
import { extractBatch } from './services/extractService.js';

dotenv.config();

async function runTest() {
  console.log("[Test] Starting backend AI mapping test with edge cases...");
  
  const headers = [
    "Registration Date", 
    "Full Name", 
    "Contact Mail", 
    "Phone Number", 
    "Organization Name", 
    "Status Info",
    "Extra Email",
    "Extra Phone",
    "Source Info",
    "Handover Time"
  ];
  
  const rows = [
    {
      "Registration Date": "2026-05-13 14:20:48",
      "Full Name": "John Doe",
      "Contact Mail": "john.doe@example.com",
      "Phone Number": "+91 9876543210",
      "Organization Name": "GrowEasy",
      "Status Info": "GOOD_LEAD_FOLLOW_UP",
      "Extra Email": "john.alt@example.com",
      "Extra Phone": "9876543219",
      "Source Info": "leads_on_demand",
      "Handover Time": ""
    },
    {
      "Registration Date": "2026-06-01 10:00:00",
      "Full Name": "Jane Smith",
      "Contact Mail": "jane.smith@example.com",
      "Phone Number": "+1 555-0199",
      "Organization Name": "Tech Corp",
      "Status Info": "Interested, follow up next week",
      "Extra Email": "",
      "Extra Phone": "",
      "Source Info": "",
      "Handover Time": ""
    },
    {
      "Registration Date": "2026-06-02 12:00:00",
      "Full Name": "Skipped User",
      "Contact Mail": "",
      "Phone Number": "",
      "Organization Name": "No Contact Inc",
      "Status Info": "Bad lead",
      "Extra Email": "",
      "Extra Phone": "",
      "Source Info": "",
      "Handover Time": ""
    },
    // Edge case 1: Title Case normalization, spaces in status, Facebook source and Handover Time
    {
      "Registration Date": "2026-05-13 14:35:22",
      "Full Name": "Dr. PRIYA SINGH",
      "Contact Mail": "priya.singh@example.com",
      "Phone Number": "+91 9876543213",
      "Organization Name": "Enterprise Corp",
      "Status Info": "SALE DONE",
      "Extra Email": "",
      "Extra Phone": "",
      "Source Info": "Facebook Ads",
      "Handover Time": "Ready Now"
    },
    // Edge case 2: Phone number supplied in name and email field
    {
      "Registration Date": "2026-05-13 14:40:00",
      "Full Name": "9432109876",
      "Contact Mail": "9432109876",
      "Phone Number": "",
      "Organization Name": "Mobile Only Co",
      "Status Info": "GOOD LEAD FOLLOW UP",
      "Extra Email": "",
      "Extra Phone": "",
      "Source Info": "",
      "Handover Time": ""
    }
  ];

  try {
    const results = await extractBatch(headers, rows);
    console.log("\n[Test] Test mapping results received:\n");
    console.log(JSON.stringify(results, null, 2));
    
    const imported = results.filter(r => r.status === 'imported');
    const skipped = results.filter(r => r.status === 'skipped');
    
    console.log(`\n[Test] Assertions check:`);
    console.log(`- Imported records count: ${imported.length} (Expected: 4)`);
    console.log(`- Skipped records count: ${skipped.length} (Expected: 1)`);
    
    // Check Edge Case 1: Name Casing, Underscored Status, and Source Info Blanking
    const priyaResult = imported.find(r => r.mapped_record && r.mapped_record.email === "priya.singh@example.com");
    let priyaPassed = false;
    let handoverPassed = false;
    if (priyaResult) {
      const name = priyaResult.mapped_record.name;
      const status = priyaResult.mapped_record.crm_status;
      const ds = priyaResult.mapped_record.data_source;
      const possession = priyaResult.mapped_record.possession_time;
      const note = priyaResult.mapped_record.crm_note || "";
      const desc = priyaResult.mapped_record.description || "";
      
      console.log(`- PRIYA SINGH Name: "${name}" (Expected: "Priya Singh")`);
      console.log(`- SALE DONE Status: "${status}" (Expected: "SALE_DONE")`);
      console.log(`- Facebook Ads Data Source: "${ds}" (Expected: "")`);
      console.log(`- Handover Time Possession mapping: "${possession}" (Expected: "Ready Now")`);
      console.log(`- Handover Time not in note: ${!note.includes("Ready Now") ? "Yes" : "No"} (Expected: Yes)`);
      console.log(`- Handover Time not in description: ${!desc.includes("Ready Now") ? "Yes" : "No"} (Expected: Yes)`);

      priyaPassed = (name === "Priya Singh" && status === "SALE_DONE" && ds === "");
      handoverPassed = (possession === "Ready Now" && !note.includes("Ready Now") && !desc.includes("Ready Now"));
    }

    // Check John Doe source retention
    const johnResult = imported.find(r => r.mapped_record && r.mapped_record.email === "john.doe@example.com");
    let johnSourcePassed = false;
    if (johnResult) {
      const ds = johnResult.mapped_record.data_source;
      console.log(`- John Doe Data Source: "${ds}" (Expected: "leads_on_demand")`);
      johnSourcePassed = (ds === "leads_on_demand");
    }

    // Check Edge Case 2: Phone number pollution in name/email
    const pollutedResult = imported.find(r => r.mapped_record && r.mapped_record.mobile_without_country_code === "9432109876");
    let pollutionCleared = false;
    if (pollutedResult) {
      const name = pollutedResult.mapped_record.name;
      const email = pollutedResult.mapped_record.email;
      const status = pollutedResult.mapped_record.crm_status;
      console.log(`- Polluted Name field: "${name}" (Expected: null or empty)`);
      console.log(`- Polluted Email field: "${email}" (Expected: null or empty)`);
      console.log(`- GOOD LEAD FOLLOW UP Status: "${status}" (Expected: "GOOD_LEAD_FOLLOW_UP")`);
      pollutionCleared = (!name && !email && status === "GOOD_LEAD_FOLLOW_UP");
    }

    if (imported.length === 4 && skipped.length === 1 && priyaPassed && johnSourcePassed && pollutionCleared && handoverPassed) {
      console.log("\n[Test] ✅ ALL TESTS PASSED!");
    } else {
      console.error("\n[Test] ❌ Test assertions failed.");
    }
  } catch (error) {
    console.error("\n[Test] ❌ Test failed with error:", error);
  }
}

runTest();
