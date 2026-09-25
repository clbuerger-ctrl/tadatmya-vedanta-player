(function(){
  var speaking=false;
  var queue=[];

  function btn(){ return document.getElementById("btnSpeakSum"); }
  function paint(){
    var b=btn();
    if(!b) return;
    b.textContent=speaking?"Stop":"Vorlesen";
    b.classList.toggle("gold",speaking);
  }
  function stop(){
    speaking=false;
    queue=[];
    try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    paint();
  }
  function pickVoice(){
    var list=[];
    try{ list=speechSynthesis.getVoices()||[]; }catch(e){ return null; }
    var i, v, de=[];
    for(i=0;i<list.length;i++){
      v=list[i];
      if(/^de/i.test(v.lang)) de.push(v);
    }
    for(i=0;i<de.length;i++){ if(/google|premium|neural|natural/i.test(de[i].name)) return de[i]; }
    return de[0]||null;
  }
  function chunks(text){
    var t=(text||"").replace(/\s+/g," ").trim();
    if(!t) return [];
    var parts=[], rest=t, cut, slice;
    while(rest.length){
      if(rest.length<=220){ parts.push(rest); break; }
      slice=rest.slice(0,220);
      cut=Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "), slice.lastIndexOf("; "), slice.lastIndexOf(", "));
      if(cut<60) cut=slice.lastIndexOf(" ");
      if(cut<40) cut=220;
      else cut=cut+1;
      parts.push(rest.slice(0,cut).trim());
      rest=rest.slice(cut).trim();
    }
    return parts;
  }
  function speakNext(){
    if(!speaking || !queue.length){
      speaking=false;
      paint();
      return;
    }
    var u=new SpeechSynthesisUtterance(queue.shift());
    u.lang="de-DE";
    u.rate=0.95;
    var v=pickVoice();
    if(v) u.voice=v;
    u.onend=function(){ speakNext(); };
    u.onerror=function(){ speakNext(); };
    speechSynthesis.speak(u);
  }
  function start(){
    if(!window.speechSynthesis){
      var err=document.getElementById("err");
      if(err) err.textContent="Dieser Browser kann nicht vorlesen.";
      return;
    }
    var body=document.getElementById("dlgB");
    var t=body ? (body.textContent||"").trim() : "";
    if(!t || /wird geladen/i.test(t) || /Kein Text/i.test(t)){
      var err2=document.getElementById("err");
      if(err2) err2.textContent="Excerpt noch nicht geladen.";
      return;
    }
    try{
      var a=document.getElementById("a");
      if(a && !a.paused) a.pause();
    }catch(e){}
    stop();
    queue=chunks(t);
    speaking=true;
    paint();
    try{ speechSynthesis.resume(); }catch(e){}
    speakNext();
  }
  window.toggleExcerptSpeak=function(){
    if(speaking) stop();
    else start();
  };
  var prevHide=window.hideSum;
  window.hideSum=function(){
    stop();
    if(typeof prevHide==="function") return prevHide.apply(this, arguments);
  };
  document.addEventListener("visibilitychange", function(){
    if(document.hidden) try{ speechSynthesis.pause(); }catch(e){}
  });
  if(window.speechSynthesis){
    try{ speechSynthesis.onvoiceschanged=function(){}; }catch(e){}
  }
  paint();
})();
