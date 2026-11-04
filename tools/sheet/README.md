# 詳細命盤（星僑格式八字論斷）工具
- `charset.mjs`：列出命盤固定／計算可能用到的字（姓名除外）。
- `build_fonts.py`：產生 `public/fonts/sheet/` 字型（`npm run fonts:sheet`）。
- `export_tpl.py`：由原始量測管線（星僑羅章雲頁掃描 → 字形座標，位於 /workspace/fig/build）匯出 `src/sheet-template.js` 與 `tests/wang-expected.json`；網站執行時不需要。
