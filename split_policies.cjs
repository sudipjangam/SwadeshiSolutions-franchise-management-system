const fs = require('fs');
const content = fs.readFileSync('E:/Swadeshi Solutions/SwadeshiSolutions-franchise-management-system/dev_policies.sql', 'utf8');

// Split on "CREATE POLICY" keeping the delimiter
const policies = content.split(/(?=CREATE POLICY )/g).filter(p => p.trim());
console.log(`Total policies: ${policies.length}`);

// Group into chunks of ~40 policies
const chunkSize = 40;
const chunks = [];
for (let i = 0; i < policies.length; i += chunkSize) {
  chunks.push(policies.slice(i, i + chunkSize).join('\n'));
}

// Write chunks to files
for (let i = 0; i < chunks.length; i++) {
  fs.writeFileSync(`E:/Swadeshi Solutions/SwadeshiSolutions-franchise-management-system/policy_chunk_${i}.sql`, chunks[i]);
  console.log(`Chunk ${i}: ${(chunks[i].match(/CREATE POLICY/g) || []).length} policies, ${chunks[i].length} chars`);
}
