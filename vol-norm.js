/* Vol Norm darf Dropbox-Play nicht über Web-Audio umleiten.
   createMediaElementSource macht unter Windows oft Stille. */
(function(){
  var KEY="tv-vol-norm-v1";

  function enabled(){
    try{ return localStorage.getItem(KEY)==="1"; }catch(e){ return false; }
  }
  function setEnabled(on){
    try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){}
    paint();
  }
  function paint(){
    var b=document.getElementById("btnVolNorm");
    if(!b) return;
    var on=enabled();
    b.textContent=on?"Vol Norm an":"Vol Norm aus";
    b.classList.toggle("gold",on);
    b.setAttribute("aria-pressed",on?"true":"false");
    b.title=on
      ?"Angleich vorgemerkt — Live-AGC geht mit Dropbox nicht, Ton bleibt normal"
      :"Lautstärke-Angleich aus";
  }
  window.toggleVolNorm=function(){
    setEnabled(!enabled());
    var err=document.getElementById("err");
    if(err){
      err.textContent=enabled()
        ?"Vol Norm: Live-Angleich braucht CORS. Dropbox liefert das nicht — Ton bleibt unverändert."
        :"";
    }
  };
  document.addEventListener("DOMContentLoaded", paint);
  if(document.readyState!=="loading") paint();
})();
