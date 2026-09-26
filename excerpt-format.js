(function(){
  function norm(s){
    return (s||"").replace(/\u00a0/g," ").replace(/\s+/g," ").trim();
  }
  function fold(s){
    return norm(s).toLowerCase()
      .replace(/[\u0101]/g,"a").replace(/[ī]/g,"i").replace(/[ū]/g,"u")
      .replace(/[śṣ]/g,"s").replace(/[ṇ]/g,"n").replace(/[ṛ]/g,"r")
      .replace(/[#*—–→👉📣🌸]/g,"");
  }
  function skipLine(line){
    var t=norm(line);
    if(!t) return true;
    if(/^autor\s*:/i.test(t)) return true;
    if(/^datum\s*:/i.test(t)) return true;
    if(/^telegram/i.test(t)) return true;
    if(/^mitschrift\s*:/i.test(t)) return true;
    if(/^inhalt\s*:/i.test(t)) return true;
    if(/^link\b/i.test(t)) return true;
    if(/^https?:\/\//i.test(t)) return true;
    if(/youtube\.com|youtu\.be/i.test(t)) return true;
    if(/^weiter geht es/i.test(t)) return true;
    if(/^wann\s*\?/i.test(t)) return true;
    if(/^wie kannst du teilnehmen/i.test(t)) return true;
    if(/^aufzeichnung/i.test(t)) return true;
    if(/^\u2014you are receiving/i.test(t)) return true;
    if(/^[📣🌸]/u.test(t) && /livestream|youtube|20:00/i.test(t)) return true;
    return false;
  }
  function headingOf(raw, L){
    var lines=(raw||"").replace(/\r\n/g,"\n").split("\n");
    var i, t;
    for(i=0;i<lines.length;i++){
      t=norm(lines[i]);
      if(!t || skipLine(t)) continue;
      if(/tādātmya|tadatmya|vertiefung|sonderausgabe|einführung/i.test(t)) return t.replace(/—/g,"–");
    }
    if(L && L.nr) return "Tādātmya Vedānta Vertiefung #"+L.nr+(L.titel?" – "+L.titel:"");
    return L && L.titel ? L.titel : "Excerpt";
  }
  function authorOf(raw, L){
    var file=((L&&L.file)||"")+" "+((L&&L.titel)||"");
    if(/revatik/i.test(file)) return "Swami Revatikaanta";
    if(/mayuran|siddhanta for/i.test(file)) return "Pandit Mayuran";
    return "Hariharānanda";
  }
  function bodyOf(raw, heading){
    var lines=(raw||"").replace(/\r\n/g,"\n").split("\n");
    var h=fold(heading);
    var out=[], i, t, f, seen=false;
    for(i=0;i<lines.length;i++){
      t=norm(lines[i]);
      if(!t){ if(out.length && out[out.length-1]!=="") out.push(""); continue; }
      if(skipLine(t)) continue;
      f=fold(t);
      if(h && (f===h || h.indexOf(f)===0 && f.length>12 || f.indexOf(h)===0 && h.length>12)){
        if(!seen){ seen=true; continue; }
        continue;
      }
      if(/^tādātmya vedānta vertiefung #\d+\s*$/i.test(t)) continue;
      out.push(t);
    }
    while(out.length && !out[0]) out.shift();
    while(out.length && !out[out.length-1]) out.pop();
    var text=out.join("\n").replace(/\n{3,}/g,"\n\n");
    return text;
  }
  function formatExcerpt(raw, L){
    var heading=headingOf(raw, L);
    var author=authorOf(raw, L);
    var body=bodyOf(raw, heading);
    return {
      heading: heading,
      author: author,
      body: body,
      display: heading+"\n"+author+"\n\n"+body,
      speak: heading+". "+author+". "+body
    };
  }
  window.tvFormatExcerpt=formatExcerpt;

  var origShow=window.showSum;
  window.showSum=function(){
    if(typeof origShow!=="function") return;
    origShow.apply(this, arguments);
    var L=null;
    try{ L=(typeof sichtbar!=="undefined" && typeof i==="number" && i>=0)?sichtbar[i]:null; }catch(e){}
    var wait=function(){
      var body=document.getElementById("dlgB");
      if(!body) return;
      var raw=body.textContent||"";
      if(/wird geladen/i.test(raw)){ setTimeout(wait,80); return; }
      if(/Kein Text/i.test(raw)) return;
      var cur=null;
      try{ cur=(typeof sichtbar!=="undefined" && typeof i==="number" && i>=0)?sichtbar[i]:null; }catch(e){}
      var fmt=formatExcerpt(raw, cur||L||{});
      window.tvExcerptSpeak=fmt.speak;
      var h=document.getElementById("dlgT");
      var a=document.getElementById("dlgTags");
      if(h) h.textContent=fmt.heading;
      if(a) a.textContent=fmt.author;
      body.textContent=fmt.body;
    };
    setTimeout(wait,30);
  };
})();
