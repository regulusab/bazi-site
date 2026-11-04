#!/usr/bin/env python3
"""產生詳細命盤用字型（皆為 TrueType，供 pdf-lib 子集嵌入與網頁顯示）。
用法: python3 tools/sheet/build_fonts.py /path/NotoSerifCJKtc-Regular.otf
  public/fonts/sheet/SheetTC.ttf     命盤固定/計算用字（tools/sheet/charset.mjs 產生）
  public/fonts/sheet/SheetSerif.ttf  Liberation Serif（ASCII）
  public/fonts/sheet/SheetMono.ttf   Nimbus Mono PS（ASCII，網址列）
  public/fonts/sheet/name/XX.ttf     姓名用字，Noto Serif CJK TC 每 256 碼位一檔（BMP）
"""
import sys, os, json, subprocess, tempfile
from concurrent.futures import ProcessPoolExecutor
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'public', 'fonts', 'sheet')
NOTO = sys.argv[1] if len(sys.argv) > 1 else '/workspace/fig/build/NotoSerifCJKtc-Regular.otf'
SERIF = '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
MONO = '/usr/share/fonts/opentype/urw-base35/NimbusMonoPS-Regular.otf'
ASCII = list(range(0x20, 0x7f))

def sub(src, cps, dst):
    o = subset.Options(); o.layout_features = []; o.hinting = False; o.name_IDs = ['*']; o.notdef_outline = True
    f = TTFont(src); s = subset.Subsetter(o); s.populate(unicodes=cps); s.subset(f); f.save(dst)

def to_ttf(src, dst, fam):
    f = TTFont(src)
    if 'CFF ' in f:
        go = f.getGlyphOrder(); gs = f.getGlyphSet(); glyf = {}
        for n in go:
            pen = TTGlyphPen(gs); gs[n].draw(Cu2QuPen(pen, 1.0, reverse_direction=True)); glyf[n] = pen.glyph()
        f['loca'] = newTable('loca'); t = newTable('glyf'); t.glyphOrder = go; t.glyphs = glyf; f['glyf'] = t
        del f['CFF ']
        if 'VORG' in f: del f['VORG']
        f['maxp'] = newTable('maxp'); m = f['maxp']; m.tableVersion = 0x00010000
        for k in ['maxZones','maxTwilightPoints','maxStorage','maxFunctionDefs','maxInstructionDefs','maxStackElements','maxSizeOfInstructions','maxComponentElements']: setattr(m, k, 0)
        m.maxZones = 1; m.numGlyphs = len(go)
        f['head'].glyphDataFormat = 0
        f['post'].formatType = 2.0; f['post'].extraNames = []; f['post'].mapping = {}; f['post'].glyphOrder = go
        f.sfntVersion = '\x00\x01\x00\x00'
    for rec in f['name'].names:
        if rec.nameID in (1, 4, 16): rec.string = fam
        if rec.nameID == 6: rec.string = fam.replace(' ', '')
    f.save(dst)

def make(src, cps, dst, fam):
    with tempfile.TemporaryDirectory() as d:
        tmp = os.path.join(d, 'x' + os.path.splitext(src)[1]); sub(src, cps, tmp); to_ttf(tmp, dst, fam)
    return dst

def block(b):
    cps = [c for c in CM if c >> 8 == b]
    make(NOTO, cps, os.path.join(OUT, 'name', '%02X.ttf' % b), 'SheetTCX')
    return b

CM = sorted(c for c in TTFont(NOTO).getBestCmap() if c < 0x10000 and (0x2E80 <= c <= 0x9FFF or 0xF900 <= c <= 0xFAFF or 0xFE30 <= c <= 0xFE4F or 0xFF00 <= c <= 0xFFEF))

if __name__ == '__main__':
    os.makedirs(os.path.join(OUT, 'name'), exist_ok=True)
    chars = subprocess.run(['node', os.path.join(ROOT, 'tools/sheet/charset.mjs')], capture_output=True, text=True, check=True).stdout
    tcset = sorted(set(ord(c) for c in chars) | {0x2022, 0x3000})
    make(NOTO, tcset, os.path.join(OUT, 'SheetTC.ttf'), 'SheetTC')
    have = TTFont(os.path.join(OUT, 'SheetTC.ttf')).getBestCmap()
    open(os.path.join(OUT, 'SheetTC.chars.txt'), 'w', encoding='utf-8').write(''.join(chr(c) for c in tcset if c in have))
    make(SERIF, ASCII, os.path.join(OUT, 'SheetSerif.ttf'), 'SheetSerif')
    make(MONO, ASCII, os.path.join(OUT, 'SheetMono.ttf'), 'SheetMono')
    blocks = sorted(set(c >> 8 for c in CM))
    with ProcessPoolExecutor() as ex: list(ex.map(block, blocks))
    json.dump(blocks, open(os.path.join(OUT, 'name', 'manifest.json'), 'w'))
    print('blocks', len(blocks), 'glyphs', len(CM))
