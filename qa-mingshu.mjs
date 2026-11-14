// 命書（十一、命書範例）回歸檢查：章節順序、範本關鍵數值、無空白/undefined/NaN、PDF 與 Word 輸出
import fs from 'fs';import zlib from 'zlib';
import {build} from './src/mingshu/build.js';
import {mingshuPdf,mingshuDocxBuffer} from './src/mingshu/render.js';
const HEADINGS=["T 基本命理分析", "H 性情優缺點及血型星座分析", "H 個人特質神煞分析", "H 個人一生之機遇分析", "H 先天命運分析", "H 一生關鍵喜忌神", "H 一生顏色喜忌", "H 對自己最幸運的數字", "H 健康狀況及先天宿疾", "H 八字中帶有的疾病", "H 婚姻關係及姻緣桃花", "H 論六親之緣份與助力", "H 一生中與自己較有緣份之生肖", "H 論朋友緣份及合夥吉凶", "H 論行、住、坐、臥、及貴人之方位", "H 先天之讀書運及考試運", "H 小兒關煞檢查表", "T 投資理財分析", "H 適合本命發揮之行業及建議", "H 上班較佳或創業做生意較好", "H 事業、工作上的助力與阻力", "H 依自己命盤決定何時進行投資計劃", "T 個人理財機運分析", "H 大運財運分析", "H 流年財運分析", "H 流年整體運勢分析", "H 流月財運分析(1-12月)", "H 流日財運分析(365天)", "T 流年吉凶剖析", "H 官司與是非防患年限表", "H 意外、血光預知年限表", "H 破財、損失防患年限表", "H 姻緣、結婚時機掌握表", "H 個人先天八字一覽表", "H 流年十二宮神煞表", "T 開運制煞篇", "H 如何鎮宅及防止意外、血光發生", "H 陽宅如何佈局，佈局好，能催旺財運", "H 如何淨化陽宅，就能一切平安順利", "H 本命八字五行欠缺或過多、如何補運", "H 如何才能催旺桃花、姻緣，感情順利", "H 如何從命盤得知本命或行運空亡", "T 知命造運改變一生", "H 以命盤的刑沖破害來論會有的現象", "H 用命宮來論斷一個人的特性", "H 論四柱及十二運星空亡之各種現象", "H 以命盤五行旺度來分析性情", "H 用什麼方式表達自己、以找尋對象", "H 未來子女的現象解析", "H 以喜用神中的十神來選行業", "H 一生適合於什麼樣工作及位階", "H 每個大運中大概會有什麼現象發生", "H 流年中大概會有什麼現象發生", "H 流月中大概會有什麼現象發生", "H 流年十二神煞分析", "H 出生後上大運該做些什麼", "H 一生中的財富演變預估"];
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('✗ '+m);}};
const io={font:async p=>fs.readFileSync('public/fonts/'+p),manifest:async()=>JSON.parse(fs.readFileSync('public/fonts/sheet/name/manifest.json')),image:async k=>fs.readFileSync('public/mingshu/'+k+'.png')};
const flat=bs=>{const o=[];const f=b=>{if(b.t==='N')b.c.forEach(f);else if(b.x!=null)o.push(b);};bs.forEach(f);return o;};
const LEAK=/undefined|NaN|\$\{|【】|null|\[object|（\s*）$/;
// 範本命例為真實個人，資料放在 repo 外，找不到就略過範本比對
const PRIV=process.env.PRIVATE_CASES||'/workspace/jiaodui/八字/private-cases/bazi-site-sample.mjs';
const {LIU}=fs.existsSync(PRIV)?await import(PRIV):{};
const CASES=[
 ...(LIU?[LIU]:[]),
 {k:'wang',f:{name:'王先生',gender:1,date:'1962-08-08',time:'00:10',lon:121.56},o:{year:2026,day:'2026-11-14'},exp:{P:'壬寅 丁未 戊寅 壬子',strong:true}},
 {k:'male-strong',f:{name:'測試丙',gender:1,date:'2001-11-03',time:'23:40',lon:121.5},o:{year:2026,day:'2026-11-14'},exp:{strong:true}},
 {k:'west',f:{name:'測試乙',gender:0,date:'1990-01-20',time:'05:30',lon:-74},o:{year:2026,day:'2026-11-14'},exp:{}},
];
const out=fs.existsSync('/workspace/fig')?'/workspace/fig/mingshu':'/tmp/mingshu-qa';fs.mkdirSync(out,{recursive:true});
for(const c of CASES){const {m,blocks}=build(c.f,{...c.o,made:'2026-11-14'});const L=flat(blocks);const txt=L.map(b=>b.x);
 const hs=L.filter(b=>b.t==='T'||b.t==='H').map(b=>b.t+' '+b.x);
 ok(JSON.stringify(hs)===JSON.stringify(HEADINGS),`${c.k} 章節順序與範本不同`);
 ok(blocks[0].t==='PAGE1','第一頁命盤');
 const bad=txt.filter(x=>!String(x).trim()||LEAK.test(x));ok(!bad.length,`${c.k} 空白/未定義：${bad.slice(0,3).join(' | ')}`);
 const p1=JSON.stringify(blocks[0].d);ok(!/undefined|NaN|null/.test(p1),`${c.k} 命盤欄位缺漏`);
 const e=c.exp;if(e.P)ok(m.P.map(p=>p.gan+p.zhi).join(' ')===e.P,`${c.k} 四柱 ${m.P.map(p=>p.gan+p.zhi).join(' ')}`);
 if(e.ge)ok(m.ge===e.ge,`${c.k} 格局 ${m.ge}`);if(e.xi)ok(m.xi.join('')===e.xi,`${c.k} 喜 ${m.xi}`);if(e.ji)ok(m.ji.join('')===e.ji,`${c.k} 忌 ${m.ji}`);
 if(e.xz)ok(m.xz===e.xz,`${c.k} 星座`);if('strong' in e)ok(m.strong===e.strong,`${c.k} 強弱`);if(e.sc)for(const k in e.sc)ok(m.sc[k]===e.sc[k],`${c.k} ${k}分 ${m.sc[k]}`);
 for(const l of c.lines||[])ok(txt.some(x=>x.includes(l)),`${c.k} 缺少「${l}」`);
 const pdf=await mingshuPdf(blocks,io,c.f.name+' 命書');ok(pdf.pages>=35&&pdf.pages<=60,`${c.k} PDF 頁數 ${pdf.pages}`);ok(!pdf.missing.length,`${c.k} 缺字 ${pdf.missing}`);
 fs.writeFileSync(`${out}/${c.k}.pdf`,pdf.bytes);
 const dx=await mingshuDocxBuffer(blocks,io,c.f.name+' 命書');fs.writeFileSync(`${out}/${c.k}.docx`,dx);
 // docx：document.xml 內含可編輯文字與頁碼欄位
 const buf=Buffer.from(dx);const i=buf.indexOf('word/document.xml');ok(i>0,`${c.k} docx 結構`);
 const xml=unzip(buf,'word/document.xml');ok(xml&&xml.includes(c.f.name)&&xml.includes(HEADINGS[1].slice(2)),`${c.k} docx 文字`);
 const ft=unzip(buf,'word/footer1.xml')||'';ok(/NUMPAGES/.test(ft)&&/PAGE/.test(ft),`${c.k} docx 頁碼`);
 console.log(`${c.k}: ${m.P.map(p=>p.gan+p.zhi).join(' ')} ${m.strong?'身強':'身弱'} ${m.ge} 行數 ${txt.length} PDF ${pdf.pages} 頁`);}
function unzip(buf,name){let p=0;while((p=buf.indexOf(Buffer.from([0x50,0x4b,3,4]),p))>=0){const n=buf.readUInt16LE(p+26),x=buf.readUInt16LE(p+28),m=buf.readUInt16LE(p+8),sz=buf.readUInt32LE(p+18);
  const fn=buf.slice(p+30,p+30+n).toString();const d=p+30+n+x;if(fn===name){const raw=buf.slice(d,d+sz);return (m===8?zlib.inflateRawSync(raw):raw).toString();}p=d;}return null;}
// ── 瀏覽器（iPhone Safari 模擬：WebKit 版面寬度 390）：完整論命 → 十一、命書範例 → 顯示、下載 PDF／Word
if(process.env.SKIP_BROWSER!=='1'){const {chromium}=await import('./qa-pw.mjs');const BASE=process.argv[2]||'https://regulusab.github.io/bazi-site/';
 const br=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await br.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,acceptDownloads:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const W=LIU?LIU.f:{name:'測試甲',gender:0,date:'1985-03-12',time:'14:20',lon:121.56};
 await pg.goto(BASE+`?n=${encodeURIComponent(W.name)}&d=${W.date}&t=${W.time}&g=${W.gender}&lon=${W.lon}#report`,{waitUntil:'networkidle'});
 await pg.fill('#msY','2011');await pg.fill('#msD','2011-09-01');
 await pg.locator('#msSec').scrollIntoViewIfNeeded();await pg.click('#msGo');
 await pg.waitForFunction(()=>document.querySelectorAll('#msOut .ms-H').length>40,null,{timeout:30000});
 const info=await pg.evaluate(()=>({h:document.querySelectorAll('#msOut .ms-H').length,t:document.querySelectorAll('#msOut .ms-T').length,txt:document.querySelector('#msOut').innerText,ow:document.documentElement.scrollWidth,fonts:[...document.fonts].filter(f=>f.family.includes('MingshuKai')).map(f=>f.status)}));
 ok(info.t===6,'網頁命書大標 '+info.t);if(LIU)ok(info.txt.includes('西元：2011 農曆：100年 48歲 (得分：103分)'),'網頁命書流年分數');ok(!/undefined|NaN|\$\{|【】/.test(info.txt),'網頁命書無未定義');
 ok(info.ow<=392,'手機版面無橫向捲動 '+info.ow);
 await pg.waitForTimeout(1500);fs.mkdirSync(out,{recursive:true});
 await pg.locator('#msOut .ms-p1').scrollIntoViewIfNeeded();await pg.waitForTimeout(800);await pg.screenshot({path:`${out}/mobile-page1.png`});
 await pg.evaluate(()=>{const h=[...document.querySelectorAll('#msOut .ms-H')][0];h.scrollIntoView();});await pg.waitForTimeout(500);await pg.screenshot({path:`${out}/mobile-text.png`});
 for(const [btn,ext] of [['#msPdf','pdf'],['#msDoc','docx']]){const [d]=await Promise.all([pg.waitForEvent('download',{timeout:90000}),pg.click(btn)]);const f=`${out}/web-demo.${ext}`;await d.saveAs(f);
  const sz=fs.statSync(f).size;ok(sz>(ext==='pdf'?500000:200000),`網頁下載 ${ext} ${sz}`);console.log('download',d.suggestedFilename(),sz);}
 ok(!errs.length,'頁面錯誤 '+errs.join(';'));await br.close();console.log('browser: 命書 H',info.h,'fonts',info.fonts.join(','));}
console.log(fail?`命書 QA 失敗 ${fail} 項`:'命書 QA 全部通過');process.exit(fail?1:0);
