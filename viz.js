// Animated technical diagrams for the three problem tabs.
// Monoline pen strokes from Rough.js with a very low roughness: clean geometry with
// a slight human wobble. On play, each stroke traces itself once with an ease-in-out,
// fills fade in, and annotations appear in sequence. Once drawn, everything stays
// still. Reduced motion shows the finished diagram.
import rough from "./vendor/rough-4.6.6.esm.js";

const NS = "http://www.w3.org/2000/svg";
// Colours are CSS variables, so the drawings follow the theme. The surface is the
// opposite of the page: deep navy on the light theme, pale slate on the dark one.
const C = n => `var(--vz-${n})`;
const INK = C("ink"), SLATE = C("slate"), BLUE = C("blue"), CORAL = C("coral"), TEAL = C("mint"), LAVENDER = C("lav");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.65,0,.35,1)";
const soft = c => c.replace(")", "-soft)");

class Sketch {
  constructor(svg, seed, w = 1) {
    this.svg = svg; this.rc = rough.svg(svg); this.g = this.rc.generator; this.seed = seed; this.w = w;
    this.queue = []; // {node, at, dur, kind}
  }
  shape(make, at, dur = 500, cls = "", kind = "draw") {
    const node = this.rc.draw(make({ seed: this.seed++ }));
    node.setAttribute("class", "pen " + cls);
    node.querySelectorAll("path").forEach(p => {
      // CSS variables only work as style properties, so move colours there.
      for (const k of ["stroke", "fill"]) { const c = p.getAttribute(k); if (c && c.startsWith("var(")) { p.style[k] = c; p.removeAttribute(k); } }
      if (kind === "draw") p.setAttribute("pathLength", "1");
    });
    this.svg.append(node);
    this.queue.push({ node, at, dur, kind });
    return node;
  }
  ink(o = {}) {
    const r = { stroke: INK, strokeWidth: 1.6, roughness: .12, bowing: .15, disableMultiStroke: true, preserveVertices: true, ...o };
    r.strokeWidth *= this.w; return r;
  }
  line(x1, y1, x2, y2, at, dur, o) { return this.shape(s => this.g.line(x1, y1, x2, y2, this.ink({ ...s, ...o })), at, dur); }
  box(x, y, w, h, at, dur, o) { return this.shape(s => this.g.rectangle(x, y, w, h, this.ink({ ...s, ...o })), at, dur); }
  poly(pts, at, dur, o) { return this.shape(s => this.g.polygon(pts, this.ink({ ...s, ...o })), at, dur); }
  path(pts, at, dur, o) { return this.shape(s => this.g.linearPath(pts, this.ink({ ...s, ...o })), at, dur); }
  // Soft translucent fill that fades in inside its outline.
  fill(x, y, w, h, color, at, dur) {
    return this.shape(s => this.g.rectangle(x, y, w, h, { ...s, stroke: "none", fill: soft(color), fillStyle: "solid", roughness: 0 }), at, Math.max(dur || 0, 420), "soft", "fade");
  }
  fillPoly(pts, color, at, dur = 500) {
    return this.shape(s => this.g.polygon(pts, { ...s, stroke: "none", fill: soft(color), fillStyle: "solid", roughness: 0 }), at, dur, "soft", "fade");
  }
  fillCircle(cx, cy, d, color, at, dur = 500) {
    return this.shape(s => this.g.circle(cx, cy, d, { ...s, stroke: "none", fill: soft(color), fillStyle: "solid", roughness: 0 }), at, dur, "soft", "fade");
  }
  ellipse(cx, cy, w, h, at, dur, o) { return this.shape(s => this.g.ellipse(cx, cy, w, h, this.ink({ roughness: .2, stroke: BLUE, ...s, ...o })), at, dur); }
  curve(pts, at, dur, o) { return this.shape(s => this.g.curve(pts, this.ink({ ...s, ...o })), at, dur); }
  arrow(pts, at, dur = 450, color = SLATE, sw = 1.4) {
    this.curve(pts, at, dur, { stroke: color, strokeWidth: sw });
    const [x2, y2] = pts[pts.length - 1], [x1, y1] = pts[pts.length - 2];
    const a = Math.atan2(y2 - y1, x2 - x1), L = 8 * this.w;
    const p = s => [x2 - L * Math.cos(a - s), y2 - L * Math.sin(a - s)];
    const [ax, ay] = p(.45), [bx, by] = p(-.45);
    this.shape(s => this.g.linearPath([[ax, ay], [x2, y2], [bx, by]], this.ink({ ...s, stroke: color, strokeWidth: sw })), at + dur * .85, 200);
  }
  underline2(x1, x2, y, at) { this.line(x1, y, x2, y, at, 380, { stroke: BLUE, strokeWidth: 1.4 }); }
  text(str, x, y, at, size = 16, anchor = "start", weight = 400, color = INK) {
    const t = document.createElementNS(NS, "text");
    Object.entries({ x, y, "text-anchor": anchor, class: "hand" + (weight >= 700 ? " strong" : ""), "font-size": size * (weight >= 700 ? .78 : .7) }).forEach(([k, v]) => t.setAttribute(k, v));
    t.style.fill = color;
    t.textContent = str; this.svg.append(t);
    this.queue.push({ node: t, at, dur: 360, kind: "fade" });
    return t;
  }
  play() {
    for (const { node, at, dur, kind } of this.queue) {
      if (kind === "fade") {
        node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: at, easing: "ease-out", fill: "backwards" });
      } else {
        node.querySelectorAll("path").forEach(p => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: at, easing: EASE, fill: "backwards" }));
      }
    }
  }
}

const charts = {
  ai(svg) {
    const k = new Sketch(svg, 11);
    k.text("Machines check first", 14, 28, 0, 24, "start", 700);
    k.underline2(14, 214, 36, 250);
    // axis, bottom to top
    k.line(124, 292, 124, 72, 400, 500, { stroke: SLATE });
    k.text("issues in one episode", 130, 66, 600, 16);
    k.text("caught by checks", 116, 100, 800, 16, "end");
    k.fill(124, 84, 196, 24, BLUE, 950, 600); k.box(124, 84, 196, 24, 850, 450);
    k.text("173", 326, 102, 1450, 20, "start", 700);
    k.text("left for a person", 116, 140, 1100, 16, "end");
    k.line(124, 136, 128, 136, 1200, 120);
    k.text("0", 140, 142, 1500, 22, "start", 700);
    k.ellipse(146, 135, 30, 28, 1650, 380);
    k.arrow([[226, 160], [192, 158], [164, 146]], 1900, 380);
    k.text("all caught first", 230, 166, 2250, 16, "start", 400, SLATE);
    k.text("review rounds, same quality", 130, 200, 2300, 16);
    k.text("heavier loop", 116, 230, 2450, 16, "end");
    k.fill(124, 214, 196, 24, CORAL, 2600, 600); k.box(124, 214, 196, 24, 2500, 450);
    k.text("84", 326, 232, 3100, 20, "start", 700);
    k.text("two gates", 116, 270, 2800, 16, "end");
    k.fill(124, 254, 7, 24, TEAL, 3050, 200); k.box(124, 254, 7, 24, 2950, 200);
    k.text("2", 142, 273, 3300, 22, "start", 700);
    k.ellipse(146, 266, 28, 28, 3400, 360);
    k.text("42× fewer rounds", 346, 318, 3700, 22, "end", 700);
    k.underline2(196, 346, 324, 3950);
    return k;
  },

  data(svg) {
    const k = new Sketch(svg, 41);
    k.text("Every read, one record", 14, 28, 0, 24, "start", 700);
    k.underline2(14, 230, 36, 250);
    k.fill(20, 48, 320, 78, BLUE, 600, 700); k.box(20, 48, 320, 78, 450, 500);
    k.text("Digital Twin", 180, 74, 1000, 22, "middle", 700);
    k.text("one record per item instance, tracked globally", 180, 98, 1150, 14, "middle");
    k.text("and synchronized with ERP financial records", 180, 116, 1250, 14, "middle");
    k.line(20, 214, 340, 214, 1200, 600, { stroke: SLATE });
    const st = [["supply chain", 45], ["warehouse", 135], ["store", 225], ["customer QR", 315]];
    st.forEach(([name, x], i) => {
      const t = 1500 + i * 650;
      k.ellipse(x, 214, 30, 30, t, 300);
      k.fill(x - 9, 205, 18, 18, BLUE, t + 150, 200);
      k.text(name, x, 244, t + 200, 15, "middle");
      k.arrow([[x, 196], [x + (180 - x) * .15, 160], [x + (180 - x) * .55, 134]], t + 300, 330, BLUE);
    });
    k.text("RFID and QR work across all points", 180, 268, 4150, 15, "middle", 400, SLATE);
    k.text("> 99.9% of items traceable", 180, 296, 4300, 18, "middle", 700, BLUE);
    k.text("manual work, before and after", 14, 324, 4600, 16);
    k.fill(70, 334, 200, 16, CORAL, 4800, 500); k.box(70, 334, 200, 16, 4700, 400);
    k.text("before", 64, 347, 4700, 14, "end");
    k.fill(70, 358, 60, 16, TEAL, 5300, 300); k.box(70, 358, 60, 16, 5200, 250);
    k.text("after", 64, 371, 5200, 14, "end");
    k.arrow([[262, 356], [220, 374], [140, 368]], 5600, 420);
    k.text("−70%", 306, 371, 6050, 24, "middle", 700, CORAL);
    k.ellipse(306, 364, 64, 34, 6200, 360, { stroke: CORAL });
    return k;
  },

  growth(svg) {
    const k = new Sketch(svg, 77);
    k.text("When the money comes back", 14, 28, 0, 24, "start", 700);
    k.underline2(14, 268, 36, 250);
    const zero = 146, sc = 110 / 500;
    k.line(30, zero, 346, zero, 400, 500, { stroke: SLATE });      // x axis, left to right
    k.line(30, 268, 30, 54, 500, 450, { stroke: SLATE });          // y axis, bottom to top
    k.text("0", 22, zero + 5, 700, 15, "end");
    const vals = [-500, -361, -147, 91, 312], lab = ["−500K", "−361K", "−147K", "+91K", "+312K"];
    const pts = [];
    vals.forEach((v, i) => {
      const x = 50 + i * 58, h = Math.abs(v) * sc, y = v < 0 ? zero : zero - h, t = 1000 + i * 420;
      k.fill(x, y, 40, h, v < 0 ? CORAL : TEAL, t + 120, 420); k.box(x, y, 40, h, t, 380);
      k.text(lab[i], x + 20, v < 0 ? y + h + 17 : y - 8, t + 380, 16, "middle", 700);
      k.text("year " + i, x + 20, 292, t + 200, 14, "middle");
      pts.push([x + 20, v < 0 ? y + h : y]);
    });
    const bx = pts[2][0] + (pts[3][0] - pts[2][0]) * (147 / (147 + 91));
    k.ellipse(bx, zero, 26, 26, 4050, 360);
    k.arrow([[bx - 96, 74], [bx - 40, 86], [bx - 10, 128]], 4400, 420);
    k.text("break-even, year 3", bx - 100, 66, 4800, 18, "middle", 700);
    k.underline2(pts[4][0] - 24, pts[4][0] + 24, pts[4][1] - 4, 5200);
    return k;
  },
};

// Article artwork: the same pen, no words. One periwinkle element carries the idea.
const W = 2.2; // thicker pen, so thumbnails stay legible
Object.assign(charts, {
  playbook(svg) {
    const k = new Sketch(svg, 5, W);
    k.box(118, 62, 160, 210, 0, 500, { stroke: SLATE });
    k.box(100, 80, 160, 210, 150, 500, { stroke: SLATE });
    k.fill(82, 98, 160, 210, BLUE, 700); k.box(82, 98, 160, 210, 300, 600, { stroke: BLUE });
    [140, 180, 220, 260].forEach((y, i) => {
      k.box(104, y - 10, 20, 20, 800 + i * 150, 250);
      k.line(138, y, 220 - (i % 2) * 30, y, 850 + i * 150, 300, { stroke: SLATE });
      k.path([[108, y], [113, y + 6], [122, y - 7]], 1500 + i * 150, 250, { stroke: TEAL });
    });
    [[70, "a"], [160, "b"], [250, "c"]].forEach(([y], i) => {
      k.arrow([[262, 200], [320, 200 + (y + 35 - 200) * .3], [394, y + 35]], 2100 + i * 200, 450, SLATE, 1.6);
      k.box(408, y, 170, 70, 2400 + i * 200, 450);
      k.box(424, y + 18, 14, 14, 2700 + i * 200, 200);
      k.line(450, y + 25, 540 - i * 18, y + 25, 2750 + i * 200, 250, { stroke: SLATE });
      k.line(450, y + 48, 520 + i * 10, y + 48, 2800 + i * 200, 250, { stroke: SLATE });
      k.path([[427, y + 25], [431, y + 30], [438, y + 20]], 3100 + i * 200, 200, { stroke: TEAL });
    });
    return k;
  },

  evals(svg) {
    const k = new Sketch(svg, 9, W);
    let t = 0;
    for (let c = 0; c < 4; c++) for (let r = 0; r < 6; r++) {
      const ok = (c * 6 + r) % 7 !== 3;
      k.shape(s => k.g.circle(70 + c * 34, 90 + r * 36, 12, k.ink({ ...s, stroke: ok ? INK : CORAL })), t += 40, 220);
    }
    k.line(210, 70, 300, 150, 1100, 450, { stroke: SLATE });
    k.line(210, 290, 300, 210, 1100, 450, { stroke: SLATE });
    k.fill(300, 140, 40, 80, BLUE, 1700); k.box(300, 140, 40, 80, 1500, 500, { stroke: BLUE });
    k.line(320, 120, 320, 240, 1550, 450, { stroke: BLUE });
    k.arrow([[344, 170], [400, 140], [462, 110]], 2100, 450, SLATE, 1.6);
    k.arrow([[344, 192], [400, 230], [462, 262]], 2250, 450, SLATE, 1.6);
    k.fillCircle(500, 104, 64, TEAL, 2700); k.shape(s => k.g.circle(500, 104, 64, k.ink({ ...s, stroke: TEAL })), 2600, 450);
    k.path([[484, 104], [496, 116], [518, 90]], 2900, 300, { stroke: TEAL });
    k.shape(s => k.g.circle(500, 268, 44, k.ink({ ...s, stroke: CORAL })), 2750, 400);
    k.line(490, 258, 510, 278, 3050, 200, { stroke: CORAL }); k.line(510, 258, 490, 278, 3150, 200, { stroke: CORAL });
    [0, 1, 2].forEach(i => { k.line(560, 80 + i * 22, 560 + [50, 38, 44][i], 80 + i * 22, 3300 + i * 120, 250, { stroke: SLATE }); });
    return k;
  },

  "model-answer"(svg) {
    const k = new Sketch(svg, 13, W);
    k.poly([[40, 120], [210, 120], [210, 220], [96, 220], [70, 250], [74, 220], [40, 220]], 0, 700);
    [148, 172, 196].forEach((y, i) => k.line(62, y, 188 - i * 30, y, 600 + i * 120, 300, { stroke: SLATE }));
    k.arrow([[220, 170], [260, 172], [292, 176]], 1100, 400, SLATE, 1.6);
    const D = [[370, 104], [446, 180], [370, 256], [294, 180]];
    k.fillPoly(D, BLUE, 1700); k.poly(D, 1400, 600, { stroke: BLUE });
    k.box(470, 28, 130, 96, 1900, 500);
    [52, 74, 96].forEach((y, i) => { k.line(488, y, 500, y, 2200 + i * 100, 150, { stroke: TEAL }); k.line(510, y, 580 - i * 16, y, 2250 + i * 100, 250, { stroke: SLATE }); });
    k.arrow([[480, 128], [450, 140], [418, 152]], 2600, 400, SLATE, 1.6);
    k.arrow([[448, 180], [500, 196], [538, 214]], 2900, 400, SLATE, 1.6);
    k.fillCircle(574, 232, 64, TEAL, 3300); k.shape(s => k.g.circle(574, 232, 64, k.ink({ ...s, stroke: TEAL })), 3200, 450);
    k.path([[558, 232], [570, 244], [592, 218]], 3500, 300, { stroke: TEAL });
    k.arrow([[370, 258], [372, 290], [420, 312]], 3100, 400, SLATE, 1.6);
    k.shape(s => k.g.circle(452, 296, 22, k.ink({ ...s })), 3500, 300);
    k.curve([[434, 330], [452, 312], [470, 330]], 3650, 300);
    return k;
  },

  rfid(svg) {
    const k = new Sketch(svg, 21, W);
    const cx = 320;
    k.fillPoly([[262, 134], [378, 134], [378, 226], [262, 226]], BLUE, 900);
    k.ellipse(cx, 134, 116, 30, 0, 500);
    k.line(262, 134, 262, 226, 300, 400, { stroke: BLUE }); k.line(378, 134, 378, 226, 300, 400, { stroke: BLUE });
    k.curve([[262, 226], [290, 241], [350, 241], [378, 226]], 650, 400, { stroke: BLUE });
    k.curve([[262, 180], [290, 195], [350, 195], [378, 180]], 800, 400, { stroke: BLUE, strokeWidth: 1.1 });
    // tag
    k.box(64, 58, 84, 56, 1100, 450); k.shape(s => k.g.circle(82, 86, 10, k.ink(s)), 1350, 200);
    k.curve([[100, 72], [128, 72], [132, 100], [104, 100], [106, 82], [122, 84]], 1450, 400, { stroke: SLATE });
    // warehouse
    k.poly([[60, 300], [60, 252], [106, 224], [152, 252], [152, 300]], 1300, 500);
    k.box(90, 268, 32, 32, 1700, 300, { stroke: SLATE });
    // store with awning
    k.box(492, 72, 92, 60, 1500, 450);
    k.path([[486, 72], [492, 54], [584, 54], [590, 72]], 1800, 300);
    [0, 1, 2, 3].forEach(i => k.curve([[492 + i * 23, 72], [503 + i * 23, 82], [515 + i * 23, 72]], 1950 + i * 60, 200, { stroke: SLATE }));
    // phone with QR
    k.box(512, 220, 56, 96, 1700, 450);
    [[522, 236], [546, 236], [522, 260]].forEach(([x, y], i) => k.box(x, y, 16, 16, 2000 + i * 80, 200, { stroke: SLATE }));
    k.box(550, 264, 8, 8, 2240, 150, { stroke: SLATE });
    // reads flowing in
    [[[152, 90], [210, 110], [258, 150]], [[156, 262], [210, 240], [258, 212]], [[486, 104], [430, 118], [382, 150]], [[506, 266], [440, 240], [382, 212]]]
      .forEach((p, i) => k.arrow(p, 2400 + i * 200, 450, BLUE, 1.6));
    return k;
  },

  "business-case"(svg) {
    const k = new Sketch(svg, 33, W);
    const z = 190;
    k.line(60, 40, 60, 320, 0, 450, { stroke: SLATE });
    k.line(60, z, 600, z, 200, 500, { stroke: SLATE });
    const v = [-110, -80, -34, 22, 72, 120];
    v.forEach((d, i) => {
      const x = 92 + i * 84, h = Math.abs(d), y = d < 0 ? z : z - h, c = d < 0 ? CORAL : TEAL;
      k.fill(x, y, 48, h, c, 800 + i * 200); k.box(x, y, 48, h, 700 + i * 200, 400, { stroke: c });
    });
    const be = 92 + 2 * 84 + 24 + 84 * (34 / 56);
    k.line(be, z, be, 78, 2100, 400, { stroke: BLUE });
    k.fillPoly([[be, 78], [be + 58, 94], [be, 110]], BLUE, 2500);
    k.poly([[be, 78], [be + 58, 94], [be, 110]], 2350, 400, { stroke: BLUE });
    k.shape(s => k.g.circle(be, z, 18, k.ink({ ...s, stroke: BLUE })), 2650, 250);
    return k;
  },
});

document.querySelectorAll(".sketch[data-viz]").forEach(fig => {
  const svg = fig.matches("svg") ? fig : fig.querySelector("svg");
  let sketch = null, played = false;
  const build = () => { svg.replaceChildren(); sketch = charts[fig.dataset.viz](svg); };
  const play = () => { build(); if (!reduce) sketch.play(); played = true; };
  build(); // drawn and static until it comes into view
  const io = new IntersectionObserver(es => es.forEach(e => {
    fig.classList.toggle("in-view", e.isIntersecting);
    if (e.isIntersecting && !played) play();
  }), { threshold: .3 });
  io.observe(fig);
  const panel = fig.closest("[role=tabpanel]");
  if (panel) new MutationObserver(() => { if (!panel.hidden && played) play(); }).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
});
