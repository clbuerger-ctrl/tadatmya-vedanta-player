(function(){
  const STORE="tv-thumb-shown-v1";
  function loadShown(){
    try{
      const raw=JSON.parse(sessionStorage.getItem(STORE)||"{}");
      return raw && typeof raw==="object" ? raw : {};
    }catch(e){ return {}; }
  }
  function markShown(key){
    const m=loadShown();
    m[key]=1;
    sessionStorage.setItem(STORE,JSON.stringify(m));
  }
  function wasShown(key){ return !!loadShown()[key]; }
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
    if(!key || wasShown(key)) return;
    const el=document.getElementById("thumbOv");
    const img=document.getElementById("thumbOvImg");
    if(!el||!img) return;
    markShown(key);
    img.src=thumbSrc(L);
    el.classList.add("on");
    clearTimeout(el._tvThumbT);
    el._tvThumbT=setTimeout(hideThumb, 5000);
  }
  const a=document.getElementById("a");
  if(!a) return;
  a.addEventListener("play", function(){
    if(typeof sichtbar==="undefined" || typeof i==="undefined" || i<0) return;
    const L=sichtbar[i];
    if(!L) return;
    if((a.currentTime||0)>6) return;
    showThumb(L);
  });
  const ov=document.getElementById("thumbOv");
  if(ov) ov.addEventListener("click", hideThumb);
})();
