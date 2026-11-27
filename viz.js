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
const hoverable = matchMedia("(hover: hover) and (pointer: fine)").matches;
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
    k.text("and synchronised with ERP financial records", 180, 116, 1250, 14, "middle");
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
    k.line(14, 392, 346, 392, 6500, 500, { stroke: SLATE, strokeWidth: 1 });
    k.text("$5M+ a year", 14, 418, 6900, 22, "start", 700, TEAL);
    k.text("planned savings across the business cases", 14, 440, 7050, 14, "start", 400, SLATE);
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

  cost(svg) {
    const k = new Sketch(svg, 51);
    k.text("Cost per usable result", 14, 28, 0, 22, "start", 700);
    k.underline2(14, 206, 36, 250);
    const x0 = 150, sc = 146 / .18;
    k.line(x0, 70, x0, 230, 400, 450, { stroke: SLATE });
    let t = 600;
    [["Provider A", 62, [["per image", .09, SLATE], ["per usable drawing", .12, BLUE]]],
     ["Provider B", 150, [["per image", .14, SLATE], ["per usable drawing", .18, CORAL]]]].forEach(([name, y, rows]) => {
      k.text(name, 14, y, t, 19, "start", 700);
      rows.forEach(([lab, val, c], i) => {
        const yy = y + 10 + i * 34, w = val * sc;
        k.text(lab, x0 - 8, yy + 16, t + 100, 19, "end", 400, SLATE);
        if (c !== SLATE) k.fill(x0, yy, w, 22, c, t + 500);
        k.box(x0, yy, w, 22, t + 200, 450, { stroke: c === SLATE ? SLATE : c });
        k.text("$" + val.toFixed(2), x0 + w + 6, yy + 17, t + 600, 20, "start", 700);
        t += 380;
      });
    });
    const ax = x0 + .12 * sc + 26;
    k.ellipse(ax, 117, 60, 28, t + 200, 380);
    k.text("A costs a third less", 14, 254, t + 500, 22, "start", 700, BLUE);
    k.text("per usable drawing (price ÷ pass rate)", 14, 278, t + 700, 18, "start", 400, SLATE);
    return k;
  },

  sales(svg) {
    const k = new Sketch(svg, 61);
    k.text("Online sales, year on year", 14, 28, 0, 22, "start", 700);
    k.underline2(14, 236, 36, 250);
    const base = 206;
    k.line(24, base, 336, base, 400, 500, { stroke: SLATE });
    k.box(60, base - 52, 64, 52, 800, 420, { stroke: SLATE });
    k.text("2021", 92, base + 22, 900, 16, "middle");
    k.fill(156, base - 130, 64, 130, TEAL, 1500); k.box(156, base - 130, 64, 130, 1200, 600, { stroke: TEAL });
    k.text("2022", 188, base + 22, 1300, 16, "middle");
    k.text("+150%", 188, base - 142, 1900, 22, "middle", 700, TEAL);
    k.ellipse(188, base - 149, 76, 32, 2100, 380, { stroke: TEAL });
    k.arrow([[280, base - 8], [284, base - 64], [300, base - 120]], 2500, 600, TEAL, 1.8);
    k.text("2023", 280, base + 22, 2500, 16, "middle");
    k.text("growth again", 300, base - 134, 3000, 16, "middle", 700);
    return k;
  },

  trust(svg) {
    const k = new Sketch(svg, 71);
    k.text("Trust", 14, 96, 0, 28, "start", 700);
    k.underline2(14, 78, 104, 300);
    k.text("=", 96, 96, 500, 28, "middle", 700, SLATE);
    k.text("Credibility", 212, 34, 800, 23, "middle", 700, BLUE);
    k.text("+ Reliability", 212, 60, 1100, 23, "middle", 700, TEAL);
    k.text("+ Intimacy", 212, 86, 1400, 23, "middle", 700, LAVENDER);
    k.line(118, 102, 306, 102, 1700, 600);
    k.text("Self-orientation", 212, 130, 2300, 23, "middle", 700, CORAL);
    k.text("the smaller, the more trust", 212, 158, 2700, 17, "middle", 400, SLATE);
    return k;
  },

  teams(svg) {
    const k = new Sketch(svg, 81, 1.3);
    k.box(24, 22, 56, 76, 0, 500, { stroke: SLATE });
    [40, 56, 72].forEach((y, i) => k.line(34, y, 70, y, 300 + i * 80, 200, { stroke: SLATE }));
    k.arrow([[88, 60], [104, 60], [120, 60]], 600, 300, SLATE, 1.4);
    let t = 850;
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      const x = 130 + c * 30, y = 30 + r * 34;
      k.fill(x, y, 22, 22, BLUE, t + 150, 300); k.box(x, y, 22, 22, t, 250, { stroke: BLUE }); t += 90;
    }
    [[244, 0], [272, 1], [300, 2]].forEach(([x, i]) => {
      k.shape(s => k.g.circle(x, 44, 14, k.ink(s)), 1500 + i * 150, 250);
      k.curve([[x - 11, 78], [x - 9, 58], [x + 9, 58], [x + 11, 78]], 1600 + i * 150, 300);
    });
    k.line(232, 92, 312, 92, 2100, 400, { stroke: TEAL });
    return k;
  },

  tradeoffs(svg) {
    const k = new Sketch(svg, 83, 1.3);
    k.poly([[160, 66], [146, 96], [174, 96]], 0, 400, { stroke: SLATE });
    k.line(130, 100, 190, 100, 200, 300, { stroke: SLATE });
    k.line(70, 54, 250, 78, 500, 500);
    k.shape(s => k.g.circle(160, 66, 8, k.ink({ ...s, stroke: TEAL })), 900, 200);
    k.line(70, 54, 70, 84, 1000, 200, { stroke: SLATE }); k.line(250, 78, 250, 108, 1000, 200, { stroke: SLATE });
    k.line(44, 84, 96, 84, 1150, 250); k.line(224, 108, 276, 108, 1150, 250);
    [[52, 14], [64, 22], [76, 10]].forEach(([x, h], i) => { k.fill(x, 82 - h, 8, h, CORAL, 1500 + i * 100, 250); k.box(x, 82 - h, 8, h, 1400 + i * 100, 200, { stroke: CORAL }); });
    [[232, 22], [244, 28], [256, 18]].forEach(([x, h], i) => { k.fill(x, 106 - h, 8, h, BLUE, 1850 + i * 100, 250); k.box(x, 106 - h, 8, h, 1750 + i * 100, 200, { stroke: BLUE }); });
    return k;
  },

  observe(svg) {
    const k = new Sketch(svg, 85, 1.3);
    k.curve([[20, 60], [50, 30], [90, 30], [120, 60]], 0, 450);
    k.curve([[20, 60], [50, 90], [90, 90], [120, 60]], 150, 450);
    k.fillCircle(70, 60, 30, BLUE, 600); k.shape(s => k.g.circle(70, 60, 30, k.ink({ ...s, stroke: BLUE })), 500, 300);
    k.shape(s => k.g.circle(70, 60, 8, k.ink({ ...s, stroke: BLUE })), 750, 150);
    [150, 210, 270].forEach((x, i) => k.box(x, 48, 30, 24, 1000 + i * 200, 250));
    k.line(180, 60, 210, 60, 1150, 150, { stroke: SLATE }); k.line(240, 60, 270, 60, 1350, 150, { stroke: SLATE });
    k.curve([[195, 60], [200, 98], [240, 104], [262, 74]], 1800, 600, { stroke: CORAL });
    k.shape(s => k.g.circle(222, 101, 8, k.ink({ ...s, stroke: CORAL })), 2350, 200);
    return k;
  },

  // How I work: business case first. Cumulative cash dips below zero, crosses at break-even, NPV marked.
  bizcase(svg) {
    const k = new Sketch(svg, 91, 1.3);
    k.line(24, 64, 300, 64, 0, 450, { stroke: SLATE });
    k.line(24, 16, 24, 108, 100, 350, { stroke: SLATE });
    [[44, 8], [76, 10], [108, 6]].forEach(([x, h], i) => { k.fill(x, 64, 18, 22 + h, CORAL, 650 + i * 120, 260); k.box(x, 64, 18, 22 + h, 550 + i * 120, 220, { stroke: CORAL }); });
    [[150, 14], [178, 24], [206, 34], [234, 42]].forEach(([x, h], i) => { k.fill(x, 64 - h, 18, h, TEAL, 1150 + i * 110, 260); k.box(x, 64 - h, 18, h, 1050 + i * 110, 220, { stroke: TEAL }); });
    k.curve([[34, 72], [70, 92], [112, 100], [146, 66], [190, 40], [244, 16]], 1700, 800, { stroke: BLUE, strokeWidth: 1.8 });
    k.shape(s => k.g.circle(142, 64, 12, k.ink({ ...s, stroke: BLUE })), 2350, 220);
    k.text("break-even", 152, 86, 2450, 15, "start", 400, BLUE);
    k.text("NPV +", 304, 28, 2600, 16, "end", 700, TEAL);
    return k;
  },

  // How I work: watch the real work. A planned path, a person stepping off it, and the data model gaining a field.
  watchwork(svg) {
    const k = new Sketch(svg, 93, 1.3);
    [26, 86, 146].forEach((x, i) => k.box(x, 26, 40, 26, i * 180, 260, { stroke: SLATE }));
    k.line(66, 39, 86, 39, 200, 150, { stroke: SLATE }); k.line(126, 39, 146, 39, 380, 150, { stroke: SLATE });
    k.curve([[106, 52], [102, 82], [134, 98], [166, 52]], 800, 600, { stroke: CORAL });
    k.shape(s => k.g.circle(120, 92, 10, k.ink({ ...s, stroke: CORAL })), 1350, 200);
    k.ellipse(58, 92, 46, 22, 1500, 380, { stroke: BLUE });
    k.fillCircle(58, 92, 12, BLUE, 1800); k.shape(s => k.g.circle(58, 92, 12, k.ink({ ...s, stroke: BLUE })), 1750, 200);
    k.arrow([[192, 66], [212, 66], [228, 66]], 2000, 300, SLATE, 1.4);
    k.box(236, 22, 64, 80, 2250, 380);
    [40, 56, 72].forEach((y, i) => k.line(246, y, 290, y, 2500 + i * 90, 200, { stroke: SLATE }));
    k.fill(244, 82, 48, 12, TEAL, 2900, 300); k.line(246, 88, 290, 88, 2850, 260, { stroke: TEAL, strokeWidth: 1.8 });
    return k;
  },

  // How I work: guardrails in code. The model suggests; rules check; a person approves at one gate.
  guardrails(svg) {
    const k = new Sketch(svg, 95, 1.3);
    k.curve([[30, 70], [24, 50], [44, 38], [58, 44], [70, 30], [94, 36], [100, 52], [114, 58], [108, 76], [30, 76], [30, 70]], 0, 700, { stroke: LAVENDER });
    k.text("AI", 68, 64, 500, 18, "middle", 700, LAVENDER);
    k.arrow([[120, 60], [134, 60], [148, 60]], 750, 300, SLATE, 1.4);
    k.box(154, 34, 52, 52, 1050, 380, { stroke: BLUE });
    k.fill(154, 34, 52, 52, BLUE, 1300, 300);
    k.box(170, 58, 20, 16, 1450, 220, { stroke: BLUE });
    k.curve([[173, 58], [173, 48], [187, 48], [187, 58]], 1600, 220, { stroke: BLUE });
    k.arrow([[212, 60], [226, 60], [240, 60]], 1850, 300, SLATE, 1.4);
    k.shape(s => k.g.circle(266, 42, 14, k.ink(s)), 2150, 250);
    k.curve([[255, 78], [257, 60], [275, 60], [277, 78]], 2300, 300);
    k.path([[290, 46], [296, 52], [306, 38]], 2650, 260, { stroke: TEAL, strokeWidth: 2 });
    return k;
  },

  docs(svg) {
    const k = new Sketch(svg, 87, 1.3);
    k.box(30, 18, 50, 66, 0, 350, { stroke: SLATE }); k.box(22, 26, 50, 66, 150, 350, { stroke: SLATE });
    k.box(14, 34, 50, 66, 300, 400);
    [50, 62, 74, 86].forEach((y, i) => k.line(22, y, 56 - (i % 2) * 10, y, 600 + i * 70, 150, { stroke: SLATE }));
    let t = 900;
    [0, 1, 2].forEach(c => [0, 1, 2].slice(0, 3 - (c === 1 ? 1 : 0)).forEach(r => {
      k.box(100 + c * 30, 22 + r * 26, 22, 18, t, 180, { stroke: r === 0 ? TEAL : INK }); t += 60;
    }));
    const N = [[226, 34], [266, 22], [300, 52], [250, 92], [292, 98]];
    [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4]].forEach(([a, b], i) => k.line(N[a][0], N[a][1], N[b][0], N[b][1], 1500 + i * 120, 250, { stroke: SLATE }));
    N.forEach(([x, y], i) => {
      if (i === 2) k.fillCircle(x, y, 16, BLUE, 2200);
      k.shape(s => k.g.circle(x, y, 16, k.ink({ ...s, stroke: i === 2 ? BLUE : INK })), 2000 + i * 60, 200);
    });
    return k;
  },

  grow(svg) {
    const k = new Sketch(svg, 89, 1.3);
    k.line(20, 104, 300, 104, 0, 500, { stroke: SLATE });
    const steps = [[40, 90], [110, 76], [180, 62], [250, 48]];
    steps.forEach(([x, y], i) => {
      k.fill(x, y, 50, 104 - y, i === 3 ? BLUE : TEAL, 500 + i * 250, 300);
      k.box(x, y, 50, 104 - y, 400 + i * 250, 300, { stroke: i === 3 ? BLUE : TEAL });
    });
    [[65, 0], [135, 1], [205, 2], [275, 3]].forEach(([x, i]) => {
      const y = steps[i][1];
      k.shape(s => k.g.circle(x, y - 22, 10, k.ink(s)), 1600 + i * 120, 200);
      k.curve([[x - 8, y - 2], [x - 6, y - 14], [x + 6, y - 14], [x + 8, y - 2]], 1700 + i * 120, 200);
    });
    k.arrow([[30, 46], [70, 26], [140, 16]], 2300, 500, SLATE, 1.2);
    return k;
  },

  "l-check"(svg) {
    const k = new Sketch(svg, 91);
    k.shape(s => k.g.circle(28, 28, 32, k.ink({ ...s, stroke: SLATE })), 0, 400);
    k.line(40, 40, 54, 54, 300, 250, { stroke: SLATE, strokeWidth: 2.4 });
    k.path([[20, 28], [26, 34], [37, 21]], 500, 300, { stroke: TEAL, strokeWidth: 2 });
    return k;
  },
  "l-gate"(svg) {
    const k = new Sketch(svg, 93);
    k.line(18, 14, 18, 54, 0, 300); k.line(46, 14, 46, 54, 100, 300);
    k.line(12, 26, 52, 26, 400, 300, { stroke: BLUE, strokeWidth: 2.2 });
    k.arrow([[6, 44], [32, 42], [58, 44]], 700, 400, TEAL, 1.6);
    return k;
  },
  "l-cost"(svg) {
    const k = new Sketch(svg, 95);
    k.fillCircle(32, 32, 44, BLUE, 400); k.shape(s => k.g.circle(32, 32, 44, k.ink({ ...s, stroke: BLUE })), 0, 450);
    k.line(20, 32, 44, 32, 500, 250);
    k.fillCircle(32, 23, 5, INK, 750); k.fillCircle(32, 41, 5, INK, 800);
    return k;
  },
  "l-data"(svg) {
    const k = new Sketch(svg, 97);
    k.fillPoly([[14, 18], [50, 18], [50, 48], [14, 48]], BLUE, 600);
    k.ellipse(32, 18, 36, 12, 0, 350);
    k.line(14, 18, 14, 48, 200, 250, { stroke: BLUE }); k.line(50, 18, 50, 48, 200, 250, { stroke: BLUE });
    k.curve([[14, 48], [22, 54], [42, 54], [50, 48]], 400, 250, { stroke: BLUE });
    k.curve([[14, 33], [22, 39], [42, 39], [50, 33]], 550, 250, { stroke: BLUE, strokeWidth: 1.1 });
    return k;
  },
  "l-chain"(svg) {
    const k = new Sketch(svg, 99);
    k.shape(s => k.g.ellipse(16, 32, 24, 14, k.ink(s)), 0, 300);
    k.shape(s => k.g.ellipse(32, 32, 22, 12, k.ink({ ...s, stroke: CORAL, strokeWidth: 1 })), 250, 300);
    k.shape(s => k.g.ellipse(48, 32, 24, 14, k.ink(s)), 500, 300);
    return k;
  },

  "b-studio"(svg) {
    const k = new Sketch(svg, 101, 1.3);
    k.fill(24, 40, 150, 84, BLUE, 600); k.box(24, 40, 150, 84, 0, 500, { stroke: BLUE });
    k.poly([[24, 40], [174, 40], [168, 20], [30, 20]], 300, 400);
    [44, 74, 104, 134].forEach((x, i) => k.line(x, 20, x + 12, 40, 500 + i * 80, 150));
    k.poly([[86, 64], [86, 102], [118, 83]], 900, 400, { stroke: INK });
    [[214, 34, "EN"], [262, 60, "IT"], [214, 92, "DE"]].forEach(([x, y], i) => {
      k.poly([[x, y], [x + 48, y], [x + 48, y + 26], [x + 14, y + 26], [x + 6, y + 36], [x + 8, y + 26], [x, y + 26]], 1300 + i * 220, 350, { stroke: i === 1 ? TEAL : SLATE });
      k.line(x + 10, y + 13, x + 38, y + 13, 1500 + i * 220, 200, { stroke: SLATE });
    });
    return k;
  },
  "b-market"(svg) {
    const k = new Sketch(svg, 103, 1.3);
    k.line(24, 120, 296, 120, 0, 450, { stroke: SLATE }); k.line(24, 120, 24, 16, 100, 400, { stroke: SLATE });
    const c = [[50, 100, 82, 74, 108], [80, 86, 70, 60, 94], [110, 72, 88, 64, 96], [140, 84, 62, 54, 90], [170, 66, 48, 40, 74]];
    c.forEach(([x, o, cl, hi, lo], i) => {
      const up = cl < o, col = up ? TEAL : CORAL;
      k.line(x, hi, x, lo, 500 + i * 150, 200, { stroke: col });
      k.fill(x - 7, Math.min(o, cl), 14, Math.abs(o - cl), col, 650 + i * 150, 200);
      k.box(x - 7, Math.min(o, cl), 14, Math.abs(o - cl), 550 + i * 150, 200, { stroke: col });
    });
    k.curve([[190, 50], [210, 40], [228, 36]], 1400, 300, { stroke: SLATE });
    // shield: code holds the gate
    const S = [[252, 26], [284, 36], [282, 72], [252, 96], [222, 72], [220, 36]];
    k.fillPoly(S, BLUE, 1900); k.poly(S, 1600, 500, { stroke: BLUE });
    k.path([[238, 60], [249, 71], [268, 48]], 2200, 300, { stroke: INK });
    return k;
  },
  "b-games"(svg) {
    const k = new Sketch(svg, 105, 1.3);
    k.box(40, 14, 70, 116, 0, 500);
    k.line(66, 22, 84, 22, 300, 150, { stroke: SLATE });
    k.fillCircle(75, 66, 22, BLUE, 700); k.shape(s => k.g.circle(75, 66, 22, k.ink({ ...s, stroke: BLUE })), 500, 300);
    k.arrow([[120, 96], [170, 70], [222, 52]], 900, 500, TEAL, 1.8);
    k.shape(s => k.g.circle(240, 46, 26, k.ink({ ...s, stroke: SLATE })), 1300, 300);
    k.shape(s => k.g.circle(270, 96, 18, k.ink({ ...s, stroke: CORAL })), 1500, 250);
    k.line(254, 116, 292, 116, 1700, 250, { stroke: SLATE }); k.line(262, 124, 284, 124, 1800, 200, { stroke: SLATE });
    return k;
  },

  halo(svg) {
    const k = new Sketch(svg, 111, 1.4);
    k.fillCircle(200, 160, 300, BLUE, 0, 900);
    return k;
  },

  path(svg) {
    const k = new Sketch(svg, 121);
    const rows = [["2004", "Front-end developer", "eBay.it and mobile.de, Milan and Berlin", "2 marketplaces, global exchange programme"], ["2007", "Product manager", "eBay.it, Milan", "+1.5% revenue in peak sales periods"], ["2009", "Web development manager", "eBay, team of 4", "300+ campaigns a year, 99.4% quality"], ["2014", "Product manager", "eBay, content management and tools", "+10% organic search traffic, 5 markets"], ["2017", "Global web development lead", "eBay, landing-page automation", "70% faster to market, +15% conversion"], ["2019", "Senior technical product manager", "dacadoo, digital health SaaS", "+25% user satisfaction"], ["2020", "Product manager", "RaiseNow, fundraising-automation fintech", "+30% fundraising revenue in 6 months"], ["2021", "Product owner", "Sunrise, Swiss telecom operator", "~20 engineers, +150% online sales"], ["2024", "Senior product manager, technology", "On, global sportswear brand", "100+ stores, 40M+ items a year"], ["2026", "Independent AI products", "studio, decision support, games", "6 languages, 3 livestreams a day"]].reverse();
    const top = 26, step = 66, lx = 70;
    k.line(lx, top - 6, lx, top + step * (rows.length - 1) + 6, 0, 1400, { stroke: SLATE });
    rows.forEach(([y, role, ctx, scope], i) => {
      const cy = top + i * step, t = 300 + i * 160, last = i === 0; // latest first
      if (last) k.fillCircle(lx, cy, 14, BLUE, t + 150);
      k.shape(s => k.g.circle(lx, cy, 14, k.ink({ ...s, stroke: last ? BLUE : INK })), t, 220);
      k.text(y, 14, cy + 6, t, 18, "start", 700, BLUE);
      k.text(role, 88, cy + 4, t + 80, 18, "start", 700);
      k.text(ctx, 88, cy + 22, t + 140, 17, "start", 400, SLATE);
      k.text(scope, 88, cy + 41, t + 200, 17, "start", 700, BLUE);
    });
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

// Drawings play one after another: when several come into view together, each
// starts just before the one before it finishes, so only one thing moves at a time.
let chain = Promise.resolve();
const lengthOf = sk => Math.max(0, ...sk.queue.map(q => q.at + q.dur));
document.querySelectorAll(".sketch[data-viz]").forEach(fig => {
  const svg = fig.matches("svg") ? fig : fig.querySelector("svg");
  let sketch = null, queued = false, played = false, busyUntil = 0;
  const build = () => { svg.replaceChildren(); sketch = charts[fig.dataset.viz](svg); };
  const play = () => { build(); sketch.play(); busyUntil = performance.now() + lengthOf(sketch); };
  build(); // the finished drawing stays visible until its animation's turn
  if (reduce) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    fig.classList.toggle("in-view", e.isIntersecting);
    if (!e.isIntersecting || queued) return;
    queued = true; io.disconnect();
    chain = chain.then(() => {
      play(); played = true;
      // the next drawing starts just before this one finishes
      return new Promise(r => setTimeout(r, Math.max(0, lengthOf(sketch) - 350)));
    });
  }), { threshold: .3 });
  io.observe(fig);
  // after the first play, hovering the drawing (or its card) draws it again
  if (!hoverable) return;
  (fig.closest(".card") || fig).addEventListener("pointerenter", e => {
    if (e.pointerType !== "mouse" || !played || performance.now() < busyUntil) return;
    play();
  });
});
