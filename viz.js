// Animated technical diagrams for the three problem tabs.
// Monoline pen strokes from Rough.js with a very low roughness: clean geometry with
// a slight human wobble. On play, each stroke traces itself once with an ease-in-out,
// fills fade in, and annotations appear in sequence. Once drawn, everything stays
// still. Reduced motion shows the finished diagram.
import rough from "./vendor/rough-4.6.6.esm.js";

const NS = "http://www.w3.org/2000/svg";
const INK = "#F1F5F9", SLATE = "#8E9BAE", BLUE = "#8AB4F8", CORAL = "#F2A68D", TEAL = "#6EE7B7", LAVENDER = "#C4B5FD";
const MUSTARD = LAVENDER; // secondary series
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.65,0,.35,1)";

class Sketch {
  constructor(svg, seed) {
    this.svg = svg; this.rc = rough.svg(svg); this.g = this.rc.generator; this.seed = seed;
    this.queue = []; // {node, at, dur, kind}
  }
  shape(make, at, dur = 500, cls = "", kind = "draw") {
    const node = this.rc.draw(make({ seed: this.seed++ }));
    node.setAttribute("class", "pen " + cls);
    if (kind === "draw") node.querySelectorAll("path").forEach(p => p.setAttribute("pathLength", "1"));
    this.svg.append(node);
    this.queue.push({ node, at, dur, kind });
    return node;
  }
  ink(o = {}) { return { stroke: INK, strokeWidth: 1.6, roughness: .45, bowing: .6, disableMultiStroke: true, ...o }; }
  line(x1, y1, x2, y2, at, dur, o) { return this.shape(s => this.g.line(x1, y1, x2, y2, this.ink({ ...s, ...o })), at, dur); }
  box(x, y, w, h, at, dur, o) { return this.shape(s => this.g.rectangle(x, y, w, h, this.ink({ ...s, ...o })), at, dur); }
  // Soft translucent fill that fades in inside its outline.
  fill(x, y, w, h, color, at, dur) {
    return this.shape(s => this.g.rectangle(x, y, w, h, { ...s, stroke: "none", fill: color, fillStyle: "solid", roughness: .3 }), at, Math.max(dur, 420), "soft", "fade");
  }
  ellipse(cx, cy, w, h, at, dur, o) { return this.shape(s => this.g.ellipse(cx, cy, w, h, this.ink({ roughness: .6, stroke: BLUE, ...s, ...o })), at, dur); }
  curve(pts, at, dur, o) { return this.shape(s => this.g.curve(pts, this.ink({ ...s, ...o })), at, dur); }
  arrow(pts, at, dur = 450, color = SLATE) {
    this.curve(pts, at, dur, { stroke: color, strokeWidth: 1.4 });
    const [x2, y2] = pts[pts.length - 1], [x1, y1] = pts[pts.length - 2];
    const a = Math.atan2(y2 - y1, x2 - x1), L = 8;
    const p = s => [x2 - L * Math.cos(a - s), y2 - L * Math.sin(a - s)];
    const [ax, ay] = p(.45), [bx, by] = p(-.45);
    this.shape(s => this.g.linearPath([[ax, ay], [x2, y2], [bx, by]], this.ink({ ...s, stroke: color, strokeWidth: 1.4 })), at + dur * .85, 200);
  }
  underline2(x1, x2, y, at) { this.line(x1, y, x2, y, at, 380, { stroke: BLUE, strokeWidth: 1.4 }); }
  text(str, x, y, at, size = 16, anchor = "start", weight = 400, color = INK) {
    const t = document.createElementNS(NS, "text");
    Object.entries({ x, y, "text-anchor": anchor, class: "hand" + (weight >= 700 ? " strong" : ""), "font-size": size * (weight >= 700 ? .78 : .7), fill: color }).forEach(([k, v]) => t.setAttribute(k, v));
    t.textContent = str; this.svg.append(t);
    this.queue.push({ node: t, at, dur: 360, kind: "fade" });
    return t;
  }
  play() {
    for (const { node, at, dur, kind } of this.queue) {
      if (kind === "fade") {
        node.animate([{ opacity: 0, transform: "translateY(2px)" }, { opacity: 1, transform: "none" }], { duration: dur, delay: at, easing: "ease-out", fill: "backwards" });
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
    k.fill(28, 52, 304, 62, BLUE, 600, 700); k.box(28, 52, 304, 62, 450, 500);
    k.text("Digital Twin", 180, 82, 1000, 22, "middle", 700);
    k.text("one record per item · the ERP reads it", 180, 104, 1150, 14, "middle");
    k.line(20, 214, 340, 214, 1200, 600, { stroke: SLATE });
    const st = [["supply chain", 45], ["warehouse", 135], ["store", 225], ["customer QR", 315]];
    st.forEach(([name, x], i) => {
      const t = 1500 + i * 650;
      k.ellipse(x, 214, 30, 30, t, 300);
      k.fill(x - 9, 205, 18, 18, BLUE, t + 150, 200);
      k.text(name, x, 244, t + 200, 15, "middle");
      k.arrow([[x, 196], [x + (180 - x) * .15, 160], [x + (180 - x) * .55, 120]], t + 300, 330, BLUE);
    });
    k.text("> 99.9% of items traceable", 180, 274, 4300, 18, "middle", 700, BLUE);
    k.text("manual work, before and after", 14, 302, 4600, 16);
    k.fill(70, 312, 200, 16, CORAL, 4800, 500); k.box(70, 312, 200, 16, 4700, 400);
    k.text("before", 64, 325, 4700, 14, "end");
    k.fill(70, 336, 60, 16, TEAL, 5300, 300); k.box(70, 336, 60, 16, 5200, 250);
    k.text("after", 64, 349, 5200, 14, "end");
    k.arrow([[262, 334], [220, 352], [140, 346]], 5600, 420);
    k.text("−70%", 306, 349, 6050, 24, "middle", 700, CORAL);
    k.ellipse(306, 342, 64, 34, 6200, 360, { stroke: CORAL });
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
