const fs = require('fs');

// Fix getDatabase to getDb in user-stats-repository.ts
const filePath = 'src/firebase/user-stats-repository.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of getDatabase with getDb
content = content.replace(/getDatabase\(\)/g, 'getDb()');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed getDatabase method calls in user-stats-repository.ts');
