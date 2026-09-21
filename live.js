(function(){
  const API="https://countapi.mileshilliard.com/api/v1";
  const CK="tvp-clbuerger-live-";
  const KNOWN=[
    "Bonn, DE","Mannheim, DE","Springen, DE","Berlin, DE","Hamburg, DE","München, DE",
    "Köln, DE","Frankfurt, DE","Stuttgart, DE","Düsseldorf, DE","Wien, AT","Zürich, CH",
    "Basel, CH","Bern, CH","Salzburg, AT","Paris, FR","London, GB","Amsterdam, NL",
    "Brüssel, BE","Prag, CZ","Warschau, PL","Rom, IT","Madrid, ES","Lissabon, PT",
    "Stockholm, SE","Kopenhagen, DK","Oslo, NO","Helsinki, FI","Dublin, IE",
    "New York, US","Los Angeles, US","Toronto, CA","Sydney, AU","Kapstadt, ZA",
    "Mumbai, IN","Delhi, IN","Chennai, IN","Mauritius","Bali, ID"
  ];
  function bucket(){return Math.floor(Date.now()/600000);}
  function slug(s){return String(s||"ort").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40);}
  function hit(k){return fetch(API+"/hit/"+encodeURIComponent(k)).then(function(r){return r.json();}).then(function(j){return +j.value||0;}).catch(function(){return 0;});}
  function get(k){return fetch(API+"/get/"+encodeURIComponent(k)).then(function(r){return r.ok?r.json():{value:0};}).then(function(j){return +j.value||0;}).catch(function(){return 0;});}
  function box(){
    let el=document.getElementById("tv-live");
    if(el) return el;
    const st=document.createElement("style");
    st.textContent="#tv-live{font-size:.68rem;color:#cbb89a;line-height:1.35;text-align:right;padding:0 12px 8px}";
    document.head.appendChild(st);
    el=document.createElement("div"); el.id="tv-live";
    const foot=document.querySelector("footer.fb")||document.body;
    foot.appendChild(el);
    return el;
  }
  function draw(rows, here){
    const el=box();
    if(!rows.length){
      el.textContent="gerade aktiv (10 min): —"+(here?" · hier: "+here:"");
      return;
    }
    el.innerHTML="gerade aktiv (10 min), Top "+rows.length+": "+rows.map(function(r){
      return r.name+(r.n>1?" ×"+r.n:"");
    }).join(" · ")+(here?"<br>hier: "+here:"");
  }
  function poll(here){
    const b=bucket();
    const names=KNOWN.slice();
    if(here && names.indexOf(here)<0) names.unshift(here);
    Promise.all(names.map(function(name){
      return get(CK+b+"-"+slug(name)).then(function(n){return {name:name,n:n};});
    })).then(function(rows){
      rows=rows.filter(function(r){return r.n>0;}).sort(function(a,b){return b.n-a.n;}).slice(0,10);
      draw(rows, here);
    });
  }
  function start(){
    if(window.__tvLiveOn) return;
    window.__tvLiveOn=1;
    draw([], "");
    fetch("https://get.geojs.io/v1/ip/geo.json").then(function(r){return r.json();}).then(function(g){
      const here=[g.city,g.country_code||g.country].filter(Boolean).join(", ")||"";
      if(here) hit(CK+bucket()+"-"+slug(here));
      poll(here);
      setInterval(function(){
        if(here) hit(CK+bucket()+"-"+slug(here));
        poll(here);
      }, 60000);
    }).catch(function(){ poll(""); });
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
