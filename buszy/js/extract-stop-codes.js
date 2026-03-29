const fs = require('fs');
const filePath = 'd:\\GitHub\\nrfz-dev\\buszy\\json\\StopCode.txt';
const jsonPath = 'd:\\GitHub\\nrfz-dev\\buszy\\json\\stop-codes.json';

const content = fs.readFileSync(filePath, 'utf8');
const allCodes = content.match(/\b\d{5}\b/g);
const seen = new Set();
const codes = [];

// Iterate in reverse to get last occurrence of each code
for (let i = allCodes.length - 1; i >= 0; i--) {
  if (!seen.has(allCodes[i])) {
    codes.unshift(allCodes[i]);
    seen.add(allCodes[i]);
  }
}

// Save as JSON
const jsonData = { st: codes };
fs.writeFileSync(jsonPath, JSON.stringify(jsonData));

console.log(`Extracted ${codes.length} unique stop codes`);
console.log(`Saved to: ${jsonPath}`);

// node extract-stop-codes.js