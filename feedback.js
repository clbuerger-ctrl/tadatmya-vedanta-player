const STAR_STORE="tv-player-stars-v1";
function starCount(){const n=parseInt(localStorage.getItem(STAR_STORE)||"0",10);return (n>=1&&n<=5)?n:0;}
function setStars(n){localStorage.setItem(STAR_STORE,String(n));paintStars();}
function paintStars(){
  const n=starCount();
  ["starsFoot","starsForm"].forEach(function(id){
    const box=document.getElementById(id); if(!box) return;
    box.innerHTML="";
    for(let i=1;i<=5;i++){
      const b=document.createElement("button");
      b.type="button"; b.textContent="★"; b.className=i<=n?"on":"";
      b.setAttribute("aria-label", i+" Sterne");
      b.onclick=function(){setStars(i);};
      box.appendChild(b);
    }
  });
}
function openFb(){
  paintStars();
  document.getElementById("fbDlg").classList.add("on");
  const bar=document.getElementById("playerBar");
  if(bar) document.getElementById("fbDlg").style.top=bar.getBoundingClientRect().bottom+"px";
}
function hideFb(){document.getElementById("fbDlg").classList.remove("on");}
function sendFb(){
  const name=(document.getElementById("fbName").value||"").trim();
  const text=(document.getElementById("fbText").value||"").trim();
  const n=starCount();
  if(!name && !text && !n){ alert("Bitte Name, Sterne oder Feedback eintragen."); return; }
  const body=["Name: "+(name||"—"),"Sterne: "+(n?n+"/5":"—"),"","Feedback:","",text||"—"].join("\n");
  const url="mailto:mail@universal-harmonics.com?subject="+encodeURIComponent("Tadatmya Vedanta Player Feedback")+"&body="+encodeURIComponent(body);
  window.location.href=url;
  hideFb();
}
document.addEventListener("DOMContentLoaded",function(){
  const dlg=document.getElementById("fbDlg");
  if(dlg) dlg.onclick=function(e){if(e.target===this)hideFb();};
  paintStars();
});
