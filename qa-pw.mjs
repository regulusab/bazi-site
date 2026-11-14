// 尋找可用的 playwright（環境變數 PLAYWRIGHT_MJS、本地 node_modules、全域 pnpm／npx 快取）
import fs from 'fs';import path from 'path';
const cands=[process.env.PLAYWRIGHT_MJS,'./node_modules/playwright/index.mjs'];
for(const root of ['/usr/local/lib/pnpm','/home/box/.npm/_npx']){try{for(const f of walk(root,5))cands.push(f);}catch(e){}}
function* walk(d,depth){if(depth<0)return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
 if(e.isDirectory()){if(e.name==='playwright'&&fs.existsSync(path.join(p,'index.mjs'))){yield path.join(p,'index.mjs');continue;}if(!e.name.startsWith('playwright-core'))yield* walk(p,depth-1);}}}
const hit=cands.find(f=>f&&fs.existsSync(path.resolve(f)));if(!hit)throw new Error('找不到 playwright；請設定 PLAYWRIGHT_MJS');
export const {chromium}=await import(path.resolve(hit));
