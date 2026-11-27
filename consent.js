// Analytics with consent. Google Analytics 4 loads only after a visitor accepts.
// Consent Mode v2 defaults are set to denied before anything else runs.
// To switch analytics on, put the GA4 Measurement ID below (it starts with "G-").
const GA_ID = "G-7SEV6TDDB1";
const KEY = "analytics-consent";
const MAX_AGE = 1000 * 60 * 60 * 24 * 365; // ask again after a year

const root = new URL(".", import.meta.url).pathname; // site root, works from /notes/ too
const ready = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
});

function read() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && (v.choice === "granted" || v.choice === "denied") && Date.now() - v.at < MAX_AGE) return v.choice;
  } catch (e) {}
  return null;
}
function save(choice) {
  try { localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() })); } catch (e) {}
}

let loaded = false;
function load() {
  if (!ready || loaded) return;
  loaded = true;
  gtag("consent", "update", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", GA_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 60 * 60 * 24 * 390,
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
  document.head.append(s);
}
function removeCookies() {
  const host = location.hostname;
  const domains = ["", host, "." + host, "." + host.replace(/^www\./, "")];
  document.cookie.split(";").map((c) => c.trim().split("=")[0])
    .filter((n) => n === "_ga" || n.startsWith("_ga_"))
    .forEach((n) => domains.forEach((d) => {
      document.cookie = `${n}=; Max-Age=0; path=/${d ? "; domain=" + d : ""}`;
    }));
}

// Banner: a labelled region at the bottom of the screen that doesn't steal focus. Both choices carry the same weight.
const dlg = document.createElement("section");
dlg.className = "consent";
dlg.hidden = true;
dlg.show = () => { dlg.hidden = false; };
dlg.close = () => { dlg.hidden = true; };
dlg.setAttribute("aria-label", "Analytics consent");
dlg.innerHTML = `
  <p class="consent-text">With your consent, I use Google Analytics to count visits and see which pages people read. Advertising features stay off, and you can change your choice any time. <a href="${root}privacy.html">Privacy and cookies</a></p>
  <div class="consent-actions">
    <button type="button" class="btn primary" value="granted">Accept analytics</button>
    <button type="button" class="btn" value="denied">Decline</button>
  </div>`;
dlg.addEventListener("click", (e) => {
  const b = e.target.closest("button[value]");
  if (!b) return;
  const choice = b.value;
  save(choice);
  if (choice === "granted") load();
  else {
    gtag("consent", "update", { analytics_storage: "denied" });
    removeCookies();
    if (loaded) location.reload(); // stop a running tag
  }
  dlg.close();
});
document.body.append(dlg);

// Without a choice, the banner appears once per visit: moving to another page doesn't bring it back.
const SEEN = "analytics-consent-shown";
const choice = read();
if (choice === "granted") load();
else if (choice === null) {
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN) === "1"; sessionStorage.setItem(SEEN, "1"); } catch (e) {}
  if (!seen) dlg.show();
}

// Footer link "Cookie settings" reopens the banner.
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-cookie-settings]")) { e.preventDefault(); dlg.show(); dlg.querySelector("button").focus(); }
});
