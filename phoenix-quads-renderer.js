// Phoenix Quads: source-contour construction (not a scaled font).
// The original FontStruct spacer columns are only separators. Each actual
// component column is remapped to either a Phoenix stem or a counter slot.
(function () {
  "use strict";
  const INPUT = window.PHOENIX_QUADS_DATA;
  const RECIPES = window.PHOENIX_RECIPES;
  if (!INPUT || !RECIPES) throw new Error("Phoenix source data must load first.");
  const U = 186;
  const fmt = v => String(Math.round(v * 100000) / 100000);
  const parsed = Object.create(null);
  const ops = {M:2,L:2,H:1,V:1,Q:4,C:6,Z:0};

  function tokenize(d) {
    const a = d.match(/[A-Za-z]|-?(?:\d*\.)?\d+/g) || [];
    const out = [];
    for (let i = 0; i < a.length;) {
      const op = a[i++];
      const count = ops[op];
      if (count === undefined || i + count > a.length) throw Error("Invalid FontStruct contour command: " + op);
      out.push([op, ...a.slice(i, i + count).map(Number)]);
      i += count;
    }
    return out;
  }
  function getParts(ch) {
    if (!INPUT[ch]) throw Error("No Phoenix source glyph: " + ch);
    return parsed[ch] || (parsed[ch] = INPUT[ch].parts.map(tokenize));
  }
  function bounds(cmd) {
    const b = {xmin:Infinity, xmax:-Infinity, ymin:Infinity, ymax:-Infinity};
    const point = (x,y) => { b.xmin=Math.min(b.xmin,x); b.xmax=Math.max(b.xmax,x); b.ymin=Math.min(b.ymin,y); b.ymax=Math.max(b.ymax,y); };
    let x=0,y=0;
    for (const [op,...v] of cmd) {
      if(op==="M"||op==="L") { x=v[0]; y=v[1]; point(x,y); }
      else if(op==="H") {x=v[0];point(x,y);}
      else if(op==="V") {y=v[0];point(x,y);}
      else if(op==="Q") {point(v[0],v[1]);x=v[2];y=v[3];point(x,y);}
      else if(op==="C") {point(v[0],v[1]);point(v[2],v[3]);x=v[4];y=v[5];point(x,y);}
    }
    return b;
  }
  function unionIntervals(bands) {
    const sorted=bands.sort((a,b)=>a[0]-b[0]),merged=[];
    for(const [a,b] of sorted) {
      if(!merged.length || a>merged[merged.length-1][1]+2) merged.push([a,b]);
      else merged[merged.length-1][1]=Math.max(merged[merged.length-1][1],b);
    }
    return merged;
  }
  function verticalMap(ch,stem,height) {
    const all = getParts(ch).map(bounds);
    const lo=Math.min(...all.map(b=>b.ymin)),hi=Math.max(...all.map(b=>b.ymax));
    const topStart=hi-((hi-lo)>2000?187:U);
    // Top, bottom, and all independent middle horizontal bricks remain
    // exactly one calculated stem thick, no matter what preview height is.
    const bands=[[lo,lo+U],[topStart,hi]];
    for(const b of all) {
      const delta=b.ymax-b.ymin;
      if(delta >= U-2 && delta<=U+2 && b.ymin>lo+U+2 && b.ymax<hi-U-2) {
        bands.push([b.ymin,b.ymax]);
      }
    }
    const fixed=unionIntervals(bands);
    const gaps=[],pieces=[];
    let at=lo;
    for(const [a,b] of fixed) {
      if(a>at) {pieces.push({a:at,b:a,fixed:false});gaps.push(a-at);}
      pieces.push({a,b,fixed:true});at=b;
    }
    if(at<hi) {pieces.push({a:at,b:hi,fixed:false});gaps.push(hi-at);}
    const fixedLen=fixed.length*stem,flexLen=height-fixedLen;
    if(flexLen<=0 && gaps.length)throw Error("Preview height is too short for "+ch+"'s "+fixed.length+" locked stroke rows.");
    const totalGap=gaps.reduce((a,b)=>a+b,0);
    let dest=0;
    for(const p of pieces) {
      p.from=dest;
      p.size=p.fixed?stem:(totalGap?flexLen*(p.b-p.a)/totalGap:0);
      dest+=p.size;
    }
    return function(y) {
      if(y<=lo) return height;
      if(y>=hi) return 0;
      for(const p of pieces) {
        if(y<=p.b+1e-7) return height-(p.from+(y-p.a)/(p.b-p.a)*p.size);
      }
      return 0;
    };
  }
  function horizontalMap(ch,stem,counter) {
    const recipe=RECIPES[ch],origin=INPUT[ch].origin;
    const slots=recipe.width;
    const starts=[];let running=0;
    for(const slot of slots){ starts.push(running);running+=(slot==="stem"?stem:counter); }
    if(ch==="T") {
      const width=running, center=(width-stem)/2;
      const cols=[{start:0,width:stem/2},{start:center,width:stem},{start:width-stem/2,width:stem/2}];
      return function(x) {
        const g=Math.max(0,Math.min(2,Math.round((x-origin-U/2)/(2*U))));
        let f=(x-(origin+g*2*U))/U;
        if(Math.abs(f)<.01)f=0;else if(Math.abs(f-1)<.01)f=1;
        if(g===0)return cols[0].start+f*stem; // original arm is half a brick
        if(g===2)return cols[2].start+(f-.5)*stem;
        return cols[1].start+f*stem;
      };
    }
    return function(x) {
      // Every successive occupied brick is separated by one EMPTY brick.
      const group=Math.max(0,Math.min(slots.length-1,Math.round((x-origin-U/2)/(2*U))));
      let frac=(x-(origin+group*2*U))/U;
      if(Math.abs(frac)<.01)frac=0;
      else if(Math.abs(frac-1)<.01)frac=1;
      return starts[group]+frac*(slots[group]==="stem"?stem:counter);
    };
  }
  function contour(cmd, xmap, ymap) {
    let d="";
    for(const [op,...v] of cmd) {
      if(op==="M"||op==="L") d+=op+fmt(xmap(v[0]))+" "+fmt(ymap(v[1]))+" ";
      else if(op==="H") d+="H"+fmt(xmap(v[0]))+" ";
      else if(op==="V") d+="V"+fmt(ymap(v[0]))+" ";
      else if(op==="Q") d+="Q"+fmt(xmap(v[0]))+" "+fmt(ymap(v[1]))+" "+fmt(xmap(v[2]))+" "+fmt(ymap(v[3]))+" ";
      else if(op==="C") d+="C"+fmt(xmap(v[0]))+" "+fmt(ymap(v[1]))+" "+fmt(xmap(v[2]))+" "+fmt(ymap(v[3]))+" "+fmt(xmap(v[4]))+" "+fmt(ymap(v[5]))+" ";
      else if(op==="Z")d+="Z";
    }
    return d.trim();
  }
  function renderGlyph(ch,stem,counter,height,options) {
    if(!Number.isFinite(stem)||!Number.isFinite(counter)||!Number.isFinite(height)||stem<=0||counter<=0||height<=0)
      throw Error("Invalid Phoenix glyph measurements");
    const recipe=RECIPES[ch],source=INPUT[ch];
    if(!recipe||!source)throw Error("Unknown Phoenix quad "+ch);
    const xmap=horizontalMap(ch,stem,counter);
    const ymap=verticalMap(ch,stem,height);
    const guides=Boolean(options&&options.guides);
    let body="",i=0;
    for(const cmds of getParts(ch)) {
      const b=bounds(cmds);
      const centerX=(b.xmin+b.xmax)/2;
      const group=Math.max(0,Math.min(recipe.width.length-1,Math.round((centerX-source.origin-U/2)/(2*U))));
      const counterCell=recipe.width[group]==="counter";
      body+='<path data-quad-glyph="'+ch+'" data-quad-column="'+group+
        '" data-quad-role="'+(counterCell?"counter-connector":"stem")+
        '" d="'+contour(cmds,xmap,ymap)+'" fill="'+(guides&&counterCell?"#a6d777":"currentColor")+'"/>';
      i++;
    }
    return body;
  }
  window.PhoenixQuads={
    renderGlyph, sourceUnit:U,
    measure: (ch,stem,counter) => RECIPES[ch].width.reduce((t,c)=>t+(c==="stem"?stem:counter),0),
    inspect: ch => getParts(ch).map((cmd,i)=>({part:i+1,bounds:bounds(cmd)}))
  };
})();