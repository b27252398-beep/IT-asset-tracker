const fs = require('fs');
const path = require('path');

const dir = 'frontend/src/pages';
const files = [
  { file: 'Approvals.tsx', arr: 'requests', item: 'req' },
  { file: 'AuditLogs.tsx', arr: 'logs', item: 'log' },
  { file: 'Consumables.tsx', arr: 'consumables', item: 'item' },
  { file: 'Locations.tsx', arr: 'facilities', item: 'fac' },
  { file: 'MaintenanceSchedules.tsx', arr: 'schedules', item: 'sched' },
  { file: 'PurchaseOrders.tsx', arr: 'orders', item: 'order' },
  { file: 'Software.tsx', arr: 'software', item: 'sw' },
  { file: 'Vendors.tsx', arr: 'vendors', item: 'vendor' },
];

for (const { file, arr, item } of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has searchTerm
  if (content.includes('searchTerm')) {
    console.log(`Skipping ${file}, already has search term.`);
    continue;
  }

  // 1. Add useState import if missing
  if (!content.includes('useState')) {
    content = content.replace(/import React from 'react';/, "import React, { useState } from 'react';");
    content = content.replace(/import {([^}]*)} from 'react';/, "import { useState, $1 } from 'react';");
  }

  // 2. Inject searchTerm state
  // Find the first line after `export default function ...() {`
  content = content.replace(
    /export default function (\w+)\(\) \{/,
    `export default function $1() {\n  const [searchTerm, setSearchTerm] = useState('');`
  );

  // 3. Update the input
  // Find the `<input type="text" placeholder="Search `
  content = content.replace(
    /(<input\s+type="text"\s+placeholder="Search [^"]+")/g,
    `$1 value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}`
  );

  // 4. Update the map
  // Replace `{arr.map((item: any) =>`
  // E.g. `{vendors.map((vendor: any) =>`
  const mapRegex = new RegExp(`{${arr}\\.map\\(\\(${item}: any\\) =>`, 'g');
  const genericFilter = `{${arr}.filter((searchItem: any) => Object.values(searchItem || {}).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))).map((${item}: any) =>`;
  content = content.replace(mapRegex, genericFilter);
  
  // also handle `{arr.map(item =>`
  const mapRegex2 = new RegExp(`{${arr}\\.map\\(${item} =>`, 'g');
  const genericFilter2 = `{${arr}.filter((searchItem: any) => Object.values(searchItem || {}).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))).map(${item} =>`;
  content = content.replace(mapRegex2, genericFilter2);

  fs.writeFileSync(filePath, content);
  console.log(`Fixed search in ${file}`);
}
