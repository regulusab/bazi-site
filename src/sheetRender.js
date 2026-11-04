// 詳細命盤輸出：螢幕 SVG、Word 用高解析圖、PDF（pdf-lib 向量文字，字型子集嵌入）
import {TPL as T} from './sheetLayout.js';
import {TRIGRAM} from './sheetData.js';
const FONT_DIR='fonts/sheet/';
const furl=p=>new URL(FONT_DIR+p,document.baseURI).href;
const FAM={cjk:"SheetTC,SheetTCX,'Noto Serif TC','Noto Serif CJK TC','PMingLiU',serif",serif:"SheetSerif,'Times New Roman',serif",mono:"SheetMono,'Courier New',monospace"};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SW=2.2;
// 卦象：三爻（由上而下），1＝陽爻（實線）
function triRects(gua){const t=T.tri,h=t.h,bits=TRIGRAM[gua]||[0,0,0];const r=[];
 t.ys.forEach((y,i)=>{if(bits[i])r.push([t.x0,y-h/2,t.x1-t.x0,h]);else{r.push([t.x0,y-h/2,t.g0-t.x0,h]);r.push([t.g1,y-h/2,t.x1-t.g1,h]);}});return r;}
export function sheetSvg(glyphs,gua,attrs=''){const o=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T.W} ${T.H}" ${attrs}>`,`<g stroke="#000" stroke-width="${SW}" stroke-linecap="square" fill="none">`];
 for(const l of T.lines){const [x1,y1,x2,y2]=l;o.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${l.length>4?` stroke-width="${(SW*0.95).toFixed(2)}" stroke-linecap="butt"`:''}/>`);}
 o.push('</g><g fill="#000">');for(const [x,y,w,h] of triRects(gua))o.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}"/>`);
 o.push('</g><g fill="#000" style="font-kerning:none">');
 for(const [x,y,t,f,s] of glyphs)o.push(`<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" font-family="${esc(FAM[f])}" font-size="${s.toFixed(2)}">${esc(t)}</text>`);
 o.push('</g></svg>');return o.join('');}
// ---- 字型載入（螢幕／畫布）----
let manifestP=null;const getManifest=()=>manifestP||(manifestP=fetch(furl('name/manifest.json')).then(r=>r.json()).catch(()=>[]));
const loaded=new Set();
const baseFaces=[['SheetTC','SheetTC.ttf'],['SheetSerif','SheetSerif.ttf'],['SheetMono','SheetMono.ttf']];
let tcCmapP=null;
async function tcChars(){if(!tcCmapP)tcCmapP=fetch(furl('SheetTC.chars.txt')).then(r=>{if(!r.ok)throw new Error('字表載入失敗');return r.text();}).then(t=>new Set([...t].map(c=>c.codePointAt(0))));return tcCmapP;}
const bufCache={};const fetchBuf=p=>bufCache[p]||(bufCache[p]=fetch(furl(p)).then(r=>{if(!r.ok)throw new Error('字型載入失敗：'+p);return r.arrayBuffer();}));
export async function nameBlocks(text){const man=new Set(await getManifest());const need=new Set();
 for(const c of text){const cp=c.codePointAt(0);if(cp>=0x2E80&&man.has(cp>>8))need.add(cp>>8);}return [...need];}
export async function loadFonts(text){if(typeof FontFace==='undefined')return;const jobs=[];
 for(const [fam,file] of baseFaces)if(!loaded.has(fam)){loaded.add(fam);const ff=new FontFace(fam,`url(${furl(file)})`);document.fonts.add(ff);jobs.push(ff.load().catch(()=>{}));}
 const tc=await tcChars().catch(()=>new Set());const extra=[...new Set(text)].filter(c=>c.codePointAt(0)>=0x2E80&&!tc.has(c.codePointAt(0))).join('');
 for(const b of await nameBlocks(extra)){const k='X'+b;if(loaded.has(k))continue;loaded.add(k);const h=b.toString(16).toUpperCase().padStart(2,'0');
  const ff=new FontFace('SheetTCX',`url(${furl('name/'+h+'.ttf')})`,{unicodeRange:`U+${h}00-${h}FF`});document.fonts.add(ff);jobs.push(ff.load().catch(()=>{}));}
 await Promise.all(jobs);}
// ---- Word：畫布點陣圖 ----
const isIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
export async function sheetPng(glyphs,gua,dpi){dpi=dpi||(isIOS()?440:600);const mmW=184.68,mmH=246.33;
 const w=Math.round(mmW/25.4*dpi),h=Math.round(mmH/25.4*dpi),k=w/T.W;
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,w,h);c.scale(k,h/T.H);
 c.strokeStyle='#000';c.lineWidth=SW;for(const l of T.lines){c.lineCap=l.length>4?'butt':'square';c.lineWidth=l.length>4?SW*0.95:SW;c.beginPath();c.moveTo(l[0],l[1]);c.lineTo(l[2],l[3]);c.stroke();}
 c.fillStyle='#000';for(const [x,y,ww,hh] of triRects(gua)){const r=hh/2;c.beginPath();c.moveTo(x+r,y);c.lineTo(x+ww-r,y);c.arc(x+ww-r,y+r,r,-Math.PI/2,Math.PI/2);c.lineTo(x+r,y+hh);c.arc(x+r,y+r,r,Math.PI/2,Math.PI*1.5);c.closePath();c.fill();}
 if('fontKerning' in c)c.fontKerning='none';c.textBaseline='alphabetic';
 for(const [x,y,t,f,s] of glyphs){c.font=`${s}px ${FAM[f]}`;c.fillText(t,x,y);}
 const blob=await new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(new Error('畫布輸出失敗（裝置記憶體不足）')),'image/png'));cv.width=cv.height=0;return {blob,w,h,dpi};}
export async function sheetDocx(glyphs,gua,title){const {Document,Packer,Paragraph,ImageRun}=await import('docx');const png=await sheetPng(glyphs,gua);
 const data=new Uint8Array(await png.blob.arrayBuffer());
 // A4，邊界 12.7mm（720 twips）；圖寬 184.68mm＝698px@96dpi
 const doc=new Document({creator:'八字論命',title,sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:720,bottom:720,left:720,right:720,header:0,footer:0,gutter:0}}},
  children:[new Paragraph({spacing:{before:0,after:0},children:[new ImageRun({type:'png',data,transformation:{width:698,height:931},altText:{title,description:title,name:title}})]})]}]});
 return {blob:await Packer.toBlob(doc),dpi:png.dpi};}
// ---- PDF：pdf-lib，TrueType 子集嵌入，文字可選取 ----
export async function sheetPdf(glyphs,gua,title){const [{PDFDocument,rgb,LineCapStyle},{default:fontkit}]=await Promise.all([import('pdf-lib'),import('@pdf-lib/fontkit')]);
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);pdf.setTitle(title);pdf.setCreator('八字論命');pdf.setProducer('八字論命 · pdf-lib');
 const page=pdf.addPage([595.2756,841.8898]);const pt=mm=>mm*72/25.4;const S=pt(184.68)/T.W,SY=pt(246.33)/T.H,ox=pt(12.7),oy=841.8898-pt(12.7);
 const X=x=>ox+x*S,Y=y=>oy-y*SY;
 const fonts={};const emb=async(k,file)=>fonts[k]||(fonts[k]=pdf.embedFont(await fetchBuf(file),{subset:true}));
 const tc=await tcChars();const man=new Set(await getManifest());
 const pick=async(t,f)=>{if(f==='serif')return emb('serif','SheetSerif.ttf');if(f==='mono')return emb('mono','SheetMono.ttf');
  const cp=t.codePointAt(0);if(tc.has(cp))return emb('tc','SheetTC.ttf');if(isLat(t))return emb('serif','SheetSerif.ttf');
  const b=cp>>8;if(cp>=0x2E80&&cp<0x10000&&man.has(b)){const h=b.toString(16).toUpperCase().padStart(2,'0');return emb('x'+h,'name/'+h+'.ttf');}return null;};
 const missing=[];
 for(const l of T.lines){const bar=l.length>4;page.drawLine({start:{x:X(l[0]),y:Y(l[1])},end:{x:X(l[2]),y:Y(l[3])},thickness:(bar?SW*0.95:SW)*S,lineCap:bar?LineCapStyle.Butt:LineCapStyle.Projecting,color:rgb(0,0,0)});}
 for(const [x,y,w,h] of triRects(gua)){const r=h/2;const d=`M ${x+r} ${y} L ${x+w-r} ${y} A ${r} ${r} 0 0 1 ${x+w-r} ${y+h} L ${x+r} ${y+h} A ${r} ${r} 0 0 1 ${x+r} ${y} Z`;page.drawSvgPath(d,{x:ox,y:oy,scale:S,color:rgb(0,0,0),borderWidth:0});}
 for(const [x,y,t,f,s] of glyphs){const font=await pick(t,f);if(!font){missing.push(t);continue;}
  try{page.drawText(t,{x:X(x),y:Y(y),size:s*S,font,color:rgb(0,0,0)});}catch(e){missing.push(t);}}
 return {blob:new Blob([await pdf.save()],{type:'application/pdf'}),missing};}
const isLat=t=>t.codePointAt(0)<0x2000&&t!=='•';
