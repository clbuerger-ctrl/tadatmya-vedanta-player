(function(){
  var u="https://cdn.jsdelivr.net/gh/clbuerger-ctrl/tadatmya-vedanta-player@77166e502246178b87e86bf751eb86e63fd12796/app.js";
  fetch(u,{cache:"no-store"}).then(function(r){return r.text();}).then(function(code){
    if(!code||code.indexOf("function zeichne")<0){ throw new Error("bad"); }
    code=code.replace(
      /a\.addEventListener\("ended",function\(\)\{[\s\S]*?\}\);/,
      'a.addEventListener("ended",function(){ var doneFile=(i>=0&&sichtbar[i])?sichtbar[i].file:""; if(doneFile) markDone(doneFile); localStorage.setItem(STORE,JSON.stringify({file:doneFile,time:0})); started=false;syncSkipBtns();updateResume(); next(); if(doneFile) markDone(doneFile); zeichne(); });'
    );
    (0,eval)(code);
  }).catch(function(){
    var e=document.getElementById("err");
    if(e) e.textContent="Liste: Notfall-Nachladen fehlgeschlagen — Seite neu laden.";
  });
})();
