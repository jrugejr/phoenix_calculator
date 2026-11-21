// Run from repository root: node --test tests/preview.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const context = vm.createContext({window:{},document:{addEventListener(){}}});
for(const path of ["app.js", "phoenix-recipes.js", "phoenix-quads-data.js",
                   "phoenix-quads-renderer.js", "phoenix-preview.js"]) {
  vm.runInContext(fs.readFileSync(path,"utf8"), context, {filename:path});
}
const calc=vm.runInContext("calculateLayout",context);
const preview=context.window.PhoenixPreview;
const quads=context.window.PhoenixQuads;

test("source is the complete original eleven-unit uppercase construction alphabet",()=>{
  assert.equal(quads.sourceUnit,186);
  for(const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const parts=quads.inspect(ch);
    assert.ok(parts.length>0,ch+" has source contours");
    assert.ok(parts.every(p=>Number.isFinite(p.bounds.xmin)&&Number.isFinite(p.bounds.ymax)),ch+" has measured outline");
  }
});

test("empty FontStruct separator bricks are discarded rather than counted as counters",()=>{
  assert.equal(preview.glyphWidth("A",1,.875),2.875);
  assert.equal(preview.glyphWidth("E",1,.875),1.875);
  assert.equal(preview.glyphWidth("M",1,.875),4.75);
  assert.equal(preview.glyphWidth("W",1,.875),4.75);
  // Three occupied source bricks for A; only ONE actual counter slot.
  const svg=quads.renderGlyph("A",1,.875,9);
  assert.ok(svg.includes('data-quad-column="0"'));
  assert.ok(svg.includes('data-quad-column="1"'));
  assert.ok(svg.includes('data-quad-column="2"'));
  assert.ok(!svg.includes('stroke-width='));
});

test("all A-Z glyphs derive from original filled FontStruct vector contours",()=>{
  for(const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){
    const svg=quads.renderGlyph(ch,1,.875,9);
    assert.ok(svg.includes('data-quad-glyph="'+ch+'"'),ch+" has imported paths");
    assert.ok(svg.includes('fill="currentColor"'),ch+" is actually filled");
    assert.ok(!/NaN|undefined|Infinity/.test(svg),ch+" coordinates finite");
    assert.ok(!svg.includes('stroke-width='),ch+" does not use centerline strokes");
  }
});

test("actual source curves are retained rather than drawn as generic splines",()=>{
  for(const ch of ["A","B","C","G","N","O","P","R","S","X","Y"]){
    const svg=quads.renderGlyph(ch,1,.875,9);
    assert.ok(svg.includes("Q"),ch+" retains FontStruct quadratic curves");
  }
  const n=quads.renderGlyph("N",1,.875,9);
  assert.ok(n.includes('data-quad-role="counter-connector"'),"N has top counter bridge");
  assert.ok(!n.includes('data-quad-role="diagonal"'),"N remains an arch, not diagonal");
});

test("height changes only the vertical construction, not horizontal widths or stroke rows",()=>{
  const a=quads.renderGlyph("A",1,.875,8);
  const b=quads.renderGlyph("A",1,.875,13);
  // The crossbar is exactly one stem thick in either preview height.
  function barHeight(svg) {
    const match=svg.match(/data-quad-role="counter-connector" d="M[^ ]+ ([0-9.]+) V([0-9.]+)/);
    assert.ok(match,"counter bar available");
    return Math.abs(Number(match[1])-Number(match[2]));
  }
  assert.ok(Math.abs(barHeight(a)-1)<0.0001);
  assert.ok(Math.abs(barHeight(b)-1)<0.0001);
  assert.ok(a.includes("M0 8 ")||a.includes("M0 8V"),"left stem reaches bottom");
  assert.ok(b.includes("M0 13 ")||b.includes("M0 13V"),"left stem reaches bottom after stretching");
});

test("construction mode colors actual counter connectors without altering geometry",()=>{
  const finished=quads.renderGlyph("S",1,.875,9,{guides:false});
  const guide=quads.renderGlyph("S",1,.875,9,{guides:true});
  assert.ok(guide.includes('data-quad-role="counter-connector"'));
  assert.ok(guide.includes('fill="#a6d777"'));
  assert.equal((guide.match(/data-quad-glyph=/g)||[]).length,
               (finished.match(/data-quad-glyph=/g)||[]).length);
  assert.equal(guide.replaceAll('fill="#a6d777"','fill="currentColor"'),finished);
});

test("special T has centered full-width stem with two half-brick top arms",()=>{
  const glyph=quads.renderGlyph("T",1,.875,9);
  assert.ok(glyph.includes('M0.4375 9 V0 H1.4375 V9'),"center stem correctly centered");
  assert.ok(glyph.includes('data-quad-role="topSpan"'),"full top bar constructed");
  assert.ok(!glyph.includes('M-'),"ink remains within letter width");
});

test("W and V vertical stems meet their bottom counter bricks with filled feet",()=>{
  for(const ch of ["W","V"]) {
    const glyph=quads.renderGlyph(ch,1,.875,9);
    assert.equal((glyph.match(/data-quad-role="bottomStemFoot"/g)||[]).length,
                 ch==="W"?3:2);
    assert.ok(glyph.includes("V9"),"foot reaches actual baseline");
  }
});

test("counter columns never exceed stroke width in actual calculator candidates",()=>{
  for(const word of ["SIGNS","PHOENIX","WXY","SHOE REPAIR","ABCD","NOW"]) {
    for(const style of ["smaller","equal"]) {
      const result=calc(word,18,style);
      assert.ok(result.recommended);
      assert.ok(result.recommended.counter>0);
      assert.ok(result.recommended.counter<=result.recommended.stem,
        word+" "+style+" counter max");
      if(style==="equal")assert.equal(result.recommended.counter,result.recommended.stem);
    }
  }
});

test("layout width stays identical to the original Phoenix calculator in both modes",()=>{
  let passed=0;
  for(const word of ["ABCDEFGHIJKLMNOPQRSTUVWXYZ","PHOENIX","SIGNS","WXY",
                      "SHOE REPAIR","OPEN","T","W","Q","Z","G","Y"]) {
    for(const width of [16,18,42]) {
      for(const style of ["smaller","equal"]) {
        const result=calc(word,width,style);
        assert.ok(result.recommended);
        const height=Math.max(width/2,result.recommended.stem*4.75);
        const svg=preview.buildSvg(result,{height});
        const guide=preview.buildSvg(result,{height,guides:true});
        assert.ok(Math.abs(svg.width-result.recommended.finalWidth)<0.00001);
        assert.equal(svg.width,guide.width);
        assert.equal(svg.height,height);
        assert.ok(!/NaN|undefined|Infinity/.test(svg.svg));
        assert.equal((svg.svg.match(/transform="translate\(/g)||[]).length,
                     result.letters.length);
        passed++;
      }
    }
  }
  assert.equal(passed,72);
});

test("red frame consumes the full user-selected letter height",()=>{
  const result=calc("SIGNS",16,"smaller");
  const auto=preview.buildSvg(result);
  const custom=preview.buildSvg(result,{height:12});
  assert.equal(auto.height,8);
  assert.equal(custom.height,12);
  assert.equal(auto.width,custom.width);
  assert.ok(auto.svg.includes('<rect x="0" y="0" width="16" height="8"'));
  assert.ok(custom.svg.includes('<rect x="0" y="0" width="16" height="12"'));
});

test("invalid input and too-short requested glyph height are rejected explicitly",()=>{
  assert.throws(()=>preview.glyphWidth("?",1,1),/No preview glyph/);
  assert.throws(()=>preview.buildSvg(null,{}),/calculated Phoenix layout/);
  assert.throws(()=>quads.renderGlyph("A",1,.875,2),/too short/);
});
