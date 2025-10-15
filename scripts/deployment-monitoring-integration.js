const fs=require('fs'),dir='.kiro/deployment-history';
if(!fs.existsSync(dir)){ console.log(JSON.stringify({totalReports:0})); process.exit(0); }
const files=fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
console.log(JSON.stringify({totalReports:files.length},null,2));
