// 列出詳細命盤可能用到的所有字（姓名除外），供產生 NSCTC-sheet 子集字型
import {sheetData,ORDER,ST,BZ,GUA} from '../../src/sheetData.js';
import T from '../../src/sheet-template.js';
const set=new Set();const add=s=>{for(const c of String(s))set.add(c);};
const walk=v=>{if(v==null)return;if(Array.isArray(v))v.forEach(walk);else if(typeof v==='object')Object.values(v).forEach(walk);else add(v);};
// recs 已去識別（佔位字〇／0），佔位字不列入；原範本量測時出現過的字另列於下（僅為排序後的字表，與任何個人無關）
walk(T.recs.map(r=>r.glyphs.map(g=>g[2].replace(/〇/g,''))));
walk('七上丑亡交亥仇休個偏傷冠出刃分劫北午南卯印又喜囚四土坎堂墓壁士夏子學寅將屬巳帝帶建後忌戌或文昌時月木未東正殺每比水沐河流浴海火申立章紅羅羊肩臨艷花華蓋衰角貴輿辰逢酉金長閒隔雲飛食養馬驛');walk(T.ltc.map(g=>g[2]));walk(T.tpl.map(t=>Array.isArray(t.text)?t.text.filter(x=>x[0]!=='§'):(t.text[0]==='§'?'':t.text)));
walk([ORDER,ST,BZ,Object.values(GUA),'甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥木火土金水','鼠牛虎兔龍蛇馬羊猴雞狗豬屬陽陰男女','星期日一二三四五六閏前','東西四命',
 '比肩劫財食神傷官偏正七殺印','春分清明穀雨立夏小滿芒種夏至小暑大暑立秋處暑白露秋分寒露霜降立冬小雪大雪冬至小寒大寒立春雨水驚蟄','出生後年個月又天交大運每逢或','旺相休囚死']);
const zones=['Asia/Taipei','America/Los_Angeles','Europe/London'];
for(let i=0;i<4000;i++){const t=Date.UTC(1901,0,1)+Math.floor(Math.random()*(Date.UTC(2049,0,1)-Date.UTC(1901,0,1)));const d=new Date(t);
 const r=sheetData({name:'',gender:i%2,date:d.toISOString().slice(0,10),time:d.toISOString().slice(11,16),zone:zones[i%3],lon:[121.5,-122.7,0][i%3],listDate:'2026-01-01'});walk(r.W);}
const cjk=[...set].filter(c=>c.codePointAt(0)>=0x2000).sort();
process.stdout.write(cjk.join(''));
