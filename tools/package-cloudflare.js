/* Copy an explicit runtime allowlist without modifying any source files. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public');
const destination = path.join(root, 'cloudflare-pages');
const reportDir = path.join(__dirname, 'cloudflare-qa');
const files = ['index.html','404.html','favicon.svg','site.webmanifest','robots.txt','sitemap.xml','_headers','assets/css/main.css','assets/js/data.js','assets/js/app.js','assets/img/og.png'];
assert(!fs.existsSync(destination), 'Destination already exists; refuse to overwrite.');
const digest = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const walk = dir => fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
const before = Object.fromEntries(walk(source).map(p => [path.relative(source,p),digest(p)]));
fs.mkdirSync(destination);
for (const file of files) {
 const out = path.join(destination,file);
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.copyFileSync(path.join(source,file),out);
 assert.equal(digest(out),before[file.split('/').join(path.sep)]);
}
const after = Object.fromEntries(walk(source).map(p => [path.relative(source,p),digest(p)]));
assert.deepEqual(after,before);
fs.mkdirSync(reportDir,{recursive:true});
const report = {folder:destination,sourceUnchanged:true,files:files.map(file=>({file,bytes:fs.statSync(path.join(destination,file)).size,sha256:digest(path.join(destination,file))})),excluded:walk(source).map(p=>path.relative(source,p).replaceAll('\\','/')).filter(p=>!files.includes(p))};
fs.writeFileSync(path.join(reportDir,'package-manifest.json'),JSON.stringify(report,null,2));
/* Reuse the existing checks against the package, keeping old test outputs intact. */
let browser = fs.readFileSync(path.join(__dirname,'browser-check.js'),'utf8');
browser=browser.replace("path.resolve(__dirname,'..')","path.resolve(__dirname,'../..')").replaceAll("'tools/screens'","'tools/cloudflare-qa/screens'").replaceAll("'tools/browser-results.json'","'tools/cloudflare-qa/browser-results.json'").replaceAll("'public/index.html'","'cloudflare-pages/index.html'");
fs.mkdirSync(path.join(reportDir,'screens'),{recursive:true});
fs.writeFileSync(path.join(reportDir,'browser-check.js'),browser);
let data = fs.readFileSync(path.join(__dirname,'check-data.js'),'utf8').replace("path.resolve(__dirname,'..')","path.resolve(__dirname,'../..')").replaceAll("'public'","'cloudflare-pages'").replaceAll("'public/","'cloudflare-pages/");
fs.writeFileSync(path.join(reportDir,'check-data.js'),data);
console.log(`PASS: ${files.length} runtime files copied, ${report.files.reduce((sum,f)=>sum+f.bytes,0)} bytes. Source SHA-256 unchanged.`);
console.log('Excluded: '+report.excluded.join(', ')+'; all tools, screenshots, browser profiles and project documentation.');
