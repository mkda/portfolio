// Shared page shell: theme toggle, mobile menu and accordions. Loaded on every page.
const meta = document.querySelector('meta[name="color-scheme"]');
const sysDark = () => matchMedia("(prefers-color-scheme: dark)").matches;
const rendered = () => meta.content === "light dark" ? (sysDark() ? "dark" : "light") : meta.content;
const theme = document.getElementById("theme");
if (theme) theme.addEventListener("click", () => {
  const target = rendered() === "dark" ? "light" : "dark";
  const system = sysDark() ? "dark" : "light";
  try { if (target === system) localStorage.removeItem("color-scheme"); else localStorage.setItem("color-scheme", target); } catch (e) {}
  meta.content = target === system ? "light dark" : target;
});
addEventListener("storage", e => { if (e.key === "color-scheme") meta.content = e.newValue ?? "light dark"; });

// Mobile menu: the button opens the page list; a link, Escape or a tap outside closes it.
const menu = document.getElementById("menu"), bar = document.querySelector(".topbar");
if (menu && bar) {
  const setMenu = open => { menu.setAttribute("aria-expanded", String(open)); bar.classList.toggle("menu-open", open); };
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  bar.querySelectorAll(".tabs a").forEach(l => l.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape" && bar.classList.contains("menu-open")) { setMenu(false); menu.focus(); } });
  document.addEventListener("click", e => { if (!bar.contains(e.target)) setMenu(false); });
  matchMedia("(min-width:52.5em)").addEventListener("change", e => { if (e.matches) setMenu(false); });
}

// Accordions start closed on compact and medium windows.
if (matchMedia("(max-width:52.49em)").matches) document.querySelectorAll("details.fold").forEach(d => d.open = false);
