// Animated visuals for the three problem tabs. Each one plays when it scrolls into view
// (or when its tab opens) and shows its final state at once under reduced motion.
const NS = "http://www.w3.org/2000/svg";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent && parent.append(n); return n; };
const rand = (seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647)(7);
const ease = "cubic-bezier(.2,.7,.2,1)";

function waffle(box, n, cls) { for (let i = 0; i < n; i++) { const c = document.createElement("i"); if (cls) c.className = cls(i); box.append(c); } }
function playWaffle(box, step = 14) {
  [...box.children].forEach((c, i) => c.animate([{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "none" }], { duration: 260, delay: reduce ? 0 : i * step, fill: "backwards", easing: ease }));
}

const builders = {
  ai(fig) {
    const svg = fig.querySelector("svg"), drops = svg.querySelector(".ai-drops"), caught = svg.querySelector(".ai-caught"), count = svg.querySelector(".ai-count");
    const cols = 29, pts = [];
    for (let i = 0; i < 173; i++) {
      const tx = 22 + (i % cols) * 9.4, ty = 126 + Math.floor(i / cols) * 5.2;
      const d = el("circle", { r: 2.4, cx: tx, cy: ty, class: "ai-dot" }, caught);
      pts.push({ d, sx: 20 + rand() * 320, sy: 8 + rand() * 70 });
    }
    waffle(fig.querySelector(".w84"), 84); waffle(fig.querySelector(".w2"), 2);
    return () => {
      if (reduce) { count.textContent = "173"; return; }
      pts.forEach((p, i) => {
        const dx = p.sx - p.d.getAttribute("cx"), dy = p.sy - p.d.getAttribute("cy");
        p.d.animate([{ transform: `translate(${dx}px,${dy}px)`, fill: "var(--secondary)" }, { transform: "none", fill: "var(--outline)" }], { duration: 900, delay: i * 9, easing: ease, fill: "backwards" });
      });
      const t0 = performance.now(), dur = 173 * 9 + 900;
      const tick = t => { const k = Math.min(1, (t - t0) / dur); count.textContent = Math.round(173 * k); if (k < 1) requestAnimationFrame(tick); else svg.querySelector(".ai-gate").animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 500 }); };
      requestAnimationFrame(tick);
      playWaffle(fig.querySelector(".w84"), 12);
      setTimeout(() => playWaffle(fig.querySelector(".w2"), 120), reduce ? 0 : 1100);
    };
  },

  data(fig) {
    const svg = fig.querySelector("svg"), st = svg.querySelector(".d-stations"), links = svg.querySelector(".d-links"), ticks = svg.querySelector(".twin-ticks"), item = svg.querySelector(".d-item");
    const stations = [["Supply chain", 40], ["Warehouse", 133], ["Store", 226], ["Customer QR", 320]];
    const parts = stations.map(([name, x], i) => {
      const g = el("g", { class: "d-st" }, st);
      el("circle", { cx: x, cy: 170, r: 14, class: "d-ring" }, g);
      el("circle", { cx: x, cy: 170, r: 5, class: "d-core" }, g);
      const t = el("text", { x, y: 206, "text-anchor": i === 0 ? "start" : i === 3 ? "end" : "middle", class: "viz-k" }, g); t.textContent = name;
      if (i === 0) t.setAttribute("x", 14); if (i === 3) t.setAttribute("x", 346);
      const ln = el("line", { x1: x, x2: x, y1: 154, y2: 70, class: "d-link" }, links);
      const tk = el("circle", { cx: 250 + i * 22, cy: 39, r: 7, class: "d-tick" }, ticks);
      return { x, g, ln, tk };
    });
    waffle(fig.querySelector(".w100"), 100, i => (i < 70 ? "gone" : ""));
    let loop;
    return () => {
      if (reduce) { parts.forEach(p => { p.ln.style.opacity = 1; p.tk.style.opacity = 1; }); fig.querySelectorAll(".w100 .gone").forEach(c => (c.style.opacity = .18)); return; }
      const run = () => {
        const per = 1300;
        item.animate(parts.map((p, i) => ({ transform: `translateX(${p.x - 30}px)`, offset: i / (parts.length - 1) })), { duration: per * parts.length, easing: "linear", fill: "both" });
        parts.forEach((p, i) => {
          const delay = i * per * (parts.length / (parts.length - 1)) * .75 + 200;
          p.g.querySelector(".d-ring").animate([{ transform: "scale(.4)", opacity: 1 }, { transform: "scale(1.7)", opacity: 0 }], { duration: 900, delay, easing: "ease-out" });
          p.ln.animate([{ strokeDashoffset: 90, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }, { opacity: .25 }], { duration: 1400, delay, fill: "both" });
          p.tk.animate([{ opacity: .15, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1.2)" }, { opacity: 1, transform: "none" }], { duration: 600, delay: delay + 450, fill: "both", easing: ease });
        });
      };
      run(); clearInterval(loop); loop = setInterval(run, 7000);
      const gone = fig.querySelectorAll(".w100 i");
      playWaffle(fig.querySelector(".w100"), 8);
      setTimeout(() => fig.querySelectorAll(".w100 .gone").forEach((c, i) => c.animate([{ opacity: 1 }, { opacity: .18 }], { duration: 400, delay: i * 12, fill: "forwards" })), 1400);
    };
  },

  growth(fig) {
    const svg = fig.querySelector("svg"), g = svg.querySelector(".g-bars"), line = svg.querySelector(".g-line"), be = svg.querySelector(".g-be");
    const vals = [-500, -361, -147, 91, 312], labels = ["−500K", "−361K", "−147K", "+91K", "+312K"], k = 88 / 500, w = 44, gap = 22, x0 = 30;
    const pts = [];
    const bars = vals.map((v, i) => {
      const x = x0 + i * (w + gap), h = Math.abs(v) * k, y = v < 0 ? 120 : 120 - h;
      const r = el("rect", { x, y, width: w, height: h, rx: 6, class: v < 0 ? "g-neg" : "g-pos" }, g);
      r.style.transformOrigin = `${x + w / 2}px 120px`; r.style.transformBox = "view-box";
      const yr = el("text", { x: x + w / 2, y: v < 0 ? 112 : 136, "text-anchor": "middle", class: "viz-k" }, g); yr.textContent = "Year " + i;
      const lab = el("text", { x: x + w / 2, y: v < 0 ? y + h + 14 : y - 6, "text-anchor": "middle", class: "g-val" }, g); lab.textContent = labels[i];
      pts.push([x + w / 2, v < 0 ? y + h : y]);
      return { r, lab, i };
    });
    line.setAttribute("d", "M" + pts.map(p => p.join(" ")).join("L"));
    const bx = pts[2][0] + (pts[3][0] - pts[2][0]) * (147 / (147 + 91)); // where the cumulative line crosses zero
    be.setAttribute("transform", `translate(${bx} 0)`);
    return () => {
      if (reduce) return;
      bars.forEach(b => { b.r.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: 600, delay: b.i * 260, easing: ease, fill: "backwards" }); b.lab.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: b.i * 260 + 400, fill: "backwards" }); });
      const len = line.getTotalLength(); line.style.strokeDasharray = len;
      line.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 1400, delay: 200, easing: "ease-in-out", fill: "backwards" });
      be.animate([{ opacity: 0, transform: `translate(${bx}px,-14px)` }, { opacity: 1, transform: `translate(${bx}px,0)` }], { duration: 500, delay: 1000, easing: ease, fill: "backwards" });
    };
  },
};

document.querySelectorAll("[data-viz]").forEach(fig => {
  const play = builders[fig.dataset.viz](fig);
  let seen = false;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && !seen) { seen = true; play(); io.disconnect(); }
  }), { threshold: .35 });
  io.observe(fig);
  // A tab switch reveals a hidden panel: let the observer pick it up, and replay on each visit.
  const panel = fig.closest("[role=tabpanel]");
  if (panel) new MutationObserver(() => { if (!panel.hidden && seen) play(); }).observe(panel, { attributes: true, attributeFilter: ["hidden"] });
});
