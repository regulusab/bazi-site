// Unified export: DOM -> blocks -> .docx / .pdf ; heavy libs are lazy-loaded.
export const DISCLAIMER='※ 本文件依傳統命理規則自動生成，僅供參考與娛樂，不構成任何人生、醫療、財務或法律建議。';
const BLOCK=/^(P|DIV|TABLE|H[1-6]|UL|OL|LI|DETAILS|SECTION|ARTICLE|SUMMARY)$/;
const SKIP=/^(BUTTON|INPUT|SELECT|SCRIPT|STYLE|LABEL|TEXTAREA)$/;
const clean=s=>s.replace(/\s+\n/g,'\n').replace(/[ \t]+/g,' ').trim();
function runs(el){const r=[];const rec=(n,b)=>{if(n.nodeType===3){if(n.textContent)r.push({t:n.textContent,b});}else if(n.nodeType===1){if(n.tagName==='BR'){r.push({t:'\n',b});return;}if(SKIP.test(n.tagName))return;n.childNodes.forEach(c=>rec(c,b||/^(B|STRONG|TH)$/.test(n.tagName)));}};rec(el,false);
 if(r.length){r[0].t=r[0].t.replace(/^\s+/,'');r[r.length-1].t=r[r.length-1].t.replace(/\s+$/,'');}return r.filter(x=>x.t);}
export function toBlocks(root){const out=[];
 const walk=el=>{for(const n of el.children){const t=n.tagName;
  if(SKIP.test(t)||n.classList.contains('xbar')||n.classList.contains('noprint')||n.classList.contains('noexport'))continue;
  if(/^H[1-6]$/.test(t)||t==='SUMMARY'){const s=clean(n.textContent);if(s)out.push({h:t==='SUMMARY'?3:+t[1],text:s});}
  else if(t==='P'||t==='LI'){const r=runs(n);if(r.length)out.push({p:r,cls:n.className});}
  else if(t==='TABLE'){const rows=[...n.rows].map(tr=>[...tr.cells].map(c=>({t:clean(c.innerText||c.textContent),th:c.tagName==='TH'})));if(rows.length)out.push({table:rows});}
  else if([...n.children].some(c=>BLOCK.test(c.tagName)))walk(n);
  else{const r=runs(n);if(r.length&&clean(n.textContent))out.push({p:r});}}};
 walk(root);return out;}
const today=()=>{const d=new Date();return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;};
export const fileBase=(name,label)=>`${(name||'命主').replace(/[\\/:*?"<>|\s]/g,'')}_${label}_${today()}`;
function wrap(blocks,title,sub){return [{h:1,text:title},...(sub?[{p:[{t:sub}],cls:'muted'}]:[]),...blocks,{p:[{t:DISCLAIMER}],cls:'muted'}];}

export async function makeDocx(blocks,title,sub){const {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType,AlignmentType}=await import('docx');
 const F='Microsoft JhengHei';const H=[null,HeadingLevel.HEADING_1,HeadingLevel.HEADING_2,HeadingLevel.HEADING_3,HeadingLevel.HEADING_4,HeadingLevel.HEADING_5,HeadingLevel.HEADING_6];
 const tr=(t,o={})=>{const parts=t.split('\n');return parts.map((s,i)=>new TextRun({text:s,font:{name:F,eastAsia:F},break:i?1:0,...o}));};
 const ch=[];for(const b of wrap(blocks,title,sub)){
  if(b.h)ch.push(new Paragraph({heading:H[b.h],alignment:b.h===1?AlignmentType.CENTER:undefined,children:tr(b.text)}));
  else if(b.p)ch.push(new Paragraph({children:b.p.flatMap(r=>tr(r.t,{bold:r.b,size:/muted/.test(b.cls||'')?18:undefined,color:/muted/.test(b.cls||'')?'777777':undefined}))}));
  else if(b.table){const n=Math.max(...b.table.map(r=>r.length));ch.push(new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:b.table.map(r=>new TableRow({children:[...r,...Array(n-r.length).fill({t:''})].map(c=>new TableCell({children:[new Paragraph({children:tr(c.t,{bold:c.th,size:n>8?14:18})})]}))}))}));ch.push(new Paragraph(''));}}
 return Packer.toBlob(new Document({creator:'八字論命',title,sections:[{properties:{page:{margin:{top:900,bottom:900,left:900,right:900}}},children:ch}]}));}

let fontP=null;
const PDFMAP={'⚠':'△','✓':'○','✗':'×','✔':'○'};
const ps=s=>s.replace(/[⚠✓✗✔]/g,c=>PDFMAP[c]);
async function pdfLib(){if(!fontP)fontP=(async()=>{const [{default:pdfMake},buf]=await Promise.all([import('pdfmake/build/pdfmake'),fetch(new URL('fonts/NotoSansTC-sub.otf',document.baseURI)).then(r=>{if(!r.ok)throw new Error('字型載入失敗');return r.arrayBuffer();})]);
 const u8=new Uint8Array(buf);let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));
 pdfMake.vfs={'tc.otf':btoa(s)};pdfMake.fonts={TC:{normal:'tc.otf',bold:'tc.otf',italics:'tc.otf',bolditalics:'tc.otf'}};return pdfMake;})();return fontP;}
export async function makePdf(blocks,title,sub){const pdfMake=await pdfLib();const content=[];let wide=0;
 for(const b of wrap(blocks,title,sub)){
  if(b.h)content.push({text:ps(b.text),fontSize:[0,18,14,12,11,11,11][b.h],bold:true,color:'#7a1f1f',alignment:b.h===1?'center':'left',margin:[0,b.h===1?0:8,0,4]});
  else if(b.p){const m=/muted/.test(b.cls||'');content.push({text:b.p.map(r=>({text:ps(r.t),bold:r.b})),fontSize:m?8.5:10.5,color:m?'#666':'#222',margin:[0,0,0,4],lineHeight:1.3});}
  else if(b.table){const n=Math.max(...b.table.map(r=>r.length));wide=Math.max(wide,n);const fs=n>9?6.5:n>6?8:9.5;
   content.push({table:{headerRows:b.table[0].every(c=>c.th)?1:0,widths:Array(n).fill('*'),dontBreakRows:true,body:b.table.map(r=>[...r,...Array(n-r.length).fill({t:''})].map(c=>({text:ps(c.t),bold:c.th,fillColor:c.th?'#f3e8cc':null,fontSize:fs})))},layout:{hLineColor:'#999',vLineColor:'#999',hLineWidth:()=>.5,vLineWidth:()=>.5,paddingLeft:()=>2,paddingRight:()=>2},margin:[0,2,0,8]});}}
 const dd={info:{title},pageSize:'A4',pageOrientation:wide>9?'landscape':'portrait',pageMargins:[36,40,36,40],defaultStyle:{font:'TC',fontSize:10.5},content,
  footer:(p,n)=>({text:`${title}　第 ${p} / ${n} 頁`,alignment:'center',fontSize:8,color:'#888'})};
 return new Promise((res,rej)=>{try{pdfMake.createPdf(dd).getBlob(res);}catch(e){rej(e);}});}
export function saveBlob(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},4000);}
export async function share(url,title,pdfFn){let file=null;
 if(navigator.share&&navigator.canShare&&pdfFn){try{const b=await pdfFn();file=new File([b.blob],b.name,{type:'application/pdf'});if(!navigator.canShare({files:[file]}))file=null;}catch(e){file=null;}}
 if(navigator.share){try{await navigator.share(file?{files:[file],title,text:title+'\n'+url}:{title,url});return 'shared';}catch(e){if(e&&e.name==='AbortError')return 'abort';}}
 try{await navigator.clipboard.writeText(url);alert('已複製分享連結：\n'+url);return 'copied';}catch(e){prompt('分享連結（請複製）',url);return 'prompt';}}
