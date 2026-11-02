/* Quiz Natura · service worker
   - Página: sempre busca a versão mais nova na internet (rede primeiro); sem internet, usa a cópia salva.
   - Dados (Supabase) nunca passam pelo cache.
   - Cada publicação troca a VERSION, e o app se atualiza sozinho. */
const VERSION='20261102190245';
const CACHE='quiznatura-'+VERSION;
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./favicon.ico','./apple-touch-icon.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=='GET'||u.origin!==self.location.origin)return;
  if(u.pathname.endsWith('/version.json')||u.pathname.endsWith('/sw.js'))return;
  if(req.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('.html')){
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{
      if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put('./index.html',c))}
      return r;
    }).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{
    if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c))}
    return res;
  })));
});
