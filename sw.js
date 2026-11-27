/* Japan Travel Companion V106: scope-local, versioned application shell. */
const PREFIX='japan2026-'+encodeURIComponent(self.registration.scope)+'-';
const SHELL=PREFIX+'v106-shell';
const STATIC=PREFIX+'v106-static';
const CORE=['./index.html','./manifest.webmanifest','./assets/react18-v105.js','./assets/utilities-v105.css'];
const CDN=new Set(['unpkg.com','cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com','www.gstatic.com']);
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(SHELL);await c.addAll(CORE.map(p=>new Request(p,{cache:'reload'})));await self.skipWaiting();})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys()){if(k.startsWith(PREFIX)&&k!==SHELL&&k!==STATIC)await caches.delete(k);}await self.clients.claim();})()));
async function nav(req){const c=await caches.open(SHELL);const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),3500);try{const r=await fetch(req,{signal:ac.signal,cache:'no-cache'});if(r.ok){await c.put('./index.html',r.clone());return r;}throw new Error('HTTP '+r.status);}catch{ return (await c.match('./index.html'))||Response.error(); }finally{clearTimeout(timer);}}
async function asset(req){const core=await caches.open(SHELL);const cached=await core.match(req);if(cached)return cached;const c=await caches.open(STATIC);const hit=await c.match(req);if(hit)return hit;const r=await fetch(req);if(r.ok||r.type==='opaque'){try{await c.put(req,r.clone());}catch{}}return r;}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin===self.location.origin&&u.href.startsWith(self.registration.scope)){if(r.mode==='navigate'||/\/index\.html$/.test(u.pathname)){e.respondWith(nav(r));return;}if(/\.(js|css|png|webp|svg|ico|webmanifest)$/.test(u.pathname)){e.respondWith(asset(r));return;}}if(CDN.has(u.hostname))e.respondWith(asset(r));});

self.addEventListener('message',e=>{if(e.data!=='warm-v106')return;e.waitUntil((async()=>{for(const path of ['./assets/cucco-v105.webp','./assets/postcard-v105.webp','./assets/pixel-wow-v106.jpg']){try{await asset(new Request(new URL(path,self.registration.scope)));}catch{}}})());});
