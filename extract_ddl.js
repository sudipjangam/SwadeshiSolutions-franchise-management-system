const fs = require('fs');
const raw = fs.readFileSync('C:/Users/janga/.gemini/antigravity/brain/9bf2b15a-607a-4784-b091-62720b13da8b/.system_generated/steps/158/output.txt', 'utf8');
const parsed = JSON.parse(raw);

// Extract the all_ddl from the untrusted-data wrapper
const dataMatch = parsed.result.match(/\[(\{.*\})\]/s);
if (dataMatch) {
  const arr = JSON.parse(dataMatch[1].replace(/\n/g, '\\n'));
  const sql = arr.all_ddl;
  fs.writeFileSync('E:/Swadeshi Solutions/SwadeshiSolutions-franchise-management-system/dev_schema_tables.sql', sql);
  console.log('Written', sql.length, 'chars');
} else {
  console.log('No match found');
}
