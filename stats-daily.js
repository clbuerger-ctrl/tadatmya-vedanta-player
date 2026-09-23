/* V1.66: cumulative daily stats override (after feedback.js) */
// STATS_START: earliest day key for cumulative Monat/gesamt (player counters from Sep 2026)
var STATS_START="2026-09-01";
function pad2(n){return String(n).padStart(2,"0");}
function ymd(){const d=new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
function ym(){return ymd().slice(0,7);}
function parseYmd(s){const p=String(s||"").split("-");return new Date(+p[0],(+p[1]||1)-1,+p[2]||1);}
function fmtYmd(d){return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
function daysInMonth(year, month){return new Date(year, month, 0).getDate();}
function listDays(fromYmd, toYmd){
  const out=[];
  let cur=parseYmd(fromYmd);
  const end=parseYmd(toYmd);
  if(isNaN(cur.getTime())||isNaN(end.getTime())||cur>end) return out;
  while(cur<=end){
    out.push(fmtYmd(cur));
    cur.setDate(cur.getDate()+1);
  }
  return out;
}
function sumCountKeys(keys){
  const BATCH=10;
  let i=0, sum=0;
  function next(){
    if(i>=keys.length) return Promise.resolve(sum);
    const batch=keys.slice(i, i+BATCH);
    i+=BATCH;
    return Promise.all(batch.map(function(k){return countGet(k);})).then(function(vals){
      for(let j=0;j<vals.length;j++) sum+=(+vals[j]||0);
      return next();
    });
  }
  return next();
}
function sumDayPrefix(prefix, fromYmd, toYmd){
  return sumCountKeys(listDays(fromYmd, toYmd).map(function(d){return CK+prefix+d;}));
}
function countHit(key){return fetch(COUNT_API+"/hit/"+encodeURIComponent(key)).then(function(r){return r.json();}).then(function(j){return +j.value||0;}).catch(function(){return 0;});}
function countGet(key){return fetch(COUNT_API+"/get/"+encodeURIComponent(key)).then(function(r){return r.ok?r.json():{value:0};}).then(function(j){return +j.value||0;}).catch(function(){return 0;});}
function countSet(key,val){return fetch(COUNT_API+"/set/"+encodeURIComponent(key)+"?value="+encodeURIComponent(val)).then(function(r){return r.json();}).then(function(j){return +j.value||val;}).catch(function(){return val;});}
function fmtMinOnly(min){min=Math.max(0,Math.round(min||0));return min+" min";}
function fmtHours(min){min=Math.max(0,min||0);const h=min/60;if(h<10)return (Math.round(h*10)/10)+" h";return Math.round(h)+" h";}
function fmtMHD(min){min=Math.max(0,Math.round(min||0));const d=Math.floor(min/1440);min-=d*1440;const h=Math.floor(min/60);min-=h*60;const p=[];if(d)p.push(d+" d");if(h)p.push(h+" h");if(min||!p.length)p.push(min+" min");return p.join(" ");}
function drawStats(){
  let box=document.getElementById("tv-stats");
  if(!box){
    const st=document.createElement("style");
    st.textContent="#tv-stats{font-size:.68rem;color:#cbb89a;line-height:1.35;text-align:right;padding:4px 12px 6px;margin:0}";
    document.head.appendChild(st);
    box=document.createElement("div"); box.id="tv-stats";
    const foot=document.querySelector("footer.fb");
    if(foot) foot.appendChild(box); else document.body.appendChild(box);
  }
  const dayN=TVS.day==null?null:(+TVS.day||0);
  const monN=TVS.month==null?null:Math.max(+TVS.month||0, dayN||0);
  const totN=TVS.total==null?null:Math.max(+TVS.total||0, monN||0, dayN||0);
  const d=dayN==null?"—":dayN;
  const m=monN==null?"—":monN;
  const t=totN==null?"—":totN;
  const dmin=+TVS.dmin||0;
  const mmin=Math.max(+TVS.mmin||0, dmin);
  const tmin=Math.max(+TVS.tmin||0, mmin);
  let html="Aufrufe: heute "+d+", Monat "+m+" = gesamt "+t;
  html+="<br>Hörzeit: heute "+fmtMinOnly(dmin)+", Monat "+fmtHours(mmin)+" = gesamt "+fmtMHD(tmin);
  if(TVS.oday!=null){
    const od=+TVS.oday||0;
    const om=Math.max(+TVS.omon||0, od);
    const ot=Math.max(+TVS.otot||0, om);
    html+="<br>Orte: heute "+od+", Monat "+om+" = gesamt "+ot;
    html+='<span id="tv-live-slot"></span>';
  }
  box.innerHTML=html;
  if(typeof window.__tvLivePaint==="function") try{ window.__tvLivePaint(); }catch(e){}
  if(typeof ensureCredit==="function") try{ ensureCredit(); }catch(e){}
}
function hookListenTime(){
  const a=document.getElementById("a");
  if(!a||a.__tvListen) return;
  a.__tvListen=1;
  a.addEventListener("timeupdate",function(){
    if(a.paused){ TVS.last=0; return; }
    const now=Date.now();
    if(TVS.last){
      const add=Math.min(2.5,(now-TVS.last)/1000);
      // only accumulate today's local minutes; Monat/gesamt come from day sums
      if(add>0){ TVS.acc+=add; TVS.dmin+=add/60; }
    }
    TVS.last=now;
    if(TVS.acc>=60){
      TVS.acc-=60;
      countHit(CK+"min-"+ymd()).then(function(v){
        TVS.dmin=Math.max(TVS.dmin, v||0);
        // each persisted minute also advances cumulative month/total by 1
        TVS.mmin=Math.max((+TVS.mmin||0)+1, TVS.dmin);
        TVS.tmin=Math.max((+TVS.tmin||0)+1, TVS.mmin);
        drawStats();
      });
    }
    drawStats();
  });
  a.addEventListener("pause",function(){ TVS.last=0; });
}
function hashStr(s){s=String(s||"");let h=5381;for(let i=0;i<s.length;i++)h=((h<<5)+h)+s.charCodeAt(i);return (h>>>0).toString(16);}
function bumpUnique(periodKey, firstKey){
  return countHit(firstKey).then(function(v){
    if(v===1) return countHit(periodKey);
    return countGet(periodKey);
  });
}
function countPlaces(){
  fetch("https://get.geojs.io/v1/ip/geo.json").then(function(r){return r.json();}).then(function(g){
    const ip=g&&g.ip;
    if(!ip) return;
    const h=hashStr(ip);
    TVS.place=[g.city,g.country].filter(Boolean).join(", ");
    const today=ymd();
    const monStart=today.slice(0,7)+"-01";
    // only daily unique; Monat/gesamt = sum of daily ips-* (same IP on multiple days counts multiple times)
    bumpUnique(CK+"ips-"+today, CK+"ipd-"+today+"-"+h).then(function(oday){
      TVS.oday=oday||0;
      drawStats();
      return Promise.all([
        sumDayPrefix("ips-", monStart, today),
        sumDayPrefix("ips-", STATS_START, today)
      ]);
    }).then(function(v){
      if(!v) return;
      TVS.omon=Math.max(v[0]||0, TVS.oday||0);
      TVS.otot=Math.max(v[1]||0, TVS.omon||0);
      drawStats();
    });
  }).catch(function(){});
}
function ensureStats(){
  if(window.__tvStatsOn) return;
  window.__tvStatsOn=1;
  drawStats();
  hookListenTime();
  const today=ymd();
  const dayK=CK+"opens-"+today;
  const monStart=today.slice(0,7)+"-01";
  const already=sessionStorage.getItem("tvp-open-session")==="1";
  // persist only daily opens; Monat/gesamt = sum of daily opens-*
  (already?countGet(dayK):countHit(dayK)).then(function(dayOpens){
    if(!already) try{ sessionStorage.setItem("tvp-open-session","1"); }catch(e){}
    TVS.day=dayOpens||0;
    drawStats();
    return Promise.all([
      sumDayPrefix("opens-", monStart, today),
      sumDayPrefix("opens-", STATS_START, today),
      countGet(CK+"min-"+today),
      sumDayPrefix("min-", monStart, today),
      sumDayPrefix("min-", STATS_START, today)
    ]);
  }).then(function(v){
    TVS.month=Math.max(v[0]||0, TVS.day||0);
    TVS.total=Math.max(v[1]||0, TVS.month||0);
    TVS.dmin=v[2]||0;
    TVS.mmin=Math.max(v[3]||0, TVS.dmin);
    TVS.tmin=Math.max(v[4]||0, TVS.mmin);
    drawStats();
    countPlaces();
  });
}
