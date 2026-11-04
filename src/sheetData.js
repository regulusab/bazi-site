// 詳細命盤（星僑八字論斷格式）資料推算。純邏輯：瀏覽器與 Node 皆可用。
// 規則由「羅章雲／羅章翔」兩張星僑範本反推，並以 王先生（1962-08-08 00:10）Python 版逐欄驗證。
import LJ from 'lunar-javascript';
import {JIE,TERMS,inRange,yearMonthPillar,prevJieIdx} from './terms.js';
import {wallToUt,zoneOffsetMin,dayIdx,gz as gz60,LINE} from './global.js';
const {Solar}=LJ;
export const G='甲乙丙丁戊己庚辛壬癸', Z='子丑寅卯辰巳午未申酉戌亥';
const H=36e5, DAY=864e5;
// 藏干（本氣在最後，與星僑範本排列相同）
export const CANG={子:'癸',丑:'辛癸己',寅:'戊丙甲',卯:'乙',辰:'癸乙戊',巳:'庚戊丙',午:'己丁',未:'乙丁己',申:'戊壬庚',酉:'辛',戌:'丁辛戊',亥:'甲壬'};
export function shishen(d,o){const a=G.indexOf(d),b=G.indexOf(o);const same=a%2===b%2;const rel=((Math.floor(b/2)-Math.floor(a/2))%5+5)%5;
 return [['比肩','劫財'],['食神','傷官'],['偏財','正財'],['七殺','正官'],['偏印','正印']][rel][same?0:1];}
// 十二運（範本文字倒排：生長、浴沐、帶冠、官臨、旺帝；戊同丙、己同丁）
const CS={甲:'亥',乙:'午',丙:'寅',丁:'酉',戊:'寅',己:'酉',庚:'巳',辛:'子',壬:'申',癸:'卯'};
export const ST=['生長','浴沐','帶冠','官臨','旺帝','衰','病','死','墓','絕','胎','養'];
export function stage(g,z){const s=Z.indexOf(CS[g]),i=Z.indexOf(z);const k=G.indexOf(g)%2===0?((i-s)%12+12)%12:((s-i)%12+12)%12;return ST[k];}
const NAYIN=['海中金','爐中火','大林木','路旁土','劍鋒金','山頭火','澗下水','城頭土','白蠟金','楊柳木','泉中水','屋上土','霹靂火','松柏木','長流水','砂中金','山下火','平地木','壁上土','金箔金','覆燈火','天河水','大驛土','釵釧金','桑柘木','大溪水','沙中土','天上火','石榴木','大海水'];
export const idx60=gz=>{for(let i=0;i<60;i++)if(G[i%10]===gz[0]&&Z[i%12]===gz[1])return i;return -1;};
export const nayin=gz=>[...NAYIN[Math.floor(idx60(gz)/2)]].reverse().join('');
export const xunkong=gz=>{const i=idx60(gz),s=i-i%10;return Z[(s+10)%12]+Z[(s+11)%12];};
export const gzAdd=(gz,n)=>{const i=((idx60(gz)+n)%60+60)%60;return G[i%10]+Z[i%12];};
const fu=(d,br)=>{const ss=[...CANG[br]].map(c=>shishen(d,c));return [ss.map(x=>x[0]).join(''),ss.map(x=>x[1]).join('')];};
export function xiantian(p){const c=Array(10).fill(0);for(const gz of p){c[G.indexOf(gz[0])]++;for(const h of CANG[gz[1]])c[G.indexOf(h)]++;}return c.map(String);}
export function minggong(yg,mz,hz){const m=((Z.indexOf(mz)-2)%12+12)%12+1,h=Z.indexOf(hz);const b=((4-m-h)%12+12)%12;
 const s0={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}[G.indexOf(yg)];const k=((b-2)%12+12)%12;return G[(s0+k)%10]+Z[b];}
export const taiyuan=m=>G[(G.indexOf(m[0])+1)%10]+Z[(Z.indexOf(m[1])+3)%12];
const ZHE={子:'丑',丑:'子',寅:'亥',亥:'寅',卯:'戌',戌:'卯',辰:'酉',酉:'辰',巳:'申',申:'巳',午:'未',未:'午'};
export const taixi=d=>G[(G.indexOf(d[0])+5)%10]+ZHE[d[1]];
// 神煞
const LU={甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
const REN={甲:'卯',乙:'辰',丙:'午',丁:'未',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'};
const GUI={甲:'丑未',戊:'丑未',庚:'丑未',乙:'子申',己:'子申',丙:'亥酉',丁:'亥酉',辛:'午寅',壬:'卯巳',癸:'卯巳'};
const WC={甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
const JY={甲:'辰',乙:'巳',丙:'未',丁:'申',戊:'未',己:'申',庚:'戌',辛:'亥',壬:'丑',癸:'寅'};
const HY={甲:'午',乙:'申',丙:'寅',丁:'未',戊:'辰',己:'辰',庚:'戌',辛:'酉',壬:'子',癸:'申'};
const chong=z=>Z[(Z.indexOf(z)+6)%12];
const stageBranch=(g,n)=>[...Z].find(z=>stage(g,z)===n);
const GRP={申:'申子辰',子:'申子辰',辰:'申子辰',寅:'寅午戌',午:'寅午戌',戌:'寅午戌',巳:'巳酉丑',酉:'巳酉丑',丑:'巳酉丑',亥:'亥卯未',卯:'亥卯未',未:'亥卯未'};
const GS={申子辰:{劫煞:'巳',華蓋:'辰',驛馬:'寅',將星:'子',亡神:'亥',桃花:'酉'},寅午戌:{劫煞:'亥',華蓋:'戌',驛馬:'申',將星:'午',亡神:'巳',桃花:'卯'},
 巳酉丑:{劫煞:'寅',華蓋:'丑',驛馬:'亥',將星:'酉',亡神:'申',桃花:'午'},亥卯未:{劫煞:'申',華蓋:'未',驛馬:'巳',將星:'卯',亡神:'寅',桃花:'子'}};
const GUCHEN={寅:'巳',卯:'巳',辰:'巳',巳:'申',午:'申',未:'申',申:'亥',酉:'亥',戌:'亥',亥:'寅',子:'寅',丑:'寅'};
const TIANDE={寅:'丁',卯:'申',辰:'壬',巳:'辛',午:'亥',未:'甲',申:'癸',酉:'寅',戌:'丙',亥:'乙',子:'巳',丑:'庚'};
const YUEDE={寅午戌:'丙',申子辰:'壬',亥卯未:'甲',巳酉丑:'庚'};
function stemStars(d,z){const r=[];if(LU[d]===z)r.push('祿神');if(REN[d]===z)r.push('羊刃');if(GUI[d].includes(z))r.push('天乙貴人');if(WC[d]===z)r.push('文昌');if(JY[d]===z)r.push('金輿');
 if(stageBranch(d,'生長')===z)r.push('學堂');if(stageBranch(d,'浴沐')===z)r.push('學士');if(chong(REN[d])===z)r.push('飛刃');if(HY[d]===z)r.push('紅艷');return r;}
function branchStars(dz,z){const r=[],g=GS[GRP[dz]];for(const k of ['華蓋','驛馬','劫煞','亡神','將星'])if(g[k]===z)r.push(k);if(g.桃花===z)r.push('日桃花');return r;}
const gejiao=dz=>Z[(Z.indexOf(dz)+2)%12];
export const ORDER=['祿神','羊刃','天乙貴人','文昌','金輿','學堂','學士','飛刃','紅艷','隔角','金匱','孤辰','天德','月德','華蓋','驛馬','劫煞','亡神','將星','日桃花'];
const ord=a=>a.slice().sort((x,y)=>ORDER.indexOf(x)-ORDER.indexOf(y));
export function shensha12(d,dz,z){const r=stemStars(d,z);if(gejiao(dz)===z)r.push('隔角');return ord(r.concat(branchStars(dz,z)));}
export function shensha4(p){const d=p[1][0],dz=p[1][1],mz=p[2][1],yz=p[3][1];
 return p.map((gz,k)=>{const z=gz[1];let r=stemStars(d,z);if(gejiao(dz)===z)r.push('隔角');
  if(k!==3&&GS[GRP[yz]].將星===z)r.push('金匱'); // 推測規則
  if(k!==3&&GUCHEN[yz]===z)r.push('孤辰');if(gz[0]===TIANDE[mz]||z===TIANDE[mz])r.push('天德');if(gz[0]===YUEDE[GRP[mz]])r.push('月德');
  if(k!==1)r=r.concat(branchStars(dz,z));return ord(r);});}
export const fmtSS=l=>l.map(s=>s+'•').join('');
const GONG_OFF=[-2,-3,-4,-5,-6,-7,-8,-9,-10,-11,0,-1], SUI_K=[5,4,3,2,1,0,11,10,9,8,7,6];
export const gongzhi=mg=>GONG_OFF.map(o=>Z[((Z.indexOf(mg[1])+o)%12+12)%12]);
export const suizhi=mg=>SUI_K.map(k=>Z[((Z.indexOf(mg[1])-k)%12+12)%12]);
// 八宅（命卦）：順序 絕命 五鬼 六煞 禍害 伏位 延年 天醫 生氣
export const GUA={1:'坎',2:'坤',3:'震',4:'巽',6:'乾',7:'兌',8:'艮',9:'離'};
export const BZ={坎:['西南','東北','西北','正西','正北','正南','正東','東南'],離:['西北','正西','西南','東北','正南','正北','東南','正東'],
 震:['正西','西北','東北','西南','正東','東南','正北','正南'],巽:['東北','西南','正西','西北','東南','正東','正南','正北'],
 乾:['正南','正東','正北','東南','西北','西南','東北','正西'],坤:['正北','東南','正南','正東','西南','西北','正西','東北'],
 艮:['東南','正北','正東','正南','東北','正西','西北','西南'],兌:['正東','正南','東南','正北','正西','東北','西南','西北']};
// 三爻（上、中、下；1=陽爻實線 0=陰爻斷線）
export const TRIGRAM={乾:[1,1,1],兌:[0,1,1],離:[1,0,1],震:[0,0,1],巽:[1,1,0],坎:[0,1,0],艮:[1,0,0],坤:[0,0,0]};
export function mingGua(year,male){const yy=year%100;let n;
 if(male)n=year<2000?(100-yy)%9:(99-yy)%9;else n=year<2000?(yy-4)%9:(yy+6)%9;n=(n+9)%9;if(n===0)n=9;if(n===5)n=male?2:8;return GUA[n];}
// 人元用事（司令）：[天干, 天數]
const SILING={子:[['壬',10],['癸',20]],丑:[['癸',9],['辛',3],['己',18]],寅:[['戊',7],['丙',7],['甲',16]],卯:[['甲',10],['乙',20]],辰:[['乙',9],['癸',3],['戊',18]],
 巳:[['戊',5],['庚',9],['丙',16]],午:[['丙',10],['己',9],['丁',11]],未:[['丁',9],['乙',3],['己',18]],申:[['戊',7],['壬',7],['庚',16]],酉:[['庚',10],['辛',20]],
 戌:[['辛',9],['丁',3],['戊',18]],亥:[['戊',7],['甲',7],['壬',16]]};
export function siling(mz,days){let acc=0;for(const [g,n] of SILING[mz]){acc+=n;if(days<acc)return g;}return SILING[mz][SILING[mz].length-1][0];}
const WX='木火土金水';const elOfZ={寅:'木',卯:'木',巳:'火',午:'火',申:'金',酉:'金',亥:'水',子:'水',辰:'木',未:'火',戌:'金',丑:'水'};
export function wangxiang(E){const i=WX.indexOf(E);const st={};st[WX[i]]='旺';st[WX[(i+1)%5]]='相';st[WX[(i+4)%5]]='休';st[WX[(i+3)%5]]='囚';st[WX[(i+2)%5]]='死';return [...WX].map(w=>st[w]);}
const ANIMAL={子:'鼠',丑:'牛',寅:'虎',卯:'兔',辰:'龍',巳:'蛇',午:'馬',未:'羊',申:'猴',酉:'雞',戌:'狗',亥:'豬'};
const ymd=ms=>{const d=new Date(ms);return [d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate()];};
const dayNo=ms=>Math.floor(ms/DAY);
// inp: {name, gender(1男/0女), date:'YYYY-MM-DD', time:'HH:MM', zone:IANA, fixedOffMin(null|分), useStd(扣夏令,預設 true), second(重複時段取第二次), listDate:'YYYY-MM-DD'}
export function sheetData(inp){
 const [y,m,d]=inp.date.split('-').map(Number),[hh,mi]=(inp.time||'12:00').split(':').map(Number);const male=Number(inp.gender)===1;
 const wall=Date.UTC(y,m-1,d,hh,mi);const zone=inp.zone||'Asia/Taipei';const fixed=inp.fixedOffMin!=null&&inp.fixedOffMin!=='';
 let ut,off,amb=null,gap=false;
 if(fixed){off=+inp.fixedOffMin;ut=wall-off*6e4;}else{const r=wallToUt(zone,wall,!!inp.second);ut=r.ut;off=r.off;amb=r.ambiguous;gap=r.gap;}
 const stdOff=fixed?off:Math.min(zoneOffsetMin(zone,Date.UTC(y,0,15)),zoneOffsetMin(zone,Date.UTC(y,6,15)),off);
 const useStd=inp.useStd!==false;const dst=off-stdOff;const lOff=useStd?stdOff:off;
 const local=ut+lOff*6e4; // 排盤用當地鐘點（預設已扣夏令時間）
 const tpe=ut+8*H;if(!inRange(tpe))throw new Error('出生時刻超出 DE421 節氣表範圍（1900–2050）');
 const ym=yearMonthPillar(tpe);
 const [LY,LM,LD]=ymd(local);const ld=new Date(local);
 const sol=Solar.fromYmdHms(LY,LM,LD,ld.getUTCHours(),ld.getUTCMinutes(),0);const lun=sol.getLunar();
 // 日柱、時柱：當地鐘點（預設扣夏令時間）；出生地在東經 70° 以西（含西半球）時，依干支換日線日序 +1（與星僑範本、全球八字主盤相同）
 const lon=inp.lon==null||inp.lon===''?121.5654:+inp.lon;const shift=(inp.dayRule||'line')==='line'&&lon<LINE?1:0;
 const hr=ld.getUTCHours()+ld.getUTCMinutes()/60;let di=(dayIdx(local)+shift)%60;const zi=Math.floor((hr+1)/2)%12;const hsDay=hr>=23?(di+1)%60:di; // 23 時後為晚子時：日柱不換、時干依次日
 const hg=G[((hsDay%5)*2+zi)%10]+Z[zi];
 const p=[hg,gz60(di),ym.month,ym.year]; // 時 日 月 年
 const dm=p[1][0];
 const zhuxing=p.map((gz,i)=>i===1?'命主':shishen(dm,gz[0]));
 const f4=p.map(gz=>fu(dm,gz[1]));
 const yang=G.indexOf(p[3][0])%2===0;const forward=yang===male;
 const mg=minggong(p[3][0],p[2][1],p[0][1]);
 const dy=Array.from({length:8},(_,i)=>gzAdd(p[2],(i+1)*(forward?1:-1))).reverse();
 const fdy=dy.map(g=>fu(dm,g[1]));
 const gzr=gongzhi(mg);
 // 節
 const i=prevJieIdx(tpe),prev=JIE[i],next=JIE[i+1];
 const jLocal=j=>j.ms-8*H+lOff*6e4; // 節氣時刻換成當地（排盤）鐘點
 // 人元用事
 const daysIn=(tpe-prev.ms)/DAY;const ry=siling(p[2][1],daysIn);
 // 旺相休囚死：四季月最後 18 天（以日期計）為土旺
 let E=elOfZ[p[2][1]];if('辰未戌丑'.includes(p[2][1])&&dayNo(jLocal(next))-dayNo(local)<=18)E='土';
 const wx=wangxiang(E);
 // 起運：三日折一年（1 分鐘 = 2 小時），四捨五入至日
 const target=forward?next:prev;const diff=Math.abs(target.ms-tpe);const vd=Math.round(diff/DAY*120);
 const QY=Math.floor(vd/360),QM=Math.floor((vd%360)/30),QD=vd%30;
 const jy0=Date.UTC(LY+QY,LM-1+QM,LD+QD);const [JY]=ymd(jy0);
 // 「每逢」句：交運日當天或之前最近的一個節氣（含中氣，範本有「穀雨後2天」）
 const endT=jy0+DAY-lOff*6e4+8*H;let k=TERMS.length-1;while(k>0&&TERMS[k].ms>=endT)k--;const jj=TERMS[k];const N=dayNo(jy0)-dayNo(jLocal(jj));
 const s1=G[((JY-4)%10+10)%10],s2=G[(G.indexOf(s1)+5)%10];
 const a0=JY-LY+1;const dyAge=Array.from({length:8},(_,i)=>String(a0+10*i)).reverse();
 // 年份、陰曆
 const by=y;const mgY=by>=1912?String(by-1911):'前'+(1912-by);const lyN=lun.getYear();const mgL=lyN>=1912?String(lyN-1911):'前'+(1912-lyN);
 const lmo=lun.getMonth();const hz=p[0][1];
 const lunarTail=(lmo<0?['閏']:[]).concat([String(Math.abs(lmo)),'月',String(lun.getDay()),'日',hz,'時','建','生']);
 const wk='日一二三四五六'[new Date(Date.UTC(y,m-1,d)).getUTCDay()];
 const ld_=(inp.listDate||'').split('-').map(Number);const listdate=ld_.length===3&&ld_[0]?`${ld_[0]}/${ld_[1]}/${ld_[2]}`:'';
 let li=i;while(JIE[li].k!==21)li--;const gyear=new Date(JIE[li].ms).getUTCFullYear(); // 立春年
 const gua=mingGua(gyear,male);const dongxi='坎離震巽'.includes(gua)?'東四命':'西四命';
 const W={serial:'',name:(inp.name||'').trim(),zodiac:'屬'+ANIMAL[p[3][1]],sex:(yang?'陽':'陰')+(male?'男':'女'),
  xiyuan:`西元${by}年`,minguo:mgY,minguo_l:mgL,listdate,
  xiantian:xiantian(p),rikong:xunkong(p[1]),niankong:xunkong(p[3]),mingge:'',minggong:mg,
  renyuan_top:ry,renyuan_bot:shishen(dm,ry),taixi:taixi(p[1]),taiyuan:taiyuan(p[2]),wang:['',''],
  yong:['用神','喜神','閒神','仇神','忌神'].map((r,i)=>[r,'',wx[i],WX[i]]),
  zhuxing,bazi:p,cang:p.map(gz=>CANG[gz[1]]),fu_top:f4.map(x=>x[0]),fu_bot:f4.map(x=>x[1]),yun:p.map(gz=>stage(dm,gz[1])),
  shensha4:shensha4(p).map(x=>x.length?[fmtSS(x)]:[]),nayin:p.map(nayin),
  solar_tail:[String(m),'月',String(d),'日',String(hh),'時',String(mi),'分'],lunar_tail:lunarTail,week:'星期'+wk,
  dy_age:dyAge,dy_zx:dy.map(g=>shishen(dm,g[0])),dy_gz:dy,dy_cang:dy.map(g=>CANG[g[1]]),dy_fu_top:fdy.map(x=>x[0]),dy_fu_bot:fdy.map(x=>x[1]),
  csheng:gzr.map(z=>stage(dm,z)),shensha12:gzr.map(z=>{const x=shensha12(dm,p[1][1],z);return x.length?[fmtSS(x)]:[];}),
  gongzhi:gzr,sui_zhi:suizhi(mg),
  chusheng:`出生後${QY}年${QM}個月又${QD}天交大運`,meifeng:`每逢${s1}或${s2}年${jj.name}後${N}天交大運`,
  gua,dongxi,bazhai_dir:BZ[gua]};
 const info={lon,shift,ut,off,stdOff,dst,useStd,amb,gap,zone:fixed?null:zone,local,forward,daysIn,
  prevJie:{name:prev.name,ms:jLocal(prev)},nextJie:{name:next.name,ms:jLocal(next)},target:{name:target.name,ms:jLocal(target)},
  diffMs:diff,vdays:vd,jiaoyun:jy0,jiaoyunJie:{name:jj.name,ms:jLocal(jj)},guaYear:gyear,lunarYear:lyN};
 return {W,info};}
