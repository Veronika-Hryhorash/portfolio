{
/* ---------- helpers ---------- */
const I = window.I18N;
const LANGS = ["en", "es", "uk"];
const store = {
  get(k, d) { try { const v = localStorage.getItem("vh:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { v == null ? localStorage.removeItem("vh:" + k) : localStorage.setItem("vh:" + k, JSON.stringify(v)); } catch (e) {} }
};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ICONS = {
  youtube: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>`,
  instagram: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>`,
  linkedin: `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zm1.8 13.1H3.6V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>`
};
let lang = store.get("lang", "en");
if (!LANGS.includes(lang)) lang = "en";
const t = (k, ...a) => { const v = (I[lang] && I[lang][k]) ?? I.en[k]; return typeof v === "function" ? v(...a) : (v ?? k); };
const L = v => v == null ? "" : typeof v === "string" ? v : (v[lang] || v.en || Object.values(v)[0] || "");
const label = (prefix, v) => { const k = prefix + v, r = t(k); return r === k ? v : r; };
const fmtDur = m => { m = Math.round(+m || 0); const h = Math.floor(m / 60), r = m % 60, H = lang === "uk" ? "год" : "h", M = t("min"); return h ? `${h} ${H}${r ? ` ${r} ${M}` : ""}` : `${m} ${M}`; };
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'`]/g, "");
const allText = v => v == null ? "" : typeof v === "string" ? v : Object.values(v).join(" ");
const surname = w => { if (w.sort) return w.sort; const p = allText(w.composer && (w.composer.en || w.composer)).trim().split(/\s+/); return p[p.length - 1] || ""; };
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let toastTimer;
function toast(msg) { const el = $("[data-toast]"); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => el.hidden = true, 1800); }
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); return true; }
  catch (e) {
    const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.append(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); return ok;
  }
}
function download(name, txt, mime = "application/json") {
  try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: mime })); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); } catch (e) {}
}

/* ---------- state ---------- */
const S = { profile: null, cv: null, pubRep: [], pubMedia: [], rep: [], media: [] };
const CAT_ORDER = ["baroque", "classical", "romantic", "modern", "opera", "neoclassical", "film", "musical", "jazz", "latin", "pop", "rock", "soul", "folk"];
/* hidden export-only grouping; a work can override it with its own "exportGenre" */
const EXPORT_ORDER = ["CLASSICAL MUSIC", "JAZZ & SWING", "POP & CONTEMPORARY HITS", "POP CLASSICS & OLDIES", "SOUL, MOTOWN & R&B", "LATIN & CARIBBEAN MUSIC", "FILM & MUSICAL SOUNDTRACKS", "DISNEY & ANIMATED CLASSICS", "INTERNATIONAL & WORLD MUSIC", "CHRISTMAS & SEASONAL MUSIC"];
const exportGenre = w => {
  if (w.exportGenre) return w.exportGenre;
  const t = w.tags || [], c = w.category, has = x => t.includes(x), G = EXPORT_ORDER;
  if (has("christmas")) return G[9];
  if (has("animation")) return G[7];
  if (["baroque", "classical", "romantic", "modern", "opera"].includes(c)) return G[0];
  if (["french", "ukrainian", "asian", "middle-east", "children"].some(has)) return G[8];
  if (c === "jazz") return G[1];
  if (c === "pop" || c === "rock") return (w.year || 9999) < 2000 ? G[3] : G[2];
  if (c === "soul") return G[4];
  if (c === "latin") return G[5];
  if (c === "film" || c === "musical") return G[6];
  if (c === "folk") return G[8];
  return G[0];
};
const exportOn = () => /[?&]export=true(?:&|#|$)/.test(location.search + location.hash);
const GROUPS = [["category", "f_category", "cat_"], ["format", "f_format", "fmt_"], ["status", "f_status", "st_"], ["tags", "f_tags", "tag_"]];
const F = Object.assign({ q: "", category: [], format: [], status: [], tags: [], sort: "composer" }, store.get("filters", {}));
F.q = "";
const prog = new Set(store.get("prog", []));
let mtab = "all";
let photos = [];

/* ---------- static text ---------- */
function renderStatic() {
  document.documentElement.lang = lang;
  $$("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
  $("#q").placeholder = t("search");
  $(".skip").textContent = t("skip");
  $("[data-lb-close]").setAttribute("aria-label", t("close"));
  $("[data-lb-prev]").setAttribute("aria-label", t("prev"));
  $("[data-lb-next]").setAttribute("aria-label", t("next"));
  $$("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  $("#sort").value = F.sort;
}

/* ---------- profile, home ---------- */
function renderProfile() {
  const p = S.profile, name = L(p.name);
  $$("[data-name]").forEach(e => e.textContent = name);
  const parts = name.split(" ");
  $("[data-name-lines]").innerHTML = `<span>${esc(parts[0])}</span><span>${esc(parts.slice(1).join(" "))}</span>`;
  $("[data-role]").textContent = L(p.role);
  $("[data-tagline]").textContent = L(p.tagline);
  const bio = p.bio ? (p.bio[lang] || p.bio.en) : [];
  $("[data-bio]").innerHTML = (Array.isArray(bio) ? bio : [bio]).map(x => `<p>${esc(x)}</p>`).join("");
  const fig = $("[data-portrait]");
  fig.hidden = !p.portrait;
  if (p.portrait) fig.innerHTML = `<img src="${esc(p.portrait)}" alt="${esc(name)}">`;
  const em = $("[data-email]"); em.textContent = p.email || ""; em.href = p.email ? "mailto:" + p.email : "#";
  $("[data-location]").textContent = L(p.location);
  $("[data-links]").innerHTML = (p.links || []).map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${ICONS[l.label.toLowerCase()] || ""}${esc(l.label)}</a></li>`).join("");
  $("[data-profile-sample]").hidden = !p.sample;
  $("[data-year]").textContent = new Date().getFullYear();
  document.title = `${name}, ${L(p.role).toLocaleLowerCase(lang)}`;
}

function workRow(w, { composer = false, add = false } = {}) {
  const sub = [composer ? L(w.composer) : "", w.catalogue, w.year].filter(Boolean).join(", ");
  const on = prog.has(w.id), title = L(w.title);
  return `<li class="work">
    <div><div class="t">${esc(title)}</div><div class="sub">${esc(sub)}${w.status === "preparing" ? ` <span class="flag">${esc(t("st_preparing"))}</span>` : ""}</div></div>
    <span class="cat">${esc(label("cat_", w.category))}</span>
    <span class="dur">${w.duration ? esc(fmtDur(w.duration)) : ""}</span>
    ${add ? `<button type="button" class="add" data-add="${esc(w.id)}" aria-pressed="${on}" aria-label="${esc((on ? t("in_prog") : t("add_prog")) + ": " + title)}" title="${esc(on ? t("in_prog") : t("add_prog"))}">${on ? "✓" : "+"}</button>` : ""}
  </li>`;
}
function renderFeatured() {
  let list = S.rep.filter(w => w.featured);
  if (!list.length) list = S.rep.slice(0, 5);
  $("[data-featured]").innerHTML = list.map(w => workRow(w, { composer: true })).join("");
}

/* ---------- repertoire ---------- */
function values(key) {
  const seen = new Set();
  S.rep.forEach(w => (key === "tags" ? (w.tags || []) : [w[key]]).forEach(v => v && seen.add(v)));
  const arr = [...seen];
  if (key === "category") arr.sort((a, b) => (CAT_ORDER.indexOf(a) + 1 || 99) - (CAT_ORDER.indexOf(b) + 1 || 99));
  return arr;
}
function count(key, v) { return S.rep.filter(w => key === "tags" ? (w.tags || []).includes(v) : w[key] === v).length; }
function renderFilters() {
  $("[data-filter-groups]").innerHTML = GROUPS.map(([key, title, prefix]) => {
    const vals = values(key); if (vals.length < 2) return "";
    return `<div class="fgroup"><h3>${esc(t(title))}</h3><div class="chips">${vals.map(v =>
      `<button type="button" class="chip" data-f="${key}" data-v="${esc(v)}" aria-pressed="${F[key].includes(v)}">${esc(label(prefix, v))}<small>${count(key, v)}</small></button>`).join("")}</div></div>`;
  }).join("");
  $("#q").value = F.q;
}
function match(w) {
  if (F.q) {
    const hay = norm([allText(w.composer), allText(w.title), w.catalogue, w.year].join(" "));
    if (!norm(F.q).split(/\s+/).every(part => hay.includes(part))) return false;
  }
  for (const [key] of GROUPS) {
    const sel = F[key]; if (!sel.length) continue;
    if (key === "tags" ? !(w.tags || []).some(x => sel.includes(x)) : !sel.includes(w[key])) return false;
  }
  return true;
}
function renderRep() {
  const list = S.rep.filter(match);
  const coll = new Intl.Collator(lang);
  if (F.sort === "composer") list.sort((a, b) => coll.compare(surname(a), surname(b)) || (a.year || 0) - (b.year || 0));
  if (F.sort === "year") list.sort((a, b) => (a.year || 0) - (b.year || 0));
  if (F.sort === "duration") list.sort((a, b) => (b.duration || 0) - (a.duration || 0));
  const total = list.reduce((s, w) => s + (+w.duration || 0), 0);
  $("[data-stats]").textContent = `${t("works", list.length)}, ${t("total", fmtDur(total))}`;
  const box = $("[data-rep-list]");
  if (!list.length) { box.innerHTML = `<div class="empty"><p>${esc(t("empty"))}</p><button type="button" class="ghost" data-reset>${esc(t("reset"))}</button></div>`; return; }
  if (F.sort === "composer") {
    const groups = new Map();
    list.forEach(w => { const k = L(w.composer); groups.has(k) || groups.set(k, []); groups.get(k).push(w); });
    box.innerHTML = [...groups].map(([c, ws]) => `<section class="group"><h2>${esc(c)}</h2><ul class="works">${ws.map(w => workRow(w, { add: true })).join("")}</ul></section>`).join("");
  } else {
    box.innerHTML = `<ul class="works">${list.map(w => workRow(w, { composer: true, add: true })).join("")}</ul>`;
  }
}
function saveFilters() { store.set("filters", { ...F, q: "" }); }
function renderProg() {
  const items = S.rep.filter(w => prog.has(w.id));
  $("[data-prog]").hidden = !items.length;
  $("[data-prog-count]").textContent = t("prog", items.length);
  $("[data-prog-time]").textContent = fmtDur(items.reduce((s, w) => s + (+w.duration || 0), 0));
}
function progText() {
  const items = S.rep.filter(w => prog.has(w.id));
  const lines = items.map(w => `${L(w.composer)}: ${L(w.title)}${w.catalogue ? ", " + w.catalogue : ""} (${fmtDur(w.duration)})`);
  return `${L(S.profile.name)}\n\n${lines.join("\n")}\n\n${fmtDur(items.reduce((s, w) => s + (+w.duration || 0), 0))}`;
}

function exportMd() {
  const coll = new Intl.Collator("en"), by = new Map();
  S.rep.forEach(w => { const g = exportGenre(w); by.has(g) || by.set(g, []); by.get(g).push(w); });
  const genres = [...by.keys()].sort((a, b) => ((EXPORT_ORDER.indexOf(a) + 1) || 99) - ((EXPORT_ORDER.indexOf(b) + 1) || 99));
  return `---\ntitle: "VERONIKA HRYHORASH"\nsubtitle: "PIANO REPERTOIRE"\n---\n\n` + genres.map(g => {
    const au = new Map();
    by.get(g).slice().sort((a, b) => coll.compare(surname(a), surname(b)) || coll.compare(a.title.en || "", b.title.en || ""))
      .forEach(w => { const k = w.composer.en || L(w.composer); au.has(k) || au.set(k, []); au.get(k).push(w.title.en || L(w.title)); });
    return `# ${EXPORT_ORDER.includes(g) ? EXPORT_ORDER.indexOf(g) + 1 + ". " : ""}${g}\n\n` + [...au].map(([a, ts]) => `## ${a}\n\n${ts.map(x => "- " + x).join("\n")}\n`).join("\n");
  }).join("\n");
}
{
  const b = $("[data-export-md]"), sync = () => { b.hidden = !exportOn(); };
  sync(); window.addEventListener("hashchange", sync);
  b.addEventListener("click", () => download("repertoire.md", exportMd(), "text/markdown;charset=utf-8"));
}

/* ---------- media ---------- */
const ytId = u => { if (!u) return ""; if (/^[\w-]{11}$/.test(u)) return u; const m = String(u).match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/); return m ? m[1] : ""; };
const vimeoId = u => { const m = String(u || "").match(/(\d{6,})/); return m ? m[1] : ""; };
function videoOf(m) {
  if (m.youtube && ytId(m.youtube)) return { kind: "yt", id: ytId(m.youtube) };
  if (m.vimeo && vimeoId(m.vimeo)) return { kind: "vimeo", id: vimeoId(m.vimeo) };
  if (m.src) return { kind: "file", src: m.src };
  return null;
}
const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 3.5v17l15-8.5z"/></svg>`;
function tile(m, i) {
  const cap = L(m.caption);
  const fc = `<figcaption><span>${esc(cap)}</span><span>${esc(m.year || "")}</span></figcaption>`;
  if (m.type === "video") {
    const v = videoOf(m); if (!v) return "";
    if (v.kind === "file") return `<figure class="tile"><div class="video"><video controls preload="metadata" src="${esc(v.src)}"${m.poster ? ` poster="${esc(m.poster)}"` : ""}></video></div>${fc}</figure>`;
    const short = v.kind === "yt" && /\/shorts\//.test(m.youtube), vc = short ? "video short" : "video";
    const poster = m.poster || (v.kind === "yt" ? `https://i.ytimg.com/vi/${v.id}/${short ? "oar2" : "hqdefault"}.jpg` : "");
    if (m.embed === false) { // the owner or a copyright claim blocks playback on other sites: open it on YouTube/Vimeo instead
      const href = v.kind === "yt" ? `https://www.youtube.com/watch?v=${v.id}` : `https://vimeo.com/${v.id}`;
      return `<figure class="tile"><a class="${vc}" href="${href}" target="_blank" rel="noopener">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : ""}<span class="play" aria-hidden="true">${PLAY}</span><span class="sr">${esc(t("play") + (cap ? ": " + cap : ""))}</span></a>${fc}</figure>`;
    }
    return `<figure class="tile"><div class="${vc}" data-video="${i}">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : ""}<button type="button" class="play" data-play="${i}" aria-label="${esc(t("play") + (cap ? ": " + cap : ""))}">${PLAY}</button></div>${fc}</figure>`;
  }
  const pi = photos.indexOf(m);
  return `<figure class="tile"><button type="button" class="ph" data-lb="${pi}" aria-label="${esc(cap || t("m_photo"))}"><img src="${esc(m.src)}" alt="${esc(cap)}" loading="lazy"></button>${fc}</figure>`;
}
let galleryCols = 0;
const colsFor = g => { const w = g.clientWidth || Math.min(1240, innerWidth * .9); return Math.max(1, Math.min(3, Math.floor((w + 18) / 298))); };
function fitGallery() { const g = $("[data-gallery]"); if (g && g.clientWidth && colsFor(g) !== galleryCols) renderMedia(); }
addEventListener("resize", fitGallery);
function renderMedia() {
  photos = S.media.filter(m => m.type === "photo" && m.src);
  const list = S.media.filter(m => mtab === "all" || m.type === mtab);
  const g = $("[data-gallery]"), n = Math.min(galleryCols = colsFor(g), list.length || 1);
  // items fill columns top to bottom in data order: the order in media.json decides the layout
  const cols = []; let k = 0;
  for (let c = 0; c < n; c++) { const size = Math.floor(list.length / n) + (c < list.length % n ? 1 : 0); cols.push(list.slice(k, k += size)); }
  g.style.setProperty("--cols", n);
  g.innerHTML = list.length ? cols.map(c => `<div class="gcol">${c.map(m => tile(m, S.media.indexOf(m))).join("")}</div>`).join("") : `<p class="empty">${esc(t("media_empty"))}</p>`;
  $$("[data-mtab]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.mtab === mtab)));
  const plate = $("[data-plate]"), plateSrc = plate && plate.getAttribute("src");
  const plateItem = S.media.find(m => m.src === plateSrc);
  if (plate && plateItem && plateItem.caption) plate.alt = L(plateItem.caption);
  $("[data-media-preview]").innerHTML = photos.filter(m => m.src !== plateSrc).slice(0, 3).map(m => tile(m, S.media.indexOf(m))).join("");
}
function playVideo(i) {
  const m = S.media[i], v = videoOf(m), box = $(`[data-video="${i}"]`); if (!v || !box) return;
  const src = v.kind === "yt" ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0` : `https://player.vimeo.com/video/${v.id}?autoplay=1`;
  box.innerHTML = `<iframe src="${src}" title="${esc(L(m.caption) || "Video")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
}
let lbIndex = 0, lbReturn = null;
function lbShow(i) {
  if (!photos.length) return;
  lbIndex = (i + photos.length) % photos.length;
  const m = photos[lbIndex], box = $("[data-lightbox]");
  $("img", box).src = m.src; $("img", box).alt = L(m.caption);
  $("figcaption", box).textContent = [L(m.caption), m.year].filter(Boolean).join(", ");
  $("[data-lb-prev]").hidden = $("[data-lb-next]").hidden = photos.length < 2;
}
function lbOpen(i) { lbReturn = document.activeElement; lbShow(i); $("[data-lightbox]").hidden = false; $("[data-lb-close]").focus(); document.body.style.overflow = "hidden"; }
function lbClose() { $("[data-lightbox]").hidden = true; document.body.style.overflow = ""; lbReturn && lbReturn.focus(); }

/* ---------- cv ---------- */
function renderCV() {
  const cv = S.cv;
  $("[data-cv-summary]").textContent = L(cv.summary);
  const pdf = $("[data-cv-pdf]"); pdf.hidden = !cv.pdf; if (cv.pdf) pdf.href = cv.pdf;
  $("[data-cv-sample]").hidden = !cv.sample;
  $("[data-cv]").innerHTML = (cv.sections || []).map(s => `<div class="band split cv-sec"><h2>${esc(L(s.title))}</h2><ul class="entries">${(s.items || []).map(it => {
    const where = L(it.place), note = L(it.note);
    return `<li class="entry"><span class="yrs">${esc(it.years || "")}</span><div><div class="what">${esc(L(it.title))}</div>${where ? `<div class="where">${esc(where)}</div>` : ""}${note ? `<div class="where">${esc(note)}</div>` : ""}</div></li>`;
  }).join("")}</ul></div>`).join("");
}

/* ---------- editor (open #edit) ---------- */
const ED = {
  en: { rep: "Repertoire", media: "Photo and video", composer: "Composer (English)", composer_uk: "Composer (Ukrainian)", title_en: "Title (English)", title_es: "Title (Spanish)", title_uk: "Title (Ukrainian)", catalogue: "Catalogue no.", year: "Year written", duration: "Length, minutes", category: "Style and period", format: "Format", status: "Status", tags: "Focus tags, comma-separated", featured: "Show on the home page", save: "Save work", saved: "Saved", new: "New work", edit: "Edit", del: "Delete", deleted: "Deleted", copy: "Copy", download: "Download", copied: "Copied — paste it into", reset: "Discard my changes", preview: "Show my changes on the site in this browser", type: "Type", photo: "Photo", video: "Video", src: "Photo or video file path, e.g. media/photo-6.jpg", yt: "YouTube or Vimeo link", cap_en: "Caption (English)", cap_es: "Caption (Spanish)", cap_uk: "Caption (Ukrainian)", save_m: "Save item", new_m: "New item", up: "Move up", photo_tip: "Put photo files in the media folder first, then enter the path here." },
  uk: { rep: "Репертуар", media: "Фото та відео", composer: "Композитор (англ.)", composer_uk: "Композитор (укр.)", title_en: "Назва (англ.)", title_es: "Назва (ісп.)", title_uk: "Назва (укр.)", catalogue: "Номер у каталозі / опус", year: "Рік написання", duration: "Тривалість, хв", category: "Стиль і епоха", format: "Формат", status: "Статус", tags: "Теги через кому", featured: "Показувати на головній", save: "Зберегти твір", saved: "Збережено", new: "Новий твір", edit: "Змінити", del: "Видалити", deleted: "Видалено", copy: "Копіювати", download: "Завантажити", copied: "Скопійовано — вставте у", reset: "Скасувати мої зміни", preview: "Показувати мої зміни на сайті в цьому браузері", type: "Тип", photo: "Фото", video: "Відео", src: "Шлях до файлу, напр. media/photo-6.jpg", yt: "Посилання на YouTube або Vimeo", cap_en: "Підпис (англ.)", cap_es: "Підпис (ісп.)", cap_uk: "Підпис (укр.)", save_m: "Зберегти", new_m: "Новий елемент", up: "Вгору", photo_tip: "Спершу покладіть файли фото в папку media, потім вкажіть тут шлях." }
};
const e = k => (ED[lang] && ED[lang][k]) || ED.en[k];
let dRep = null, dMedia = null, editRep = -1, editMedia = -1;
const clone = o => JSON.parse(JSON.stringify(o));
function drafts() {
  dRep = dRep || store.get("draft:rep", null) || clone(S.pubRep);
  dMedia = dMedia || store.get("draft:media", null) || clone(S.pubMedia);
}
function persist() {
  store.set("draft:rep", dRep); store.set("draft:media", dMedia);
  if (store.get("preview", false)) { S.rep = dRep; S.media = dMedia; renderData(); }
}
const fld = (name, lab, val = "", type = "text", cls = "") => `<label class="field ${cls}"><span>${esc(lab)}</span><input name="${name}" type="${type}" value="${esc(val)}"${type === "number" ? ' min="0" inputmode="numeric"' : ""}></label>`;
const sel = (name, lab, opts, val) => `<label class="field"><span>${esc(lab)}</span><select name="${name}">${opts.map(([v, l]) => `<option value="${esc(v)}"${v === val ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
function renderEditor() {
  drafts();
  const w = dRep[editRep] || { composer: {}, title: {}, category: "romantic", format: "solo", status: "ready", tags: [] };
  const c = typeof w.composer === "string" ? { en: w.composer } : (w.composer || {});
  const ti = typeof w.title === "string" ? { en: w.title } : (w.title || {});
  const cats = [...new Set([...CAT_ORDER, ...values("category")])].map(v => [v, label("cat_", v)]);
  const m = dMedia[editMedia] || { type: "photo", caption: {} };
  const cap = m.caption || {};
  $("[data-editor]").innerHTML = `<div class="ed">
  <div class="ed-block"><h2>${esc(e("rep"))} (${dRep.length})</h2>
    <ul class="ed-list">${dRep.map((x, i) => `<li><span>${esc(L(x.composer))}: ${esc(L(x.title))} <small>${x.duration ? esc(fmtDur(x.duration)) : ""}</small></span><button type="button" class="ghost mini" data-ed="rep-edit" data-i="${i}">${esc(e("edit"))}</button><button type="button" class="ghost mini" data-ed="rep-del" data-i="${i}">${esc(e("del"))}</button></li>`).join("")}</ul>
    <div class="ed-bar"><button type="button" class="solid mini" data-ed="rep-copy">${esc(e("copy"))} repertoire.json</button><button type="button" class="ghost mini" data-ed="rep-dl">${esc(e("download"))}</button></div>
  </div>
  <form class="ed-form" data-form="rep">
    ${fld("composer_en", e("composer"), c.en, "text", "wide")}${fld("composer_uk", e("composer_uk"), c.uk, "text", "wide")}
    ${fld("title_en", e("title_en"), ti.en, "text", "wide")}${fld("title_es", e("title_es"), ti.es)}${fld("title_uk", e("title_uk"), ti.uk)}
    ${fld("catalogue", e("catalogue"), w.catalogue)}${fld("year", e("year"), w.year, "number")}
    ${fld("duration", e("duration"), w.duration, "number")}${sel("category", e("category"), cats, w.category)}
    ${sel("format", e("format"), ["solo", "chamber", "concerto"].map(v => [v, label("fmt_", v)]), w.format)}
    ${sel("status", e("status"), ["ready", "preparing"].map(v => [v, label("st_", v)]), w.status)}
    ${fld("tags", e("tags"), (w.tags || []).join(", "), "text", "wide")}
    <label class="field check wide"><input type="checkbox" name="featured"${w.featured ? " checked" : ""}><span>${esc(e("featured"))}</span></label>
    <div class="ed-bar wide"><button class="solid mini" type="submit">${esc(e("save"))}</button><button class="ghost mini" type="button" data-ed="rep-new">${esc(e("new"))}</button></div>
  </form>
  <div class="ed-block"><h2>${esc(e("media"))} (${dMedia.length})</h2>
    <ul class="ed-list">${dMedia.map((x, i) => `<li><span>${esc(x.type === "video" ? e("video") : e("photo"))}: ${esc(L(x.caption) || x.src || x.youtube || x.vimeo)}</span>${i ? `<button type="button" class="ghost mini" data-ed="m-up" data-i="${i}" aria-label="${esc(e("up"))}">↑</button>` : ""}<button type="button" class="ghost mini" data-ed="m-edit" data-i="${i}">${esc(e("edit"))}</button><button type="button" class="ghost mini" data-ed="m-del" data-i="${i}">${esc(e("del"))}</button></li>`).join("")}</ul>
    <div class="ed-bar"><button type="button" class="solid mini" data-ed="m-copy">${esc(e("copy"))} media.json</button><button type="button" class="ghost mini" data-ed="m-dl">${esc(e("download"))}</button></div>
  </div>
  <form class="ed-form" data-form="media">
    ${sel("type", e("type"), [["photo", e("photo")], ["video", e("video")]], m.type)}${fld("year", e("year").replace(/written|написання/, "").trim(), m.year, "number")}
    ${fld("src", e("src"), m.src, "text", "wide")}${fld("link", e("yt"), m.youtube || m.vimeo, "url", "wide")}
    ${fld("cap_en", e("cap_en"), cap.en, "text", "wide")}${fld("cap_es", e("cap_es"), cap.es)}${fld("cap_uk", e("cap_uk"), cap.uk)}
    <p class="note wide">${esc(e("photo_tip"))}</p>
    <div class="ed-bar wide"><button class="solid mini" type="submit">${esc(e("save_m"))}</button><button class="ghost mini" type="button" data-ed="m-new">${esc(e("new_m"))}</button></div>
  </form>
  <div class="wide">
    <label class="field check"><input type="checkbox" data-ed-preview${store.get("preview", false) ? " checked" : ""}> <span>${esc(e("preview"))}</span></label>
    <div class="ed-bar"><button type="button" class="ghost mini" data-ed="reset">${esc(e("reset"))}</button></div>
  </div></div>`;
}
function saveRepForm(f) {
  const d = Object.fromEntries(new FormData(f));
  if (!d.composer_en.trim() || !d.title_en.trim()) { toast(e("composer") + ", " + e("title_en")); return; }
  const old = dRep[editRep] || {};
  const w = {
    id: old.id || norm(d.composer_en.split(" ").pop() + "-" + d.title_en).replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6),
    composer: Object.assign({ en: d.composer_en.trim() }, d.composer_uk.trim() ? { uk: d.composer_uk.trim() } : {}, old.composer && old.composer.es ? { es: old.composer.es } : {}),
    title: { en: d.title_en.trim(), es: d.title_es.trim() || d.title_en.trim(), uk: d.title_uk.trim() || d.title_en.trim() },
    ...(old.sort ? { sort: old.sort } : {}),
    ...(old.exportGenre ? { exportGenre: old.exportGenre } : {}),
    catalogue: d.catalogue.trim(), year: +d.year || null, category: d.category, format: d.format,
    duration: +d.duration || 0, status: d.status, tags: d.tags.split(",").map(s => s.trim()).filter(Boolean), featured: !!d.featured
  };
  if (editRep >= 0) dRep[editRep] = w; else dRep.push(w);
  editRep = -1; persist(); renderEditor(); toast(e("saved"));
}
function saveMediaForm(f) {
  const d = Object.fromEntries(new FormData(f));
  const m = { type: d.type, caption: { en: d.cap_en.trim(), es: d.cap_es.trim() || d.cap_en.trim(), uk: d.cap_uk.trim() || d.cap_en.trim() } };
  if (d.year) m.year = +d.year;
  if (d.src.trim()) m.src = d.src.trim();
  if (d.link.trim()) m[/vimeo/.test(d.link) ? "vimeo" : "youtube"] = d.link.trim();
  if (!m.src && !m.youtube && !m.vimeo) { toast(e("src")); return; }
  if (editMedia >= 0) dMedia[editMedia] = m; else dMedia.unshift(m);
  editMedia = -1; persist(); renderEditor(); toast(e("saved"));
}

/* ---------- keyboard (the picture) ---------- */
let keysW = 0, ac = null;
const WHITE = [0, 2, 4, 5, 7, 9, 11];
function buildKeys() {
  const box = $("#keys"), W = box.clientWidth, H = box.clientHeight;
  if (!W || W === keysW) return; keysW = W;
  const n = Math.max(14, Math.min(44, Math.round(W / 58))), kw = W / n, felt = 7, bw = kw * .58, bh = (H - felt) * .62;
  const startOct = 4 - Math.floor(n / 14);
  const midiAt = i => 12 * (startOct + Math.floor(i / 7) + 1) + WHITE[i % 7];
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs>
    <linearGradient id="ksh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".94" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
    <linearGradient id="kb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a3a42"/><stop offset=".25" stop-color="#1d1d22"/><stop offset="1" stop-color="#101013"/></linearGradient></defs>`;
  for (let i = 0; i < n; i++) {
    const x = i * kw;
    s += `<g class="wk" data-m="${midiAt(i)}"><rect class="w" x="${x + .6}" y="${felt - 6}" width="${kw - 1.2}" height="${H - felt + 3}" rx="4"/><rect x="${x + .6}" y="${felt}" width="${kw - 1.2}" height="${H - felt}" fill="url(#ksh)" pointer-events="none"/></g>`;
  }
  for (let i = 0; i < n - 1; i++) {
    if (![0, 1, 3, 4, 5].includes(i % 7)) continue;
    const x = (i + 1) * kw - bw / 2 + ([0, 3].includes(i % 7) ? -kw * .06 : [1, 5].includes(i % 7) ? kw * .06 : 0);
    s += `<g class="bk" data-m="${midiAt(i) + 1}"><rect class="b" x="${x}" y="${felt - 4}" width="${bw}" height="${bh + 4}" rx="3" fill="url(#kb)"/><rect x="${x + bw * .12}" y="${felt + bh - 12}" width="${bw * .76}" height="9" rx="2" fill="#4a4a53" opacity=".55" pointer-events="none"/></g>`;
  }
  s += `<rect x="0" y="0" width="${W}" height="${felt}" fill="#9b1c31"/><rect x="0" y="${felt}" width="${W}" height="1.5" fill="#000" opacity=".35"/></svg>`;
  box.innerHTML = s;
}
function press(g, sound) {
  if (!g) return;
  g.classList.add("down-g"); g.firstElementChild.classList.add("down");
  setTimeout(() => { g.classList.remove("down-g"); g.firstElementChild.classList.remove("down"); }, 200);
  if (sound) note(+g.dataset.m);
}
function note(m) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    const f = 440 * 2 ** ((m - 69) / 12), now = ac.currentTime;
    const out = ac.createGain(), lp = ac.createBiquadFilter();
    out.gain.setValueAtTime(0, now); out.gain.linearRampToValueAtTime(.16, now + .006); out.gain.exponentialRampToValueAtTime(.0008, now + 2.2);
    lp.type = "lowpass"; lp.frequency.setValueAtTime(Math.min(f * 7, 9000), now); lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.4, 280), now + 1.4);
    [[1, "triangle", 1], [2, "sine", .3], [3, "sine", .1], [4, "sine", .05]].forEach(([mul, type, amp]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f * mul; g.gain.value = amp;
      o.connect(g); g.connect(lp); o.start(now); o.stop(now + 2.3);
    });
    lp.connect(out); out.connect(ac.destination);
  } catch (err) {}
}
let held = false, lastKey = null;
function keyAt(ev) { const el = document.elementFromPoint(ev.clientX, ev.clientY); return el && el.closest && el.closest("#keys [data-m]"); }
function intro() {
  if (reduced) return;
  [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => setTimeout(() => press($(`#keys [data-m="${m}"]`), false), 500 + i * 120));
}

/* ---------- router ---------- */
const ROUTES = ["home", "repertoire", "media", "cv", "edit"];
let current = "";
function route() {
  const r = location.hash.slice(1).split("?")[0];
  if (r && !ROUTES.includes(r)) return;
  const view = r || "home";
  if (view === current) return;
  current = view;
  $$("[data-view]").forEach(v => v.hidden = v.dataset.view !== view);
  $$("[data-route]").forEach(a => a.dataset.route === view ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  if (view === "edit") renderEditor();
  if (view === "home") requestAnimationFrame(buildKeys);
  if (view === "media") requestAnimationFrame(fitGallery);
  window.scrollTo(0, 0);
}

/* ---------- render all ---------- */
function renderFacts() {
  const n = S.rep.length, mins = S.rep.reduce((s, w) => s + (+w.duration || 0), 0);
  $("[data-fact-works]").textContent = n.toLocaleString(lang);
  $("[data-fact-hours]").textContent = Math.round(mins / 60).toLocaleString(lang);
}
function renderData() { renderFacts(); renderFeatured(); renderFilters(); renderRep(); renderProg(); renderMedia(); }
function renderAll() {
  renderStatic(); renderProfile(); renderData(); renderCV();
  if (current === "edit") renderEditor();
}

/* ---------- events ---------- */
document.addEventListener("click", ev => {
  const b = ev.target.closest("button, a"); if (!b) return;
  if (b.matches(".skip")) { ev.preventDefault(); $("#main").focus(); return; }
  if (b.dataset.lang) { lang = b.dataset.lang; store.set("lang", lang); renderAll(); return; }
  if (b.hasAttribute("data-contact")) { $("#contact").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); $("[data-email]").focus({ preventScroll: true }); return; }
  if (b.dataset.f) {
    const arr = F[b.dataset.f], v = b.dataset.v, i = arr.indexOf(v);
    i < 0 ? arr.push(v) : arr.splice(i, 1);
    b.setAttribute("aria-pressed", String(i < 0)); saveFilters(); renderRep(); return;
  }
  if (b.id === "reset" || b.hasAttribute("data-reset")) { GROUPS.forEach(([k]) => F[k] = []); F.q = ""; saveFilters(); renderFilters(); renderRep(); return; }
  if (b.dataset.add) { const id = b.dataset.add; prog.has(id) ? prog.delete(id) : prog.add(id); store.set("prog", [...prog]); renderRep(); renderProg(); return; }
  if (b.hasAttribute("data-prog-copy")) { copyText(progText()).then(ok => ok && toast(t("prog_copied"))); return; }
  if (b.hasAttribute("data-prog-clear")) { prog.clear(); store.set("prog", []); renderRep(); renderProg(); return; }
  if (b.dataset.mtab) { mtab = b.dataset.mtab; renderMedia(); return; }
  if (b.dataset.play) { playVideo(+b.dataset.play); return; }
  if (b.dataset.lb) { lbOpen(+b.dataset.lb); return; }
  if (b.hasAttribute("data-lb-close")) { lbClose(); return; }
  if (b.hasAttribute("data-lb-prev")) { lbShow(lbIndex - 1); return; }
  if (b.hasAttribute("data-lb-next")) { lbShow(lbIndex + 1); return; }
  if (b.hasAttribute("data-cv-print")) { try { window.print(); } catch (err) {} return; }
  const a = b.dataset.ed; if (!a) return;
  const i = +b.dataset.i;
  const json = o => JSON.stringify(o, null, 2) + "\n";
  if (a === "rep-edit") { editRep = i; renderEditor(); $("[data-form=rep] input").focus(); }
  if (a === "rep-del") { dRep.splice(i, 1); editRep = -1; persist(); renderEditor(); toast(e("deleted")); }
  if (a === "rep-new") { editRep = -1; renderEditor(); $("[data-form=rep] input").focus(); }
  if (a === "rep-copy") copyText(json(dRep)).then(ok => ok && toast(e("copied") + " data/repertoire.json"));
  if (a === "rep-dl") download("repertoire.json", json(dRep));
  if (a === "m-edit") { editMedia = i; renderEditor(); $("[data-form=media] select").focus(); }
  if (a === "m-del") { dMedia.splice(i, 1); editMedia = -1; persist(); renderEditor(); toast(e("deleted")); }
  if (a === "m-up") { [dMedia[i - 1], dMedia[i]] = [dMedia[i], dMedia[i - 1]]; persist(); renderEditor(); }
  if (a === "m-new") { editMedia = -1; renderEditor(); }
  if (a === "m-copy") copyText(json(dMedia)).then(ok => ok && toast(e("copied") + " data/media.json"));
  if (a === "m-dl") download("media.json", json(dMedia));
  if (a === "reset") { dRep = clone(S.pubRep); dMedia = clone(S.pubMedia); store.set("draft:rep", null); store.set("draft:media", null); S.rep = S.pubRep; S.media = S.pubMedia; editRep = editMedia = -1; renderData(); renderEditor(); }
});
document.addEventListener("submit", ev => {
  const f = ev.target.closest("[data-form]"); if (!f) return; ev.preventDefault();
  f.dataset.form === "rep" ? saveRepForm(f) : saveMediaForm(f);
});
document.addEventListener("change", ev => {
  if (ev.target.id === "sort") { F.sort = ev.target.value; saveFilters(); renderRep(); }
  if (ev.target.hasAttribute("data-ed-preview")) {
    const on = ev.target.checked; store.set("preview", on);
    S.rep = on ? dRep : S.pubRep; S.media = on ? dMedia : S.pubMedia; renderData();
  }
});
$("#q").addEventListener("input", ev => { F.q = ev.target.value.trim(); renderRep(); });
document.addEventListener("keydown", ev => {
  if ($("[data-lightbox]").hidden) return;
  if (ev.key === "Escape") lbClose();
  if (ev.key === "ArrowLeft") lbShow(lbIndex - 1);
  if (ev.key === "ArrowRight") lbShow(lbIndex + 1);
  if (ev.key === "Tab") { const f = $$("[data-lightbox] button:not([hidden])"); const i = f.indexOf(document.activeElement); if (ev.shiftKey && i <= 0) { ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && i === f.length - 1) { ev.preventDefault(); f[0].focus(); } }
});
$("[data-lightbox]").addEventListener("click", ev => { if (ev.target === ev.currentTarget) lbClose(); });
const keysEl = $("#keys");
keysEl.addEventListener("pointerdown", ev => { held = true; lastKey = keyAt(ev); press(lastKey, true); try { keysEl.setPointerCapture(ev.pointerId); } catch (err) {} });
keysEl.addEventListener("pointermove", ev => { if (!held) return; const k = keyAt(ev); if (k && k !== lastKey) { lastKey = k; press(k, true); } });
["pointerup", "pointercancel", "pointerleave"].forEach(n => keysEl.addEventListener(n, () => { held = false; lastKey = null; }));
const keysRO = new ResizeObserver(() => buildKeys());
keysRO.observe(keysEl);
window.addEventListener("hashchange", route);

/* ---------- boot ---------- */
async function load() {
  const get = p => fetch(p, { cache: "no-cache" }).then(r => { if (!r.ok) throw new Error(p + " " + r.status); return r.json(); });
  renderStatic();
  try {
    [S.profile, S.pubRep, S.pubMedia, S.cv] = await Promise.all(["data/profile.json", "data/repertoire.json", "data/media.json", "data/cv.json"].map(get));
  } catch (err) {
    console.error(err);
    $("#main").innerHTML = `<div class="band"><p class="empty">${esc(t("load_error"))}</p></div>`;
    return;
  }
  const preview = store.get("preview", false);
  S.rep = (preview && store.get("draft:rep", null)) || S.pubRep;
  S.media = (preview && store.get("draft:media", null)) || S.pubMedia;
  renderAll(); route(); buildKeys();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(intro);
}
load();
}
