// 命書（第十一節）資料推算：沿用本站排盤引擎（DE421 節氣定年月柱、真太陽時定日時柱、東經 70° 干支換日線）。
// 純邏輯，瀏覽器與 Node 皆可用。
import LJ from 'lunar-javascript';
import {buildChart,hide,shiShen,ganWx,zhiWx,WX,GAN,ZHI} from '../bazi.js';
import {sheetData,minggong,taiyuan,taixi,xunkong,mingGua,BZ,gzAdd,CANG} from '../sheetData.js';
import {JIE,yearMonthPillar} from '../terms.js';
const {Solar,Lunar}=LJ;
export const G=GAN,Z=ZHI;
const H=36e5,DAY=864e5;
export const ANIMAL={子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};
export const SS10=['比肩','劫財','食神','傷官','偏財','正財','七殺','正官','偏印','正印'];
export const GROUP_OF={比肩:0,劫財:0,食神:1,傷官:1,偏財:2,正財:2,七殺:3,正官:3,偏印:4,正印:4};
export const GROUP_NAME=['比劫','食傷','財星','官殺','印星'];
// 地支藏干權重（每支 10 分，天干每字 5 分；由範本「火20 土21 金3 水7 木9」反推，見 README）
export const HW={子:{癸:10},丑:{己:7,癸:2,辛:1},寅:{甲:7.5,丙:1.5,戊:1},卯:{乙:10},辰:{戊:7,乙:2,癸:1},巳:{丙:7.5,庚:1.5,戊:1},
 午:{丁:7,己:3},未:{己:7,丁:2,乙:1},申:{庚:7.5,壬:1.5,戊:1},酉:{辛:10},戌:{戊:7,辛:2,丁:1},亥:{壬:8.5,甲:1.5}};
export const relEl=(dw,k)=>WX[(WX.indexOf(dw)+k)%5];
export const chongZ=z=>Z[(Z.indexOf(z)+6)%12];
export const isChong=(a,b)=>chongZ(a)===b;
const LIUHE={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
export const liuhe=z=>LIUHE[z];
const HAI={子:'未',未:'子',丑:'午',午:'丑',寅:'巳',巳:'寅',卯:'辰',辰:'卯',申:'亥',亥:'申',酉:'戌',戌:'酉'};
export const hai=z=>HAI[z];
const XING={子:['卯'],卯:['子'],寅:['巳'],巳:['申','寅'],申:['寅','巳'],丑:['戌'],戌:['未','丑'],未:['丑','戌']};
export const isXing=(a,b)=>(a===b&&'辰午酉亥'.includes(a))||(XING[a]||[]).includes(b);
const SANHE={申:'申子辰',子:'申子辰',辰:'申子辰',寅:'寅午戌',午:'寅午戌',戌:'寅午戌',巳:'巳酉丑',酉:'巳酉丑',丑:'巳酉丑',亥:'亥卯未',卯:'亥卯未',未:'亥卯未'};
export const sanheGroup=z=>SANHE[z];
export const isBanhe=(a,b)=>a!==b&&SANHE[a]===SANHE[b];
const GANHE={甲:'己',己:'甲',乙:'庚',庚:'乙',丙:'辛',辛:'丙',丁:'壬',壬:'丁',戊:'癸',癸:'戊'};
export const ganhe=g=>GANHE[g];
export const HEHUA={甲己:'土',乙庚:'金',丙辛:'水',丁壬:'木',戊癸:'火'};
// 天干相剋（同陰陽、七殺關係，命書稱「沖」）
export const ganKe=(a,b)=>{const x=ganWx(a),y=ganWx(b);return G.indexOf(a)%2===G.indexOf(b)%2&&(WX.indexOf(x)+2)%5===WX.indexOf(y);};
export const mainQi=z=>hide(z)[0];
export const elOf=ch=>G.includes(ch)?ganWx(ch):zhiWx(ch);
const pad=n=>String(n).padStart(2,'0');
// 星座
const XZ=[[1,20,'水瓶'],[2,19,'雙魚'],[3,21,'牡羊'],[4,20,'金牛'],[5,21,'雙子'],[6,22,'巨蟹'],[7,23,'獅子'],[8,23,'處女'],[9,23,'天秤'],[10,24,'天蠍'],[11,23,'射手'],[12,22,'摩羯']];
export function xingzuo(m,d){let r='摩羯';for(const [mm,dd,n] of XZ)if(m>mm||(m===mm&&d>=dd))r=n;return r;}
// 神煞表
const LU={甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const REN={甲:'卯',乙:'辰',丙:'午',丁:'未',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'};
const GUI={甲:'丑未',戊:'丑未',庚:'丑未',乙:'子申',己:'子申',丙:'亥酉',丁:'亥酉',辛:'午寅',壬:'卯巳',癸:'卯巳'};
const WC={甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
const JY={甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'未',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'};
const HY={甲:'午',乙:'申',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'};
const XT={甲:'亥',乙:'午',丙:'寅',丁:'酉',戊:'寅',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'}; // 學堂（長生）
const GS={申子辰:{劫煞:'巳',華蓋:'辰',驛馬:'寅',將星:'子',亡神:'亥',桃花:'酉'},寅午戌:{劫煞:'亥',華蓋:'戌',驛馬:'申',將星:'午',亡神:'巳',桃花:'卯'},
 巳酉丑:{劫煞:'寅',華蓋:'丑',驛馬:'亥',將星:'酉',亡神:'申',桃花:'午'},亥卯未:{劫煞:'申',華蓋:'未',驛馬:'巳',將星:'卯',亡神:'寅',桃花:'子'}};
const TIANXI={子:'酉',丑:'申',寅:'未',卯:'午',辰:'巳',巳:'辰',午:'卯',未:'寅',申:'丑',酉:'子',戌:'亥',亥:'戌'};
const HONGLUAN={子:'卯',丑:'寅',寅:'丑',卯:'子',辰:'亥',巳:'戌',午:'酉',未:'申',申:'未',酉:'午',戌:'巳',亥:'辰'};
const GUCHEN={寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥',亥:'寅',子:'寅',丑:'寅'};
const GUASU={寅:'丑',卯:'丑',辰:'丑',巳:'辰',午:'辰',未:'辰',申:'未',酉:'未',戌:'未',亥:'戌',子:'戌',丑:'戌'};
const TIANDE={寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'};
const TDHE={丁:'壬',申:'巳',壬:'丁',辛:'丙',亥:'寅',甲:'己',癸:'戊',寅:'亥',丙:'辛',乙:'庚',巳:'申',庚:'乙'};
const YUEDE={寅午戌:'丙',申子辰:'壬',亥卯未:'甲',巳酉丑:'庚'};
const SHILING=['甲辰','乙亥','丙辰','丁酉','戊午','庚戌','庚寅','辛亥','壬寅','癸未'];
const KUIGANG=['庚辰','壬辰','戊戌','庚戌'];
const YINCHA=['丙子','丁丑','戊寅','辛卯','壬辰','癸巳','丙午','丁未','戊申','辛酉','壬戌','癸亥'];
const GULUAN=['乙巳','丁巳','辛亥','戊申','甲寅','壬子','丙午','戊午'];
const SHIE=['甲辰','乙巳','丙申','丁亥','戊戌','己丑','庚辰','辛巳','壬申','癸亥'];
// k: 0年 1月 2日 3時
export function pillarStars(P,k){const r=[],p=P[k],yz=P[0].zhi,mz=P[1].zhi,dg=P[2].gan,dz=P[2].zhi,z=p.zhi,g=p.gan;
 if(k>0){if(z===yz)r.push('伏吟');else if(isChong(z,yz))r.push('反吟');}
 if(k>=2){if(g===TIANDE[mz]||z===TIANDE[mz])r.push('天德');if(g===TDHE[TIANDE[mz]]||z===TDHE[TIANDE[mz]])r.push('天德合');
  const yd=YUEDE[SANHE[mz]];if(g===yd)r.push('月德');if(g===GANHE[yd])r.push('月德合');if(z===Z[(Z.indexOf(mz)+11)%12])r.push('天醫');}
 if(k>0){const gs=GS[SANHE[yz]];if(TIANXI[yz]===z)r.push('天喜');if(HONGLUAN[yz]===z)r.push('紅鸞');if(gs.劫煞===z)r.push('劫煞');if(GUCHEN[yz]===z)r.push('孤辰');if(GUASU[yz]===z)r.push('寡宿');
  if(gs.華蓋===z)r.push('華蓋');if(gs.驛馬===z)r.push('驛馬');if(gs.桃花===z)r.push('桃花');if(gs.亡神===z)r.push('亡神');if(gs.將星===z)r.push('將星');}
 if(LU[dg]===z)r.push('祿神');if(REN[dg]===z)r.push('羊刃');if(GUI[dg].includes(z))r.push('天乙貴人');if(WC[dg]===z)r.push('文昌');if(HY[dg]===z)r.push('紅艷');if(JY[dg]===z)r.push('金輿');if(XT[dg]===z)r.push('學堂');
 if(k!==2){const gs=GS[SANHE[dz]];for(const n of ['劫煞','華蓋','驛馬','桃花','亡神'])if(gs[n]===z)r.push(n);}
 if(k===2){const gz=g+z;if(SHILING.includes(gz))r.push('十靈日');if(KUIGANG.includes(gz))r.push('魁罡');if(YINCHA.includes(gz))r.push('陰差陽錯');if(GULUAN.includes(gz))r.push('孤鸞');if(SHIE.includes(gz))r.push('十惡大敗');}
 return r;}
export const GUI_TABLE=GUI;export const LU_TABLE=LU;export const REN_TABLE=REN;
// 十二長生
const CS={甲:'亥',乙:'午',丙:'寅',丁:'酉',戊:'寅',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'};
export const ST12=['長生','沐浴','冠帶','臨官','帝旺','衰','病','死','墓','絕','胎','養'];
export function stage12(g,z){const s=Z.indexOf(CS[g]),i=Z.indexOf(z);const k=G.indexOf(g)%2===0?((i-s)%12+12)%12:((s-i)%12+12)%12;return ST12[k];}
// 九宮流年
export function yearStar(Y){return ((10-Y%9)%9+9)%9+1;}
export const FLY=['中宮','西北','西','東北','南','北','西南','東','東南'];
export function flyStars(Y){const s=yearStar(Y);const o={};FLY.forEach((d,i)=>o[d]=((s-1+i)%9)+1);return o;}
const SUI12=['太歲','太陽','喪門','太陰','五鬼','小耗','歲破','龍德','白虎','福德','天狗','病符'];
export const suiShen=(yz,lz)=>SUI12[((Z.indexOf(lz)-Z.indexOf(yz))%12+12)%12];
const minguo=y=>y-1911;
function lunarOf(y,m,d,hh=12,mi=0){return Solar.fromYmdHms(y,m,d,hh,mi,0).getLunar();}
export function dayGz(y,m,d){return lunarOf(y,m,d).getDayInGanZhiExact();}
// 主函式
export function model(form,opt={}){
 const now=opt.now||new Date();
 const Y=+(opt.year||now.getFullYear());
 const dayStr=opt.day||`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
 const c=buildChart(form);
 const lon=form.lon==null||form.lon===''?null:+form.lon;
 const P=c.pillars.map(p=>({gan:p.gan,zhi:p.zhi,nayin:p.nayin}));
 if(lon!=null&&lon<70){ // 干支換日線：東經 70° 以西日序 +1，時干隨新日干；晚子時（23:00 後）依再下一日
  const d=gzAdd(P[2].gan+P[2].zhi,1);P[2]={...P[2],gan:d[0],zhi:d[1]};const zi=Z.indexOf(P[3].zhi);
  const hh=+(form.time||'12:00').split(':')[0];const hs=hh>=23?gzAdd(d,1)[0]:d[0];P[3]={...P[3],gan:G[((G.indexOf(hs)%5)*2+zi)%10]};}
 const dm=P[2].gan,dw=ganWx(dm),male=Number(form.gender)===1;
 P.forEach((p,i)=>{p.ss=i===2?'日元':shiShen(dm,p.gan);p.cang=CANG[p.zhi];p.fu=[...p.cang].map(h=>shiShen(dm,h));p.main=shiShen(dm,mainQi(p.zhi));p.stage=stage12(dm,p.zhi);});
 // 五行旺度
 const score={木:0,火:0,土:0,金:0,水:0};P.forEach(p=>{score[ganWx(p.gan)]+=5;for(const [h,w] of Object.entries(HW[p.zhi]))score[ganWx(h)]+=w;});
 const sc={};WX.forEach(w=>sc[w]=Math.round(score[w]));
 // 十神個數（八字八字，日元計為比肩）
 const cnt={};SS10.forEach(s=>cnt[s]=0);P.forEach((p,i)=>{cnt[i===2?'比肩':p.ss]++;cnt[p.main]++;});
 const el=k=>relEl(dw,k);const tong=score[el(0)]+score[el(4)],tot=60;
 const strong=tong>=tot*0.4; // 表頭「身強／身弱」
 const strong10=tong>tot*0.5; // 「先天命運分析」十神身強／身弱用語
 let xi,ji;
 if(strong){xi=[1,2,3].map(el).sort((a,b)=>score[a]-score[b]).slice(0,2);ji=[0,4].map(el).sort((a,b)=>score[b]-score[a]);}
 else{xi=[4,0].map(el).sort((a,b)=>score[a]-score[b]);ji=[1,2,3].map(el).sort((a,b)=>score[b]-score[a]).slice(0,2);}
 const xian=WX.filter(w=>!xi.includes(w)&&!ji.includes(w));
 const role=w=>xi.includes(w)?'喜':ji.includes(w)?'忌':'閒';
 const VAL={};VAL[xi[0]]=123;VAL[xi[1]]=115;xian.forEach(w=>VAL[w]=88);VAL[ji[1]]=70;VAL[ji[0]]=66;
 // 格局
 const mz=P[1].zhi,mh=hide(mz);const tou=mh.find(g=>P.some((p,i)=>i!==2&&p.gan===g));const geSS=shiShen(dm,tou||mh[0]);
 const ge=geSS==='比肩'?'建祿格':geSS==='劫財'?'月刃格':geSS+'格';
 // 命宮、胎元、胎息、空亡、命卦
 const mg=minggong(P[0].gan,P[1].zhi,P[3].zhi);
 const sd=sheetData({name:form.name,gender:form.gender,date:form.date,time:form.time,zone:form.zone||'Asia/Taipei',lon:lon??121.5654,useStd:!!form.useStd,timeMode:form.timeMode==='solar'?'solar':'clock'});
 const gyear=sd.info.guaYear;const gua=mingGua(gyear,male);
 const dyAsc=[...sd.W.dy_gz].reverse(),dyAge=[...sd.W.dy_age].reverse().map(Number);
 const dayun=dyAsc.map((gz,i)=>({gz,from:dyAge[i],to:dyAge[i]+9,ss:shiShen(dm,gz[0]),zs:shiShen(dm,mainQi(gz[1]))}));
 const [by,bm,bd]=form.date.split('-').map(Number),[bh,bmi]=(form.time||'12:00').split(':').map(Number);
 const lun=lunarOf(by,bm,bd,bh,bmi);
 // 交運日期：首次為精確交運日（出生 + 節氣差 × 120），其後每五年同一農曆月日
 const st=new Date(c.yun.startMs);const s0=Solar.fromYmd(st.getUTCFullYear(),st.getUTCMonth()+1,st.getUTCDate());const l0=s0.getLunar();
 const jiaoyun=[];for(let k=0;k<16;k++){if(k===0){jiaoyun.push({s:[s0.getYear(),s0.getMonth(),s0.getDay()],l:[l0.getYear(),Math.abs(l0.getMonth()),l0.getDay()]});continue;}
  const ly=l0.getYear()+5*k;let dd=l0.getDay(),s=null;while(!s&&dd>0){try{s=Lunar.fromYmd(ly,Math.abs(l0.getMonth()),dd).getSolar();}catch(e){dd--;}}
  jiaoyun.push({s:[s.getYear(),s.getMonth(),s.getDay()],l:[ly,Math.abs(l0.getMonth()),dd]});}
 // 流年、流月、流日
 const age=Y-by+1;const lyGz=(()=>{const yg=((Y-4)%10+10)%10,yz=((Y-4)%12+12)%12;return G[yg]+Z[yz];})();
 const curDy=dayun.find(d=>age>=d.from&&age<=d.to)||null;const curHalf=curDy?(age-curDy.from<5?curDy.gz[0]:curDy.gz[1]):null;
 const months=[];{const yg=G.indexOf(lyGz[0]);for(let i=0;i<12;i++){const gz=G[((yg%5)*2+2+i)%10]+Z[(2+i)%12];
  let sm;try{sm=Lunar.fromYmd(Y,i+1,1).getSolar().getMonth();}catch(e){sm=i+2>12?1:i+2;}
  const j=JIE.find(t=>{const d=new Date(t.ms);return d.getUTCFullYear()===(i===11?Y+1:Y)&&t.k===((21+2*i)%24);});
  months.push({n:i+1,gz,sm,jieYear:j?new Date(j.ms).getUTCFullYear():(i===11?Y+1:Y)});}}
 const [dy_,dm_,dd_]=dayStr.split('-').map(Number);const dl=lunarOf(dy_,dm_,dd_);const dGz=dl.getDayInGanZhiExact();
 const dMonth=yearMonthPillar(Date.UTC(dy_,dm_-1,dd_,12)).month;
 return {form,opt,Y,age,lyGz,c,P,dm,dw,male,score,sc,cnt,tong,strong,strong10,xi,ji,xian,role,VAL,ge,geSS,mg,taiyuan:taiyuan(P[1].gan+P[1].zhi),taixi:taixi(P[2].gan+P[2].zhi),
  ykong:xunkong(P[0].gan+P[0].zhi),dkong:xunkong(P[2].gan+P[2].zhi),gua,gyear,bz:BZ[gua],dayun,dyAge,chusheng:sd.W.chusheng,jiaoyun,curDy,curHalf,months,
  day:{s:[dy_,dm_,dd_],gz:dGz,l:[dl.getYear(),Math.abs(dl.getMonth()),dl.getDay()],month:dMonth},
  birth:{y:by,m:bm,d:bd,h:bh,mi:bmi,l:[lun.getYear(),lun.getMonth(),lun.getDay()]},xz:xingzuo(bm,bd),blood:opt.blood||'',
  stars:P.map((p,k)=>pillarStars(P,k)),name:form.name||'命主',el,minguo};}
