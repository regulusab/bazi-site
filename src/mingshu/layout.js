// 命書版面：把 build() 的區塊排成 A4 頁面的繪圖指令（點，左上原點），供 PDF 與 SVG 共用。
import {isChong,liuhe,hai,isXing,ganhe,ganKe} from './engine.js';
import {ganWx,zhiWx} from '../bazi.js';
export const PW=595.28,PH=841.89;
const LH=16.8,XB=66,XN=50,XH=42,RIGHT=556,TOP=44,BOT=784;
export const COLOR={T:'#000000',H:'#0000ff',S:'#008000',R:'#ff0000',P:'#000000'};
export const SIZE={T:20,H:16,S:14,R:14,P:14};
export const IMG={body1:[793,1020],body2:[793,985],taohua:[830,841],caiwei:[478,243]};
const IMGW={body1:492,body2:492,taohua:400,caiwei:297};
const NOSTART='，。、：；！？）」』】》,.;:!?)…％%';
export function wrap(text,width,size,meas){const out=[];
 for(const para of String(text).split('\n')){let cur='';
  let w=0;for(const ch of para){const cw=meas(ch,size);if(cur&&w+cw>width&&!NOSTART.includes(ch)){out.push(cur);cur=ch;w=cw;}else{cur+=ch;w+=cw;}}
  out.push(cur);}
 return out;}
const t=(x,y,s,txt,c='#000000',o={})=>({k:'t',x,y,s,t:String(txt),c,...o});
const ln=(x1,y1,x2,y2,w=0.8,c='#000000')=>({k:'l',x1,y1,x2,y2,w,c});
const rc=(x,y,w,h,o={})=>({k:'r',x,y,w,h,w0:0.8,c:'#000000',...o});
const ci=(cx,cy,r,o={})=>({k:'c',cx,cy,r,w0:0.8,c:'#000000',...o});
// 直書
const vt=(x,y,s,txt,c,step)=>[...String(txt)].map((ch,i)=>t(x,y+i*(step||s*1.08),s,ch,c,{mid:1}));
// 文字置中（mid:1 表示 x 為中心）
const ct=(x,y,s,txt,c)=>t(x,y,s,txt,c,{mid:1});
export function page1(d){const o=[];const BL='#0000ff',RD='#ff0000',GR='#008000';
 // ── 右：命盤表
 const X0=283,CW=57,XL=511,XR=567,cx=i=>X0+CW*i+CW/2;const ord=[3,2,1,0];// 時日月年
 const rows=[51,74,97,120,140,180,236,292,320,360,392,560,578,612,640];
 o.push(rc(X0,rows[0],XR-X0,rows[rows.length-1]-rows[0],{w0:1.2}));
 for(let i=1;i<rows.length-1;i++)o.push(ln(X0,rows[i],XR,rows[i]));
 for(let i=1;i<4;i++)o.push(ln(X0+CW*i,rows[3],X0+CW*i,rows[11]));o.push(ln(XL,rows[3],XL,rows[11]));
 const b=d.birth;
 o.push(t(X0+6,rows[0]+16,12,`姓名：${d.name||'—'}`),t(XL-30,rows[0]+16,12,`性別：${d.sex}`));
 o.push(t(X0+6,rows[1]+16,12,`西元：${b.y}年${b.m}月${b.d}日${b.h}時${b.mi}分`));
 o.push(t(X0+6,rows[2]+16,12,`農曆：${d.lunar}`));
 const lab=['','主星','天干','地支','藏','副','十二運星','特星神煞'];
 ['時','日','月','年'].forEach((s,i)=>o.push(ct(cx(i),rows[3]+15,12,s,BL)));
 for(let r=4;r<=10;r++){const s=lab[r-3];const h=rows[r+1]-rows[r];
  if(s.length>2&&h<60)o.push(ct((XL+XR)/2,rows[r]+h/2-2,10,s.slice(0,2)),ct((XL+XR)/2,rows[r]+h/2+10,10,s.slice(2)));
  else if(s.length>2)o.push(...vt((XL+XR)/2,rows[r]+h/2-s.length*6+10,11,s));
  else o.push(ct((XL+XR)/2,rows[r]+h/2+5,12,s));}
 ord.forEach((pi,i)=>{const p=d.P[pi],x=cx(i);
  const ss=pi===2?'日元':p.ss;o.push(...vt(x,rows[4]+15,11,ss,'#000000',12));
  o.push(ct(x-6,rows[5]+44,22,p.gan,RD),t(x+8,rows[5]+52,9,ganWx(p.gan)));
  o.push(ct(x-6,rows[6]+44,22,p.zhi,RD),t(x+8,rows[6]+52,9,zhiWx(p.zhi)));
  o.push(ct(x,rows[7]+18,12,p.cang));
  p.fu.forEach((f,k)=>o.push(ct(x,rows[8]+11+k*10.5,9,f)));
  o.push(ct(x,rows[9]+15,12,p.stage),ct(x,rows[9]+28,8,d.ages[pi]+'歲'));
  (d.stars[pi]||[]).forEach((s,k)=>o.push(ct(x,rows[10]+16+k*14,11,s)));});
 // 干支關係（相鄰柱）
 for(let i=0;i<3;i++){const a=d.P[ord[i]],c=d.P[ord[i+1]];
  for(let j=i+1;j<4;j++){const c=d.P[ord[j]],lv=j-i-1,xa=cx(i)+10,xb=cx(j)-10;
  const k=(u,v)=>{const A='木火土金水',x=A.indexOf(ganWx(u)),y=A.indexOf(ganWx(v));return (x+2)%5===y;};
  const g=ganhe(a.gan)===c.gan?'合':(j===i+1&&(k(a.gan,c.gan)||k(c.gan,a.gan)))?'剋':'';
  if(g){const y=rows[5]+8+lv*7;o.push(ln(xa,y,xb,y,0.7,BL),ct((xa+xb)/2+(lv?14:0),y-1,7,g,BL));}
  const z=isChong(a.zhi,c.zhi)?'沖':isXing(a.zhi,c.zhi)||isXing(c.zhi,a.zhi)?'刑':liuhe(a.zhi)===c.zhi?'合':hai(a.zhi)===c.zhi?'害':'';
  if(z){const y=rows[6]+8+lv*7;o.push(ln(xa,y,xb,y,0.7,BL),ct((xa+xb)/2+(lv?14:0),y-1,7,z,BL));}}}
 // 大運
 const dy=d.dayun.slice(0,8),DW=(XR-X0)/dy.length;
 dy.forEach((u,i)=>{const x=XR-DW*i-DW/2;if(i)o.push(ln(XR-DW*i,rows[11],XR-DW*i,rows[14]));
  o.push(ct(x,rows[11]+13,9,u.from+'歲'),ct(x,rows[12]+15,13,u.gz[0],RD),ct(x,rows[12]+30,13,u.gz[1],RD),ct(x,rows[13]+12,7.5,u.ss),ct(x,rows[13]+22,7.5,u.zs));});
 o.push(t(X0+3,rows[11]-4,9,'大運（由右至左）',BL));
 // ── 左上：五行圓
 const C=[140,128],R=72,EL=['火','土','金','水','木'];
 const A5='木火土金水',de=A5.indexOf(ganWx(d.P[2].gan)),GRP=[['比肩','劫財'],['食神','傷官'],['偏財','正財'],['七殺','正官'],['偏印','正印']];
 o.push(ci(C[0],C[1],R+20,{c:'#999999',w0:0.6}));
 EL.forEach((e,i)=>{const a=-Math.PI/2+i*2*Math.PI/5,x=C[0]+R*Math.cos(a),y=C[1]+R*Math.sin(a);
  const gi=(A5.indexOf(e)-de+5)%5,pr=GRP[gi],xi_=C[0]+R*0.48*Math.cos(a),yi=C[1]+R*0.48*Math.sin(a);
  o.push(ct(xi_,yi-2,8,`${pr[0]}${d.cnt[pr[0]]}`),ct(xi_,yi+8,8,`${pr[1]}${d.cnt[pr[1]]}`,RD));
  o.push(ci(x,y,15,{fill:'#ffffff',c:'#000000',w0:1}),ct(x,y+6,16,e,RD),ct(x+(Math.cos(a)>0.2?30:Math.cos(a)<-0.2?-30:0),y+(Math.cos(a)>0.2||Math.cos(a)<-0.2?5:(Math.sin(a)<0?-20:30)),11,`${d.sc[e]}分`,BL));});
 // 十神統計
 const sk=['比肩','劫財','食神','傷官','偏財','正財','七殺','正官','偏印','正印'];

 // 直書資料
 const info=[['天運五行',d.tianyun],['胎息',d.taixi],['胎元',d.taiyuan],['命宮',d.mg],['格局',d.ge],['血型',d.blood?d.blood+'型':'　'],['空亡',d.kong.join('')],['喜用神',d.xi.join('')],['忌神',d.ji.join('')],['星座',d.xz],['強弱',d.strong?'身強':'身弱']];
 info.forEach(([k,v],i)=>o.push(...vt(26+i*21.5,240,10.5,`${k}：${v}`,i>=7&&i<=8?RD:'#000000',11.2)));
 o.push(...vt(268,240,10.5,d.chusheng,BL,11.2));
 // 左下：流年表
 const LX=20,LY=440,LWc=48,LHb=70;o.push(t(LX,LY-6,11,'流年',BL));
 for(let blk=0;blk<3;blk++){const y0=LY+blk*LHb;o.push(rc(LX,y0,LWc*5,LHb-4,{w0:0.8}));o.push(ln(LX,y0+15,LX+LWc*5,y0+15));
  for(let i=0;i<5;i++){const u=d.ly[blk*5+4-i],x=LX+LWc*i+LWc/2;if(i)o.push(ln(LX+LWc*i,y0,LX+LWc*i,y0+LHb-4));
   o.push(ct(x,y0+11,9,`${u.y}(${u.age})`),ct(x-9,y0+33,14,u.gz[0],RD),ct(x-9,y0+50,14,u.gz[1],RD),t(x+1,y0+29,7.5,u.ss[0]),t(x+1,y0+46,7.5,u.ss[1]),ct(x,y0+62,8.5,u.sui,GR));}}
 // 客戶資料框
 o.push(rc(20,660,547,70,{rr:8,c:GR,w0:1.2}),t(32,680,12,'【客戶資料】',GR),t(32,700,11,`姓名：${d.name||'—'}　性別：${d.sex}　出生：${b.y}年${b.m}月${b.d}日${b.h}時${b.mi}分${d.place?'（'+d.place+'）':''}`),t(32,718,10,`本命書依八字論命網站推算產生（${d.made}），僅供參考。`));
 return o;}
function compass(cx,cy,r,title,lab){const o=[ci(cx,cy,r),ci(cx,cy,r*0.35),ct(cx,cy+4,10,'中')];
 const D=['北','東北','東','東南','南','西南','西','西北'];
 D.forEach((dd,i)=>{const a=-Math.PI/2+Math.PI-(i*Math.PI/4);// 上南下北（傳統），東在左
  const ang=Math.PI/2+i*Math.PI/4;const x=cx+Math.cos(ang)*r*0.68,y=cy+Math.sin(ang)*r*0.68;
  o.push(ln(cx+Math.cos(ang+Math.PI/8)*r*0.35,cy+Math.sin(ang+Math.PI/8)*r*0.35,cx+Math.cos(ang+Math.PI/8)*r,cy+Math.sin(ang+Math.PI/8)*r,0.5));
  const L=lab(dd);o.push(ct(x,y-2,10,dd),ct(x,y+11,9,L[0],L[1]));});
 o.push(ct(cx,cy-r-8,12,title,'#0000ff'));return o;}
const shiftY=(p,dy)=>{const q={...p};for(const k of ['y','y1','y2','cy'])if(k in q)q[k]+=dy;return q;};
// 主排版
export function layout(blocks,meas,opt={}){const pages=[];let pg=null,y=TOP;
 const newPage=()=>{pg=[];pages.push(pg);y=TOP;};newPage();
 const ensure=h=>{if(y+h>BOT)newPage();};
 const lines=(txt,x,size,color,pitch,hang)=>{let ls;if(hang){const hw=hang*size,first=wrap(txt,RIGHT-x,size,meas)[0]||'';const rest=String(txt).slice(first.length);ls=[[first,x],...(rest?wrap(rest,RIGHT-x-hw,size,meas).map(l=>[l,x+hw]):[])];}
  else ls=wrap(txt,RIGHT-x,size,meas).map(l=>[l,x]);
  for(const [l,xx] of ls){ensure(pitch);if(l)pg.push(t(xx,y+size*0.88,size,l,color));y+=pitch;}};
 let prev=null;
 const one=(b,x,inN)=>{switch(b.t){
  case 'T':{if(pg.length)newPage();const w=meas(b.x,20);pg.push(t((PW-w)/2,y+18,20,b.x,COLOR.T,{u:1}));y+=30;break;}
  case 'H':{if(y>TOP)y+=12;ensure(LH*4);lines(b.x,XH,16,COLOR.H,20);y+=6;break;}
  case 'S':{if(!inN&&y>TOP&&prev!=='H')y+=10;lines(b.x,XN,14,COLOR.S,LH);if(!inN)y+=4;break;}
  case 'R':{if(!inN&&y>TOP&&prev!=='H'&&prev!=='S')y+=10;lines(b.x,inN?x:XB,14,COLOR.R,LH);break;}
  case 'P':{if((!inN||b.gap)&&y>TOP&&prev!=='H'&&prev!=='S')y+=10;lines(b.x,x,14,COLOR.P,LH,b.hang);break;}
  case 'N':{if(y>TOP)y+=10;ensure(LH*2);pg.push(t(XN,y+14*0.88,14,b.n+'、'));
   for(const c of b.c)one(c,XB,true);break;}
  case 'IMG':{const [iw,ih]=IMG[b.k],w=IMGW[b.k],h=w*ih/iw;if(y>TOP)y+=8;ensure(h);pg.push({k:'img',key:b.k,x:(PW-w)/2,y,w,h});y+=h+8;break;}
  case 'TBL':{const cw=120,rh=46,x0=(PW-cw*3)/2;if(y>TOP)y+=10;ensure(LH+rh*3+6);lines(b.cap,XN,13,'#000000',LH);y+=4;
   b.rows.forEach((r,i)=>r.forEach((c,j)=>{const hl=b.hl&&b.hl.includes(c.split('\n')[0]);pg.push(rc(x0+j*cw,y+i*rh,cw,rh,{fill:hl?'#ffe0e0':null}));
    c.split('\n').forEach((s,k)=>pg.push(ct(x0+j*cw+cw/2,y+i*rh+19+k*16,k?11:13,s,k?(hl?'#ff0000':'#000000'):'#0000ff')));}));y+=rh*3+8;break;}
  case 'COMPASS':{const h=220;if(y>TOP)y+=8;ensure(h);const y0=y;
   pg.push(...compassPrims(b.d).map(p=>shiftY(p,y0)));y+=h+6;break;}
  case 'PAGE1':{if(pg.length)newPage();pg.push(...page1(b.d));newPage();break;}}
  prev=b.t;};
 for(const b of blocks)one(b,XB,false);
 if(!pg.length)pages.pop();
 const N=pages.length;pages.forEach((p,i)=>p.push(t(452,804,10,`Page ${i+1} of ${N}`)));
 return pages;}

// 繪圖指令 → SVG
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const FONT_STACK="MingshuKai,SheetTCX,'BiauKai','DFKai-SB','Kaiti TC','STKaiti',serif";
export function svgOf(prims,box,attrs='',imgUrl=k=>k){const [x0,y0,w,h]=box;const o=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${w} ${h}" ${attrs} font-family="${esc(FONT_STACK)}">`];
 for(const p of prims){
  if(p.k==='t'){o.push(`<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" font-size="${p.s}" fill="${p.c}"${p.mid?' text-anchor="middle"':''}${p.u?' text-decoration="underline"':''}>${esc(p.t)}</text>`);}
  else if(p.k==='l')o.push(`<line x1="${p.x1.toFixed(1)}" y1="${p.y1.toFixed(1)}" x2="${p.x2.toFixed(1)}" y2="${p.y2.toFixed(1)}" stroke="${p.c}" stroke-width="${p.w}"/>`);
  else if(p.k==='r')o.push(`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"${p.rr?` rx="${p.rr}"`:''} fill="${p.fill||'none'}" stroke="${p.c}" stroke-width="${p.w0}"/>`);
  else if(p.k==='c')o.push(`<circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="${p.r}" fill="${p.fill||'none'}" stroke="${p.c}" stroke-width="${p.w0}"/>`);
  else if(p.k==='img')o.push(`<image href="${esc(imgUrl(p.key))}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"/>`);}
 o.push('</svg>');return o.join('');}
export function compassPrims(d){const g=new Set(d.gui.map(s=>s.replace(/方$/,'')));const J={};d.ji8.best.concat(d.ji8.good).forEach(z=>J[z.replace(/^正/,'')]=1);
 return [...compass(150,110,85,'貴人方位',dd=>g.has(dd)?['●貴人','#ff0000']:['','#000000']),...compass(PW-150,110,85,'八宅吉凶方位',dd=>J[dd]?['吉方','#008000']:['凶方','#ff0000'])];}
