/* [Grok-Bot] V1.88: Titelbild (YouTube-Thumbnail) bei jedem Start eines Vortrags 4 Sekunden einblenden,
   der Ton läuft im Hintergrund schon. Nicht erneut bei Stream-Reparatur/Resume desselben Vortrags innerhalb von 10 Min.
   Neue Vorträge: Zeile "@yt: <Nr> <YouTube-ID>" in katalog.txt (katalog.js trägt sie in TV_THUMBS ein). */
(function(){
  let lastKey="", lastAt=0;
  function lectureKey(L){
    if(!L) return "";
    if(L.nr) return "nr-"+L.nr;
    return "file-"+(L.file||"");
  }
  function thumbSrc(L){
    if(!L) return "cover.jpg";
    const byNr=(window.TV_THUMBS||{})[L.nr];
    if(byNr && byNr.yt) return tvThumbUrl(byNr.yt);
    const file=String(L.file||"")+(L.titel||"");
    const map=window.TV_THUMBS_FILE||{};
    for(const k in map){
      if(file.indexOf(k)>=0 && map[k].yt) return tvThumbUrl(map[k].yt);
    }
    return "cover.jpg";
  }
  function hideThumb(){
    const el=document.getElementById("thumbOv");
    if(el) el.classList.remove("on");
  }
  function showThumb(L){
    const key=lectureKey(L);
    if(!key) return;
    const now=Date.now();
    if(key===lastKey && now-lastAt<600000) return;
    const el=document.getElementById("thumbOv");
    const img=document.getElementById("thumbOvImg");
    if(!el||!img) return;
    lastKey=key; lastAt=now;
    img.src=thumbSrc(L);
    el.classList.add("on");
    clearTimeout(el._tvThumbT);
    el._tvThumbT=setTimeout(hideThumb, 4000);
  }
  window.tvShowThumb=showThumb;
  const orig=window.play;
  if(typeof orig==="function"){
    window.play=function(idx){
      try{
        const L=(typeof sichtbar!=="undefined" && sichtbar[idx]) ? sichtbar[idx] : null;
        if(L) showThumb(L);
      }catch(e){}
      return orig.apply(this, arguments);
    };
  }
  const ov=document.getElementById("thumbOv");
  if(ov) ov.addEventListener("click", hideThumb);
})();
