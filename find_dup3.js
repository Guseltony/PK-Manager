const fs = require('fs');

let input = fs.readFileSync('frontend/src/features/dreams/DreamDetailView.tsx', 'utf8');
let lines = input.split('\n');

const intelligenceIdx = [];
lines.forEach((l, i) => { if (l.includes('activeTab === "intelligence"')) intelligenceIdx.push(i); });

console.log('Intelligence:', intelligenceIdx);
