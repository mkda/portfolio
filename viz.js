// Hand-drawn animated charts for the three problem tabs.
// Ink and marker strokes come from Rough.js. Each shape is drawn three times with
// different seeds and the copies swap at 12 fps, so the lines "boil" like
// frame-by-frame animation. On play, strokes draw themselves on in 12 fps steps
// and handwritten labels pop in one after another. Reduced motion shows the
// finished drawing, still.
import rough from "./vendor/rough-4.6.6.esm.js";

const NS = "http://www.w3.org/2000/svg";
const INK = "#2B2B2B", CORAL = "#E8806B", TEAL = "#3FA7A0", MUSTARD = "#E3B341";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FRAME = 1000 / 12;
const steps = ms => `steps(${Math.max(2, Math.round(ms / FRAME))}, end)`;

class Sketch {
  constructor(svg, seed) {
    this.svg = svg; this.rc = rough.svg(svg); this.g = this.rc.generator; this.seed = seed;
    this.queue = []; // {node, at, dur, kind}
  }
  // One boiling shape: three seeded copies of the same drawable.
  shape(make, at, dur = 500, cls = "") {
    const wrap = document.createElementNS(NS, "g");
    wrap.setAttribute("class", "boil " + cls);
    for (let k = 0; k < 3; k++) {
      const d = make({ seed: this.seed++ });
      const node = this.rc.draw(d);
      node.querySelectorAll("path").forEach(p => p.setAttribute("pathLength", "1"));
      wrap.append(node);
    }
    this.svg.append(wrap);
    this.queue.push({ node: wrap, at, dur, kind: "draw" });
    return wrap;
  }
  ink(o = {}) { return { stroke: INK, strokeWidth: 1.7, roughness: 1.3, bowing: 1.4, ...o }; }
  marker(color, o = {}) { return { stroke: "none", fill: color, fillStyle: "zigzag", fillWeight: 6, hachureGap: 6, hachureAngle: -38, roughness: 2.2, ...o }; }
  line(x1, y1, x2, y2, at, dur, o) { return this.shape(s => this.g.line(x1, y1, x2, y2, this.ink({ ...s, ...o })), at, dur); }
  box(x, y, w, h, at, dur, o) { return this.shape(s => this.g.rectangle(x, y, w, h, this.ink({ ...s, ...o })), at, dur); }
  // Marker fill that bleeds a little outside the ink outline.
  fill(x, y, w, h, color, at, dur) {
    const b = 2.5;
    return this.shape(s => this.g.rectangle(x - b, y - b * .6, w + b * 1.6, h + b * 1.2, this.marker(color, s)), at, dur, "marker");
  }
  ellipse(cx, cy, w, h, at, dur, o) { return this.shape(s => this.g.ellipse(cx, cy, w, h, this.ink({ roughness: 1.6, ...s, ...o })), at, dur); }
  curve(pts, at, dur, o) { return this.shape(s => this.g.curve(pts, this.ink({ ...s, ...o })), at, dur); }
  arrow(pts, at, dur = 450) {
    this.curve(pts, at, dur);
    const [x2, y2] = pts[pts.length - 1], [x1, y1] = pts[pts.length - 2];
    const a = Math.atan2(y2 - y1, x2 - x1), L = 9;
    const p = s => [x2 - L * Math.cos(a - s), y2 - L * Math.sin(a - s)];
    const [ax, ay] = p(.45), [bx, by] = p(-.45);
    this.shape(s => this.g.linearPath([[ax, ay], [x2, y2], [bx, by]], this.ink(s)), at + dur, 160);
  }
  underline2(x1, x2, y, at) { this.line(x1, y, x2, y + 1, at, 220); this.line(x1 + 6, y + 5, x2 - 4, y + 6, at + 160, 220); }
  text(str, x, y, at, size = 16, anchor = "start", weight = 400, color = INK) {
    const t = document.createElementNS(NS, "text");
    Object.entries({ x, y, "text-anchor": anchor, class: "hand", "font-size": size, "font-weight": weight, fill: color }).forEach(([k, v]) => t.setAttribute(k, v));
    t.textContent = str; this.svg.append(t);
    this.queue.push({ node: t, at, dur: 160, kind: "pop" });
    return t;
  }
  play() {
    for (const { node, at, dur, kind } of this.queue) {
      if (kind === "pop") {
        node.animate([{ opacity: 0, transform: "translateY(3px) scale(.92)" }, { opacity: 1, transform: "none" }], { duration: dur, delay: at, easing: steps(dur), fill: "backwards" });
      } else {
        node.querySelectorAll("path").forEach(p => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: at, easing: steps(dur), fill: "backwards" }));
      }
    }
  }
  get end() { return Math.max(...this.queue.map(q => q.at + q.dur)); }
}

const charts = {
  ai(svg) {
    const k = new Sketch(svg, 11);
    k.text("Machines check first", 14, 28, 0, 24, "start", 700);
    k.underline2(14, 214, 36, 250);
    // axis, bottom to top
    k.line(124, 292, 124, 72, 400, 500);
    k.text("issues in one episode", 130, 66, 600, 16);
    k.text("caught by checks", 116, 100, 800, 16, "end");
    k.fill(124, 84, 196, 24, TEAL, 950, 600); k.box(124, 84, 196, 24, 850, 450);
    k.text("173", 326, 102, 1450, 20, "start", 700);
    k.text("left for a person", 116, 140, 1100, 16, "end");
    k.line(124, 136, 128, 136, 1200, 120);
    k.text("0", 140, 142, 1500, 22, "start", 700);
    k.ellipse(146, 135, 30, 28, 1650, 380);
    k.arrow([[226, 160], [192, 158], [164, 146]], 1900, 380);
    k.text("all caught first", 230, 166, 2250, 16, "start", 400, "#5a554e");
    k.text("review rounds, same quality", 130, 200, 2300, 16);
    k.text("heavier loop", 116, 230, 2450, 16, "end");
    k.fill(124, 214, 196, 24, CORAL, 2600, 600); k.box(124, 214, 196, 24, 2500, 450);
    k.text("84", 326, 232, 3100, 20, "start", 700);
    k.text("two gates", 116, 270, 2800, 16, "end");
    k.fill(124, 254, 7, 24, MUSTARD, 3050, 200); k.box(124, 254, 7, 24, 2950, 200);
    k.text("2", 142, 273, 3300, 22, "start", 700);
    k.ellipse(146, 266, 28, 28, 3400, 360);
    k.text("42× fewer rounds", 196, 318, 3700, 22, "start", 700);
    k.underline2(196, 342, 324, 3950);
    return k;
  },

  data(svg) {
    const k = new Sketch(svg, 41);
    k.text("Every read, one record", 14, 28, 0, 24, "start", 700);
    k.underline2(14, 230, 36, 250);
    k.fill(28, 52, 304, 62, TEAL, 600, 700); k.box(28, 52, 304, 62, 450, 500);
    k.text("Digital Twin", 180, 82, 1000, 22, "middle", 700);
    k.text("one record per item · the ERP reads it", 180, 104, 1150, 14, "middle");
    k.line(20, 214, 340, 214, 1200, 600);
    const st = [["supply chain", 45], ["warehouse", 135], ["store", 225], ["customer QR", 315]];
    st.forEach(([name, x], i) => {
      const t = 1500 + i * 650;
      k.ellipse(x, 214, 30, 30, t, 300);
      k.fill(x - 9, 205, 18, 18, MUSTARD, t + 150, 200);
      k.text(name, x, 250, t + 200, 15, "middle");
      k.arrow([[x, 196], [x + (180 - x) * .15, 160], [x + (180 - x) * .55, 120]], t + 300, 330);
    });
    k.text("manual work, before and after", 14, 270, 4400, 16);
    k.fill(70, 280, 200, 16, CORAL, 4600, 500); k.box(70, 280, 200, 16, 4500, 400);
    k.text("before", 64, 293, 4500, 14, "end");
    k.fill(70, 306, 60, 16, TEAL, 5100, 300); k.box(70, 306, 60, 16, 5000, 250);
    k.text("after", 64, 319, 5000, 14, "end");
    k.arrow([[262, 302], [220, 322], [140, 316]], 5400, 420);
    k.text("−70%", 296, 318, 5850, 24, "middle", 700);
    k.ellipse(296, 310, 62, 32, 6000, 360);
    k.text("> 99.9% of items traceable", 346, 150, 6300, 16, "end", 700);
    return k;
  },

  growth(svg) {
    const k = new Sketch(svg, 77);
    k.text("When the money comes back", 14, 28, 0, 24, "start", 700);
    k.underline2(14, 268, 36, 250);
    const zero = 146, sc = 110 / 500;
    k.line(30, zero, 346, zero, 400, 500);      // x axis, left to right
    k.line(30, 268, 30, 54, 500, 450);          // y axis, bottom to top
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
    k.shape(s => k.g.linearPath(pts, k.ink({ ...s, strokeWidth: 1.3, roughness: 1.6 })), 3300, 700);
    const bx = pts[2][0] + (pts[3][0] - pts[2][0]) * (147 / (147 + 91));
    k.ellipse(bx, zero, 26, 26, 4050, 360);
    k.arrow([[bx - 96, 74], [bx - 40, 86], [bx - 10, 128]], 4400, 420);
    k.text("break-even, year 3", bx - 100, 66, 4800, 18, "middle", 700);
    k.underline2(pts[4][0] - 24, pts[4][0] + 24, pts[4][1] - 4, 5200);
    return k;
  },
};

document.querySelectorAll(".sketch[data-viz]").forEach(fig => {
  const svg = fig.querySelector("svg");
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
