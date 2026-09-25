(function(){
  var speaking=false;
  var queue=[];

  /* Deutsche Lautschrift für Browser-Stimmen. Längste Formen zuerst. */
  var SAY=[
    ["Tādātmya Vedānta","Ta-daat-mja We-daan-ta"],
    ["Tadatmya Vedanta","Ta-daat-mja We-daan-ta"],
    ["Tādātmya-Vedānta","Ta-daat-mja We-daan-ta"],
    ["Tādātmya-Anubhava","Ta-daat-mja A-nu-bha-wa"],
    ["Tadatmya-Anubhava","Ta-daat-mja A-nu-bha-wa"],
    ["Hari Bhakta Sampradāya","Ha-ri Bhak-ti Sam-pra-daa-ja"],
    ["Hari Bhakta Sampradaya","Ha-ri Bhak-ti Sam-pra-daa-ja"],
    ["Paramahamsa","Pa-ra-ma-ham-sa"],
    ["Vishwananda","Wisch-wa-nan-da"],
    ["Viśwananda","Wisch-wa-nan-da"],
    ["Sahadevananda","Sa-ha-de-wa-nan-da"],
    ["Revatikaanta","Re-wa-ti-kaan-ta"],
    ["Revatikanta","Re-wa-ti-kaan-ta"],
    ["Mayuran","Ma-ju-ran"],
    ["Tādātmya","Ta-daat-mja"],
    ["Tadatmya","Ta-daat-mja"],
    ["Vedānta","We-daan-ta"],
    ["Vedanta","We-daan-ta"],
    ["Siddhānta","Sid-dhaan-ta"],
    ["Siddhanta","Sid-dhaan-ta"],
    ["Sampradāya","Sam-pra-daa-ja"],
    ["Sampradaya","Sam-pra-daa-ja"],
    ["Śrī Hari","Schrii Ha-ri"],
    ["Sri Hari","Schrii Ha-ri"],
    ["Śrī Kṛṣṇa","Schrii Krish-na"],
    ["Bhagavān","Bha-ga-waan"],
    ["Bhagavan","Bha-ga-waan"],
    ["Nārāyaṇa","Naa-raa-ja-na"],
    ["Narayana","Naa-raa-ja-na"],
    ["Kṛṣṇa","Krish-na"],
    ["Krishna","Krish-na"],
    ["Caitanya","Tschai-tan-ja"],
    ["Satguru","Sat-gu-ru"],
    ["Ācārya","Aa-tschaar-ja"],
    ["Acharya","Aa-tschaar-ja"],
    ["Ātmā-śakti","Aat-maa Schak-ti"],
    ["Atma-Shakti","Aat-maa Schak-ti"],
    ["Māyā-śakti","Maa-jaa Schak-ti"],
    ["Maya-Shakti","Maa-jaa Schak-ti"],
    ["Ātmā","Aat-maa"],
    ["Atma","Aat-maa"],
    ["Jīvātmā","Dschii-waat-maa"],
    ["Jivatma","Dschii-waat-maa"],
    ["Jīva","Dschii-wa"],
    ["Jiva","Dschii-wa"],
    ["Avidyā","A-wid-jaa"],
    ["Avidya","A-wid-jaa"],
    ["Vidyā","Wid-jaa"],
    ["Bhakti","Bhak-ti"],
    ["Prema","Pre-ma"],
    ["Māyā","Maa-jaa"],
    ["Maya","Maa-jaa"],
    ["Prakṛti","Pra-kri-ti"],
    ["Prakriti","Pra-kri-ti"],
    ["Antaḥkaraṇa","An-tah-ka-ra-na"],
    ["Antahkarana","An-tah-ka-ra-na"],
    ["Ahaṅkāra","A-hang-kaa-ra"],
    ["Ahankara","A-hang-kaa-ra"],
    ["Buddhi","Bud-dhi"],
    ["Manas","Ma-nas"],
    ["Citta","Tschit-ta"],
    ["Citti","Tschit-ti"],
    ["Pramāṇa","Pra-maa-na"],
    ["Pramana","Pra-maa-na"],
    ["Pratyakṣa","Prat-jak-scha"],
    ["Anumāna","A-nu-maa-na"],
    ["Śbda","Schab-da"],
    ["Sabda","Schab-da"],
    ["Śruti","Schru-ti"],
    ["Sruti","Schru-ti"],
    ["Śāstra","Schaas-tra"],
    ["Sastra","Schaas-tra"],
    ["Smṛti","Smri-ti"],
    ["Anubhava","A-nu-bha-wa"],
    ["Pratyabhijñā"," Prat-ja-bhidsch-nja"],
    ["Pratyabhijna","Prat-ja-bhidsch-nja"],
    ["Upādhi","U-paa-dhi"],
    ["Pratibimba","Pra-ti-bim-ba"],
    ["Bimba","Bim-ba"],
    ["śakti","Schak-ti"],
    ["Shakti","Schak-ti"],
    ["Guṇa","Gu-na"],
    ["Guna","Gu-na"],
    ["Sattva","Sat-twa"],
    ["Rajas","Ra-dschas"],
    ["Tamas","Ta-mas"],
    ["Vyūha","Wjuu-ha"],
    ["Vyuha","Wjuu-ha"],
    ["Ādi-puruṣa","Aa-di Pu-ru-scha"],
    ["Adi-purusa","Aa-di Pu-ru-scha"],
    ["Antaryāmī","An-tar-jaa-mii"],
    ["Sadāśiva","Sa-daa-schi-wa"],
    ["Sadasiva","Sa-daa-schi-wa"],
    ["Vaiṣṇava","Waish-na-wa"],
    ["Vaishnava","Waish-na-wa"],
    ["Mukhyārtha","Muk-hjaar-tha"],
    ["Lakṣaṇā","Lak-scha-naa"],
    ["Laksana","Lak-scha-naa"],
    ["Niṣkāma","Nisch-kaa-ma"],
    ["Niskama","Nisch-kaa-ma"],
    ["Jñāna","Gjaa-na"],
    ["Jnana","Gjaa-na"],
    ["Dhyāna","Dhjaa-na"],
    ["Dhyana","Dhjaa-na"],
    ["Karma-yoga","Kar-ma Jo-ga"],
    ["Bhakti-yoga","Bhak-ti Jo-ga"],
    ["Guruji","Gu-ru-dschi"],
    ["Rishi","Ri-schi"],
    ["Ṛṣi","Ri-schi"]
  ];

  function phonetic(text){
    var t=text||"";
    var i;
    for(i=0;i<SAY.length;i++){
      t=t.replace(new RegExp(SAY[i][0].replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi"), SAY[i][1]);
    }
    t=t.replace(/[āĀ]/g,"aa").replace(/[īĪ]/g,"ii").replace(/[ūŪ]/g,"uu");
    t=t.replace(/[śŚṣṢ]/g,"sch").replace(/[ṇṆ]/g,"n").replace(/[ṛṚ]/g,"ri");
    return t;
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
    u.rate=0.88;
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
    queue=chunks(phonetic(t));
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
