const {execSync}=require('child_process');
function sh(c){ return execSync(c,{stdio:['ignore','pipe','pipe']}).toString().trim(); }
try{ console.log('STS:', sh('aws sts get-caller-identity')); }catch(e){ console.error('STS failed'); process.exit(1); }
try{ console.log('S3:', sh(`aws s3 ls s3://${process.env.S3_BUCKET}`)); }catch(e){ console.warn('S3 ls failed (may be empty)'); }
try{ console.log('CF:', sh(`aws cloudfront get-distribution --id ${process.env.CF_DISTRIBUTION_ID}`)); }catch(e){ console.warn('CF get-distribution failed'); }
console.log('Security validation finished');
