  timer=setTimeout(function(){
    if(cancelled || !isOn()) return;
    let n=0;
    blink=setInterval(function(){
      if(play) play.style.opacity=(n%2)?"1":".35";
      n++;
      if(n>=4){
        stopBlink();
        armed=true;
        kickResume();
      }
    }, 280);
  }, 4000);
}
function ensureAppName(){
  document.title="TadatmyaVedantaPlayer";
  if(!document.querySelector('link[rel="manifest"]')){
    const l=document.createElement("link");
    l.rel="manifest"; l.href="manifest.json";
    document.head.appendChild(l);
  }
  if(!document.querySelector('meta[name="apple-mobile-web-app-title"]')){
    const m=document.createElement("meta");
    m.name="apple-mobile-web-app-title"; m.content="TadatmyaVedantaPlayer";
    document.head.appendChild(m);
  }
}
document.addEventListener("DOMContentLoaded",function(){
  const dlg=document.getElementById("fbDlg");
  if(dlg) dlg.onclick=function(e){if(e.target===this)hideFb();};
  ensureCredit();
  ensureAppName();
  ensureTwoCol();
  ensureCoverLink();
  ensureCoverBlurb();
  ensureTextDlgFix();
  ensureStats();
  ensureCredit();
  ensureAutoStart();
  ensureKapSubtitle();
  ensureDoneCounts();
  fixLecture2b();
});
ensureCredit();
ensureAppName();
ensureTwoCol();
ensureCoverLink();
ensureCoverBlurb();
ensureTextDlgFix();
ensureAutoStart();
ensureKapSubtitle();
ensureDoneCounts();
