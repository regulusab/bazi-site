import {chromium} from '/home/box/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
const BASE=process.argv[2]||'https://regulusab.github.io/bazi-site/';
const R=[];const ok=(n,c,x='')=>{R.push([c?'PASS':'FAIL',n,x]);};
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({acceptDownloads:true});
async function open(q,hash='',vp){const p=await ctx.newPage();if(vp)await p.setViewportSize(vp);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.dismiss());await p.goto(BASE+q+hash);await p.waitForTimeout(1500);return [p,errs];}
const txt=async(p,s)=>(await p.locator(s).innerText().catch(()=>''));
// 1962
let [p,e]=await open('?d=1962-08-08&t=00:10&g=1&n=QA','#daily');
let d=await txt(p,'#daily');
ok('daily 11-row overview',(d.match(/上運前|第\d+運/g)||[]).length>=11,'');
ok('甲寅 2022-01-09 19:22',d.includes('2022-01-09 19:22'));ok('丁巳 end 2062-01-25 08:44',d.includes('2062-01-25 08:44'));
ok('節氣 table 立秋 08:33:33',(await p.content()).includes('1962-08-08 08:33:33'));
ok('折算口訣',d.includes('1 秒 = 2 分'));ok('銜接驗證 all ✓',!d.includes('✗')&&d.includes('無縫'));ok('人生時間跨度',d.includes('人生時間跨度'));
ok('details per pillar',await p.locator('#daily details.dseg').count()>=11);ok('partial ⚠',(await p.content()).includes(' ⚠'));
const h=await p.content();ok('row16 癸巳 2026-08-31 04:10',/2026-08-31 04:10/.test(h));
ok('喜忌/流年 columns',d.includes('喜忌')&&d.includes('流年'));
const [dl1]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null),p.click('#dCsv')]);
if(dl1){await dl1.saveAs('/workspace/qa/t.csv');}ok('CSV download',!!dl1);
ok('1962 page errors',e.length===0,e.join('|'));
// report & method
await p.click('[data-t=report]');await p.waitForTimeout(500);const rep=await txt(p,'#report');
ok('計算工具與方法 section',rep.includes('計算工具與方法')&&rep.includes('DE421'));
ok('header DE421',(await txt(p,'header')).includes('DE421'));
const [dl2]=await Promise.all([p.waitForEvent('download',{timeout:15000}).catch(()=>null),p.click('#rDoc')]);
if(dl2)await dl2.saveAs('/workspace/qa/r.docx');ok('docx download',!!dl2);
await p.emulateMedia({media:'print'});await p.pdf({path:'/workspace/qa/r.pdf'}).then(()=>ok('PDF print',true)).catch(x=>ok('PDF print',false,x.message));
// share roundtrip
const u=await p.evaluate(async()=>{const m=await import(document.querySelector('script[type=module]').src).catch(()=>null);return null;});
await p.close();
// DST
for(const [dt,tm] of [['1962-08-08','00:10'],['1975-06-01','12:00']]){[p,e]=await open(`?d=${dt}&t=${tm}&g=1`,'#chart');const a=await txt(p,'#chart');await p.close();[p,e]=await open(`?d=${dt}&t=${tm}&g=1&dst=1`,'#chart');const bb=await txt(p,'#chart');ok(`DST ${dt} shifts −1h`,a!==bb&&bb.includes(dt<'1970'?'排盤時間：1962-08-07 23:10':'排盤時間：1975-06-01 11:00'),'');ok(`DST ${dt} no errors`,e.length===0,e.join('|'));await p.close();}
// share link
[p,e]=await open('?n=SH&d=1975-06-01&t=12:00&g=0&lon=121.56&dst=1','#daily');const f=await p.evaluate(()=>['name','date','time','gender','lon'].map(i=>document.getElementById(i).value).concat(document.getElementById('dst').checked).join('|'));ok('share link round-trip',f==='SH|1975-06-01|12:00|0|121.56|true',f);await p.close();
// 立春 2024 boundary 16:27:08
for(const [tm,exp] of [['16:20','癸卯'],['16:30','甲辰']]){[p,e]=await open(`?d=2024-02-04&t=${tm}&g=1`,'#chart');const c=await txt(p,'#chart');ok(`2024立春 ${tm} → ${exp}`,c.includes('天干\t'+exp[0])&&c.includes('地支\t'+exp[1]),c.split('\n').slice(2,4).join(' '));await p.close();}
// fallback
for(const y of ['1890-05-05','2060-05-05']){[p,e]=await open(`?d=${y}&t=12:00&g=1`,'#daily');ok(`fallback ${y}`,e.length===0&&(await txt(p,'#daily')).length>100,e.join('|'));await p.close();}
// tabs & 1990
[p,e]=await open('?d=1990-01-01&t=12:00&g=1','');for(const t of ['chart','report','daily','year','match','pick']){await p.click(`[data-t=${t}]`);await p.waitForTimeout(300);}
await p.click('[data-t=year]');await p.click('#lyGo');await p.click('[data-t=match]');await p.click('#mGo');await p.click('[data-t=pick]');await p.click('#pGo');await p.waitForTimeout(800);
ok('1990 pillars',(await txt(p,'#chart')).includes('天干\t己\t丙\t丙\t甲'));ok('all tabs no errors',e.length===0,e.join('|'));
ok('match score',(await txt(p,'.score')).length>0);ok('pick results',(await txt(p,'#pOut')).includes('合適日子'));await p.close();
// mobile
[p,e]=await open('?d=1962-08-08&t=00:10&g=1','#daily',{width:390,height:844});const ov=await p.evaluate(()=>document.documentElement.scrollWidth);ok('mobile 390 no horizontal overflow',ov<=392,'scrollWidth '+ov);await p.screenshot({path:'/workspace/qa/mobile.png'});await p.close();
await b.close();R.forEach(r=>console.log(r.join('  ')));
