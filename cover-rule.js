(function(){
  function place(){
    var row=document.querySelector(".cover-row");
    if(!row) return;
    var hr=document.querySelector("hr.cover-rule");
    if(!hr){
      hr=document.createElement("hr");
      hr.className="cover-rule";
      hr.setAttribute("aria-hidden","true");
    }
    if(!document.getElementById("tv-cover-rule-css")){
      var st=document.createElement("style");
      st.id="tv-cover-rule-css";
      st.textContent=".cover-rule{border:0;border-top:1px solid #3d2f26;width:min(92%,40rem);margin:14px auto 10px;opacity:.9;display:block}";
      document.head.appendChild(st);
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
