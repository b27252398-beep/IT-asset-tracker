const fs = require('fs');
const path = require('path');

const dirs = ['frontend/src/pages', 'frontend/src/components'];

const replacements = [
  ['bg-white', 'bg-white dark:bg-slate-900'],
  ['bg-slate-50', 'bg-slate-50 dark:bg-slate-900/50'],
  ['bg-slate-100', 'bg-slate-100 dark:bg-slate-800'],
  ['text-slate-900', 'text-slate-900 dark:text-white'],
  ['text-slate-800', 'text-slate-800 dark:text-slate-100'],
  ['text-slate-700', 'text-slate-700 dark:text-slate-200'],
  ['text-slate-600', 'text-slate-600 dark:text-slate-300'],
  ['text-slate-500', 'text-slate-500 dark:text-slate-400'],
  ['border-slate-200', 'border-slate-200 dark:border-slate-700'],
  ['border-slate-300', 'border-slate-300 dark:border-slate-600'],
  ['border-slate-100', 'border-slate-100 dark:border-slate-800']
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    for (const [light, dark] of replacements) {
      // Find the light class that is NOT followed by " dark:"
      const regex = new RegExp(`\\b${light}\\b(?!\\s+dark:)`, 'g');
      content = content.replace(regex, dark);
    }
    
    fs.writeFileSync(filePath, content);
  }
}
console.log('Dark mode classes injected into pages and components!');
