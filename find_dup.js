const fs = require('fs');

let input = fs.readFileSync('frontend/src/features/dreams/DreamDetailView.tsx', 'utf8');
let lines = input.split('\n');

const indexes = [];
lines.forEach((l, i) => {
  if (l.includes('activeTab === "milestones"')) indexes.push(i);
});

console.log(indexes);
