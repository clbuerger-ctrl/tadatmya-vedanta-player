function playNr(){
  const n=parseInt(document.getElementById("nr").value,10);
  const idx=sichtbar.findIndex(function(L){return L.nr===n;});
  if(idx<0){document.getElementById("err").textContent="Keine Lesung für #"+n;return;}
  play(idx);
}
function prev(){ if(typeof modalOpen==="function"&&modalOpen()) return; play(i<0?0:i-1); }
function next(){ if(typeof modalOpen==="function"&&modalOpen()) return; play(i<0?0:i+1); }
if(typeof refreshZeitraum==="function") refreshZeitraum();
