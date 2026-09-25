/* Live-Lautstärkenormierung: Compressor + langsames AGC.
   Dateien werden nicht umgeschrieben. Messung nur während des Hörens. */
(function(){
  var KEY="tv-vol-norm-v1";
  var GAIN_KEY="tv-vol-gain-v1";
  var TARGET=0.075;
  var MIN_G=0.45;
  var MAX_G=3.6;
  var ctx,src,comp,gain,ana,timer;
  var wired=false;
  var curGain=1;

  function enabled(){
    try{ return localStorage.getItem(KEY)!=="0"; }catch(e){ return true; }
  }
  function setEnabled(on){
    try{ localStorage.setItem(KEY,on?"1":"0"); }catch(e){}
    paint();
    applyMode();
  }
  function loadGains(){
    try{
      var raw=JSON.parse(localStorage.getItem(GAIN_KEY)||"{}");
      return raw && typeof raw==="object" ? raw : {};
    }catch(e){ return {}; }
  }
  function saveGain(file,g){
    if(!file) return;
    var m=loadGains();
    m[file]=Math.round(g*100)/100;
    try{ localStorage.setItem(GAIN_KEY,JSON.stringify(m)); }catch(e){}
  }
  function paint(){
    var b=document.getElementById("btnVolNorm");
    if(!b) return;
    var on=enabled();
    b.textContent=on?"Vol Norm an":"Vol Norm aus";
    b.classList.toggle("gold",on);
    b.setAttribute("aria-pressed",on?"true":"false");
    b.title=on?"Lautstärke-Angleich an":"Lautstärke-Angleich aus";
  }
  function ensureGraph(){
    var el=document.getElementById("a");
    if(!el) return false;
    if(wired){
      try{ if(ctx && ctx.state==="suspended") ctx.resume(); }catch(e){}
      return true;
    }
    try{
      var AC=window.AudioContext||window.webkitAudioContext;
      if(!AC) return false;
      ctx=new AC();
      src=ctx.createMediaElementSource(el);
      comp=ctx.createDynamicsCompressor();
      comp.threshold.value=-22;
      comp.knee.value=18;
      comp.ratio.value=4;
      comp.attack.value=0.04;
      comp.release.value=0.28;
      gain=ctx.createGain();
      gain.gain.value=1;
      ana=ctx.createAnalyser();
      ana.fftSize=2048;
      ana.smoothingTimeConstant=0.7;
      src.connect(comp);
      comp.connect(gain);
      gain.connect(ana);
      gain.connect(ctx.destination);
      wired=true;
      if(ctx.state==="suspended") ctx.resume();
      return true;
    }catch(e){
      wired=false;
      return false;
    }
  }
  function applyMode(){
    if(!wired || !comp || !gain) return;
    if(enabled()){
      try{
        comp.threshold.value=-22;
        comp.ratio.value=4;
      }catch(e){}
    }else{
      try{
        comp.threshold.value=0;
        comp.ratio.value=1;
        gain.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
        curGain=1;
      }catch(e){}
    }
  }
  function startAgc(){
    stopAgc();
    if(!enabled() || !ana) return;
    var buf=new Float32Array(ana.fftSize);
    timer=setInterval(function(){
      if(!enabled() || !ana || !gain) return;
      var a=document.getElementById("a");
      if(!a || a.paused) return;
      try{ ana.getFloatTimeDomainData(buf); }catch(e){ return; }
      var sum=0, i, v, peak=0;
      for(i=0;i<buf.length;i++){
        v=buf[i];
        sum+=v*v;
        if(v<0) v=-v;
        if(v>peak) peak=v;
      }
      var rms=Math.sqrt(sum/buf.length);
      if(rms<0.004) return;
      var want=TARGET/rms;
      if(peak*want>0.95) want=0.95/Math.max(peak,0.001);
      var next=curGain+(want-curGain)*0.08;
      if(next<MIN_G) next=MIN_G;
      if(next>MAX_G) next=MAX_G;
      curGain=next;
      try{ gain.gain.setTargetAtTime(next, ctx.currentTime, 0.12); }catch(e){}
      try{
        if(window.current && window.current.file) saveGain(window.current.file, next);
      }catch(e){}
    }, 220);
  }
  function stopAgc(){
    if(timer){ clearInterval(timer); timer=null; }
  }
  function onPlayStart(){
    if(!enabled()) return;
    if(!ensureGraph()) return;
    applyMode();
    try{
      var file=window.current && window.current.file;
      var saved=file ? loadGains()[file] : 0;
      if(saved && isFinite(saved)){
        curGain=Math.min(MAX_G, Math.max(MIN_G, saved));
        gain.gain.value=curGain;
      }
    }catch(e){}
    startAgc();
  }
  window.toggleVolNorm=function(){
    setEnabled(!enabled());
    if(enabled()){
      ensureGraph();
      applyMode();
      onPlayStart();
    }else{
      stopAgc();
      applyMode();
    }
  };
  window.tvVolNormOnPlay=onPlayStart;
  document.addEventListener("DOMContentLoaded", function(){
    paint();
    var a=document.getElementById("a");
    if(!a) return;
    a.addEventListener("play", onPlayStart);
    a.addEventListener("pause", stopAgc);
    a.addEventListener("ended", stopAgc);
  });
  if(document.readyState!=="loading"){
    paint();
    var a0=document.getElementById("a");
    if(a0){
      a0.addEventListener("play", onPlayStart);
      a0.addEventListener("pause", stopAgc);
      a0.addEventListener("ended", stopAgc);
    }
  }
})();
