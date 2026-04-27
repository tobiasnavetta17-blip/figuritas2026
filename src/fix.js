import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

const filePath = 'src/App.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');
console.log('Total lines:', lines.length);

const errors = [];

// Find anchor 1: supabase.auth.getSession().then
const getSessionIdx = lines.findIndex(l => l.includes('supabase.auth.getSession().then(async'));
console.log('getSession at line', getSessionIdx + 1, ':', lines[getSessionIdx]?.trim());
if (getSessionIdx < 0) errors.push('getSession not found');

// Find anchor 2: return () => subscription.unsubscribe()
const returnIdx = lines.findIndex((l, i) => i > getSessionIdx && l.includes('subscription.unsubscribe()'));
console.log('return/unsubscribe at line', returnIdx + 1, ':', lines[returnIdx]?.trim());
if (returnIdx < 0) errors.push('subscription.unsubscribe not found');

if (errors.length > 0) { console.error('ERRORS:', errors); process.exit(1); }

// Detect indent
const indent = lines[getSessionIdx].match(/^(\s*)/)[1];
console.log('Detected indent:', JSON.stringify(indent));

// Validate the return line looks as expected
if (!lines[returnIdx].includes('return () =>')) {
  console.error('ERROR: return line does not look right:', lines[returnIdx]);
    process.exit(1);
    }

    // Apply from BOTTOM to TOP

    // FIX 2: Change return line to also clear timeout
    const oldReturn = lines[returnIdx];
    const newReturn = indent + 'return () => { clearTimeout(timeoutId); subscription.unsubscribe(); };';
    lines[returnIdx] = newReturn;
    console.log('FIX2: changed return line', returnIdx + 1);
    console.log('  was:', oldReturn.trim());
    console.log('  now:', newReturn.trim());

    // FIX 1: Insert setTimeout before getSession line
    const newTimeoutLine = indent + 'const timeoutId = setTimeout(() => setAuthLoading(false), 3000);';
    lines.splice(getSessionIdx, 0, newTimeoutLine);
    console.log('FIX1: inserted setTimeout before line', getSessionIdx + 1);

    console.log('Total lines after:', lines.length);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log('DONE - wrote', filePath);
    