import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const html=await readFile(resolve(root,'dist/index.html'),'utf8');
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const data=JSON.parse(await readFile(resolve(root,'data/history-catalogue.json'),'utf8'));
assert.equal(data.people.length,16);assert.equal(new Set(data.people.map(p=>p.id)).size,16);
assert.equal(data.people.reduce((n,p)=>n+p.yearList.length,0),32);
const embedded=JSON.parse(html.match(/const catalogue=(\[.*?\]);\nfunction yearSpan/s)[1]);assert.deepEqual(embedded,data.people);
for(const p of data.people){assert.ok(p.refUrl.startsWith('https://'));assert.ok(p.postVersions.length);assert.ok(p.name);}
for(const [,code] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(code);
assert.ok(html.includes(`data-version>v${pkg.version}`));assert.ok(!html.includes('__APP_VERSION__'));
assert.equal((html.match(/cloud\.umami\.is\/script\.js/g)||[]).length,1);
assert.ok(html.includes('https://github.com/holynova/dihao'));assert.ok(html.includes('https://dihao.xiaosang.cc/'));
const files=await readdir(resolve(root,'dist'));assert.deepEqual(files.sort(),['assets','data','index.html']);
console.log('Release checks passed: catalogue integrity, data parity, JavaScript syntax, version, links and asset boundary.');
