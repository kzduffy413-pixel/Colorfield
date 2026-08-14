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
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999';

    var imgWrap = document.createElement('div');
    imgWrap.style.cssText = 'max-width:90%;max-height:90%;position:relative;';

    var img = document.createElement('img');
    img.style.cssText = 'width:100%;height:auto;display:block;max-height:90vh';
    img.loading = 'lazy';
    img.src = images[startIndex];

    imgWrap.appendChild(img);

    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;padding:8px 12px;background:#fff;border:none;cursor:pointer';
    closeBtn.addEventListener('click', function(){ document.body.removeChild(overlay); });

    var left = document.createElement('button');
    left.textContent = '<';
    left.style.cssText = 'position:absolute;left:-60px;top:50%;transform:translateY(-50%);padding:8px 12px;background:#fff;border:none;cursor:pointer';
    var right = document.createElement('button');
    right.textContent = '>';
    right.style.cssText = 'position:absolute;right:-60px;top:50%;transform:translateY(-50%);padding:8px 12px;background:#fff;border:none;cursor:pointer';

    var idx = startIndex;
    left.addEventListener('click', function(){ idx = (idx-1+images.length)%images.length; img.src = images[idx]; });
    right.addEventListener('click', function(){ idx = (idx+1)%images.length; img.src = images[idx]; });

    overlay.addEventListener('click', function(ev){ if(ev.target===overlay) document.body.removeChild(overlay); });

    overlay.appendChild(imgWrap);
    overlay.appendChild(closeBtn);
    overlay.appendChild(left);
    overlay.appendChild(right);
    document.body.appendChild(overlay);

    window.addEventListener('keydown', function onKey(e){ if(e.key==='Escape'){ if(document.body.contains(overlay)) document.body.removeChild(overlay); window.removeEventListener('keydown', onKey); } if(e.key==='ArrowLeft'){ left.click(); } if(e.key==='ArrowRight'){ right.click(); } });
  }

  if(document.readyState==='complete' || document.readyState==='interactive') initGallery(); else document.addEventListener('DOMContentLoaded', initGallery);
})();
