/* V1.85 Excerpt-Format: nur Überschrift, Autor, Text. Gilt für bereinigte und für neue Roh-Dateien in texte/N.txt. */
(function(){
  var SERIES="Tādātmya Vedānta Vertiefung";
  function norm(s){ return String(s||"").replace(/\u00a0/g," ").replace(/\s+/g," ").trim(); }
  function fold(s){
    return norm(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
      .replace(/[\u2010-\u2015\-–—:.,;!?"„“”'’()]/g," ").replace(/[#*\u2192\u{1F449}\u{1F4E3}\u{1F338}\u2757\uFE0F]/gu,"").replace(/\s+/g," ").trim();
  }
  function isAuthorLine(t){ return /^(geschrieben|gesprochen) von\s+\S/i.test(t); }
  function isSeriesHeader(t, nr){
    /* wiederholte Kopfzeilen wie "Tādātmya Vedānta Vertiefung #18 (2/2)" oder "Sonderausgabe Tādātmya Vedānta #30 – … (1/2)" */
    if(t.length>140) return false;
    if(!/^(sonderausgabe\s+)?t[aā]d[aā]tmya\s+ved[aā]nta\b/i.test(t)) return false;
    if(!/#\s*\d+/.test(t)) return false;
    if(nr && !new RegExp("#\\s*"+nr+"\\b").test(t)) return false;
    return true;
  }
  function isMeta(t){
    return /^autor\s*:/i.test(t) || /^datum\s*:/i.test(t) || /^telegram\s*\/\s*mitschrift\s*:?$/i.test(t) ||
      /^mitschrift\s*:?$/i.test(t) || /^[-–—_=*·•]{3,}$/.test(t) || /^edited\s+\d/i.test(t) ||
      /^\u2014?you are receiving/i.test(t);
  }
  function isRecording(t){ return /^(link zur\s+)?aufzeichnung\b/i.test(t); }
  function cleanHeading(t){
    return norm(t).replace(/\s*\((teil\s*)?\d\s*\/\s*\d\)\s*$/i,"").replace(/\s+[—–-]\s+/g," – ").replace(/—/g,"–");
  }
  function subtitleOf(h){ var k=h.indexOf(" – "); return k>0 ? h.slice(k+3) : ""; }
  function defaultAuthor(L){
    var file=((L&&L.file)||"")+" "+((L&&L.titel)||"");
    if(/revatik/i.test(file)) return "gesprochen von Swami Revatikaanta";
    if(/mayuran|siddhanta for/i.test(file)) return "gesprochen von Pandit Mayuran";
    return "geschrieben von Hariharānanda";
  }
  function keepLine(line){
    var raw=String(line||"").replace(/[\u00a0\u202f\u2007]/g," ").replace(/[\u200b\ufe0f]/g,"").replace(/\u2011/g,"-").replace(/\s+$/,"");
    var t=raw.trim().replace(/[ \t]{2,}/g," ");
    if(/^\s{2,}[-•*]/.test(raw)) return "  "+t;
    return t;
  }
  function urlLine(t){
    var m=/^(https?:\/\/)([^\/\s?#]+)\S*$/i.exec(t);
    return m ? m[2].replace(/^www\./i,"") : null;
  }
  /* Rohtext oder bereinigter Text -> {heading, author, body} */
  function cleanExcerpt(raw, L, over){
    L=L||{}; over=over||{};
    var nr=L.nr||0;
    var lines=String(raw||"").replace(/\r\n?/g,"\n").split("\n");
    var i=0, t, heading="", author="";
    while(i<lines.length && !norm(lines[i])) i++;
    if(i<lines.length){ heading=cleanHeading(lines[i]); i++; }
    var j=i; while(j<lines.length && !norm(lines[j])) j++;
    if(j<lines.length && isAuthorLine(norm(lines[j]))){ author=norm(lines[j]); i=j+1; }
    if(over.heading) heading=over.heading;
    if(nr && heading && !/#\s*\d+/.test(heading)) heading=SERIES+" #"+nr+" – "+heading;
    if(!heading) heading = nr ? SERIES+" #"+nr : (L.titel||"Excerpt");
    var sub=fold(subtitleOf(heading)), hf=fold(heading), dropSub=false;
    var out=[], seen=0, m;
    for(; i<lines.length; i++){
      t=norm(lines[i]);
      if(!t){ if(out.length && out[out.length-1]!=="") out.push(""); continue; }
      if(/^autor\s*:/i.test(t)){ if(!author) author="geschrieben von "+t.replace(/^autor\s*:\s*/i,"").replace(/\s*\(.*\)\s*$/,""); continue; }
      if(isAuthorLine(t) && !seen){ if(!author) author=t; continue; }
      if(isMeta(t)) continue;
      if(isRecording(t)) break;                       /* ab hier nur Aufzeichnungs-Link, Termine, PS */
      if(/^weiter geht es\b/i.test(t)) break;
      if(isSeriesHeader(t, nr)) continue;
      if(fold(t)===hf) continue;
      if(sub && !dropSub && seen<8 && fold(t)===sub){ dropSub=true; continue; }
      if((m=urlLine(t))){ out.push(m); seen++; continue; }
      out.push(keepLine(lines[i]));
      seen++;
    }
    while(out.length && !out[0]) out.shift();
    while(out.length && !out[out.length-1]) out.pop();
    /* doppelte Absätze (identisch, > 60 Zeichen) nur einmal */
    var paras=out.join("\n").split(/\n{2,}/), keep=[], have={};
    paras.forEach(function(p){ var k=fold(p); if(k.length>60 && have[k]) return; have[k]=1; keep.push(p); });
    return { heading: heading, author: author || defaultAuthor(L), body: keep.join("\n\n") };
  }
  function toFileText(fmt){ return fmt.heading+"\n"+fmt.author+"\n\n"+fmt.body+"\n"; }
  function speakText(fmt){
    /* Zeilen ohne Satzzeichen (Zwischenüberschriften) bekommen eine Pause */
    var body=fmt.body.split("\n").map(function(l){ l=l.trim(); if(!l) return ""; return /[.!?:;,]$/.test(l) ? l : l+"."; }).join(" ");
    return fmt.heading+". "+fmt.author+". "+body;
  }
  function formatExcerpt(raw, L){
    var f=cleanExcerpt(raw, L);
    f.display=f.heading+"\n"+f.author+"\n\n"+f.body;
    f.speak=speakText(f);
    return f;
  }
  var api={ cleanExcerpt: cleanExcerpt, formatExcerpt: formatExcerpt, toFileText: toFileText, speakText: speakText };
  if(typeof module!=="undefined" && module.exports){ module.exports=api; }
  if(typeof window==="undefined") return;
  window.tvFormatExcerpt=formatExcerpt;

  function curLecture(){ try{ return (typeof sichtbar!=="undefined" && typeof i==="number" && i>=0) ? sichtbar[i] : null; }catch(e){ return null; } }
  var origShow=window.showSum;
  window.showSum=function(){
    if(typeof origShow!=="function") return;
    origShow.apply(this, arguments);
    var L=curLecture();
    window.tvExcerptSpeak="";
    var b0=document.getElementById("dlgB");
    if(b0) b0.removeAttribute("data-fmt");
    var a0=document.getElementById("dlgTags");
    if(a0) a0.textContent=defaultAuthor(L||{});          /* keine Hashtags im Excerpt-Fenster */
    var wait=function(){
      var body=document.getElementById("dlgB");
      if(!body) return;
      var raw=body.textContent||"";
      if(/wird geladen/i.test(raw)){ setTimeout(wait,80); return; }
      if(/Kein Text/i.test(raw)) return;
      var fmt=formatExcerpt(raw, curLecture()||L||{});
      window.tvExcerptSpeak=fmt.speak;
      var h=document.getElementById("dlgT");
      var a=document.getElementById("dlgTags");
      if(h) h.textContent=fmt.heading;
      if(a) a.textContent=fmt.author;
      body.textContent=fmt.body;
      body.setAttribute("data-fmt","185");
    };
    setTimeout(wait,30);
  };
})();
