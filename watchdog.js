/* [Grok-Bot] V1.95: Wächter gegen Aussetzer mitten im Vortrag.
   Prüft alle 3 s: Steht die Zeit 15 s still, obwohl der Ton laufen soll, wird die Quelle
   neu geladen (recoverPlayback aus app.js). Stoppt der Player unerwartet (nicht per Pause),
   wird alle 4 s neu gestartet. Hat app.js nach 3 Versuchen aufgegeben, versucht der Wächter
   es mit wachsendem Abstand (8–30 s) weiter, bis zu 12 Mal. Startablauf bleibt unverändert. */
(function(){
  if(window.__tvWatchdog) return; window.__tvWatchdog=1;
  var el=document.getElementById("a"); if(!el) return;
  var lastT=-1, since=Date.now(), pauseSince=0, want=false, giveups=0, nextTry=0;
  el.addEventListener("playing",function(){ want=true; giveups=0; nextTry=0; });
  el.addEventListener("ended",function(){ want=false; });
  function speaking(){ try{ return !!(window.speechSynthesis && (speechSynthesis.speaking||speechSynthesis.pending)); }catch(e){ return false; } }
  function errText(){ var e=document.getElementById("err"); return e?e.textContent:""; }
  function reload(why){
    try{ recoverDebounceUntil=0; }catch(e){}
    if(typeof recoverPlayback==="function") recoverPlayback(why);
  }
  setInterval(function(){
    var now=Date.now();
    var up=false; try{ up=userPaused; }catch(e){}
    if(up) want=false;
    if(!el.getAttribute("src") || up || el.ended || speaking()){ lastT=-1; since=now; pauseSince=0; return; }
    var dur=el.duration;
    if(isFinite(dur)&&dur>0&&el.currentTime>=dur-1){ lastT=-1; since=now; pauseSince=0; return; }
    if(!want) return;
    // app.js hat aufgegeben ("nochmal Play tippen") -> mit Abstand weiter versuchen
    if(/nochmal Play/.test(errText())){
      if(giveups>=12) return;
      if(!nextTry){ nextTry=now+Math.min(30000,(giveups+1)*8000); return; }
      if(now<nextTry) return;
      giveups++; nextTry=0;
      try{ recoverTries=0; }catch(e){}
      reload("watchdog-retry");
      since=now; lastT=-1;
      return;
    }
    if(el.paused){
      if(!pauseSince){ pauseSince=now; return; }
      if(now-pauseSince>=4000){
        pauseSince=now;
        var p=el.play();
        if(p&&p.catch)p.catch(function(){ reload("watchdog-pause"); });
      }
      return;
    }
    pauseSince=0;
    var t=el.currentTime;
    if(Math.abs(t-lastT)>0.05){ lastT=t; since=now; return; }
    if(now-since>=15000){ since=now; lastT=-1; reload("watchdog"); }
  },3000);
})();
