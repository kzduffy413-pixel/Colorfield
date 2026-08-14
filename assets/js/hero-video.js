// Hero video sound toggle
// Adds a simple SOUND ON / SOUND OFF button that toggles the video's mute state via the YouTube iframe API using postMessage.

(function(){
  // Create the control and append to hero-content
  function initHeroSoundToggle(){
    var hero = document.querySelector('.hero');
    if(!hero) return;
    var cont = hero.querySelector('.hero-content');
    if(!cont) return;

    var btn = document.createElement('button');
    btn.className = 'hero-sound-toggle';
    btn.setAttribute('aria-pressed','true');
    btn.textContent = 'SOUND OFF';
    btn.style.cssText = 'position:absolute;right:40px;top:36px;padding:8px 12px;background:rgba(242,239,233,0.9);border:none;font-family:IBM Plex Mono,monospace';
    cont.appendChild(btn);

    var iframe = document.getElementById('heroVideo');
    if(!iframe) return;

    var muted = true;
    // store preference in session
    try { if(sessionStorage.getItem('colorfield-hero-muted')==='false') muted=false; } catch(e){}
    setButton();

    btn.addEventListener('click', function(){
      muted = !muted;
      setButton();
      try{ sessionStorage.setItem('colorfield-hero-muted', muted ? 'true':'false'); } catch(e){}
      postMute();
    });

    function setButton(){ btn.textContent = muted ? 'SOUND ON':'SOUND OFF'; btn.setAttribute('aria-pressed', muted ? 'true':'false'); }

    function postMute(){
      // YouTube postMessage to control mute via the API
      try{
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: muted ? 'mute' : 'unMute', args: [] }), '*');
      }catch(e){/* ignore */}
    }

    // ensure we send initial mute/unmute once iframe loads
    iframe.addEventListener('load', function(){ postMute(); });
  }

  if(document.readyState==='complete' || document.readyState==='interactive') initHeroSoundToggle(); else document.addEventListener('DOMContentLoaded', initHeroSoundToggle);
})();
