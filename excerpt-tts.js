(function(){
  var speaking=false;
  var queue=[];
  var VOICE_KEY="tvVoiceProfile";
  var PROFILES={
    ruhig:{label:"Sprecher 1 \u00b7 ruhig", rate:0.76, pitch:0.86, prefer:/stefan|conrad|markus|georg|klaus|andreas|male|m\u00e4nnlich/i},
    klar:{label:"Sprecher 2 \u00b7 klar", rate:0.84, pitch:0.96, prefer:/google|neural|natural|premium|anna|petra/i},
    warm:{label:"Sprecher 3 \u00b7 warm", rate:0.78, pitch:0.92, prefer:/katja|hedda|helena|ingrid|gisela|female|weiblich/i}
  };
  var SAY=[
    ["T\u0101d\u0101tmya Ved\u0101nta","Tadaatmja Wedaanta"],["Tadatmya Vedanta","Tadaatmja Wedaanta"],
    ["Hari Bhakta Samprad\u0101ya","Hari Bhakta Sampradaaja"],["Harihar\u0101nanda","Hariharaananda"],["Hariharananda","Hariharaananda"],
    ["Paramahamsa Vishwananda","Paramahamsa Wischwananda"],["Vishwananda","Wischwananda"],["Sahadevananda","Sahadewananda"],
    ["Revatikaanta","Rewatikaanta"],["Mayuran","Majuran"],["\u015ar\u012b Hari","Schrii Hari"],["Sri Hari","Schrii Hari"],
    ["Bhagav\u0101n","Bhagawaan"],["Bhagavan","Bhagawaan"],["N\u0101r\u0101ya\u1e47a","Naaraajana"],["Narayana","Naaraajana"],
    ["\u0100tm\u0101-\u015bakti","Aatmaa Schakti"],["M\u0101y\u0101-\u015bakti","Maajaa Schakti"],["J\u012bv\u0101tm\u0101","Dschiiwaatmaa"],
    ["Antahkarana","Antahkarana"],["Aha\u1e45k\u0101ra","Ahangkaara"],["Ahankara","Ahangkaara"],
    ["Pratyabhij\u00f1\u0101","Pratjabhidschnja"],["J\u00f1\u0101na-yoga","Gjaana Joga"],["Dhy\u0101na-yoga","Dhjaana Joga"],
    ["Karma-yoga","Karma Joga"],["Bhakti-yoga","Bhakti Joga"],["Pram\u0101\u1e47a","Pramaana"],["\u015aabda","Schabda"],
    ["\u015a\u0101stra","Schaastra"],["Avidy\u0101","Awidjaa"],["Avidya","Awidjaa"],["\u0100tm\u0101","Aatmaa"],["Atma","Aatmaa"],
    ["J\u012bva","Dschiiwa"],["Jiva","Dschiiwa"],["M\u0101y\u0101","Maajaa"],["Maya","Maajaa"],["\u015bakti","Schakti"],["Shakti","Schakti"],
    ["Citta","Tschitta"],["Siddh\u0101nta","Siddhaanta"],["Siddhanta","Siddhaanta"],["T\u0101d\u0101tmya","Tadaatmja"],["Tadatmya","Tadaatmja"],
    ["Ved\u0101nta","Wedaanta"],["Vedanta","Wedaanta"],["Guruji","Gurudschi"],["Rishi","Rischi"],["Satguru","Satguru"],
    ["\u015aiva","Schiwa"],["Shiva","Schiwa"],["Bhakti","Bhakti"],["Prema","Prema"],["Paramahamsa","Paramahamsa"]
  ];
  function speakReady(text){
    var t=String(text||"");
    t=t.replace(/#\s*(\d+)/g," Nummer $1 ").replace(/#/g,"");
    t=t.replace(/[\u2022\u25cf]/g,", ").replace(/[\u2013\u2014]/g,", ").replace(/\s+/g," ").trim();
    var i; for(i=0;i<SAY.length;i++){ t=t.replace(new RegExp(SAY[i][0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"), SAY[i][1]); }
    t=t.replace(/[\u0101\u0100]/g,"aa").replace(/[\u012b\u012a]/g,"ii").replace(/[\u016b\u016a]/g,"uu");
    t=t.replace(/[\u015b\u015a\u1e63\u1e62]/g,"sch");
    return t.replace(/\s+/g," ").trim();
  }
  function profileId(){ try{ var id=localStorage.getItem(VOICE_KEY); if(id&&PROFILES[id]) return id; }catch(e){} return "ruhig"; }
  function setProfile(id){ if(!PROFILES[id]) id="ruhig"; try{ localStorage.setItem(VOICE_KEY,id);}catch(e){} var sel=document.getElementById("voicePick"); if(sel) sel.value=id; }
  function deVoices(){
    var list=[]; try{ list=speechSynthesis.getVoices()||[]; }catch(e){ return []; }
    var out=[], i, v; for(i=0;i<list.length;i++){ v=list[i]; if(/^de/i.test(v.lang)||/german|deutsch/i.test(v.name)) out.push(v); } return out;
  }
  function pickVoice(prof){
    var de=deVoices(), i;
    if(prof&&prof.prefer){ for(i=0;i<de.length;i++){ if(prof.prefer.test(de[i].name)) return de[i]; } }
    for(i=0;i<de.length;i++){ if(/google|neural|natural|premium/i.test(de[i].name)) return de[i]; }
    return de[0]||null;
  }
  function fillSelect(){
    var sel=document.getElementById("voicePick"); if(!sel) return;
    if(sel.getAttribute("data-ready")!=="1"){
      sel.innerHTML="";
      ["ruhig","klar","warm"].forEach(function(id){ var o=document.createElement("option"); o.value=id; o.textContent=PROFILES[id].label; sel.appendChild(o); });
      sel.setAttribute("data-ready","1");
      sel.onchange=function(){ setProfile(sel.value); if(speaking){ stop(); start(); } };
    }
    sel.value=profileId();
  }
  function audioEl(){ return document.getElementById("a"); }
  function pauseLecture(){ var a=audioEl(); try{ if(a&&!a.paused) a.pause(); }catch(e){} }
  function lockPlayer(){
    pauseLecture();
    ["btnPlay","btnResume"].forEach(function(id){ var el=document.getElementById(id); if(el) el.disabled=true; });
    var err=document.getElementById("err"); if(err) err.textContent="Vortrag pausiert \u2014 Play nach dem Vorlesen.";
  }
  function unlockPlayer(){
    var p=document.getElementById("btnPlay"); if(p) p.disabled=false;
    var r=document.getElementById("btnResume"); if(r) r.disabled=false;
    var err=document.getElementById("err"); if(err&&/Vortrag pausiert/.test(err.textContent||"")) err.textContent="";
  }
  function blockIfSpeaking(name){
    var orig=window[name]; if(typeof orig!=="function") return;
    window[name]=function(){ if(speaking){ pauseLecture(); var err=document.getElementById("err"); if(err) err.textContent="Erst Vorlesen beenden (Stop), dann Play."; return; } return orig.apply(this, arguments); };
  }
  function btn(){ return document.getElementById("btnSpeakSum"); }
  function paint(){ var b=btn(); if(!b) return; b.textContent=speaking?"Stop":"Vorlesen"; b.classList.toggle("gold",speaking); }
  function stop(){ speaking=false; queue=[]; try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){} unlockPlayer(); paint(); }
  function chunks(text){
    var t=(text||"").replace(/\s+/g," ").trim(); if(!t) return [];
    var parts=[], rest=t, cut, slice;
    while(rest.length){
      if(rest.length<=180){ parts.push(rest); break; }
      slice=rest.slice(0,180);
      cut=Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "), slice.lastIndexOf("; "), slice.lastIndexOf(", "));
      if(cut<50) cut=slice.lastIndexOf(" "); if(cut<30) cut=180; else cut=cut+1;
      parts.push(rest.slice(0,cut).trim()); rest=rest.slice(cut).trim();
    }
    return parts;
  }
  function speakNext(){
    if(!speaking||!queue.length){ speaking=false; unlockPlayer(); paint(); return; }
    var prof=PROFILES[profileId()];
    var u=new SpeechSynthesisUtterance(queue.shift());
    u.lang="de-DE"; u.rate=prof.rate; u.pitch=prof.pitch;
    var v=pickVoice(prof); if(v) u.voice=v;
    u.onend=function(){ speakNext(); }; u.onerror=function(){ speakNext(); };
    speechSynthesis.speak(u);
  }
  function start(){
    if(!window.speechSynthesis){ var err=document.getElementById("err"); if(err) err.textContent="Dieser Browser kann nicht vorlesen."; return; }
    var t=window.tvExcerptSpeak||"";
    if(!t){ var h=document.getElementById("dlgT"); var au=document.getElementById("dlgTags"); var body=document.getElementById("dlgB"); t=[h&&h.textContent, au&&au.textContent, body&&body.textContent].filter(Boolean).join(". "); }
    t=(t||"").trim();
    if(!t||/wird geladen/i.test(t)||/Kein Text/i.test(t)){ var err2=document.getElementById("err"); if(err2) err2.textContent="Excerpt noch nicht geladen."; return; }
    stop(); queue=chunks(speakReady(t)); speaking=true; lockPlayer(); paint(); try{ speechSynthesis.resume(); }catch(e){} speakNext();
  }
  window.toggleExcerptSpeak=function(){ if(speaking) stop(); else start(); };
  var prevHide=window.hideSum;
  window.hideSum=function(){ stop(); if(typeof prevHide==="function") return prevHide.apply(this, arguments); };
  ["play","toggle","playNr","resumeNow","prev","next","playFromSession"].forEach(blockIfSpeaking);
  var a=audioEl(); if(a){ a.addEventListener("play", function(){ if(speaking){ try{ a.pause(); }catch(e){} } }); }
  document.addEventListener("visibilitychange", function(){ if(document.hidden) try{ speechSynthesis.pause(); }catch(e){} });
  if(window.speechSynthesis){ try{ speechSynthesis.onvoiceschanged=function(){ fillSelect(); }; }catch(e){} }
  fillSelect(); setTimeout(fillSelect,400); paint();
})();
