const fs = require('fs');
const basePath = 'C:/Users/janga/.gemini/antigravity/brain/9bf2b15a-607a-4784-b091-62720b13da8b/.system_generated/steps/';
const files = ['231', '232', '233', '234'];
let allFunctions = [];

for (const f of files) {
  try {
    const raw = fs.readFileSync(basePath + f + '/output.txt', 'utf8');
    const parsed = JSON.parse(raw);
    // Extract from untrusted-data wrapper
    const match = parsed.result.match(/\[(\{.*)\]/s);
    if (match) {
      // Parse the JSON array of objects
      const jsonStr = '[' + match[1] + ']';
      const items = JSON.parse(jsonStr);
      for (const item of items) {
        if (item.funcdef) {
          // Clean up the function definition
          let funcDef = item.funcdef.replace(/\r\n/g, '\n');
          allFunctions.push(funcDef);
        }
      }
    }
  } catch (e) {
    console.error('Error processing file', f, e.message);
  }
}

const output = allFunctions.join('\n\n');
fs.writeFileSync('E:/Swadeshi Solutions/SwadeshiSolutions-franchise-management-system/dev_functions.sql', output);
console.log(`Extracted ${allFunctions.length} functions, ${output.length} chars`);
