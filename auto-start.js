/* [Grok.com] V1.93: Nach 4 Sekunden an der gespeicherten Stelle weiterhören.
   Aus, wenn noch nie gehört wurde oder der Schalter AutoStart aus ist. */
(function(){
  var KEY="tv-autostart-v1";
  function on(){
    try{
      var v=localStorage.getItem(KEY);
      if(v===null) return true;
      return v!=="aus";
    }catch(e){ return true; }
  }
  function setOn(v){
    try{ localStorage.setItem(KEY, v?"an":"aus"); }catch(e){}
    paint();
  }
  function paint(){
    var b=document.getElementById("btnAutoStart");
    if(!b) return;
    var an=on();
    b.textContent=an?"AutoStart an":"AutoStart aus";
    b.setAttribute("aria-pressed", an?"true":"false");
    b.classList.toggle("gold", an);
  }
  function blinkPlay(times, then){
    var b=document.getElementById("btnPlay");
    if(!b||times<=0){ if(typeof then==="function") then(); return; }
    b.classList.add("gold");
    setTimeout(function(){
      b.classList.remove("gold");
      setTimeout(function(){ blinkPlay(times-1, then); }, 180);
    }, 180);
  }
  function boot(){
    paint();
    var btn=document.getElementById("btnAutoStart");
    if(btn && !btn.__tv){
      btn.__tv=1;
      btn.addEventListener("click", function(){ setOn(!on()); });
    }
    if(!on()) return;
    var st=null;
    try{ st=JSON.parse(localStorage.getItem("tv-player-resume-v1")||"null"); }catch(e){}
    if(!st || !st.file) return;
    setTimeout(function(){
      if(!on()) return;
      blinkPlay(2, function(){
        if(typeof resumeNow==="function") resumeNow();
      });
    }, 4000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
