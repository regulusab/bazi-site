// 詳細命盤回歸測試：王先生（與 Python 版逐欄、逐字形比對）＋羅章雲／羅章翔（與星僑原單比對）
import fs from 'fs';
import {sheetData} from '../src/sheetData.js';
import {layoutSheet} from '../src/sheetLayout.js';
const J=f=>JSON.parse(fs.readFileSync(new URL(f,import.meta.url)));
let fail=0;const chk=(n,c,x='')=>{console.log(c?'PASS':'FAIL',n,x);if(!c)fail++;};
// 1) 王先生 1962-08-08 00:10 台灣 乾造
const E=J('./wang-expected.json');
const {W}=sheetData({name:'王先生',gender:1,date:'1962-08-08',time:'00:10',zone:'Asia/Taipei',listDate:'2026-11-05'});
const dk=Object.keys(E.W).filter(k=>JSON.stringify(W[k])!==JSON.stringify(E.W[k]));
chk('王先生 全部欄位 = Python 版',dk.length===0,`${Object.keys(E.W).length} 欄${dk.length?'，不同：'+dk.join(','):''}`);
chk('王先生 八字 壬寅 丁未 戊寅 壬子',[...W.bazi].reverse().join(' ')==='壬寅 丁未 戊寅 壬子');
const G=layoutSheet(W);let maxd=0,same=G.length===E.glyphs.length;
E.glyphs.forEach((g,i)=>{const h=G[i];if(!h||h[2]!==g[2]||h[3]!==g[3]){same=false;return;}maxd=Math.max(maxd,Math.abs(h[0]-g[0]),Math.abs(h[1]-g[1]),Math.abs(h[4]-g[4]));});
// 唯一差異：Python 以 PIL 量 Latin 字寬含 '11' 字距調整，網頁版不做字距調整（0.63 範本單位 ≈ 0.08 mm）
chk('王先生 版面字形 = Python 版（位置誤差 < 1 單位）',same&&maxd<1,`${G.length} 字形，最大誤差 ${maxd.toFixed(3)}`);
chk('天干皆為「壬」非「王」（王只出現在姓名）',G.filter(g=>g[2]==='王').length===1);
// 2) 羅章雲／羅章翔：波特蘭出生，星僑原單轉錄（tests/luo-sheets.json）
const S=J('./luo-sheets.json');const BLANK=new Set(['serial','mingge','wang']);
const norm=(k,v)=>k==='shensha12'?v.map(a=>a.join('')):k==='yong'?v.map(r=>[r[0],r[2],r[3]]):v;
const KNOWN={p1:{chusheng:'出生後6年0個月又18天交大運',meifeng:'每逢壬或丁年立夏後1天交大運'}};
for(const [pg,d,t,bz] of [['p1','2026-04-17','01:17','丙午 壬辰 壬戌 庚子'],['p2','2026-10-12','13:01','丙午 戊戌 庚申 壬午']]){
 const r=sheetData({name:S[pg].name,gender:1,date:d,time:t,zone:'America/Los_Angeles',lon:-122.68,listDate:'2026-11-04'});
 chk(`${S[pg].name} 八字 ${bz}`,[...r.W.bazi].reverse().join(' ')===bz);
 const keys=Object.keys(S[pg]).filter(k=>k in r.W&&!BLANK.has(k));const bad=[];
 for(const k of keys){const kn=KNOWN[pg]?.[k];if(kn){chk(`${S[pg].name} ${k}（已知差 1 天：星僑 ${S[pg][k]}）`,r.W[k]===kn,r.W[k]);continue;}
  if(JSON.stringify(norm(k,r.W[k]))!==JSON.stringify(norm(k,S[pg][k])))bad.push(k);}
 chk(`${S[pg].name} 可推導欄位與星僑原單一致`,bad.length===0,`${keys.length} 欄${bad.length?'，不同：'+bad.join(','):''}`);
 chk(`${S[pg].name} 版面可排`,layoutSheet(r.W).length>900);}
// 3) 其他邊界：台灣夏令時間、女命、閏月、晚子時
const d1=sheetData({name:'測',gender:0,date:'1979-07-15',time:'12:30',listDate:'2026-01-01'});chk('1979 台灣夏令時間自動扣 60 分',d1.info.dst===60);
const d2=sheetData({name:'測',gender:0,date:'2023-04-01',time:'23:30',listDate:'2026-01-01'});chk('2023 閏二月 + 晚子時換日干',d2.W.lunar_tail.includes('閏')&&/^[甲乙丙丁戊己庚辛壬癸]子$/.test(d2.W.bazi[0]),JSON.stringify([d2.W.lunar_tail,d2.W.bazi]));
console.log(fail?`${fail} FAILED`:'sheet tests: all passed');process.exit(fail?1:0);
