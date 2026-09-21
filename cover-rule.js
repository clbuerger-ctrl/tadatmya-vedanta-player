(function(){
  var CSS=".cover-rule{border:0;border-top:1px solid #c9a36a;width:min(92%,42rem);margin:16px auto 12px;opacity:.9;display:block;height:0;background:transparent}";
  function style(){
    var st=document.getElementById("tv-cover-rule-css");
    if(!st){ st=document.createElement("style"); st.id="tv-cover-rule-css"; document.head.appendChild(st); }
    st.textContent=CSS;
  }
  function place(){
    style();
    var row=document.querySelector(".cover-row");
    if(!row) return;
    var hr=document.querySelector("hr.cover-rule");
    if(!hr){
      hr=document.createElement("hr");
      hr.className="cover-rule";
      hr.setAttribute("aria-hidden","true");
    }
    if(hr.previousElementSibling!==row){
      row.parentNode.insertBefore(hr, row.nextSibling);
    }
  }
  function tick(){ place(); if(!document.querySelector(".cover-row")) setTimeout(tick,50); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",tick);
  else tick();
  setTimeout(place,200);
  setTimeout(place,800);
})();
