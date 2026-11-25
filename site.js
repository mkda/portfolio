// Progressive enhancement: the page is complete without this file.
import { animate as draw, svg, stagger } from "./vendor/anime-4.5.0.esm.min.js";

const M = window.Motion;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (M && !calm) {
  const ease = [0.2, 0, 0, 1];

  // Sections settle in once, a few pixels, as they enter the viewport.
  const reveal = ".theme-block, .grid .card, .note-link, .table-wrap";
  document.querySelectorAll(reveal).forEach((el) => {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
    }
  });
  M.inView(reveal, (el) => {
    M.animate(el, { opacity: 1, transform: "translateY(0px)" }, { duration: 0.45, ease });
  }, { amount: 0.15 });

  // Headline numbers count up once.
  document.querySelectorAll(".stats dt").forEach((dt) => {
    const m = dt.textContent.trim().match(/^(\D*)([\d.]+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m;
    const places = (num.split(".")[1] || "").length;
    M.animate(0, parseFloat(num), {
      duration: 1.1,
      ease,
      onUpdate: (v) => { dt.textContent = pre + v.toFixed(places) + post; },
    });
  });

  // Diagram connectors draw in the direction the data flows.
  M.inView(".diagram", (fig) => {
    const lines = svg.createDrawable(fig.querySelectorAll(".d-line path, .d-drop path"));
    draw(lines, { draw: ["0 0", "0 1"], duration: 900, delay: stagger(120), ease: "inOut(2)" });
  }, { amount: 0.4 });

  // Chart bars grow from zero.
  M.inView(".chart", (fig) => {
    draw(fig.querySelectorAll(".bar"), { scaleX: [0, 1], duration: 700, delay: stagger(90), ease: "out(3)" });
  }, { amount: 0.4 });
}
