import {chromium} from '/home/box/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
import {execSync} from 'child_process';import fs from 'fs';
const BASE=process.argv[2]||'https://regulusab.github.io/bazi-site/';const OUT='/tmp/qaexp';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x='')=>R.push([c?'PASS':'FAIL',n,x]);
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
const q='?n=王小明&d=1962-08-08&t=00:10&g=1&y=2027&mn=林美麗&mg=0&md=1965-03-15&mt=09:30&pp=1&ps=2026-11-01&pe=2026-12-31&ph=1';
await p.goto(BASE+q+'#match');await p.waitForTimeout(1500);
const EXP={chart:['命盤','日主'],report:['完整論命','計算工具與方法'],daily:['逐日對照','甲寅'],year:['流年運勢','2027'],match:['合婚合盤','林美麗'],pick:['擇日','搬家']};
for(const [tab,[lab,key]] of Object.entries(EXP)){await p.click(`#tabs [data-t=${tab}]`);
 for(const k of ['docx','pdf']){const [dl]=await Promise.all([p.waitForEvent('download',{timeout:60000}).catch(()=>null),p.click(`#${tab}>.xbar [data-k=${k}]`)]);
  if(!dl){ok(`${tab} ${k} download`,false);continue;}const fn=dl.suggestedFilename();const path=`${OUT}/${tab}.${k}`;await dl.saveAs(path);
  const txt=k==='pdf'?execSync(`pdftotext -layout ${path} -`).toString():execSync(`python3 -c "import docx,sys;d=docx.Document(sys.argv[1]);print('\\n'.join([x.text for x in d.paragraphs]+[c.text for t in d.tables for r in t.rows for c in r.cells]))" ${path}`).toString();
  const good=fn.startsWith(`王小明_${lab}_`)&&fn.endsWith('.'+k)&&txt.includes('王小明')&&txt.includes(key)&&txt.includes('僅供參考');
  ok(`${tab} ${k}`,good,`${fn} ${txt.length}ch`);}}
// share link round trip
const urls={};for(const t of Object.keys(EXP))urls[t]=await p.evaluate(t=>window.__stateUrl(t),t);
await p.evaluate(()=>{delete navigator.__proto__.share;});await p.click('#tabs [data-t=match]');await p.click('#match>.xbar [data-k=share]');await p.waitForTimeout(800);const clip=await p.evaluate(()=>navigator.clipboard.readText().catch(()=>''));
ok('share button copies link',clip===urls.match,clip.slice(0,60));
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push(e.message));await p2.goto(urls.match);await p2.waitForTimeout(1500);
ok('share match round-trip',(await p2.locator('#mOut').innerText()).includes('林美麗'));await p2.goto(urls.pick);await p2.waitForTimeout(1500);
ok('share pick round-trip',(await p2.locator('#pOut').innerText()).includes('2026-11-01 至 2026-12-31')&&await p2.inputValue('#pP')==='1');
await p2.goto(urls.year);await p2.waitForTimeout(1200);ok('share year round-trip',(await p2.locator('#lyOut').innerText()).includes('2027'));
ok('no page errors',errs.length===0,errs.join('|'));
// lazy: initial load should not fetch pdfmake/font
const p3=await ctx.newPage();const reqs=[];p3.on('request',r=>reqs.push(r.url()));await p3.goto(BASE);await p3.waitForTimeout(1500);ok('lazy load (no pdfmake/font/docx initially)',!reqs.some(u=>/pdfmake|NotoSansTC|dist-/.test(u)),reqs.filter(u=>/assets|fonts/.test(u)).map(u=>u.split('/').pop()).join(','));
await b.close();R.forEach(r=>console.log(r.join('  ')));
