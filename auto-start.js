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
  /* [Grok-Bot] V1.96: Beim AutoStart nach dem Hochscrollen des Buchbilds (cover-fx.js, fertig nach ca. 5 s)
     die Liste so scrollen, dass der aktuelle Vortrag direkt unter dem Player steht. Nicht, wenn der Nutzer selbst scrollt. */
  var t0=Date.now(), userScrolled=false;
  ["wheel","touchmove","keydown"].forEach(function(ev){
    window.addEventListener(ev,function(){ userScrolled=true; },{passive:true});
  });
  function scrollToCurrent(){
    var wait=Math.max(400,(t0+5200)-Date.now());
    setTimeout(function(){
      if(userScrolled) return;
      var it=document.querySelector("#list .item.active");
      if(!it) return;
      var bar=document.getElementById("playerBar");
      var barH=bar?bar.getBoundingClientRect().height:0;
      var y0=window.scrollY||0;
      var target=Math.max(0,y0+it.getBoundingClientRect().top-barH-8);
      var diff=target-y0;
      if(Math.abs(diff)<4) return;
      var start=performance.now(), dur=1200;
      function step(now){
        if(userScrolled) return;
        var p=Math.min(1,(now-start)/dur);
        var e=p<0.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
        window.scrollTo(0,y0+diff*e);
        if(p<1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    },wait);
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
        scrollToCurrent();
      });
    }, 4000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
