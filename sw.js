const V = "found-20261102231409", A = "found-assets";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(V).then(c => c.addAll(["./", "assets/vendor/gsap.min.js", "manifest.webmanifest"]))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== A).map(async k => {
  // carry the old version's pictures over before it goes
  if (/^found-\d+$/.test(k)) { const old = await caches.open(k), keep = await caches.open(A); for (const q of await old.keys()) if (/\/assets\//.test(q.url)) { const res = await old.match(q); if (res) await keep.put(q, res); } }
  return caches.delete(k);
}))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (r.mode === "navigate") { e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put("./", c)); return res; }).catch(() => caches.match("./"))); return; }
  if (u.origin !== location.origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) return;
  // videos stream in byte ranges; let Safari fetch them directly (a cached whole file breaks iPhone playback)
  if (/\.mp4$/.test(u.pathname) || r.headers.has("range")) return;
  const C = /\/assets\//.test(u.pathname) ? A : V;
  e.respondWith(caches.match(r).then(hit => { const net = fetch(r).then(res => { if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(C).then(x => x.put(r, c)); } return res; }).catch(() => hit); return hit || net; }));
});
