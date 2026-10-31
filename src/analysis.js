// 格局・用神・調候・旺衰 — rule-based, deterministic
import {GAN,ZHI,WX,ganWx,zhiWx,hide,shiShen,zhiRel,ganRel} from './bazi.js';
export const rel=(dw,k)=>WX[(WX.indexOf(dw)+k)%5]; // 0比劫 1食傷 2財 3官殺 4印
export const GROUP=['比劫','食傷','財星','官殺','印星'];
export const SEASON={寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水',子:'水',丑:'土'};
export function wangXiang(mz){const s=SEASON[mz],o={};WX.forEach(w=>{const d=(WX.indexOf(w)-WX.indexOf(s)+5)%5;o[w]=['旺','相','死','囚','休'][d];});return o;}
const GOOD=['正官','正印','正財','食神'],BADS=['七殺','傷官','劫財','偏印'];
export const ssNature=s=>GOOD.includes(s)?'吉':BADS.includes(s)?'凶':'平';
export function analyze(c){
 const P=c.pillars,dw=c.dw,sc=c.score,tot=Object.values(sc).reduce((a,b)=>a+b);
 const pct={};WX.forEach(w=>pct[w]=sc[w]/tot);
 const mz=P[1].zhi,dm=c.dm;
 // 得令 得地 得勢
 const delin=[dw,rel(dw,4)].includes(SEASON[mz]);
 const roots=P.filter((p,i)=>hide(p.zhi).some(g=>ganWx(g)===dw)).map(p=>p.label);
 const help=P.filter((p,i)=>i!==2&&[dw,rel(dw,4)].includes(ganWx(p.gan))).map(p=>p.label);
 let pts=Math.round(c.self*40)+(delin?8:0)+roots.length*2+help.length*2; // 0-60ish
 const strong=c.self>=0.5;
 // 格局
 const mh=hide(mz);const tou=mh.find(g=>P.some((p,i)=>i!==2&&p.gan===g));const gg=tou||mh[0];let ge=shiShen(dm,gg);
 let geName=ge==='比肩'?'建祿格':ge==='劫財'?'月刃格':(ge==='偏財'||ge==='正財'?ge+'格':ge==='七殺'?'七殺格':ge+'格');
 const allSS=[];P.forEach((p,i)=>{if(i!==2)allSS.push(p.ss);p.hide.forEach(h=>allSS.push(h.ss));});
 const has=s=>allSS.includes(s),hasG=g=>allSS.some(s=>g.includes(s));
 const combos=[];
 if(has('七殺')&&hasG(['正印','偏印']))combos.push(['殺印相生','七殺有印化之，壓力可轉為權柄，宜任職掌權、教學管理']);
 if(has('食神')&&has('七殺'))combos.push(['食神制殺','以才智技藝制伏壓力，臨事有魄力']);
 if(has('傷官')&&hasG(['正印','偏印']))combos.push(['傷官配印','才華有約束，宜專業、學術、技術']);
 if(hasG(['正財','偏財'])&&has('正官'))combos.push(['財官相生','財能生官，事業與收入互為支撐']);
 if(hasG(['食神','傷官'])&&hasG(['正財','偏財']))combos.push(['食傷生財','以才能、技藝或口才生財']);
 if(has('傷官')&&has('正官')&&P.some(p=>p.ss==='傷官')&&P.some(p=>p.ss==='正官'))combos.push(['傷官見官','天干傷官與正官並透，宜慎言守規，防與上司、規範衝突']);
 if(!strong&&pct[rel(dw,2)]>=.3)combos.push(['財多身弱','財星旺而日主難任，宜借力合作，量力理財']);
 if(strong&&pct[dw]>=.3&&hasG(['正財','偏財']))combos.push(['比劫爭財','同輩分財之象，合夥借貸宜分明']);
 // 爭合
 const zh=[];for(const g of GAN){const n=P.filter(p=>p.gan===g).length;if(n>=2){const partner=P.filter(p=>ganRel(g,p.gan).some(r=>r.startsWith('合')));if(partner.length===1)zh.push(`${partner[0].gan}一干而${g}${n}見，${n}${g}爭合${partner[0].gan}`);}}
 // 用神
 const shi=rel(dw,1),cai=rel(dw,2),guan=rel(dw,3),yin=rel(dw,4);let yong,xi,fu=null,ji,method;
 if(strong){method='身強宜洩、宜耗、宜制';
  if(sc[yin]>sc[dw]||(sc[yin]>=sc[dw]*0.5&&sc[guan]>0)){yong=cai;xi=pct[guan]>0?guan:shi;fu=xi===guan?shi:guan;}
  else if(pct[guan]>=.15){yong=guan;xi=cai;fu=shi;} else {yong=shi;xi=cai;fu=guan;}
  ji=[yin,dw];}
 else{method='身弱宜生、宜扶';
  const enemy=[[guan,sc[guan]],[shi,sc[shi]],[cai,sc[cai]]].sort((a,b)=>b[1]-a[1])[0][0];
  if(enemy===cai){yong=dw;xi=yin;} else {yong=yin;xi=dw;}
  ji=enemy===guan?[guan,cai]:enemy===shi?[shi,cai]:[cai,guan];}
 // 調候
 let tiao='寒暖適中，無須偏補';let tiaoW=null;
 if('亥子丑'.includes(mz)){tiaoW='火';tiao='生於冬令，水寒土凍，調候以火為急';}
 if('巳午未'.includes(mz)){tiaoW='水';tiao='生於夏令，炎燥，調候宜水潤';}
 if(tiaoW&&pct[tiaoW]>=.22)tiao+=`；原局${tiaoW}已有 ${(pct[tiaoW]*100).toFixed(0)}%，調候已足`;
 const missing=WX.filter(w=>sc[w]<0.05);
 const lev=pts>=34?'身強':pts>=26?'偏強':pts>=18?'偏弱':'身弱';
 return {pct,delin,roots,help,pts,lev,strong,geName,ge,combos,zh,yong,xi,fu,ji,method,tiao,tiaoW,missing,wx:wangXiang(mz),
  role:w=>w===yong?'用':w===xi?'喜':w===fu?'輔':ji.includes(w)?'忌':'閒'};
}
