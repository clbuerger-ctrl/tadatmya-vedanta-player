/* V1.84 Listen-Markierungen (lädt nach app.js, vor feedback.js)
   Zeile 1: Überschrift + ✓ (auf diesem Gerät komplett gehört) + (m:ss) (angefangen)
   Zeile 2: Tags · Kapitel + (n) = gerade aktive Hörer/Leser (nur n>0) · n× gehört (globale Completions) */
(function(){
  if(typeof zeichne!=="function") return;
  window.__tvKapOn=1; // ersetzt ensureKapSubtitle aus feedback.js (sonst doppelte Zeile 2)
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
  function kapLine(L){
    const live=typeof window.__tvLiveCount==="function"?(+window.__tvLiveCount(L)||0):0;
    let n=0;
    try{ n=typeof doneCountFor==="function"?(+doneCountFor(L)||0):0; }catch(e){ n=0; } // feedback.js evtl. noch nicht fertig geladen
    let h="";
    if(L.kap) h+=esc(L.kap);
    if(live>0){
      const t=live===1?"1 Person hört/liest gerade":live+" Personen hören/lesen gerade";
      h+=(h?" ":"")+"<span class='livecount' title='"+t+"'>("+live+")</span>";
    }
    if(n>0) h+=(h?" · ":"")+"<span class='donecount' title='"+n+"× komplett gehört (alle Hörer)'>"+n+"× gehört</span>";
    return h;
  }
  function render(){
    const box=document.getElementById("list");
    if(!box) return;
    box.innerHTML="";
    sichtbar.forEach(function(L,idx){
      const d=document.createElement("button");
      d.type="button";
      d.className="item"+(idx===i?" active":"");
      d.setAttribute("data-idx",String(idx));
      const done=isDone(L.file);
      const pos=getPos(L.file);
      let mark="";
      if(done) mark+=" <span class='done' title='komplett gehört'>✓</span>";
      if(pos>3) mark+=" <span class='posmark' title='weiter bei "+fmt(pos)+"'>("+fmt(pos)+")</span>";
      const tags=(L.tags||[]).join(" ");
      const kl=kapLine(L);
      d.innerHTML="<span class='ttl'>"+labelOf(L)+mark+"</span><div class='tags'>"+tags+(kl?(tags?" · ":"")+"<span class='kapline'>"+kl+"</span>":"")+"</div>";
      box.appendChild(d);
    });
  }
  window.zeichne=render;
  // (m:ss) des laufenden Vortrags mitführen, ohne die Liste neu aufzubauen
  function refreshPosMark(){
    try{
      if(typeof i!=="number"||i<0) return;
      const L=sichtbar[i];
      const d=document.querySelector('#list .item[data-idx="'+i+'"] .ttl');
      if(!L||!d) return;
      const pos=getPos(L.file);
      let pm=d.querySelector(".posmark");
      if(pos>3){
        const txt="("+fmt(pos)+")";
        if(!pm){ pm=document.createElement("span"); pm.className="posmark"; d.appendChild(document.createTextNode(" ")); d.appendChild(pm); }
        if(pm.textContent!==txt){ pm.textContent=txt; pm.title="weiter bei "+fmt(pos); }
      }else if(pm){ pm.remove(); }
    }catch(e){}
  }
  const au=document.getElementById("a");
  if(au){
    au.addEventListener("timeupdate",refreshPosMark);
    au.addEventListener("pause",refreshPosMark);
  }
  try{ render(); }catch(e){}
})();
