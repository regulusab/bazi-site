import {Document,Packer,Paragraph,TextRun,HeadingLevel,Table,TableRow,TableCell,WidthType} from 'docx';
const F='Microsoft JhengHei';
const run=(t,b)=>new TextRun({text:t,bold:b,font:F});
function para(el,heading){const runs=[];el.childNodes.forEach(n=>{const t=n.textContent;if(t)runs.push(run(t,n.nodeName==='B'||n.nodeName==='STRONG'));});return new Paragraph({children:runs,heading});}
export async function reportDocx(root){const out=[];
 const walk=el=>{for(const n of el.children){const t=n.tagName;
  if(t==='H1')out.push(para(n,HeadingLevel.HEADING_1));else if(t==='H2')out.push(para(n,HeadingLevel.HEADING_2));else if(t==='H3')out.push(para(n,HeadingLevel.HEADING_3));
  else if(t==='P'||t==='LI')out.push(para(n));
  else if(t==='TABLE'){const rows=[...n.rows].map(r=>new TableRow({children:[...r.cells].map(c=>new TableCell({children:[new Paragraph({children:[run(c.innerText||c.textContent,c.tagName==='TH')]})]}))}));if(rows.length)out.push(new Table({rows,width:{size:100,type:WidthType.PERCENTAGE}}));}
  else if(!['BUTTON','INPUT','SCRIPT','STYLE'].includes(t)&&!n.classList.contains('noprint'))walk(n);}};
 walk(root);
 return Packer.toBlob(new Document({sections:[{children:out}]}));}
