// 命書輸出：網頁 HTML、PDF（pdf-lib，字型子集嵌入，可選取文字）、Word（docx，可編輯文字）。
// io：{font(path)→ArrayBuffer, manifest()→number[], image(key)→Uint8Array, imgUrl(key)→string}
import {layout,page1,svgOf,compassPrims,PW,PH,IMG,COLOR,FONT_STACK} from './layout.js';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const textOf=blocks=>{const o=[];const f=b=>{if(b.t==='N')b.c.forEach(f);else if(b.x!=null)o.push(b.x);else if(b.cap)o.push(b.cap);else if(b.d)o.push(JSON.stringify(b.d));};blocks.forEach(f);return o.join('\n');};
// ── 網頁
export function mingshuHtml(blocks,imgUrl){const o=[];
 const one=b=>{switch(b.t){
  case 'T':o.push(`<h3 class="ms-T">${esc(b.x)}</h3>`);break;
  case 'H':o.push(`<h4 class="ms-H">${esc(b.x)}</h4>`);break;
  case 'S':o.push(`<p class="ms-S">${esc(b.x)}</p>`);break;
  case 'R':o.push(`<p class="ms-R">${esc(b.x)}</p>`);break;
  case 'P':o.push(`<p class="ms-P">${esc(b.x)}</p>`);break;
  case 'N':o.push(`<div class="ms-N"><span class="ms-n">${b.n}、</span><div>`);b.c.forEach(one);o.push('</div></div>');break;
  case 'IMG':{const [w,h]=IMG[b.k];o.push(`<img class="ms-img ms-${b.k}" src="${esc(imgUrl(b.k))}" width="${w}" height="${h}" alt="" loading="lazy">`);break;}
  case 'TBL':o.push(`<p class="ms-P">${esc(b.cap)}</p><table class="ms-tbl">${b.rows.map(r=>`<tr>${r.map(c=>{const [a,z]=c.split('\n');return `<td${b.hl&&b.hl.includes(a)?' class="hl"':''}><b>${esc(a)}</b><br>${esc(z)}</td>`;}).join('')}</tr>`).join('')}</table>`);break;
  case 'COMPASS':o.push(`<div class="ms-svg">${svgOf(compassPrims(b.d),[0,0,PW,225],'class="ms-compass" role="img" aria-label="方位圖"')}</div>`);break;
  case 'PAGE1':o.push(`<div class="ms-svg ms-p1">${svgOf(page1(b.d),[0,40,PW,700],'class="ms-page1" role="img" aria-label="命盤"')}</div>`);break;}};
 blocks.forEach(one);return o.join('');}
// ── 共用：字型
async function fonts(pdf,blocks,io){const kai=await pdf.embedFont(await io.font('mingshu/MingshuKai.ttf'),{subset:true});
 const kset=new Set(kai.getCharacterSet());const man=new Set(await io.manifest().catch(()=>[]));const ext={};
 for(const ch of new Set(textOf(blocks))){const cp=ch.codePointAt(0);if(kset.has(cp)||cp<0x2E80||cp>0xFFFF)continue;const b=cp>>8;
  if(man.has(b)&&!ext[b]){const h=b.toString(16).toUpperCase().padStart(2,'0');try{ext[b]=await pdf.embedFont(await io.font('sheet/name/'+h+'.ttf'),{subset:true});}catch(e){}}}
 const fontFor=cp=>kset.has(cp)?kai:(ext[cp>>8]||kai);const wc={};
 const meas=(s,size)=>{let w=0;for(const ch of s){let u=wc[ch];if(u==null){const f=fontFor(ch.codePointAt(0));try{u=f.widthOfTextAtSize(ch,1000);}catch(e){u=1000;}wc[ch]=u;}w+=u*size/1000;}return w;};
 const runs=s=>{const r=[];for(const ch of s){const f=fontFor(ch.codePointAt(0));if(r.length&&r[r.length-1].f===f)r[r.length-1].s+=ch;else r.push({f,s:ch});}return r;};
 return {meas,runs,missing:[...new Set(textOf(blocks))].filter(ch=>{const cp=ch.codePointAt(0);return cp>=0x2E80&&!kset.has(cp)&&!ext[cp>>8];})};}
// ── PDF
export async function mingshuPdf(blocks,io,title){const [{PDFDocument,rgb},{default:fontkit}]=await Promise.all([import('pdf-lib'),import('@pdf-lib/fontkit')]);
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);pdf.setTitle(title);pdf.setCreator('八字論命');pdf.setProducer('八字論命 · pdf-lib');pdf.setLanguage('zh-TW');
 const F=await fonts(pdf,blocks,io);const pages=layout(blocks,F.meas);
 const col=h=>{const n=parseInt(h.slice(1),16);return rgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255);};
 const imgs={};const img=async k=>imgs[k]||(imgs[k]=await pdf.embedPng(await io.image(k)));
 for(const prims of pages){const pg=pdf.addPage([PW,PH]);
  for(const p of prims){
   if(p.k==='t'){let x=p.x;if(p.mid)x-=F.meas(p.t,p.s)/2;const c=col(p.c);
    for(const r of F.runs(p.t)){try{pg.drawText(r.s,{x,y:PH-p.y,size:p.s,font:r.f,color:c});}catch(e){}x+=F.meas(r.s,p.s);}
    if(p.u)pg.drawLine({start:{x:p.mid?p.x-F.meas(p.t,p.s)/2:p.x,y:PH-p.y-3},end:{x,y:PH-p.y-3},thickness:1,color:c});}
   else if(p.k==='l')pg.drawLine({start:{x:p.x1,y:PH-p.y1},end:{x:p.x2,y:PH-p.y2},thickness:p.w,color:col(p.c)});
   else if(p.k==='r'){if(p.rr){const r=p.rr,{x,y,w,h}=p;pg.drawSvgPath(`M ${x+r} ${y} H ${x+w-r} A ${r} ${r} 0 0 1 ${x+w} ${y+r} V ${y+h-r} A ${r} ${r} 0 0 1 ${x+w-r} ${y+h} H ${x+r} A ${r} ${r} 0 0 1 ${x} ${y+h-r} V ${y+r} A ${r} ${r} 0 0 1 ${x+r} ${y} Z`,{x:0,y:PH,borderColor:col(p.c),borderWidth:p.w0});}
    else pg.drawRectangle({x:p.x,y:PH-p.y-p.h,width:p.w,height:p.h,borderColor:col(p.c),borderWidth:p.w0,...(p.fill?{color:col(p.fill)}:{})});}
   else if(p.k==='c')pg.drawCircle({x:p.cx,y:PH-p.cy,size:p.r,borderColor:col(p.c),borderWidth:p.w0,...(p.fill?{color:col(p.fill)}:{})});
   else if(p.k==='img')pg.drawImage(await img(p.key),{x:p.x,y:PH-p.y-p.h,width:p.w,height:p.h});}}
 const bytes=await pdf.save();return {bytes,pages:pages.length,missing:F.missing};}
// ── Word
export async function mingshuDocx(blocks,io,title){const D=await import('docx');
 const {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,Footer,PageNumber,ImageRun,BorderStyle,TabStopType}=D;
 const FONT={ascii:'Times New Roman',hAnsi:'Times New Roman',eastAsia:'標楷體',cs:'標楷體'};
 const R=(text,o={})=>new TextRun({text,font:FONT,bold:true,size:(o.s||14)*2,color:(o.c||'#000000').slice(1),underline:o.u?{}:undefined,break:o.br});
 const tw=pt=>Math.round(pt*20);const SP={line:336,lineRule:'atLeast'};
 const para=(text,o={})=>new Paragraph({spacing:{...SP,before:tw(o.before||0),after:tw(o.after||0)},indent:o.ind!=null?{left:tw(o.ind),hanging:o.hang?tw(o.hang):undefined}:undefined,alignment:o.al,pageBreakBefore:o.pb,tabStops:o.tab?[{type:TabStopType.LEFT,position:tw(o.tab)}]:undefined,keepNext:o.kn,
  children:o.runs||[R(text,o)]});
 const cell=(txt,o={})=>new TableCell({width:o.w?{size:o.w,type:WidthType.DXA}:undefined,columnSpan:o.span,shading:o.fill?{fill:o.fill.slice(1)}:undefined,
  children:String(txt).split('\n').map(l=>new Paragraph({alignment:o.al||AlignmentType.CENTER,children:[R(l,{s:o.s||10.5,c:o.c})]}))});
 const table=(rows,widths)=>new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,rows:rows.map(r=>new TableRow({children:r}))});
 const pngSize=async k=>{const [w,h]=IMG[k];const W={body1:492,body2:492,taohua:400,caiwei:297}[k];return {width:Math.round(W*96/72),height:Math.round(W*h/w*96/72)};};
 const out=[];
 const one=async(b,inN)=>{const X=inN?24:24;switch(b.t){
  case 'T':out.push(para(b.x,{s:20,al:AlignmentType.CENTER,u:1,pb:true,after:10}));break;
  case 'H':out.push(para(b.x,{s:16,c:COLOR.H,before:12,after:6,kn:true}));break;
  case 'S':out.push(para(b.x,{s:14,c:COLOR.S,ind:8,before:inN?0:8}));break;
  case 'R':out.push(para(b.x,{s:14,c:COLOR.R,ind:X,before:inN?0:8}));break;
  case 'P':out.push(para(b.x,{s:14,ind:X+(b.hang?b.hang*14:0),hang:b.hang?b.hang*14:undefined,before:(!inN||b.gap)?8:0}));break;
  case 'N':{const [f,...rest]=b.c;
   if(f&&f.t!=='N'&&f.x!=null)out.push(para('',{ind:24,hang:16,tab:24,before:8,runs:[R(`${b.n}、`),new TextRun({text:'\t'}),R(f.x,{c:COLOR[f.t]})]}));else{out.push(para(`${b.n}、`,{ind:8,before:8}));if(f)await one(f,true);}
   for(const c of rest)await one(c,true);break;}
  case 'IMG':out.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:120,after:120},children:[new ImageRun({type:'png',data:await io.image(b.k),transformation:await pngSize(b.k),altText:{title:b.k,description:b.k,name:b.k}})]}));break;
  case 'TBL':out.push(para(b.cap,{s:13,ind:8,before:8}));out.push(table(b.rows.map(r=>r.map(c=>{const a=c.split('\n')[0];const hl=b.hl&&b.hl.includes(a);return cell(c,{w:2400,s:12,fill:hl?'#ffe0e0':null,c:hl?'#ff0000':null});})),[2400,2400,2400]));break;
  case 'COMPASS':{const d=b.d;const J=[...d.ji8.best,...d.ji8.good],K=[...d.ji8.worst,...d.ji8.bad];
   out.push(table([[cell('貴人方位',{w:4600,c:COLOR.H,s:12}),cell('八宅吉凶方位',{w:4600,c:COLOR.H,s:12})],[cell(d.gui.join('、'),{w:4600,s:12,c:'#ff0000'}),cell(`吉方：${J.join('、')}\n凶方：${K.join('、')}`,{w:4600,s:12})]],[4600,4600]));break;}
  case 'PAGE1':{const d=b.d,bi=d.birth,ord=[3,2,1,0],w=[1500,1500,1500,1500,1400];
   out.push(para('八字命盤',{s:16,c:COLOR.H,al:AlignmentType.CENTER,after:6}));
   out.push(table([[cell(`姓名：${d.name||'—'}`,{span:3,w:4500,al:AlignmentType.LEFT,s:12}),cell(`性別：${d.sex}`,{span:2,w:2900,s:12})],
    [cell(`西元：${bi.y}年${bi.m}月${bi.d}日${bi.h}時${bi.mi}分`,{span:5,w:7400,al:AlignmentType.LEFT,s:12})],[cell(`農曆：${d.lunar}`,{span:5,w:7400,al:AlignmentType.LEFT,s:12})],
    [...['時','日','月','年'].map(s=>cell(s,{w:1500,c:COLOR.H,s:12})),cell('',{w:1400})],
    [...ord.map(i=>cell(i===2?'日元':d.P[i].ss,{w:1500})),cell('主星',{w:1400})],
    [...ord.map(i=>cell(`${d.P[i].gan}（${'甲乙丙丁戊己庚辛壬癸'.indexOf(d.P[i].gan)>=0?'':''}）`.replace('（）',''),{w:1500,s:18,c:'#ff0000'})),cell('天干',{w:1400})],
    [...ord.map(i=>cell(d.P[i].zhi,{w:1500,s:18,c:'#ff0000'})),cell('地支',{w:1400})],
    [...ord.map(i=>cell(d.P[i].cang,{w:1500})),cell('藏',{w:1400})],
    [...ord.map(i=>cell(d.P[i].fu.join('\n'),{w:1500,s:9})),cell('副',{w:1400})],
    [...ord.map(i=>cell(`${d.P[i].stage}\n${d.ages[i]}歲`,{w:1500})),cell('十二運星',{w:1400})],
    [...ord.map(i=>cell((d.stars[i]||[]).join('\n')||'—',{w:1500,s:9.5})),cell('特星神煞',{w:1400})]],w));
   out.push(para(`天運五行：${d.tianyun}　胎息：${d.taixi}　胎元：${d.taiyuan}　命宮：${d.mg}　格局：${d.ge}　血型：${d.blood?d.blood+'型':'（　）'}　空亡：${d.kong.join('')}`,{s:11,before:6}));
   out.push(para('',{s:11,runs:[R(`喜用神：${d.xi.join('')}　`,{s:11,c:'#ff0000'}),R(`忌神：${d.ji.join('')}　`,{s:11,c:'#ff0000'}),R(`星座：${d.xz}　強弱：${d.strong?'身強':'身弱'}　`,{s:11}),R(d.chusheng,{s:11,c:COLOR.H})]}));
   out.push(para(`五行分數：${['木','火','土','金','水'].map(e=>`${e}${d.sc[e]}`).join('　')}`,{s:11}));
   out.push(para(`十神：${Object.entries(d.cnt).map(([k,v])=>k+v).join('　')}`,{s:11}));
   const dy=d.dayun.slice(0,8),dw=Math.floor(9200/dy.length);
   out.push(para('大運',{s:12,c:COLOR.H,before:6}));
   out.push(table([dy.map(u=>cell(`${u.from}歲`,{w:dw,s:9.5})),dy.map(u=>cell(u.gz,{w:dw,s:14,c:'#ff0000'})),dy.map(u=>cell(`${u.ss}\n${u.zs}`,{w:dw,s:9}))],dy.map(()=>dw)));
   out.push(para('流年',{s:12,c:COLOR.H,before:6}));
   const rows=[];for(let k=0;k<3;k++){const u5=d.ly.slice(k*5,k*5+5);rows.push(u5.map(u=>cell(`${u.y}（${u.age}歲）`,{w:1840,s:9.5})));rows.push(u5.map(u=>cell(`${u.gz}\n${u.ss[0]}／${u.ss[1]}\n${u.sui}`,{w:1840,s:10})));}
   out.push(table(rows,[1840,1840,1840,1840,1840]));
   out.push(para(`本命書依八字論命網站推算產生（${d.made}），僅供參考。`,{s:10,before:8}));break;}}};
 for(const b of blocks)await one(b,false);
 const doc=new Document({creator:'八字論命',title,styles:{default:{document:{run:{font:FONT,size:28}}}},
  sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:880,bottom:900,left:840,right:780,footer:400}}},
   footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({children:['Page ',PageNumber.CURRENT,' of ',PageNumber.TOTAL_PAGES],size:20,font:FONT})]})]})},
   children:out}]});
 return {doc,Packer};}
export async function mingshuDocxBlob(blocks,io,title){const {doc,Packer}=await mingshuDocx(blocks,io,title);return Packer.toBlob(doc);}
export async function mingshuDocxBuffer(blocks,io,title){const {doc,Packer}=await mingshuDocx(blocks,io,title);return Packer.toBuffer(doc);}
export {FONT_STACK};
