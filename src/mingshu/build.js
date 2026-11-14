// 命書（第十一節）內容生成：依範本之章節順序、標題、語氣產生區塊。
// 區塊：{t:'T'|'H'|'S'|'R'|'P', x} 標題／小標／紅字／內文；{t:'N', n, c:[區塊]} 編號項；{t:'IMG',k}；{t:'TBL',rows,w}；{t:'PAGE1',d}
import {model,G,Z,ANIMAL,SS10,GROUP_OF,relEl,isChong,liuhe,hai,isXing,sanheGroup,isBanhe,ganhe,ganKe,mainQi,elOf,suiShen,flyStars,FLY,GUI_TABLE,LU_TABLE,stage12} from './engine.js';
import {ganWx,zhiWx,shiShen,WX} from '../bazi.js';
import {GE,MONTH_TRAIT,DAY_TRAIT,XZ_TEXT,DAY_MASTER,MONTH_BRANCH,STAR} from './t-basic.js';
import {SS_TEXT,SS_COMBO,MA,KU,LUCK_SS,RUN_EXTRA,scoreText,LUCK_LINE} from './t-ss.js';
import * as L from './t-life.js';
import * as Y from './t-year.js';
import {S} from './t-static.js';
const NUMS='一二三四五六七八九十';
const cn=n=>n<=10?NUMS[n-1]:'十'+NUMS[n-11];
const fw=n=>String(n).replace(/\d/g,d=>String.fromCharCode(0xFF10+ +d));
const dirName=d=>d.replace(/^正/,'')+'方';
const PIL=['年','月','日','時'];
const r1=x=>Math.round(x*10)/10;
export function build(form,opt={}){
 const m=model(form,opt);const {P,dm,dw,male,cnt,xi,ji,role,VAL,Y:YR}=m;const B=[];
 const T=x=>B.push({t:'T',x}),H=x=>B.push({t:'H',x}),Sx=x=>B.push({t:'S',x}),R=x=>B.push({t:'R',x}),Pp=x=>B.push({t:'P',x});
 const Ps=a=>a.forEach(Pp);
 let num=0;const N=(c)=>B.push({t:'N',n:++num,c:c.map(x=>typeof x==='string'?{t:'P',x}:x)});const resetN=()=>{num=0;};
 const TA=male?'他':'她',TXT=s=>s.replace(/\{TA\}/g,TA).replace(/\{同\}/g,male?'男生':'女生').replace(/\{異\}/g,male?'女生':'男生').replace(/\{兄姊\}/g,male?'大哥':'大姊');
 const ssOfG=g=>shiShen(dm,g),ssOfZ=z=>shiShen(dm,mainQi(z));
 const roleOfSS=s=>role(relEl(dw,GROUP_OF[s]));
 const present=new Set();P.forEach((p,i)=>{if(i!==2)present.add(p.ss);present.add(p.main);});
 const has=a=>a.some(s=>present.has(s));
 const flat=m.stars.flat();const hasStar=n=>flat.includes(n);
 const ctx={...m,role:s=>roleOfSS(s),has,hasStar};
 const ganOf=(s)=>[...G].find(g=>shiShen(dm,g)===s);
 const minguo=y=>y-1911;
 const mz=P[1].zhi,dz=P[2].zhi,yz=P[0].zhi,hz=P[3].zhi;
 // ───── 第 1 頁：命盤
 const ly=[];for(let y=YR-3;y<=YR+11;y++){const gz=G[((y-4)%10+10)%10]+Z[((y-4)%12+12)%12];ly.push({y,age:y-m.birth.y+1,gz,ss:[ssOfG(gz[0]),ssOfZ(gz[1])],sui:suiShen(yz,gz[1])});}
 B.push({t:'PAGE1',d:{name:m.name,sex:male?'男':'女',birth:m.birth,P,sc:m.sc,cnt,strong:m.strong,xz:m.xz,xi,ji,blood:m.blood,ge:m.ge,mg:m.mg,taiyuan:m.taiyuan,taixi:m.taixi,
  kong:[m.ykong,m.dkong],tianyun:P[0].nayin.slice(-1),chusheng:m.chusheng,stars:m.stars,dayun:m.dayun,ly,ages:['1-16','17-32','33-48','49-64'],lunar:(()=>{const l=m.birth.l||[];return `${P[0].gan}${P[0].zhi}年${l[1]<0?'閏'+(-l[1]):l[1]}月${l[2]}日${P[3].zhi}時`;})(),place:form.placeName||'',made:opt.made||new Date().toISOString().slice(0,10)}});
 // ───── 基本命理分析
 T('基本命理分析');H('性情優缺點及血型星座分析');Ps(S.XG_INTRO);
 const ge=GE[m.ge]||GE['正官格'];Sx(`您的格局為${m.ge}，會有此種現象：`);Pp(ge[0]);resetN();
 N([{t:'P',x:`優點：${ge[1]}`,hang:3},{t:'P',x:`缺點：${ge[2]}`,hang:3}]);N(ge[3]);N([MONTH_TRAIT[mz]]);N([DAY_TRAIT[dm]]);
 const xz=XZ_TEXT[m.xz];{const g=x=>({t:'P',x,gap:1});N(['本人的風格',...xz.style.map(s=>'　　'+TXT(s)),g('別人的感覺'),'　　'+TXT(xz.others),g('在工作事業上的表現'),'　　'+TXT(xz.work),g('金錢觀'),'　　'+TXT(xz.money),g('愛情觀'),'　　'+TXT(xz.love)]);}
 if(m.blood&&L.BLOOD&&L.BLOOD[m.blood])N([`血型：${m.blood}型`,L.BLOOD[m.blood]]);
 H('個人特質神煞分析');
 const DM=DAY_MASTER[dm];Sx('依八字日主可診斷出您可能會有以下的特性，好的請保持，不好的請儘快改進。');
 Pp(`${DM[0]}：請注意可能會有(${DM[1]})方面的疾病。假如真的有，建議您要定期做健康檢查。`);Pp('特性：');DM[2].split('|').forEach((s,i)=>Pp(`　${cn(i+1)}、${s}`));
 const MB=MONTH_BRANCH[mz];Sx('依八字月支可診斷出您可能會有以下的特性，好的請保持，不好的請儘快改進。');
 Pp(`${mz}：${MB[0]}、請注意可能會有(${MB[1]})方面的疾病。假如真的有，建議您要定期做健康檢查。`);Pp('特性：');MB[2].split('|').forEach((s,i)=>Pp(`　${cn(i+1)}、${s}`));
 H('個人一生之機遇分析');Ps(S.STAR_INTRO);
 {const seen=[];m.stars.forEach(a=>a.forEach(n=>{if(!seen.includes(n))seen.push(n);}));seen.forEach((n,i)=>{Sx(`${i+1}、${n}：`);Pp(STAR[n]);});
  if(!seen.length)Pp('命盤中未見特殊神煞，一生平順，凡事靠自己努力即可有所成就。');}
 // 先天命運分析
 H('先天命運分析');Ps(S.SS_INTRO);resetN();
 const w=m.strong10?1:0;const gpos={};SS10.forEach(s=>gpos[s]=[]);P.forEach((p,i)=>{if(i!==2)gpos[p.ss].push(i);if(i!==2||true)gpos[p.main].push(i);});
 const cntG=k=>SS10.filter(s=>GROUP_OF[s]===k).reduce((a,s)=>a+cnt[s],0);
 for(const s of SS10){if(!present.has(s))continue;const D=SS_TEXT[s];const c=[];c.push({t:'P',x:D.head[w]});if(D.str)c.push({t:'P',x:D.str[w]});
  for(const cb of SS_COMBO.filter(q=>q.in===s)){let ok=false;
   if(cb.k==='食神和傷官多')ok=cnt.食神+cnt.傷官>=3&&present.has('傷官');
   else if(cb.k.startsWith('偏印+傷官，'))ok=present.has('偏印')&&present.has('傷官');
   else if(cb.k.startsWith('比肩，傷官'))ok=!male&&cnt.比肩>=2&&present.has('傷官');
   else if(cb.k.startsWith('帶食神┼'))ok=present.has('食神');
   else if(cb.k==='偏印+傷官同現')ok=present.has('傷官');
   else if(cb.k.startsWith('財星+官星'))ok=has(['正財','偏財']);
   else if(cb.k.startsWith('官星+印星'))ok=has(['正官','七殺']);
   else if(cb.k.startsWith('食神+偏印'))ok=present.has('偏印');
   else if(cb.k.startsWith('比劫+財星'))ok=has(['比肩','劫財'])&&cntG(0)>=3;
   if(ok){if(cb.plain)c.push({t:'P',x:`${cb.k}：${cb.t}`});else{c.push({t:'R',x:cb.k+'：'});c.push({t:'P',x:cb.t});}}}
  if(D.more)D.more[w].forEach(x=>c.push({t:'P',x}));
  const pls=[...new Set(gpos[s])].filter(i=>i!==2).sort();
  for(const i of pls){c.push({t:'R',x:PIL[i]+'柱：'});D.pil[PIL[i]].split('|').forEach(x=>{if(x.startsWith('女命：')&&male)return;c.push({t:'P',x});});}
  B.push({t:'N',n:++num,c});}
 {const ma=P.filter(p=>'寅申巳亥'.includes(p.zhi)).length,ku=P.filter(p=>'辰戌丑未'.includes(p.zhi)).length;
  if(ma)N([MA[Math.min(ma,3)]]);if(ku)N([KU[Math.min(ku,3)]]);}
 // 喜忌
 H('一生關鍵喜忌神');resetN();N([...S.XI_INTRO,{t:'R',x:`喜用神：${xi.join('')}`},...S.XI_PTS]);N([...S.JI_INTRO,{t:'R',x:`忌神：${ji.join('')}`},...S.JI_PTS]);
 H('一生顏色喜忌');Ps(S.COLOR_INTRO);R(`對你一生最有幫助的顏色為：${xi.map(e=>L.COLOR[e]).join('、')}`);Ps(S.COLOR_USE);R(`對你一生較無幫助的顏色為：${ji.map(e=>L.COLOR[e]).join('、')}`);Ps(S.COLOR_AVOID);Ps(S.COLOR_ESSAY);
 H('對自己最幸運的數字');Ps(S.NUM_INTRO);R(`對你一生最幸運的數字為：${xi.map(e=>L.NUM[e]).join('、')}`);Ps(S.NUM_ESSAY);R(`對你一生較無幫助的數字為：${ji.map(e=>L.NUM[e]).join('、')}`);Ps(S.NUM_AVOID);
 H('健康狀況及先天宿疾');Ps(S.HEALTH_ESSAY);resetN();
 const weak=WX.slice().sort((a,b)=>m.score[a]-m.score[b])[0];const HE=L.HEALTH[weak];
 N([S.HEALTH_SRC[0],HE[0]]);N([S.HEALTH_MAG[0],HE[1]]);N([HE[2]]);
 H('八字中帶有的疾病');Ps(S.DIS_INTRO);R(`(1)${L.GAN_ORGAN[dm]} (2)${L.GAN_PART[dm]} (3)${L.ZHI_ORGAN[mz]} (4)${L.ZHI_PART[mz]}`);Ps(S.DIS_END);Ps(S.DIS_ESSAY);
 B.push({t:'IMG',k:'body1'});B.push({t:'IMG',k:'body2'});
 // 婚姻
 H('婚姻關係及姻緣桃花');Sx('配偶的個性：');Pp(L.SPOUSE_ZHI[dz]);Pp(L.SPOUSE_SS[P[2].main]);
 Sx('異性緣及桃花：');{const sp=male?['正財','偏財']:['正官','七殺'];const pr=sp.filter(s=>present.has(s));const rl=pr.length?roleOfSS(pr[0]):null;
  Pp(!pr.length?'異性緣較淡，宜多主動參加社交活動，以增加認識異性的機會。':rl==='喜'?`異性緣很好，且能得${male?'女性或妻子':'男性或丈夫'}之助。`:rl==='忌'?'異性緣雖佳，但易因異性而煩惱或破財，宜慎選對象。':'異性緣尚可，感情生活平順。');}
 Sx('婚姻關係：');{const r=role(zhiWx(dz));
  Pp(r==='喜'?'以先天命盤分析您夫妻宮因得位、故配偶能得助力、且能安守本份、兼顧家庭、故有80分。':r==='閒'?'以先天命盤分析您夫妻宮因得位、故配偶雖無大助力、卻可安守本份、兼顧家庭、故有50分。':'以先天命盤分析您夫妻宮因失位、故配偶助力較少、彼此宜多包容體諒、故有30分。');
  if(cntG(0)>=3)Pp(male?'為人個性較強，夫妻應多互相尊重、共同打拼。茲因命中注定、此生婚姻較多磨合，您難到不能稍為放手嗎。':'為女強人，夫妻應多互相激勵、共同打拼。茲因命中注定、此生婚姻不佳，您難到不能稍為放手嗎。');
  const bad=[0,1,3].some(i=>isXing(dz,P[i].zhi)||isChong(dz,P[i].zhi)||hai(dz)===P[i].zhi);
  if(bad)Pp('茲因命中注定、此生婚姻不佳，夫妻間唯有多說好話，多做好事才能改變此一婚姻不美狀況。');
  if(male?(has(['比肩','劫財'])&&has(['正財','偏財'])):(present.has('傷官')&&has(['正官','七殺'])))Pp('茲因命中注定、此生婚姻因信念不同，而造成婚姻不美。如能好好溝通即能轉變婚狀況！');
  if(r==='喜'&&!bad)Pp('夫妻感情和睦，能互相扶持，婚姻生活美滿。');}
 Sx('夫妻婚配：');Ps(L.MARRIAGE_STATIC);
 H('論六親之緣份與助力');resetN();{let any=false,self=false;
  [[0,'年'],[1,'月'],[3,'時']].forEach(([i,k])=>{const o=P[i].zhi;const D=L.LIUQIN[k];
   if(isXing(dz,o)){N([D.xing]);any=true;if(dz===o)self=true;}else if(isChong(dz,o)){N([D.chong]);any=true;}else if(hai(dz)===o){N([D.hai]);any=true;}else if(liuhe(dz)===o){N([D.he]);any=true;}});
  if(self)N([L.SELF_XING_HEAD,L.SELF_XING[dz]]);
  if(!any)N(['日支與其他地支無刑沖害、六親之間相處較為平和、彼此助力尚可。']);}
 H('一生中與自己較有緣份之生肖');Ps(S.SX_INTRO);L.SX_TEXT[yz].split('|').forEach(Pp);Pp('《較有緣份者》');
 {const lh=liuhe(yz),sh=[...sanheGroup(yz)].filter(z=>z!==yz);const pre=['同','跟','與'];[lh,...sh].forEach((z,i)=>Pp(`肖${ANIMAL[z]}(${z})：${pre[i]}肖${ANIMAL[z]}的一樣，${L.SX_LIKE[z]}`));}
 H('論朋友緣份及合夥吉凶');Ps(S.PARTNER_INTRO);Pp(`經電腦檢查出本人是${mz}月生,月支主氣為${P[1].main}，${hz} 時出生。`);Sx('與朋友合夥吉凶判斷：');resetN();
 {const r=role(dw);N(r==='忌'?['事業規模較小，難得合夥人之助力。','不適合與人合夥。',...S.PARTNER_NOTE]:r==='喜'?['事業規模可以擴大，容易得到合夥人之助力。','適合與人合夥。',...S.PARTNER_NOTE]:['事業規模中等，合夥人之助力普通。','合夥宜謹慎選擇對象。',...S.PARTNER_NOTE]);
  const lines=[];for(const n of [11,12,1,2,3,4,5,6,7,8,9,10]){const o=Z[(n+1)%12];let t;
   if(mz==='巳')t=L.PARTNER_SI[o];else{const a=zhiWx(o),b=zhiWx(mz),ia=WX.indexOf(a),ib=WX.indexOf(b);
    t=o===mz?L.PARTNER_SI.巳:isChong(o,mz)?L.PARTNER_SI.亥:liuhe(o)===mz?L.PARTNER_SI.申:isBanhe(o,mz)?`你會欣賞他的${L.BR_HE[o]}，而他也對你有助。`:hai(o)===mz?`${L.BR_HE[o]}的他，彼此較易有心結，對你不利。`:
     (ia+1)%5===ib?`${L.BR_HE[o]}的他，對你有幫助。`:(ib+1)%5===ia?`${L.BR_HE[mz]}的你會為他付出。`:(ia+2)%5===ib?`${L.BR_HE[o]}的他，對你有害的。`:(ib+2)%5===ia?`你的${L.BR_HE[mz]}會對他有幫助。`:'彼此個性相近，可以互相合作，但宜分工清楚。';}
   lines.push(`與${n<10?'　':''}${fw(n)}月出生之人合夥：${t}`);}
  N(lines);}
 H('論行、住、坐、臥、及貴人之方位');Ps(S.GUIREN_A);Ps(S.GUIREN_B);
 const bz=m.bz;const ji8={best:[bz[5],bz[6]],good:[bz[7],bz[4]],worst:[bz[0]],bad:[bz[1],bz[3],bz[2]]};
 B.push({t:'COMPASS',d:{gui:[...new Set(xi.map(e=>L.DIR[e]))],ji8}});
 Ps(S.GUIREN_2);Sx('方法一(用喜用神來判斷)：');Pp(`貴人較容易在：${[...new Set(xi.map(e=>L.DIR[e]))].join('、')}出現。`);
 {const SEA={亥:'北方',子:'北方',丑:'北方',寅:'東方',卯:'東方',辰:'東方',巳:'南方',午:'南方',未:'南方',申:'西方',酉:'西方',戌:'西方'};
  Sx('方法二(用天乙貴人來判斷)：');Pp(`貴人較容易在：${[...new Set([...GUI_TABLE[P[0].gan]].map(z=>SEA[z]))].join('、')}出現。`);}
 Sx('陽宅坐向：');Pp(`本人為：${m.gua}命`);Pp(`1、其最吉方在${ji8.best.map(dirName).join('、')}，次吉方在${ji8.good.map(dirName).join('、')}。`);Pp(`2、最凶方在${ji8.worst.map(dirName).join('、')}，次凶方在${ji8.bad.map(dirName).join('、')}。`);Pp(S.YZ_3[0].replace(/本命\s*卦/,`本命${m.gua}卦`));
 // 讀書
 H('先天之讀書運及考試運');Sx('先天之讀書運：');resetN();
 N([has(['正印','偏印'])||hasStar('文昌')||hasStar('學堂')?L.SHOUJU:'讀書成績普通，宜多加督促，培養讀書的興趣。']);
 for(let k=0;k<3;k++){const d=m.dayun[k];if(!d)break;[[d.gz[0],d.from,d.from+4],[d.gz[1],d.from+5,d.to]].forEach(([ch,a,b])=>{const r=role(elOf(ch));
  N([`在${a}～${b}歲：${r==='忌'?'求學運阻力較多。':r==='喜'?'讀書運佳，成績優良，容易得到師長的讚賞。':'讀書運普通，成績平平。'}`]);});}
 if(has(['食神','傷官'])&&has(['正印','偏印']))N(['可得到高的學歷, 或腦筋較靈活。']);
 Ps(S.STUDY_ESSAY);Sx(`${YR}年之考運：`);{const a=role(elOf(m.lyGz[0])),b=role(elOf(m.lyGz[1]));Pp(a==='喜'&&b==='喜'?'考試運佳，容易金榜題名。':a==='忌'&&b==='忌'?'考試運較差，宜加倍努力。':'考試運普通');}
 Ps(S.EXAM_TIPS);Sx('怎樣選擇大學的科系就讀：');Ps(S.DEPT_INTRO);xi.forEach(e=>Ps(L.DEPT[e]));
 H('小兒關煞檢查表');Ps(S.GUANSHA_INTRO);
 {const sea=Math.floor(((Z.indexOf(mz)-2+12)%12)/3);const gs=[];
  if([['寅','酉','子'],['巳','戌','亥'],['申','丑'],['子','午']][sea].includes(hz))gs.push('無情關');
  const TD={申子辰:'巳午',寅午戌:'辰午',亥卯未:'申午',巳酉丑:'卯子'};if(TD[sanheGroup(yz)].includes(hz))gs.push('天吊關');
  const DC={甲:'午未',乙:'午未',丙:'寅辰巳',庚:'子申',壬:'丑',癸:'丑'};if((DC[dm]||'').includes(hz))gs.push('斷腸關');
  const BR=['辰戌丑未','寅申巳亥','子午卯酉'];const mi=('寅申巳亥'.includes(mz)?0:'子午卯酉'.includes(mz)?1:2);if(BR[mi].includes(hz))gs.push('百日關');
  if(['丑未','辰戌','子午','卯酉'][sea].includes(hz))gs.push('閻王關');
  const GM={子:'酉',丑:'午',寅:'未',卯:'申',辰:'亥',巳:'戌',午:'丑',未:'寅',申:'卯',酉:'子',戌:'巳',亥:'辰'};if(GM[yz]===hz)gs.push('鬼門關');
  if(!gs.length)Pp('經檢查本命盤，未見小兒關煞，小孩較好帶養。');gs.forEach((g,i)=>{Sx(`${i+1}、${g}`);Pp(L.GUANSHA[g]);});}
 // ───── 投資理財分析
 T('投資理財分析');H('適合本命發揮之行業及建議');resetN();
 N([...S.IND_HEAD,...S.IND_INTRO,...xi.flatMap(e=>L.INDUSTRY[e]),...S.IND_END]);
 {const zc=has(['正財']),pc=has(['偏財']);const A=zc&&pc?L.ADVICE.both:zc?L.ADVICE.zheng:pc?L.ADVICE.pian:L.ADVICE.none;N([...S.ADVICE_INTRO,...A,...S.ADVICE_END]);}
 H('上班較佳或創業做生意較好');Ps(S.JOB_INTRO);
 {const cai=has(['正財','偏財']),cr=role(relEl(dw,2));const J=!cai?L.JOB.work:cr==='喜'&&m.strong?L.JOB.biz:cr==='忌'?L.JOB.work2:L.JOB.both;R(J[0]);R(J[1]);}Ps(S.JOB_END);
 H('事業、工作上的助力與阻力');
 Sx('在先天命格的斷定上, 於工作或事業的機遇及助力可得以下之建言：');resetN();{const h=SS10.filter(s=>present.has(s)&&roleOfSS(s)==='喜').flatMap(s=>L.HELP[s][0]);(h.length?h:['命局中喜用十神不現，助力需靠後天努力爭取，多結善緣、廣結人脈。']).forEach(x=>N([x]));}
 Sx('在先天命格的斷定上, 於工作或事業的機遇及阻力可得以下之建言：');resetN();{const h=SS10.filter(s=>present.has(s)&&roleOfSS(s)==='忌').flatMap(s=>L.HELP[s][1]);(h.length?h:['命局中忌神十神不現，阻力較少，凡事較能順利推動。']).forEach(x=>N([x]));}
 H('依自己命盤決定何時進行投資計劃');Ps(S.INVEST_INTRO);
 for(let k=1;k<=4;k++){const d=m.dayun[k];if(!d)break;Sx(`${d.from}～${d.to}歲:`);const a=role(elOf(d.gz[0])),b=role(elOf(d.gz[1]));const o=[];
  if(a==='忌'&&b==='忌')o.push('不宜進行投資創業。');else if(a==='喜'&&b==='喜')o.push('可進行投資創業。','較可以創業，也比較有升遷之機會。');
  else if(a==='閒'&&b==='閒')o.push('投資創業宜保守，量力而為。');
  else{if(b==='喜')o.push('後五年可進行投資創業。');if(a==='喜')o.push('前五年可進行投資創業。');if(a==='忌')o.push('前五年不宜進行投資創業。');if(b==='忌')o.push('後五年不宜進行投資創業。');
   if(b==='喜')o.push('後五年較可以創業，也比較有升遷之機會。');if(a==='喜')o.push('前五年較可以創業，也比較有升遷之機會。');}
  Ps(o);}
 // ───── 個人理財機運分析
 const V=ch=>VAL[elOf(ch)];const raw=gz=>0.405*V(gz[0])+0.56*V(gz[1])+2.5;
 const luck=(ch,pre)=>{const s=G.includes(ch)?ssOfG(ch):ssOfZ(ch);const r=role(elOf(ch));if(r==='閒')return null;return LUCK_LINE[s][r==='喜'?0:1].replace('{P}',pre);};
 T('個人理財機運分析');H('大運財運分析');Ps(S.DYCAI_INTRO);
 for(let k=1;k<m.dayun.length;k++){const d=m.dayun[k];const s1=Math.round(0.755*V(d.gz[0])+0.245*V(d.gz[1])),s2=Math.round(0.245*V(d.gz[0])+0.755*V(d.gz[1]));
  [[d.from,d.from+4,s1,d.gz[0]],[d.from+5,d.to,s2,d.gz[1]]].forEach(([a,b,s,ch])=>{R(`${a}～${b}歲 (得分：${s}分)`);Pp(scoreText(s));const l=luck(ch,'本大運');if(l)Pp(l);});}
 const half=m.curHalf;const lyS=Math.round((raw(m.lyGz)+(half?V(half):88))/2);
 H('流年財運分析');Ps(S.LNCAI_INTRO);R(`西元：${YR} 農曆：${minguo(YR)}年 ${m.age}歲 (得分：${lyS}分)`);Pp(scoreText(lyS));[luck(m.lyGz[0],'今年'),luck(m.lyGz[1],'今年')].filter(Boolean).forEach(Pp);
 H('流年整體運勢分析');Ps(S.LNALL_INTRO);const lss=[ssOfG(m.lyGz[0]),ssOfZ(m.lyGz[1])];Sx(`西元：${YR} 農曆：${minguo(YR)}年 ${m.age}歲 (天干走${lss[0]}/ 地支走${lss[1]})`);resetN();
 {const items=[...Y.YEAR_ITEMS[lss[0]]];if(lss[1]!==lss[0])items.push(...Y.YEAR_ITEMS[lss[1]]);const lz=m.lyGz[1];
  if(hai(lz)===dz)items.push(Y.DAY_HAI_EXTRA,`${lz}${dz}害：${Y.REL_TXT.害}`);else if(isChong(lz,dz))items.push(Y.DAY_CHONG_EXTRA,`${lz}${dz}沖：${Y.REL_TXT.沖}`);
  else if(isXing(lz,dz))items.push(`${lz}${dz}刑：${Y.REL_TXT.刑}`);else if(liuhe(lz)===dz)items.push(`${lz}${dz}合：${Y.REL_TXT.合}`);
  items.forEach(x=>N([x]));}
 H('流月財運分析(1-12月)');Ps(S.LY_INTRO);
 m.months.forEach(mo=>{const s=Math.round(raw(mo.gz));R(`農曆：${minguo(YR)}年${mo.n}月 , 西元：${YR}年${mo.sm}月   (得分：${s}分)`);Pp(scoreText(s));[luck(mo.gz[0],'本月'),luck(mo.gz[1],'本月')].filter(Boolean).forEach(Pp);});
 H('流日財運分析(365天)');Ps(S.LR_INTRO);{const s=Math.round((2*raw(m.day.gz)+raw(m.day.month))/3);const [a,b,c]=m.day.s,[la,lb,lc]=m.day.l;R(`西元：${a}年${b}月${c}日  農曆：${minguo(la)}年${lb}月${lc}日 (得分：${s}分)`);Pp(scoreText(s));}
 // ───── 流年吉凶剖析
 T('流年吉凶剖析');const lg=m.lyGz[0],lz=m.lyGz[1];const lgS=ssOfG(lg),lzS=ssOfZ(lz);
 const gf=(lgS==='傷官'||lzS==='傷官')&&present.has('正官')||(lgS==='七殺'||lzS==='七殺')&&role(relEl(dw,3))==='忌'||isXing(lz,dz);
 const xg=isChong(lz,dz)||lz===LU_TABLE[dm]&&false||lz===({甲:'卯',乙:'辰',丙:'午',丁:'未',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'})[dm]||isChong(lz,({甲:'卯',乙:'辰',丙:'午',丁:'未',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'})[dm]);
 const pc=((lgS==='比肩'||lgS==='劫財')&&role(dw)==='忌')||((lzS==='比肩'||lzS==='劫財')&&role(dw)==='忌')||isChong(lz,mz);
 const sp=male?['正財','偏財']:['正官','七殺'];
 const hy=ganhe(lg)===dm||liuhe(lz)===dz||sp.includes(lgS)||sp.includes(lzS)||isBanhe(lz,dz);
 H('官司與是非防患年限表');Ps(S.GF_INTRO);Sx(`西元：${YR}年`);(gf?R:Pp)(Y.YEAR_RISK.官非[gf?0:1]);Ps(S.GF_END);
 H('意外、血光預知年限表');Ps(S.XGU_INTRO);Sx(`西元：${YR}年`);(xg?R:Pp)(Y.YEAR_RISK.血光[xg?0:1]);Ps(S.XGU_END);
 H('破財、損失防患年限表');Ps(S.PC_INTRO);Sx(`西元：${YR}年`);(pc?R:Pp)(Y.YEAR_RISK.破財[pc?0:1]);Ps(S.PC_END);
 H('姻緣、結婚時機掌握表');Ps(S.HUN_INTRO);Sx(`西元：${YR}年`);
 if(hy){R(Y.YEAR_RISK.姻緣[0]);R('由八字診斷出今年會有結婚的機會，就表示只要機會來了，就不能有敷衍的心態，要更積極，相親也好，婚友社也好，只要有人示愛自己千萬不要為排斥而拒絕所有機會。');R('PS：結過婚的人表示今年異性緣較濃，表示可以找異性幫忙或做異性商品的生意可能會有不錯的成績。');}
 else Pp(Y.YEAR_RISK.姻緣[1]);
 B.push({t:'IMG',k:'taohua'});
 H('個人先天八字一覽表');Ps(S.CG_INTRO);
 {const lyg=m.c.lunar?null:null;const lun=m.birth.l;const lyGz=(()=>{const y=lun[0];return G[((y-4)%10+10)%10]+Z[((y-4)%12+12)%12];})();
  const wt=Math.round((Y.CG_YEAR[lyGz]+Y.CG_MONTH[Math.abs(lun[1])]+Y.CG_DAY[lun[2]]+Y.CG_HOUR[hz])*10);const q=Y.CG_POEM[wt]||Y.CG_POEM[Math.max(21,Math.min(72,wt))];
  const ws=wt%10?`${Math.floor(wt/10)}兩${wt%10}錢`:`${wt/10}兩`;R(`依八字得知重量為：${ws}`);Pp(`綜合評論為：${q[0]}`);q[1].replace(/。$/,'').split('，').forEach(Pp);}
 H('流年十二宮神煞表');Ps(S.SUI12_INTRO);Sx(`西元：${YR}年`);const sui=suiShen(yz,lz);const SU=Y.SUI[sui];Pp(`${sui}：${SU[0]}`);Pp(SU[1]);Ps(S.SUI12_END);Ps(S.GUA_HEAD);
 const fs=flyStars(YR);const GUA_DIR={坎:'北',離:'南',震:'東',巽:'東南',乾:'西北',兌:'西',艮:'東北',坤:'西南'};Pp(Y.STAR9[fs[GUA_DIR[m.gua]]]);Ps(S.GUA_REMEDY);
 // ───── 開運制煞篇
 T('開運制煞篇');H('如何鎮宅及防止意外、血光發生');Ps(S.ZZ);
 {const pos=n=>FLY.find(d=>fs[d]===n);const grid=[['東南','南','西南'],['東','中宮','西'],['東北','北','西北']];
  B.push({t:'TBL',cap:`西元${YR}年流年九宮飛星（五黃位：${pos(5)}　二黑位：${pos(2)}）`,rows:grid.map(r=>r.map(d=>`${d}\n${Y.STAR_NAME[fs[d]]}`)),hl:[pos(5),pos(2)]});}
 Ps(S.ZZ_PS);
 H('陽宅如何佈局，佈局好，能催旺財運');Ps(S.BJ_A);Ps(S.BJ_TT);B.push({t:'IMG',k:'caiwei'});Ps(S.BJ_B);
 H('如何淨化陽宅，就能一切平安順利');Ps(S.JH);
 H('本命八字五行欠缺或過多、如何補運');Ps(S.BUYUN_INTRO);
 const tal=s=>{const g=ganOf(s);return `${g}或${LU_TABLE[g]}`;};
 for(const s of SS10){if(cnt[s]<3)continue;Sx(`八字中有過多的${s}`);Pp('本來您將擁有很多優點：');Y.GOOD[s].forEach((x,i)=>Pp(`${i+1}.${x.replace('|','')}`));
  Pp(`Ps:但因為【${s}】過多所以缺點:就顯現無遺變成`);Y.BAD[s].forEach((x,i)=>Pp(`${i+1}.${x}`));Pp(`影響所及人際方面代表：${Y.ROB_PEOPLE[s]}`);
  const rb=Y.ROB[s];Pp(`同時${s}會奪${rb}`);Pp('以下的優點也都會被破壞:像');(rb==='偏財'?Y.ROB_GOOD_PIANCAI:Y.GOOD[rb]).forEach((x,i)=>Pp(`${i+1}.${x.replace('|','')}`));
  R(`建議您可以用印有【${LU_TABLE[ganOf(rb)]}】字的轉運金牌來改變先天命格不佳的情況。`);}
 for(const s of ['食神','偏財','正財','正官','正印']){if(cnt[s]>0)continue;Sx(`以您的八字看來先天缺少十神中的【${s} 】`);Pp('所以以下的一些好現象將不容易出現');
  Y.GOOD[s].forEach((x,i)=>x.split('|').forEach((y,j)=>Pp(j?'  '+y:`${i+1}.${y}`)));Pp(`如果能適時補上【${s}】那以上的優點將會適時發揮、且對日後的行運會有好幾倍的幫助。`);R(`建議您可以用印有【${tal(s)}】字的轉運金牌來改變先天命格不佳的情況。`);}
 H('如何才能催旺桃花、姻緣，感情順利');Ps(S.TH_INTRO);resetN();
 {const th=P.map(p=>p.zhi).filter(z=>'子午卯酉'.includes(z));
  if(!th.length){const sh=[...sanheGroup(dz)][1];const a=[...new Set([sh,liuhe(dz)])].filter(z=>z!==dz);
   N(['八字地支中沒有【子.午.卯.酉.】表示較無人緣桃花.要催桃花可以運用地支產生法：','建議您可以用補桃花的方式來改變上述的狀況。',{t:'R',x:`建議您可以用印有【${a.join('或')}】字來催旺人緣桃花。`}]);}
  else N([`八字地支中帶有【${[...new Set(th)].join('.')}.】表示本身已有人緣桃花.只要多加運用即可：`,{t:'R',x:`建議您可以多穿戴印有【${[...new Set(th)].join('或')}】字之飾品來加強人緣桃花。`}]);
  N(['年過30而未婚者、可用沖日支法來沖動。',{t:'R',x:`建議您可以用印有【${Z[(Z.indexOf(dz)+6)%12]}】字來沖動婚姻宮，讓婚姻快成。`}]);
  const sg=ganOf(male?'正財':'正官');N([`想要有異性緣可以用${male?'正財':'正官'}來加以促成。`,{t:'R',x:`建議您可以用印有【${sg}】字來沖動異性緣，讓自己更有異性緣。`}]);}
 H('如何從命盤得知本命或行運空亡');Ps(S.KONG_INTRO);resetN();
 {const k=m.dkong;const any=[];if(m.curDy&&k.includes(m.curDy.gz[1]))any.push(`經檢查本命盤後得知本大運逢空亡，請用轉運金牌【${Z[(Z.indexOf(m.curDy.gz[1])+6)%12]}】字來將空亡沖掉。`);
  m.months.forEach(mo=>{if(mo.jieYear===YR&&k.includes(mo.gz[1]))any.push(`經檢查本命盤後得知：西元${YR}農曆${mo.n}月逢空亡，請用轉運金牌【${Z[(Z.indexOf(mo.gz[1])+6)%12]}】字來將空亡沖掉。`);});
  if(k.includes(lz))any.unshift(`經檢查本命盤後得知：西元${YR}年逢空亡，請用轉運金牌【${Z[(Z.indexOf(lz)+6)%12]}】字來將空亡沖掉。`);
  if(!any.length)any.push('經檢查本命盤後得知本大運及今年流年、流月皆未逢空亡。');any.forEach(x=>N([x]));}
 Ps(S.KONG_END);
 // ───── 知命造運改變一生
 T('知命造運改變一生');H('以命盤的刑沖破害來論會有的現象');Ps(S.XC_INTRO);resetN();
 {const SRC={年:'與祖上、父母緣份較薄，早年家庭較多變動，宜早出外發展。',日:'夫妻之間較易起爭執，凡事宜多忍讓，多溝通。',時:'晚年與子女較易有代溝，宜多溝通、多包容。',
   月:'常碰到倒霉事及不如意的事，或常事與願違，請改變心態就可解開命運之。'+(male?'':'女人的月支是「緣份宮」，逢沖，容易有相處難容之象，或與公公婆婆較合不來。')};
  const hit=new Set();let n=0;
  for(let i=0;i<4;i++){const tg=[];for(let j=0;j<4;j++){if(i===j)continue;if(ganKe(P[i].gan,P[j].gan)){tg.push(j);hit.add('g'+j);}if(j>i&&isChong(P[i].zhi,P[j].zhi)){tg.push(j);hit.add('z'+j);hit.add('z'+i);}}
   const u=[...new Set(tg)].sort();if(u.length){N([`${PIL[i]}沖${u.map(j=>PIL[j]).join('')}：${SRC[PIL[i]]}`]);n++;}}
  const gk=s=>[0,1,3].some(j=>(P[j].ss===s&&hit.has('g'+j))||(P[j].main===s&&hit.has('z'+j)));
  const one=(a,b)=>cnt[a]+cnt[b]===1;
  if(gk('正官'))N([Y.GUAN_CHONG[0]]);
  if(!male&&(gk('正官')||gk('七殺'))&&one('正官','七殺'))N([Y.GUAN_CHONG[1]]);
  if(male&&(gk('正財')||gk('偏財'))&&one('正財','偏財'))N(['正財、偏財只有一位而被沖者，代表婚姻比較不美滿、應多做溝通才對。']);
  if(gk('七殺'))N([Y.GUAN_CHONG[2]]);
  const gs=P.map(p=>p.gan);for(const [k,v] of Object.entries(Y.GANHE_TXT)){if(gs.includes(k[0])&&gs.includes(k[1]))N(v);}
  if(!num)N(['命盤四柱之間無明顯刑沖破害，此生命運較為平順。']);}
 H('用命宮來論斷一個人的特性');Ps(S.MG_INTRO);Pp(`以下論斷出來您的命宮在${m.mg}宮，所以比較會有以下現象：`);Pp(`命宮在${m.mg[1]}宮的人: 一般都是屬於`);Pp(Y.MINGGONG[m.mg[1]]);
 H('論四柱及十二運星空亡之各種現象');Ps(S.KW_INTRO);Sx('十二長生運在命局上之論法：');resetN();
 P.forEach((p,i)=>N([Y.ST12_DESC[p.stage],`在${PIL[i]}柱：${Y.ST12_PIL[p.stage][PIL[i]]}`]));
 {const KW={0:'年柱逢空亡：與祖上緣份較薄，祖業難以繼承，早年宜自立。',1:'月柱逢空亡：兄弟姊妹助力較少，青年時期凡事要靠自己。',3:'時柱逢空亡：與子女緣份較淡，晚年宜自己做好規劃。'};
  [0,1,3].forEach(i=>{if(m.dkong.includes(P[i].zhi))N([KW[i]]);});}
 H('以命盤五行旺度來分析性情');const ds=m.sc[dw];Pp(`一般在斷性情大概可用，日主之五行旺度來分析您一生的個性特質，在命盤中發現您的日主五行是屬${dw}，旺度為${ds}分，所以大概會有以下現象：`);
 R(`您的日主屬：${dw}`);{const li=Y.WANGDU_LV.findIndex(([t])=>ds>=t);Pp(`${Y.WANGDU_LV[li][1]}：${Y.WANGDU[dw][li]}`);}
 H('用什麼方式表達自己、以找尋對象');Ps(S.ZHAO_INTRO);{const hs=[...P[2].cang];const pos=[0,1,3].filter(i=>hs.includes(P[i].gan));
  if(pos.length)pos.forEach(i=>Y.TOUGAN[PIL[i]].forEach(R));else Y.TOUGAN.none.forEach(R);}
 H('未來子女的現象解析');Ps(S.CHILD_INTRO);resetN();
 {const o=[];const st=m.stars[3];const sh=['食神','傷官'];const pil=[0,1,3].filter(i=>sh.includes(P[i].ss)||sh.includes(P[i].main));
  if(st.includes('孤辰')||st.includes('寡宿')||pil.some(i=>m.stars[i].includes('孤辰')||m.stars[i].includes('寡宿')))o.push(Y.CHILD.guchen);
  const hc=[0,1,2].some(j=>ganKe(P[j].gan,P[3].gan)||isChong(P[j].zhi,P[3].zhi)||isXing(P[j].zhi,P[3].zhi)&&P[j].zhi!==P[3].zhi);if(hc)o.push(Y.CHILD.chong);
  if(!o.length){if(!has(male?['正官','七殺']:['食神','傷官']))o.push(Y.CHILD.none);else o.push(role(ganWx(P[3].gan))==='喜'?Y.CHILD.xi:role(ganWx(P[3].gan))==='忌'?Y.CHILD.ji:Y.CHILD.good);}
  o.forEach(x=>N([x]));}
 H('以喜用神中的十神來選行業');Ps(S.SSJOB_INTRO);resetN();
 {const stems=P.filter((p,i)=>i!==2).map(p=>p.ss);const L2=[];xi.forEach(e=>{const k=WX.indexOf(e)-WX.indexOf(dw);const g=((k%5)+5)%5;const pair=SS10.filter(s=>GROUP_OF[s]===g);
   [pair[g===0?0:0],pair[1]].forEach(s=>{});const ord=g===0?['比肩','劫財']:g===1?['食神','傷官']:g===2?['偏財','正財']:g===3?['七殺','正官']:['偏印','正印'];ord.forEach(s=>{if(!stems.includes(s))L2.push(s);});});
  (L2.length?L2:[]).forEach(s=>N(L.SS_JOB[s]));if(!L2.length)N(['喜用十神皆已透出天干，可依本身興趣選擇行業，較能得心應手。']);}
 H('一生適合於什麼樣工作及位階');Ps(S.RANK_INTRO);resetN();
 {const ctx2={...ctx,role:s=>roleOfSS(s)==='喜'?'xi':'x'};Y.RANK.forEach(([h,cs])=>{const ok=cs.filter(([_,f])=>f(ctx2)).map(([t])=>t);if(ok.length)N([h,...ok]);});if(!num)N(['依命局結構，宜從基層做起，憑實力逐步升遷。']);}
 // 大運
 H('每個大運中大概會有什麼現象發生');Ps(S.DY_INTRO);
 const ssBlock=(ch,pre,isStem,extra)=>{const s=isStem?ssOfG(ch):ssOfZ(ch);const neg=isStem&&role(elOf(ch))==='忌';const D=LUCK_SS[s];const o=[{t:'P',x:`${s}：`},{t:'P',x:D[0]},{t:'P',x:pre+D[neg?2:1]}];
  if(!isStem&&RUN_EXTRA[dm+ch])o.push({t:'P',x:RUN_EXTRA[dm+ch]});return o;};
 const pair=(gz,pre)=>{const a=ssBlock(gz[0],pre,true);if(ssOfZ(gz[1])===ssOfG(gz[0]))return a;return [...a,...ssBlock(gz[1],pre,false)];};
 m.dayun.forEach(d=>{Sx(`${d.from} ─${d.to}歲(${d.gz})`);B.push(...pair(d.gz,'本大運'));
  if(ganKe(d.gz[0],P[1].gan)||isChong(d.gz[1],P[1].zhi))R('大運沖月柱：因您的大運沖月柱表示環境可能會變動、或職位異動、生活較不穩定、心裏情緒靜不下來、與家人易有爭吵。');
  {const a=WX.indexOf(zhiWx(d.gz[1])),b=WX.indexOf(ganWx(d.gz[0]));if((a+2)%5===b)R('茲因本大運為「截腳運」所以對本大運會有扣分之現象。');}});
 H('流年中大概會有什麼現象發生');Ps(S.LN_INTRO);Sx(`西元：${YR}年  農曆：${minguo(YR)}年(${m.lyGz})${m.age}歲`);B.push(...pair(m.lyGz,'今年'));
 {const gs=[...P.map(p=>p.gan),...(m.curDy?[m.curDy.gz[0]]:[])],zs=[...P.map(p=>p.zhi),...(m.curDy?[m.curDy.gz[1]]:[])];
  if(gs.includes(ganhe(lg))||zs.includes(liuhe(lz)))R('命、運、歲三者干支多合、主事多延遲被合住、或易發生感情糾紛或外遇、或犯桃花、或犯小人。若為喜用、則表是暗中有貴人相助。');
  if(P.some(p=>p.gan===ganhe(lg)&&role(ganWx(p.gan))==='忌'))R('因今年流年來合住命局忌神、或合化為喜用神、本來今年不好但因忌神被合所以反凶為吉、今年以吉論。');}
 H('流月中大概會有什麼現象發生');Ps(S.LY2_INTRO);m.months.forEach(mo=>{Sx(`西元：${YR}年  農曆：${minguo(YR)}年${mo.n}月(${mo.gz})`);B.push(...pair(mo.gz,'本月'));});
 H('流年十二神煞分析');Ps(S.SUI_INTRO);Sx(`西元：${YR}年  農曆：${minguo(YR)}年(${m.lyGz})${m.age}歲`);R(`本命生肖神煞走${sui}運`);Pp(SU[2]);Pp(SU[3]);
 H('出生後上大運該做些什麼');Pp(`由您的命盤得知，您${m.chusheng}。建議您於交大運時前往您所居住地的土地公廟或廟宇拜拜，祈求平安順利！`);Pp('以下是每五年交大運之日期，請參考之。');resetN();
 m.jiaoyun.forEach(j=>N([`西元：${j.s[0]}年${j.s[1]}月${j.s[2]}日  農曆：${minguo(j.l[0])}年${j.l[1]}月${j.l[2]}日`]));
 Pp('有這麼一說：');Pp(S.JY_END[0].replace(/^有這麼一說：/,''));Ps(S.MANTRA);
 H('一生中的財富演變預估');Ps(S.WEALTH_INTRO);Sx('一生中的發財與破財時機如何從八字看出：');resetN();N([Y.WEALTH_STRONG[m.strong?0:1]]);
 Sx('以命局中之喜用神在四柱中之情況論財富：');resetN();
 {let f=null;for(const e of xi){for(let i=0;i<4;i++){if((i!==2&&ganWx(P[i].gan)===e)||zhiWx(P[i].zhi)===e&&ganWx(mainQi(P[i].zhi))===e){f={e,i};break;}}if(f)break;}
  if(f){const g=((WX.indexOf(f.e)-WX.indexOf(dw))%5+5)%5;N([`用神為：${Y.SS_GROUP_NAME[['比劫','食傷','財星','官殺','印星'][g]].replace(/(..)(..)/,'$1$2')}`,Y.WEALTH_PIL[PIL[f.i]]]);}
  else N([`用神為：${xi.map(e=>Y.SS_GROUP_NAME[['比劫','食傷','財星','官殺','印星'][((WX.indexOf(e)-WX.indexOf(dw))%5+5)%5]]).join('、')}`,Y.WEALTH_PIL.none]);}
 return {m,blocks:B};}
