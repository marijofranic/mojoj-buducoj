const fs = require('node:fs');
const file = 'index.html';
const html = fs.readFileSync(file, 'utf8');
const tag = '<script src="/free-narrator.js"></script>';
if (!html.includes(tag)) {
  if (!html.includes('</body>')) throw new Error('HTML body closing tag missing');
  fs.writeFileSync(file, html.replace('</body>', tag + '</body>'));
}
console.log('Free narrator enabled for production build');
