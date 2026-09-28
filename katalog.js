/* [Grok-Bot] V1.86 Katalog: neue MP3s erscheinen auch bevor lesungen.js ergänzt ist (lädt nach app.js).
   1. katalog.txt hier im Repo (GitHub Pages, gleicher Ursprung, kein CORS-Problem) – Hauptquelle
   2. katalog.json/.txt in Dropbox (app.js loadExtraCatalog) scheitert im Browser meist an CORS:
      www.dropbox.com antwortet mit 302 ohne Access-Control-Allow-Origin.
   Zeile: "Dateiname.mp3" oder "Dateiname.mp3 | Titel | #Tag1 #Tag2 | Kap. x"  (siehe KATALOG.md) */
function nfc(s){ s=String(s==null?"":s); try{ return s.normalize("NFC"); }catch(e){ return s; } }
function vortragNr(file){ const m=nfc(file).match(/Vortrag #(\d+) zum Buch/); return m?parseInt(m[1],10):0; }
function titelAusDatei(file){
  const f=nfc(file).replace(/\.mp3$/i,"");
  if(vortragNr(f)) return "Neuer Vortrag — Titel folgt";
  return f.replace(/^T\u0101d\u0101tmya Ved\u0101nta\s*-\s*/,"");
}
function mergeEntries(arr){
  if(!Array.isArray(arr)) return 0;
  let n=0;
  arr.forEach(function(E){
    if(!E) return;
    const file=nfc(E.file||E.name||E.filename).trim();
    if(!file) return;
    if(LESUNGEN.some(function(L){ return nfc(L.file)===file; })) return;
    const vn=vortragNr(file);
    if(vn && LESUNGEN.some(function(L){ return vortragNr(L.file)===vn; })) return;
    const nr=E.nr||vn||0;
    const tags=Array.isArray(E.tags)?E.tags:String(E.tags||"").split(/\s+/).filter(Boolean);
    const L={nr:nr,titel:E.titel||E.title||titelAusDatei(file),file:file,tags:tags.length?tags:(vn?["#Neu"]:[]),kap:E.kap||"",sum:E.sum||""};
    let at=LESUNGEN.length;
    if(vn){ // hinter den letzten kleineren Vortrag, vor die Team-Satsangs
      let last=-1;
      LESUNGEN.forEach(function(X,k){ const xn=vortragNr(X.file); if(xn && xn<vn) last=k; });
      if(last>=0) at=last+1;
    }
    LESUNGEN.splice(at,0,L);
    n++;
  });
  if(n){ sichtbar=LESUNGEN.slice(); filterList(); updateResume(); }
  return n;
}
function parseKatalogText(t){
  return String(t||"").split(/\r?\n/).map(function(l){ return l.trim(); }).filter(function(l){
    return l && l.charAt(0)!=="#" && l.charAt(0)!=="<" && /\.mp3(\s*\||$)/i.test(l);
  }).map(function(l){
    const p=l.split(/\s*\|\s*/);
    return {file:p[0],titel:p[1]||"",tags:p[2]||"",kap:p[3]||""};
  });
}
/* [Grok-Bot] V1.87: Zeitraum bei jedem Aufruf frisch aus katalog.txt ("@zeitraum: TT.MM.JJJJ – TT.MM.JJJJ").
   Ersetzt den Abruf von zeitraum.txt aus Dropbox, den der Browser wegen CORS blockiert. */
function applyKatalogZeitraum(t){
  const m=String(t||"").match(/^@zeitraum:\s*(\d{1,2}\.\d{1,2}\.\d{4})\s*[–-]\s*(\d{1,2}\.\d{1,2}\.\d{4})\s*$/m);
  if(!m) return;
  window.TV_ZEITRAUM={from:m[1],to:m[2]};
  if(typeof applyZeitraum==="function") applyZeitraum(m[1],m[2]);
  else { const el=document.getElementById("zeitraum"); if(el) el.textContent="Zeitraum: "+m[1]+" – "+m[2]; }
}
(function loadRepoKatalog(){
  fetch("katalog.txt?v="+Date.now(),{cache:"no-store"}).then(function(r){ return r.ok?r.text():""; }).then(function(t){
    if(!t || /^\s*</.test(t)) return;
    applyKatalogZeitraum(t);
    mergeEntries(parseKatalogText(t));
  }).catch(function(){});
})();
