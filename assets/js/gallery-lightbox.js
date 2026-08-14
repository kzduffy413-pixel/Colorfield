// Lightweight gallery lightbox
// Usage: clicking VIEW ALL opens the lightbox with full gallery. This script provides simple keyboard navigation and lazy-loading.
(function(){
  function initGallery(){
    document.querySelectorAll('.view-all-photos').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var gallery = JSON.parse(btn.getAttribute('data-gallery'));
        openLightbox(gallery, 0);
      });
    });
  }

  function openLightbox(images, startIndex){
    var overlay = document.createElement('div');
    overlay.className = 'cf-lightbox';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;z-index:9999';

    var imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'width:100%;height:100%;position:relative;display:flex;align-items:center;justify-content:center;padding:70px 60px;box-sizing:border-box;';

    var img = document.createElement('img');
    img.style.cssText = 'max-width:100%;max-height:100%;display:block;object-fit:contain;';
    img.loading = 'lazy';
    img.src = images[startIndex];

    imgWrap.appendChild(img);

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Close gallery');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'position:fixed;top:16px;right:16px;padding:12px 18px;background:#fff;border:none;cursor:pointer;font-family:"IBM Plex Mono",monospace;font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;z-index:10001;min-height:44px;';
    closeBtn.addEventListener('click', function(){ document.body.removeChild(overlay); document.body.style.overflow=''; });

    var counter = document.createElement('div');
    counter.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);color:#fff;font-family:"IBM Plex Mono",monospace;font-size:0.78rem;letter-spacing:0.08em;z-index:10001;';

    var left = document.createElement('button');
    left.setAttribute('aria-label', 'Previous photo');
    left.textContent = '\u2039';
    left.style.cssText = 'position:fixed;left:8px;top:50%;transform:translateY(-50%);width:48px;height:48px;background:rgba(255,255,255,0.9);border:none;cursor:pointer;font-size:1.4rem;z-index:10001;';
    var right = document.createElement('button');
    right.setAttribute('aria-label', 'Next photo');
    right.textContent = '\u203a';
    right.style.cssText = 'position:fixed;right:8px;top:50%;transform:translateY(-50%);width:48px;height:48px;background:rgba(255,255,255,0.9);border:none;cursor:pointer;font-size:1.4rem;z-index:10001;';

    var idx = startIndex;
    function updateCounter(){ counter.textContent = (idx+1) + ' / ' + images.length; }
    updateCounter();
    left.addEventListener('click', function(){ idx = (idx-1+images.length)%images.length; img.src = images[idx]; updateCounter(); });
    right.addEventListener('click', function(){ idx = (idx+1)%images.length; img.src = images[idx]; updateCounter(); });

    overlay.addEventListener('click', function(ev){ if(ev.target===overlay || ev.target===imgWrap) { document.body.removeChild(overlay); document.body.style.overflow=''; } });

    overlay.appendChild(imgWrap);
    overlay.appendChild(closeBtn);
    overlay.appendChild(counter);
    overlay.appendChild(left);
    overlay.appendChild(right);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', function onKey(e){ if(e.key==='Escape'){ if(document.body.contains(overlay)){ document.body.removeChild(overlay); document.body.style.overflow=''; } window.removeEventListener('keydown', onKey); } if(e.key==='ArrowLeft'){ left.click(); } if(e.key==='ArrowRight'){ right.click(); } });
  }

  if(document.readyState==='complete' || document.readyState==='interactive') initGallery(); else document.addEventListener('DOMContentLoaded', initGallery);
})();
