import {chromium} from '/home/box/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
import {execSync} from 'child_process';import fs from 'fs';
const BASE=process.argv[2]||'https://regulusab.github.io/bazi-site/';const OUT='/tmp/qaglob';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x='')=>R.push([c?'PASS':'FAIL',n,x]);
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const errs=[];const pg=async(u,vp)=>{const p=await ctx.newPage();if(vp)await p.setViewportSize(vp);p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto(u);await p.waitForTimeout(1500);return p;};
const cells=async p=>(await p.locator('#gOut .gcols table').allInnerTexts()).map(t=>t.split('\n').pop().replace(/\s/g,''));
let p=await pg(BASE+'index.html');ok('main nav link to global.html',await p.locator('nav a[href="./global.html"]').count()===1);await p.click('nav a[href="./global.html"]');await p.waitForTimeout(1500);
let c=await cells(p);ok('Portland #1 default 丙午壬辰壬戌庚子',c[0]==='丙午壬辰壬戌庚子',c.join('|'));ok('Portland #1 civil day 辛酉',c[1].slice(4,6)==='辛酉',c[1]);
let t=await p.locator('#gOut').innerText();ok('clock hour 辛丑 shown',t.includes('時柱為 辛丑'));ok('calc panel (UT/EoT/L)',t.includes('2026-04-17 08:17:00 UTC')&&t.includes('237.3200')&&t.includes('均時差'));ok('boundary warning near midnight',t.includes('距午夜換日'));
ok('大運 癸巳 + both conventions',t.includes('癸巳')&&t.includes('三日折一年')&&t.includes('× 120'));
// rounding toggle reproduces notes
await p.check('#gRound');await p.click('#gCalc');await p.waitForTimeout(300);t=await p.locator('#gOut').innerText();ok('round-minute: 2032-04-02 17:17 & 2032-05-04 17:17',t.includes('2032-04-02 17:17')&&t.includes('2032-05-04 17:17'));
// case 2
await p.fill('#gDate','2026-10-12');await p.fill('#gTime','13:01');await p.click('#gCalc');await p.waitForTimeout(300);c=await cells(p);t=await p.locator('#gOut').innerText();
ok('Portland #2 丙午戊戌庚申壬午',c[0]==='丙午戊戌庚申壬午',c.join('|'));ok('Portland #2 civil 己未 / clock 癸未 / 立冬 01:52 PST / 2035-03-08 18:01',c[1].slice(4,6)==='己未'&&t.includes('時柱為 癸未')&&t.includes('立冬 2026-11-07 01:52')&&t.includes('2035-03-08 18:01')&&t.includes('己亥'));
// exports
for(const k of ['docx','pdf']){const [dl]=await Promise.all([p.waitForEvent('download',{timeout:60000}).catch(()=>null),p.click(`#gOut .xbar [data-k=${k}]`)]);if(!dl){ok('global '+k,false);continue;}const f=`${OUT}/g.${k}`;await dl.saveAs(f);
 const txt=k==='pdf'?execSync(`pdftotext ${f} -`).toString():execSync(`python3 -c "import docx,sys;d=docx.Document(sys.argv[1]);print('\\n'.join([x.text for x in d.paragraphs]+[c.text for t in d.tables for r in t.rows for c in r.cells]))" ${f}`).toString();
 ok('global '+k,/_全球八字_\d{8}\./.test(dl.suggestedFilename())&&txt.includes('庚申')&&txt.includes('東經 70')&&txt.includes('研究用暫定線')&&txt.includes('僅供'),dl.suggestedFilename());}
// share
const url=await p.evaluate(()=>window.__gState());await p.click('#gOut .xbar [data-k=share]');await p.waitForTimeout(800);ok('share copies link',(await p.evaluate(()=>navigator.clipboard.readText().catch(()=>'')))===url);
const p2=await pg(url);c=await cells(p2);ok('share link round-trip',c[0]==='丙午戊戌庚申壬午'&&(await p2.isChecked('#gRound')),c[0]);
// presets
await p2.selectOption('#gCity','1');await p2.fill('#gDate','2026-11-03');await p2.fill('#gTime','12:00');await p2.click('#gCalc');await p2.waitForTimeout(300);c=await cells(p2);
ok('Taipei preset: zone Asia/Taipei, 辛巳日, main==civil',(await p2.inputValue('#gZone'))==='Asia/Taipei'&&c[0].slice(4,6)==='辛巳'&&c[0]===c[1],c.join('|'));
await p2.selectOption('#gCity','6');ok('London zone auto',(await p2.inputValue('#gZone'))==='Europe/London');
await p2.selectOption('#gCity','8');ok('Kashgar zone auto',(await p2.inputValue('#gZone'))==='Asia/Urumqi');
// manual offset & DST ambiguity
await p2.selectOption('#gCity','4');await p2.fill('#gDate','2026-11-01');await p2.fill('#gTime','01:30');await p2.click('#gCalc');await p2.waitForTimeout(300);ok('DST fall-back ambiguity note',(await p2.locator('#gOut').innerText()).includes('出現兩次'));
await p2.fill('#gOff','-8');await p2.click('#gCalc');await p2.waitForTimeout(300);ok('manual offset override',(await p2.locator('#gOut').innerText()).includes('手動偏移 UTC−08:00'));
const p3=await pg(BASE+'global.html',{width:390,height:844});ok('mobile 390 no overflow',await p3.evaluate(()=>document.documentElement.scrollWidth)<=392);await p3.screenshot({path:OUT+'/mobile.png',fullPage:true});
ok('no page errors',errs.length===0,errs.join('|'));
await b.close();R.forEach(r=>console.log(r.join('  ')));if(R.some(r=>r[0]==='FAIL'))process.exitCode=1;
