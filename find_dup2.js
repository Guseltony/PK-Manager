const fs = require('fs');

let input = fs.readFileSync('frontend/src/features/dreams/DreamDetailView.tsx', 'utf8');
let lines = input.split('\n');

const milestonesIdx = [];
lines.forEach((l, i) => { if (l.includes('activeTab === "milestones"')) milestonesIdx.push(i); });

const knowledgeIdx = [];
lines.forEach((l, i) => { if (l.includes('activeTab === "knowledge"')) knowledgeIdx.push(i); });

const tasksIdx = [];
lines.forEach((l, i) => { if (l.includes('{dream.tasks && dream.tasks.length > 0 ? (')) tasksIdx.push(i); });

console.log('Milestones:', milestonesIdx);
console.log('Knowledge:', knowledgeIdx);
console.log('Tasks:', tasksIdx);
