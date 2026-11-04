// QA：詳細命盤分頁（產生、版面比對、PDF／Word 下載）。用法：node qa-sheet.mjs [BASE_URL]
import {chromium} from '/home/box/.npm/_npx/705bc6b22212b352/node_modules/playwright/index.mjs';
import {execSync} from 'child_process';import fs from 'fs';
const BASE=process.argv[2]||'https://regulusab.github.io/bazi-site/';const OUT='/tmp/qasheet';fs.mkdirSync(OUT,{recursive:true});
const R=[];const ok=(n,c,x='')=>R.push([c?'PASS':'FAIL',n,x]);
const EXP=JSON.parse(fs.readFileSync(new URL('./tests/wang-expected.json',import.meta.url)));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const ctx=await b.newContext({acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
const errs=[],reqs=[];
const pg=async(u,vp)=>{const p=await ctx.newPage();if(vp)await p.setViewportSize(vp);p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>reqs.push(r.url()));p.on('dialog',d=>d.accept());await p.goto(u);await p.waitForTimeout(1200);return p;};
const sh=c=>execSync(c).toString();
let p=await pg(BASE+'index.html');
ok('sheet fonts not fetched on initial load',!reqs.some(u=>/fonts\/sheet|sheetPage/.test(u)));
ok('tab button 詳細命盤',await p.locator('#tabs [data-t=sheet]').innerText()==='詳細命盤');
await p.click('#tabs [data-t=sheet]');await p.waitForSelector('#sOut svg',{timeout:30000});
ok('main form hidden on sheet tab',!(await p.isVisible('#formBox')));
ok('列表日期 defaults to today',(await p.inputValue('#sList'))===(await p.evaluate(()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`;})));
const setIn=async(o)=>{for(const [k,v] of Object.entries(o)){if(k==='sGender'||k==='sCity'||k==='sDayRule')await p.selectOption('#'+k,v);else await p.fill('#'+k,v);}await p.click('#sGen');await p.waitForTimeout(600);};
await setIn({sName:'王先生',sGender:'1',sDate:'1962-08-08',sTime:'00:10',sCity:'0',sList:'2026-11-05'});
const gl=await p.$$eval('#sOut svg text',ts=>ts.map(t=>[+t.getAttribute('x'),+t.getAttribute('y'),t.textContent,+t.getAttribute('font-size')]));
let maxd=0,same=gl.length===EXP.glyphs.length;EXP.glyphs.forEach((g,i)=>{const h=gl[i];if(!h||h[2]!==g[2]){same=false;return;}maxd=Math.max(maxd,Math.abs(h[0]-g[0]),Math.abs(h[1]-g[1]),Math.abs(h[3]-g[4]));});
ok('王先生 on-screen glyphs = Python sheet (text/pos/size)',same&&maxd<1,`n=${gl.length}/${EXP.glyphs.length} maxd=${maxd.toFixed(3)}`);
ok('王先生 note pillars 壬寅 丁未 戊寅 壬子',(await p.innerText('#sNote')).includes('壬寅 丁未 戊寅 壬子'));
const fontsOk=await p.evaluate(()=>document.fonts.check('30px SheetTC')&&document.fonts.check('30px SheetSerif'));ok('sheet webfonts loaded',fontsOk);
await p.screenshot({path:OUT+'/screen.png',fullPage:true});
const down=async(btn,f)=>{const [dl]=await Promise.all([p.waitForEvent('download',{timeout:90000}).catch(()=>null),p.click(btn)]);if(!dl)return null;await dl.saveAs(f);return dl.suggestedFilename();};
let n=await down('#sPdf',OUT+'/w.pdf');
ok('PDF filename 八字論斷_王先生.pdf',n==='八字論斷_王先生.pdf',n);
if(n){const info=sh(`pdfinfo ${OUT}/w.pdf`);ok('PDF 1 page A4',/Pages:\s+1\n/.test(info)&&/595\.2\d* x 841\.8\d* pts/.test(info),info.match(/Page size:.*/)?.[0]);
 const t=sh(`pdftotext ${OUT}/w.pdf -`).replace(/\s/g,'');ok('PDF has selectable Chinese text (八字論斷, 王先生, 壬; 王 only in name)',t.includes('八字論斷')&&t.includes('王先生')&&t.includes('壬')&&(t.match(/王/g)||[]).length===1,t.length+' chars');
 const ff=sh(`pdffonts ${OUT}/w.pdf`);ok('PDF fonts embedded subsets',/SheetTC/.test(ff)&&!/\bno\s+no\b/.test(ff.split('\n').slice(2).join('\n').replace(/\s+yes\s+yes\s+yes/g,'')),ff.split('\n').length-3+' fonts');
 // 與 Python 版 wang.pdf 像素比對
 if(fs.existsSync('/workspace/fig/build/wang.pdf')){sh(`pdftoppm -r 100 -png -singlefile ${OUT}/w.pdf ${OUT}/js && pdftoppm -r 100 -png -singlefile /workspace/fig/build/wang.pdf ${OUT}/py`);
  const d=sh(`python3 -c "from PIL import Image,ImageChops;import sys;a=Image.open('${OUT}/js.png').convert('L');b=Image.open('${OUT}/py.png').convert('L');d=ImageChops.difference(a,b);h=d.histogram();n=sum(h);print(sum(h[64:])/n)"`).trim();
  ok('PDF raster ≈ Python 王先生 PDF (pixels differing >25%)',+d<0.01,d);}}
n=await down('#sDocx',OUT+'/w.docx');ok('Word filename 八字論斷_王先生.docx',n==='八字論斷_王先生.docx',n);
if(n){sh(`cd ${OUT} && rm -f w_docx.pdf && cp w.docx w_docx.docx && soffice --headless --convert-to pdf w_docx.docx >/dev/null 2>&1`);const info=sh(`pdfinfo ${OUT}/w_docx.pdf`);ok('Word opens as 1 page (LibreOffice)',/Pages:\s+1\n/.test(info));
 const img=sh(`cd ${OUT} && rm -rf dx && mkdir dx && cd dx && unzip -o -q ../w.docx && python3 -c "from PIL import Image;import glob;f=glob.glob('word/media/*')[0];print(Image.open(f).size)"`).trim();ok('Word image 600 dpi',img==='(4363, 5819)',img);}
// 羅（波特蘭）兩例
await setIn({sName:'羅章雲',sCity:'10',sDate:'2026-04-17',sTime:'01:17',sList:'2026-11-04'});
let note=await p.innerText('#sNote');ok('羅章雲 Portland 丙午 壬辰 壬戌 庚子',note.includes('丙午 壬辰 壬戌 庚子')&&note.includes('換日線'),note);
let txt=(await p.$$eval('#sOut svg text',ts=>ts.map(t=>t.textContent).join('')));ok('羅章雲 起運 6年0個月又18天/立夏後1天 (星僑: 17天/後0天, DE421 vs 星僑 term time)',txt.includes('出生後6年0個月又18天交大運')&&txt.includes('立夏後1天'),'');
await setIn({sName:'羅章翔',sDate:'2026-10-12',sTime:'13:01'});note=await p.innerText('#sNote');txt=(await p.$$eval('#sOut svg text',ts=>ts.map(t=>t.textContent).join('')));
ok('羅章翔 Portland 丙午 戊戌 庚申 壬午',note.includes('丙午 戊戌 庚申 壬午'),note);ok('羅章翔 起運 8年6個月又9天 / 穀雨後2天',txt.includes('出生後8年6個月又9天交大運')&&txt.includes('每逢乙或庚年穀雨後2天交大運'));
// 罕用姓名字（需載入姓名字型分檔）
await setIn({sName:'鍾曉彤',sCity:'0',sDate:'1985-03-21',sTime:'23:30'});n=await down('#sPdf',OUT+'/z.pdf');
ok('rare-name PDF no missing glyphs',n&&!(await p.innerText('#sMsg')).includes('缺字')&&sh(`pdftotext ${OUT}/z.pdf -`).replace(/\s/g,'').includes('鍾曉彤'),await p.innerText('#sMsg'));
ok('rare-name chunk fonts fetched',reqs.some(u=>/fonts\/sheet\/name\/[0-9A-F]{2}\.ttf/.test(u)));
// 分享連結
await p.click('#sShare');await p.waitForTimeout(500);const url=await p.evaluate(()=>navigator.clipboard.readText().catch(()=>''));ok('share link copied',url.includes('#sheet')&&url.includes('d=1985-03-21'),url);
if(url){const p2=await pg(url);await p2.waitForSelector('#sOut svg',{timeout:30000});ok('share link round-trip',(await p2.inputValue('#sName'))==='鍾曉彤'&&(await p2.innerText('#sNote')).length>4);await p2.close();}
// iPhone 寬度
const pi=await pg(BASE+'index.html#sheet',{width:390,height:844});await pi.waitForSelector('#sOut svg',{timeout:30000});
const m=await pi.evaluate(()=>({sw:document.documentElement.scrollWidth,vw:innerWidth,w:document.querySelector('#sOut svg').getBoundingClientRect().width}));
ok('iPhone 390px: sheet fits, no horizontal scroll',m.sw<=m.vw+1&&m.w>300&&m.w<=m.vw,JSON.stringify(m));await pi.screenshot({path:OUT+'/iphone.png'});
ok('no page errors',errs.length===0,errs.join(' | '));
await b.close();
for(const r of R)console.log(r.join('  '));const f=R.filter(r=>r[0]==='FAIL').length;console.log(`${R.length-f}/${R.length} passed`);process.exit(f?1:0);
