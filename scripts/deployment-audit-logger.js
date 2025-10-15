const fs=require('fs'),path=require('path');
const state='.kiro/deployment-history/.current.json';
fs.mkdirSync(path.dirname(state),{recursive:true});
const cmd=process.argv[2]||'init';
if(cmd==='init'){
  const run={id:Date.now().toString(),startedAt:new Date().toISOString(),events:[]};
  fs.writeFileSync(state,JSON.stringify(run,null,2));
  console.log('audit: init');
}else if(cmd==='complete'){
  if(!fs.existsSync(state)){console.log('audit: no state, skipping');process.exit(0)}
  const run=JSON.parse(fs.readFileSync(state,'utf8'));
  run.completedAt=new Date().toISOString();
  const dir=path.join('.kiro/deployment-history',run.id);
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'audit.json'),JSON.stringify(run,null,2));
  fs.rmSync(state);
  console.log('audit: complete ->',dir);
}else{
  console.log('audit: unknown cmd, skipping');
}
