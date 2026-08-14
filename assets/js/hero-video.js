// Hero video: full-bleed native video sizing + sound toggle

(function(){
  function initCoverSizing(){
    var wraps = document.querySelectorAll('.hero-video-wrap, .res-video-wrap');
    wraps.forEach(function(wrap){
      var video = wrap.querySelector('video');
      if(video) video.setAttribute('playsinline', '');
    });
  }

  function initHeroSoundToggle(){
    var hero = document.querySelector('.hero, .res-hero');
    if(!hero) return;
    var cont = hero.querySelector('.hero-content, .res-hero-content');
    if(!cont) return;

    var btn = document.createElement('button');
    btn.className = 'hero-sound-toggle';
    btn.setAttribute('aria-pressed','true');
    btn.textContent = 'SOUND OFF';
    hero.appendChild(btn);

    var video = document.getElementById('heroVideo');
    if(!video) return;

    var muted = true;
    // store preference in session
    try { if(sessionStorage.getItem('colorfield-hero-muted')==='false') muted=false; } catch(e){}
    setButton();

    btn.addEventListener('click', function(){
      muted = !muted;
      setButton();
      try{ sessionStorage.setItem('colorfield-hero-muted', muted ? 'true':'false'); } catch(e){}
      video.muted = muted;
    });

    function setButton(){ btn.textContent = muted ? 'SOUND ON':'SOUND OFF'; btn.setAttribute('aria-pressed', muted ? 'true':'false'); }

    video.addEventListener('loadeddata', function(){ video.muted = muted; });
  }

  function init(){ initCoverSizing(); initHeroSoundToggle(); }

  if(document.readyState==='complete' || document.readyState==='interactive') init(); else document.addEventListener('DOMContentLoaded', init);
})();
