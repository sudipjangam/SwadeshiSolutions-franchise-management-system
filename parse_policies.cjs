const fs = require('fs');
const basePath = 'C:/Users/janga/.gemini/antigravity/brain/9bf2b15a-607a-4784-b091-62720b13da8b/.system_generated/steps/';
const files = ['313', '316', '319', '322', '325'];
let allPolicies = [];

for (const f of files) {
  try {
    const raw = fs.readFileSync(basePath + f + '/output.txt', 'utf8');
    const parsed = JSON.parse(raw);
    const match = parsed.result.match(/\[\{"all_policies":"(.*)"\}\]/s);
    if (match) {
      let sql = match[1]
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
      allPolicies.push(sql);
    }
  } catch (e) {
    console.error('Error processing file', f, e.message);
  }
}

const output = allPolicies.join('\n');
const count = (output.match(/CREATE POLICY/g) || []).length;
fs.writeFileSync('E:/Swadeshi Solutions/SwadeshiSolutions-franchise-management-system/dev_policies.sql', output);
console.log(`Extracted ${count} policies, ${output.length} chars`);
