const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix 1: Search bars
  content = content.replace(
    /className="block w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none"/g,
    'className="block w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-slate-400 dark:placeholder-slate-500"'
  );

  // Fix 2: Modal inputs/selects/textareas
  content = content.replace(
    /className="mt-1 block w-full border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/g,
    'className="mt-1 block w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-400 dark:placeholder-slate-500"'
  );

  // Fix 3: Select dropdown in filters
  content = content.replace(
    /className="appearance-none inline-flex items-center pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:bg-slate-900\/50 transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"/g,
    'className="appearance-none inline-flex items-center pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"'
  );

  // Fix 4: Clean up bad regex artifacts from earlier
  content = content.replace(/dark:bg-slate-900\/50\/50/g, 'dark:bg-slate-800/50');
  content = content.replace(/dark:bg-slate-900\/50 dark:bg-slate-900\/50/g, 'dark:bg-slate-800/50');
  content = content.replace(/dark:bg-slate-900\/50 dark:bg-slate-900/g, 'dark:bg-slate-800/50');

  // Fix 5: Some search bars might have "dark:text-white" injected badly from my previous script, 
  // wait, the previous script didn't target inputs directly.
  
  fs.writeFileSync(filePath, content);
}
console.log('Fixed inputs in all pages!');
