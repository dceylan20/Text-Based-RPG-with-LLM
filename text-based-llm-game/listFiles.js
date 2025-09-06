const fs = require('fs');
const path = require('path');

function listFiles(dir, indent = '') {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      console.log(`${indent}📁 ${item}/`);
      listFiles(fullPath, indent + '  ');
    } else {
      console.log(`${indent}📄 ${item}`);
    }
  }
}

// Proje kök dizininden çalıştır
const rootDir = '.'; // veya __dirname
console.log('📦 Proje Dosya Yapısı:\n');
listFiles(rootDir);
