const CACHE='gestor-precios-v5';
const APP=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
const CDN=[
 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js',
 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>
    c.addAll(APP).then(()=>Promise.all(CDN.map(u=>fetch(u).then(r=>c.put(u,r)).catch(()=>{}))))
  ).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{
      const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return res;
    }).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return;
  }
  if(u.origin===location.origin||u.hostname==='cdnjs.cloudflare.com'){
    e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(x=>x.put(r,copy));}
      return res;
    })));
  }
});
