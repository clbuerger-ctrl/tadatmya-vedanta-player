(function(){
  var speaking=false;
  var queue=[];
  var SAY=[
    ["T\u0101d\u0101tmya Ved\u0101nta","Tadaatmja Wedaanta"],
    ["Tadatmya Vedanta","Tadaatmja Wedaanta"],
    ["T\u0101d\u0101tmya-Ved\u0101nta","Tadaatmja Wedaanta"],
    ["T\u0101d\u0101tmya-Anubhava","Tadaatmja Anubhawa"],
    ["Hari Bhakta Samprad\u0101ya","Hari Bhakta Sampradaaja"],
    ["Hari Bhakta Sampradaya","Hari Bhakta Sampradaaja"],
    ["Harihar\u0101nanda","Hariharaananda"],
    ["Hariharananda","Hariharaananda"],
    ["Paramahamsa Sri Swami Vishwananda","Paramahamsa Schrii Swami Wischwananda"],
    ["Paramahamsa Vishwananda","Paramahamsa Wischwananda"],
    ["Vishwananda","Wischwananda"],
    ["Sahadevananda","Sahadewananda"],
    ["Revatikaanta","Rewatikaanta"],
    ["Revatikanta","Rewatikaanta"],
    ["Mayuran","Majuran"],
    ["\u015ar\u012b Hari","Schrii Hari"],
    ["Sri Hari","Schrii Hari"],
    ["\u015ar\u012b K\u1e5b\u1e63\u1e47a","Schrii Krishna"],
    ["Bhagav\u0101n","Bhagawaan"],
    ["Bhagavan","Bhagawaan"],
    ["N\u0101r\u0101ya\u1e47a","Naaraajana"],
    ["Narayana","Naaraajana"],
    ["\u0100tm\u0101-\u015bakti","Aatmaa Schakti"],
    ["Atma-Shakti","Aatmaa Schakti"],
    ["M\u0101y\u0101-\u015bakti","Maajaa Schakti"],
    ["Maya-Shakti","Maajaa Schakti"],
    ["J\u012bv\u0101tm\u0101","Dschiiwaatmaa"],
    ["Jivatma","Dschiiwaatmaa"],
    ["Anta\u1e25kara\u1e47a","Antahkarana"],
    ["Antahkarana","Antahkarana"],
    ["Aha\u1e45k\u0101ra","Ahangkaara"],
    ["Ahankara","Ahangkaara"],
    ["Pratyabhij\u00f1\u0101","Pratjabhidschnja"],
    ["Pratyabhijna","Pratjabhidschnja"],
    ["\u0100di-puru\u1e63a","Aadi Puruscha"],
    ["Sad\u0101\u015biva","Sadaaschiwa"],
    ["Antary\u0101m\u012b","Antarjaamii"],
    ["Lak\u1e63a\u1e47\u0101","Lakschanaa"],
    ["Ni\u1e63k\u0101ma","Nischkaama"],
    ["J\u00f1\u0101na-yoga","Gjaana Joga"],
    ["Dhy\u0101na-yoga","Dhjaana Joga"],
    ["Karma-yoga","Karma Joga"],
    ["Bhakti-yoga","Bhakti Joga"],
    ["Prakara\u1e47a","Prakarana"],
    ["Param\u0101rtha","Paramaartha"],
    ["Up\u0101ya","Upaaja"],
    ["Tattva","Tattwa"],
    ["\u015aabda-pram\u0101\u1e47a","Schabda Pramaana"],
    ["Pratyak\u1e63a","Pratjakscha"],
    ["Anum\u0101na","Anumaana"],
    ["Pram\u0101\u1e47a","Pramaana"],
    ["Pramana","Pramaana"],
    ["\u015aabda","Schabda"],
    ["\u015aruti","Schrutti"],
    ["\u015a\u0101stra","Schaastra"],
    ["Anubhava","Anubhawa"],
    ["Up\u0101dhi","Upaadhi"],
    ["Pratibimba","Pratibimba"],
    ["Vy\u016bha","Wjuuha"],
    ["Vai\u1e63\u1e47ava","Waishnawa"],
    ["Vaishnava","Waishnawa"],
    ["J\u00f1\u0101na","Gjaana"],
    ["Jnana","Gjaana"],
    ["Dhy\u0101na","Dhjaana"],
    ["Avidy\u0101","Awidjaa"],
    ["Avidya","Awidjaa"],
    ["Vidy\u0101","Widjaa"],
    ["\u0100tm\u0101","Aatmaa"],
    ["Atma","Aatmaa"],
    ["J\u012bva","Dschiiwa"],
    ["Jiva","Dschiiwa"],
    ["M\u0101y\u0101","Maajaa"],
    ["Maya","Maajaa"],
    ["Prak\u1e5bti","Prakriti"],
    ["\u015bakti","Schakti"],
    ["Shakti","Schakti"],
    ["Citta","Tschitta"],
    ["Siddh\u0101nta","Siddhaanta"],
    ["Siddhanta","Siddhaanta"],
    ["Samprad\u0101ya","Sampradaaja"],
    ["T\u0101d\u0101tmya","Tadaatmja"],
    ["Tadatmya","Tadaatmja"],
    ["Ved\u0101nta","Wedaanta"],
    ["Vedanta","Wedaanta"],
    ["K\u1e5b\u1e63\u1e47a","Krishna"],
    ["Caitanya","Tschaitanja"],
    ["Satguru","Satguru"],
    ["\u0100c\u0101rya","Aatschaarja"],
    ["Guruji","Gurudschi"],
    ["Rishi","Rischi"],
    ["\u015aiva","Schiwa"],
    ["Shiva","Schiwa"],
    ["Vi\u1e63\u1e47u","Wischnu"],
    ["Vishnu","Wischnu"],
    ["Paramahamsa","Paramahamsa"],
    ["Bhakti","Bhakti"],
    ["Prema","Prema"]
  ];
  function speakReady(text){
    var t=String(text||"");
    t=t.replace(/#\s*(\d+)/g," Nummer $1 ");
    t=t.replace(/#/g,"");
    t=t.replace(/[\u2022\u25cf\u25e6]/g,", ");
    t=t.replace(/[\u2013\u2014]/g,", ");
    t=t.replace(/\s+/g," ").trim();
    var i;
    for(i=0;i<SAY.length;i++){
      t=t.replace(new RegExp(SAY[i][0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"), SAY[i][1]);
    }
    t=t.replace(/[\u0101\u0100]/g,"aa").replace(/[\u012b\u012a]/g,"ii").replace(/[\u016b\u016a]/g,"uu");
    t=t.replace(/[\u015b\u015a\u1e63\u1e62]/g,"sch").replace(/[\u00f1\u00d1]/g,"nj").replace(/[\u1e47\u1e46\u1e45\u1e44]/g,"n");
    t=t.replace(/[\u1e5b\u1e5a]/g,"ri").replace(/[\u1e43\u1e42\u1e41]/g,"m").replace(/[\u1e25\u1e24]/g,"h");
    return t.replace(/\s+/g," ").trim();
  }
  function audioEl(){ return document.getElementById("a"); }
  function pauseLecture(){
    var a=audioEl();
    try{ if(a && !a.paused) a.pause(); }catch(e){}
  }
  function lockPlayer(){
    pauseLecture();
    ["btnPlay","btnResume"].forEach(function(id){
      var el=document.getElementById(id); if(el) el.disabled=true;
    });
    var err=document.getElementById("err");
    if(err) err.textContent="Vortrag pausiert \u2014 Play nach dem Vorlesen.";
  }
  function unlockPlayer(){
    var p=document.getElementById("btnPlay"); if(p) p.disabled=false;
    var r=document.getElementById("btnResume"); if(r) r.disabled=false;
    var err=document.getElementById("err");
    if(err && /Vortrag pausiert/.test(err.textContent||"")) err.textContent="";
  }
  function blockIfSpeaking(name){
    var orig=window[name];
    if(typeof orig!=="function") return;
    window[name]=function(){
      if(speaking){
        pauseLecture();
        var err=document.getElementById("err");
        if(err) err.textContent="Erst Vorlesen beenden (Stop), dann Play.";
        return;
      }
      return orig.apply(this, arguments);
    };
  }
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
    unlockPlayer();
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
    for(i=0;i<de.length;i++){ if(/helena|katja|anna|petra|conrad|stefan/i.test(de[i].name)) return de[i]; }
    return de[0]||null;
  }
  function chunks(text){
    var t=(text||"").replace(/\s+/g," ").trim();
    if(!t) return [];
    var parts=[], rest=t, cut, slice;
    while(rest.length){
      if(rest.length<=180){ parts.push(rest); break; }
      slice=rest.slice(0,180);
      cut=Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "), slice.lastIndexOf("; "), slice.lastIndexOf(", "));
      if(cut<50) cut=slice.lastIndexOf(" ");
      if(cut<30) cut=180; else cut=cut+1;
      parts.push(rest.slice(0,cut).trim());
      rest=rest.slice(cut).trim();
    }
    return parts;
  }
  function speakNext(){
    if(!speaking || !queue.length){
      speaking=false; unlockPlayer(); paint(); return;
    }
    var u=new SpeechSynthesisUtterance(queue.shift());
    u.lang="de-DE"; u.rate=0.86; u.pitch=1;
    var v=pickVoice(); if(v) u.voice=v;
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
    var t=window.tvExcerptSpeak||"";
    if(!t){
      var h=document.getElementById("dlgT");
      var au=document.getElementById("dlgTags");
      var body=document.getElementById("dlgB");
      t=[h&&h.textContent, au&&au.textContent, body&&body.textContent].filter(Boolean).join(". ");
    }
    t=(t||"").trim();
    if(!t || /wird geladen/i.test(t) || /Kein Text/i.test(t)){
      var err2=document.getElementById("err");
      if(err2) err2.textContent="Excerpt noch nicht geladen.";
      return;
    }
    stop();
    queue=chunks(speakReady(t));
    speaking=true; lockPlayer(); paint();
    try{ speechSynthesis.resume(); }catch(e){}
    speakNext();
  }
  window.toggleExcerptSpeak=function(){ if(speaking) stop(); else start(); };
  var prevHide=window.hideSum;
  window.hideSum=function(){ stop(); if(typeof prevHide==="function") return prevHide.apply(this, arguments); };
  ["play","toggle","playNr","resumeNow","prev","next","playFromSession"].forEach(blockIfSpeaking);
  var a=audioEl();
  if(a){ a.addEventListener("play", function(){ if(speaking){ try{ a.pause(); }catch(e){} } }); }
  document.addEventListener("visibilitychange", function(){ if(document.hidden) try{ speechSynthesis.pause(); }catch(e){} });
  if(window.speechSynthesis){ try{ speechSynthesis.onvoiceschanged=function(){}; }catch(e){} }
  paint();
})();
