const CACHE="xauai-v1";
const ASSETS=["./index.html","./manifest.json","./icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{if(["twelvedata","anthropic","netlify","rss2json"].some(s=>e.request.url.includes(s)))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
self.addEventListener("push",e=>{const d=e.data?e.data.json():{title:"XAUAI",body:"Market update"};e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:"./icon.svg",vibrate:[200,100,200],tag:"xauai"}))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.openWindow("/"))});
