import {chromium} from './qa-pw.mjs';
import {execSync} from 'child_process';import fs from 'fs';import path from 'path';
const BASE=process.argv[2]||'https://regulusab.github.io/bazi-site/';const OUT='/tmp/qaglob';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x='')=>R.push([c?'PASS':'FAIL',n,x]);
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const errs=[];const pg=async(u,vp)=>{const p=await ctx.newPage();if(vp)await p.setViewportSize(vp);p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto(u);await p.waitForTimeout(1500);return p;};
const cells=async p=>(await p.locator('#gOut .gcols table').allInnerTexts()).map(t=>t.split('\n').pop().replace(/\s/g,''));
let p=await pg(BASE+'index.html');ok('main nav link to global.html',await p.locator('nav a[href="./global.html"]').count()===1);await p.click('nav a[href="./global.html"]');await p.waitForTimeout(1500);
let c=await cells(p);ok('Portland default (fictional) 癸酉辛酉癸巳壬子',c[0]==='癸酉辛酉癸巳壬子',c.join('|'));ok('Portland default civil day 壬辰',c[1].slice(4,6)==='壬辰',c[1]);
let t=await p.locator('#gOut').innerText();ok('clock hour 癸丑 shown',t.includes('時柱為 癸丑'));ok('calc panel (UT/EoT/L)',t.includes('1993-09-08 08:20:00 UTC')&&t.includes('237.3200')&&t.includes('均時差'));ok('boundary warning near midnight',t.includes('距午夜換日'));
ok('大運 庚申 + both conventions',t.includes('庚申')&&t.includes('三日折一年')&&t.includes('× 120'));
// rounding toggle reproduces notes
await p.check('#gRound');await p.click('#gCalc');await p.waitForTimeout(300);t=await p.locator('#gOut').innerText();ok('round-minute: 1993-12-03 00:20 & 1993-12-04 01:20',t.includes('1993-12-03 00:20')&&t.includes('1993-12-04 01:20'));
// case 2
await p.fill('#gDate','2001-11-20');await p.fill('#gTime','15:30');await p.click('#gCalc');await p.waitForTimeout(300);c=await cells(p);t=await p.locator('#gOut').innerText();
ok('Portland #2 (fictional) 辛巳己亥戊子庚申',c[0]==='辛巳己亥戊子庚申',c.join('|'));ok('Portland #2 civil 丁亥 / clock 庚申 / 立冬 00:37 PST / 2006-05-13 02:30',c[1].slice(4,6)==='丁亥'&&t.includes('時柱為 庚申')&&t.includes('立冬 2001-11-07 00:37')&&t.includes('2006-05-13 02:30')&&t.includes('戊戌'));
// exports
for(const k of ['docx','pdf']){const [dl]=await Promise.all([p.waitForEvent('download',{timeout:60000}).catch(()=>null),p.click(`#gOut .xbar [data-k=${k}]`)]);if(!dl){ok('global '+k,false);continue;}const f=`${OUT}/g.${k}`;await dl.saveAs(f);
 const txt=k==='pdf'?execSync(`pdftotext ${f} -`).toString():execSync(`python3 -c "import docx,sys;d=docx.Document(sys.argv[1]);print('\\n'.join([x.text for x in d.paragraphs]+[c.text for t in d.tables for r in t.rows for c in r.cells]))" ${f}`).toString();
 ok('global '+k,/_全球八字_\d{8}\./.test(dl.suggestedFilename())&&txt.includes('庚申')&&txt.includes('東經 70')&&txt.includes('研究用暫定線')&&txt.includes('僅供'),dl.suggestedFilename());}
// share
const url=await p.evaluate(()=>window.__gState());await p.click('#gOut .xbar [data-k=share]');await p.waitForTimeout(800);ok('share copies link',(await p.evaluate(()=>navigator.clipboard.readText().catch(()=>'')))===url);
const p2=await pg(url);c=await cells(p2);ok('share link round-trip',c[0]==='辛巳己亥戊子庚申'&&(await p2.isChecked('#gRound')),c[0]);
// 星僑範本兩例（真實個人）：資料在 repo 外，找不到就略過
{const PL=process.env.PRIVATE_LUO||(process.env.PRIVATE_CASES?path.join(path.dirname(process.env.PRIVATE_CASES),'bazi-site-luo.mjs'):'/workspace/jiaodui/八字/private-cases/bazi-site-luo.mjs');
 if(fs.existsSync(PL)){const {QA_GLOBAL:Q}=await import(PL);for(const [k,q] of Object.entries(Q)){await p.fill('#gDate',q.date);await p.fill('#gTime',q.time);await p.click('#gCalc');await p.waitForTimeout(300);c=await cells(p);t=await p.locator('#gOut').innerText();
  ok(`私有例 ${k} ${q.main}`,c[0]===q.main&&c[1].slice(4,6)===q.civil&&t.includes('時柱為 '+q.clock)&&(q.has||[]).concat(q.round||[],q.ut?[q.ut]:[],q.dayun?[q.dayun]:[]).every(x=>t.includes(x)),c.join('|'));}}
 else console.log('SKIP 星僑範本兩例（找不到 '+PL+'）');}
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
