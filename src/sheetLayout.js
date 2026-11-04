// 詳細命盤版面：以星僑範本（羅章雲頁）量測之字形座標為基準，替換文字後排版。座標系 1512×2016（範本掃描像素）。
import T from './sheet-template.js';
export const TPL=T;
const isLatin=ch=>ch.codePointAt(0)<0x2000&&ch!=='•';
const ttype=t=>t==='•'?'B':(isLatin(t[0])?'L':'C');
const adv=(t,f)=>{const A=T.adv[f]||{};let s=0;for(const c of t)s+=A[c]!=null?A[c]:(f==='cjk'?1:0.5);return s;};
const md=v=>{const a=v.slice().sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;};
const bc=b=>(b[0]+b[2])/2;
const r1=v=>Math.round(v*10)/10;
const keyOf=(box,mode)=>box.map(r1).join(',')+'|'+mode;
export function tokens(text,mode){let toks;
 if(Array.isArray(text))toks=text;
 else{const hasC=[...text].some(c=>!isLatin(c));if(hasC&&mode!=='h'){toks=text.match(/[\x20-\x7e]+|[\s\S]/gu)||[];}else toks=[...text];}
 return toks.filter(t=>t.trim()!=='');}
// 範本欄位標記 §field.i → 實際值
function fill(text,W,box){const get=ref=>{let [k,...ix]=ref.split('.');if(k==='minguo'&&box[0]===1207&&W.minguo_l!=null)k='minguo_l';let v=W[k];for(const i of ix)v=v==null?v:v[+i];return v;};
 if(Array.isArray(text)){const out=[];for(const t of text){if(typeof t==='string'&&t[0]==='§'){const v=get(t.slice(1));if(Array.isArray(v))out.push(...v);else if(v!=null)out.push(String(v));}else out.push(t);}return out;}
 if(typeof text==='string'&&text[0]==='§'){const v=get(text.slice(1));if(Array.isArray(v)){return v.length===1&&typeof v[0]==='string'&&text.startsWith('§shensha')?v[0]:v;}return v==null?'':String(v);}
 return text;}
const recs=T.recs.map(r=>({...r,key:keyOf(r.box,r.mode)}));
const byKey={};for(const r of recs)(byKey[r.key]||(byKey[r.key]=[])).push(r);
function subst(g,toks,dx=0){return g.map(([x,y,t,f,s],i)=>{const nt=toks[i];const nf=f==='mono'?'mono':(isLatin(nt[0])?'serif':'cjk');
 if(nf==='cjk'&&f==='cjk')return [x+dx,y,nt,nf,s];if(t==='•')return [x+dx,y,nt,f,s];
 const a0=adv(t,f)*s,a1=adv(nt,nf)*s;return [x+dx+(a0-a1)/2,y,nt,nf,s];});}
const DEF={CC:29.3,CB:40,BC:19,bx:-15,LL:29.3,CL:29.3,LC:29.3,BL:19,LB:40};
function vstats(it,ref,row){const offs=[],y0s=[],G={CC:[],CB:[],BC:[]},bx=[];
 for(const r of row.concat([ref])){const cs=r.glyphs.filter(g=>ttype(g[2])==='C');if(!cs.length)continue;
  offs.push(...cs.map(g=>g[0]-bc(r.box)));y0s.push(r.glyphs[0][1]);
  for(let i=0;i+1<r.glyphs.length;i++){const p=r.glyphs[i],q=r.glyphs[i+1];const tp=ttype(p[2])+ttype(q[2]);if(G[tp])G[tp].push(q[1]-p[1]);if(tp==='CB')bx.push(q[0]-p[0]);}}
 const m=(v,d)=>v.length?md(v):d;
 return {off:m(offs,3),y0:m(y0s,ref.glyphs[0]?ref.glyphs[0][1]:it.box[1]+42),gap:{...DEF,CC:m(G.CC,DEF.CC),CB:m(G.CB,DEF.CB),BC:m(G.BC,DEF.BC)},bx:m(bx,DEF.bx)};}
function synthV(it,toks,ref,row,xc){const st=vstats(it,ref,row);const x=xc!=null?xc-14.8:bc(it.box)+st.off;let y=st.y0;const s=29.6;const out=[];let prev=null;
 for(const t of toks){const tt=ttype(t);if(prev)y+=st.gap[prev+tt]!=null?st.gap[prev+tt]:st.gap.CC;
  if(tt==='C')out.push([x,y,t,'cjk',s]);else if(tt==='B')out.push([x+st.bx,y,t,'cjk',59.2]);
  else{const sl=T.SIZEL;const a=adv(t,'serif')*sl;out.push([x+s/2-a/2,y,t,'serif',sl]);}prev=tt;}
 return out;}
function synthH(it,toks,ref){const g=ref.glyphs;const dx=bc(it.box)-bc(ref.box);const s=md(g.map(x=>x[4])),y=md(g.map(x=>x[1]));
 const cs=g.filter(x=>ttype(x[2])==='C');const pitch=cs.length>1?md(cs.slice(1).map((x,i)=>x[0]-cs[i][0])):s;
 const l=Math.min(...g.map(x=>x[0])),r=Math.max(...g.map(x=>x[0]+(ttype(x[2])==='C'?x[4]:adv(x[2],'serif')*x[4])));const cx=(l+r)/2+dx;
 if(toks.some(t=>ttype(t)==='L')){ // 含拉丁字：依字寬排
  const w=toks.map(t=>ttype(t)==='C'?pitch:adv(t,'serif')*s);const tot=w.reduce((a,b)=>a+b,0)-(ttype(toks[toks.length-1])==='C'?pitch-s:0);let x=cx-tot/2;
  return toks.map((t,i)=>{const o=[x,y,t,ttype(t)==='C'?'cjk':'serif',s];x+=w[i];return o;});}
 const wid=pitch*(toks.length-1)+s;const x=cx-wid/2;return toks.map((t,i)=>[x+i*pitch,y,t,'cjk',s]);}
// 直排欄超出格子：神煞拆成多欄（右起），其他文字等比縮小
const bottomOf=g=>g[2]==='•'?g[1]-0.322*g[4]:g[1]+0.05*g[4];
function fitV(it,g,toks,ref,row){if(!g.length)return g;const lim=Math.max(it.box[3]-3,...(ref?ref.glyphs.map(bottomOf):[]));if(bottomOf(g[g.length-1])<=lim)return g;
 if(toks.includes('•')){const st=vstats(it,ref,row);const stars=[];let cur=[];for(const t of toks){cur.push(t);if(t==='•'){stars.push(cur);cur=[];}}if(cur.length)stars.push(cur);
  const cap=lim-st.y0;const h=s=>{let y=0;for(let i=1;i<s.length;i++)y+=st.gap[ttype(s[i-1])+ttype(s[i])]||st.gap.CC;return y+(s[s.length-1]==='•'?-0.322*59.2:0.05*29.6);};
  const cols=[];let c=[];for(const s of stars){const cand=c.length?c.concat(['C_GAP'],s):s;const hh=h(cand.filter(x=>x!=='C_GAP').length?c.concat(s):s);if(c.length&&hh>cap){cols.push(c);c=s.slice();}else c=c.concat(s);}if(c.length)cols.push(c);
  const n=cols.length,W=it.box[2]-it.box[0];const pitch=Math.min(36,(W-4)/n);const out=[];
  cols.forEach((cc,j)=>{const xc=bc(it.box)+pitch*(n-1)/2-pitch*j;out.push(...synthV(it,cc,ref,row,xc));});
  const over=Math.max(...out.map(bottomOf))-lim;if(over<=0)return out;g=out;}
 const y0=Math.min(...g.map(x=>x[1]-(x[2]==='•'?0.45*x[4]:0.88*x[4])));const top=y0,need=Math.max(...g.map(bottomOf))-top,avail=lim-top;const k=avail/need;
 const xs=md(g.filter(x=>x[3]==='cjk'&&x[2]!=='•').map(x=>x[0]+x[4]/2).concat([bc(it.box)]));
 return g.map(([x,y,t,f,s])=>{const cx=x+(f==='cjk'?s/2:adv(t,f)*s/2);const nx=xs+(cx-xs)*k;const ns=s*k;return [nx-(f==='cjk'?ns/2:adv(t,f)*ns/2),top+(y-top)*k,t,f,ns];});}
// 橫排含拉丁字超寬：縮小
function fitH(it,g,og){if(!g.length)return g;const ext=a=>[Math.min(...a.map(x=>x[0])),Math.max(...a.map(x=>x[0]+adv(x[2],x[3])*x[4]))];const oe=og&&og.length?ext(og):[1e9,-1e9];const L=Math.min(it.box[0]+1,oe[0]),R=Math.max(it.box[2]-1,oe[1]);const l=Math.min(...g.map(x=>x[0])),r=Math.max(...g.map(x=>x[0]+adv(x[2],x[3])*x[4]));if(l>=L-0.5&&r<=R+0.5)return g;
 const k=Math.min(1,(R-L)/(r-l));const c=(L+R)/2,mid=(l+r)/2;return g.map(([x,y,t,f,s])=>[c+(x-mid)*k,y,t,f,s*k]);}
export function layoutSheet(W,{log}={}){const out=T.ltc.map(g=>g.slice());const L=log||[];
 for(const it0 of T.tpl){const it={...it0,text:fill(it0.text,W,it0.box)};const toks=tokens(it.text,it.mode);if(!toks.length)continue;
  const k=keyOf(it.box,it.mode);const cand=byKey[k];const nt=toks.map(ttype);
  if(cand){const og=cand[0].glyphs;if(og.length===nt.length&&og.every((g,i)=>ttype(g[2])===nt[i])){const g=subst(og,toks);out.push(...(it.mode==='v'?fitV(it,g,toks,cand[0],[]):fitH(it,g,og)));continue;}}
  const row=recs.filter(r=>r.mode===it.mode&&Math.abs(r.box[1]-it.box[1])<0.5&&Math.abs(r.box[3]-it.box[3])<0.5&&Math.abs((r.box[2]-r.box[0])-(it.box[2]-it.box[0]))<6);
  const don=row.filter(r=>r.glyphs.length===nt.length&&r.glyphs.every((g,i)=>ttype(g[2])===nt[i]));
  if(don.length){let best=don[0];for(const r of don)if(Math.abs(bc(r.box)-bc(it.box))<Math.abs(bc(best.box)-bc(it.box)))best=r;
   const g=subst(best.glyphs,toks,bc(it.box)-bc(best.box));out.push(...(it.mode==='v'?fitV(it,g,toks,best,row):fitH(it,g,best.glyphs.map(x=>[x[0]+bc(it.box)-bc(best.box),...x.slice(1)]))));L.push(['DONOR',toks.join('')]);continue;}
  let ref=cand?cand[0]:null;
  if(!ref){if(!row.length){L.push(['NOREF',toks.join('')]);continue;}ref=row[0];for(const r of row)if(Math.abs(bc(r.box)-bc(it.box))<Math.abs(bc(ref.box)-bc(it.box)))ref=r;}
  if(it.mode==='v'){const g=synthV(it,toks,ref,row);out.push(...fitV(it,g,toks,ref,row));L.push(['SYNV',toks.join('')]);}
  else{out.push(...fitH(it,synthH(it,toks,ref),ref.glyphs.map(x=>[x[0]+bc(it.box)-bc(ref.box),...x.slice(1)])));L.push(['SYNH',toks.join('')]);}}
 return out;}
