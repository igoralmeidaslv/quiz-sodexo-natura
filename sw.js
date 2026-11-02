/* Quiz Natura · service worker
   - Página: sempre busca a versão mais nova na internet (rede primeiro); sem internet, usa a cópia salva.
   - Dados (Supabase) nunca passam pelo cache.
   - Cada publicação troca a VERSION, e o app se atualiza sozinho. */
const VERSION='20261102195658';
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

/* Avisos no celular (tarefas da limpeza) */
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch(_){d={body:e.data?e.data.text():''}}
  e.waitUntil(self.registration.showNotification(d.title||'Quiz Natura',{body:d.body||'Você tem novidades no app.',icon:'./icon-192.png',badge:'./favicon-32.png',tag:d.tag||'aviso',renotify:true,data:{url:d.url||'./'}}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||'./',self.location.href).href;
  e.waitUntil((async()=>{
    const cs=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of cs){if(c.url.split('#')[0].split('?')[0]===url.split('#')[0].split('?')[0]&&'focus' in c){try{await c.navigate(url)}catch(_){}return c.focus()}}
    return self.clients.openWindow(url);
  })());
});
