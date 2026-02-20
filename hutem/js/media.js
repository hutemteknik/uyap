/* ============================================
   UYAP Eğitim — Medya Sistemi v3
   ============================================ */

(function () {

  document.addEventListener('DOMContentLoaded', function () {
    setupGifs();
    setupLightbox();
    setupZoom();
  });

  /* ==========================================
     1. GIF OYNATICI
  ========================================== */
  function setupGifs() {

    var areas = document.querySelectorAll('.gif-area');

    if (areas.length === 0) return;

    areas.forEach(function (area) {

      var img   = area.querySelector('img');
      var cover = area.querySelector('.gif-cover');
      var tag   = area.querySelector('.gif-tag');

      if (!img) return;

      /* --- Kaynak dosyaları belirle --- */
      var gifSrc = area.getAttribute('data-gif') ||
                   img.getAttribute('data-gif')  ||
                   img.getAttribute('src')        || '';

      /* Static yoksa GIF'i hem önizleme hem de oynatma için kullan */
      var staticSrc = area.getAttribute('data-static') ||
                      img.getAttribute('data-static')  ||
                      '';

      /* Static dosya tanımlı değilse GIF direkt oynar, kapak olmaz */
      var hasStatic = staticSrc !== '';

      var playing = false;

      /* Static yoksa kapağı kaldır, direkt GIF yükle */
      if (!hasStatic) {
        staticSrc = gifSrc;
        if (cover) {
          cover.style.display = 'none';
        }
        /* GIF'i direkt başlat */
        img.src = gifSrc + '?t=' + Date.now();
        playing = true;
        if (tag) {
          tag.textContent = '■ Dur';
          tag.classList.add('playing');
        }
      }

      /* --- OYNAT --- */
      function play() {
        img.src = gifSrc + '?t=' + Date.now();
        playing = true;

        /* ESKİ — ÇALIŞMIYOR: */
        /* cover.style.display = 'none'; */

        /* YENİ — ÇALIŞIYOR: */
        if (cover) cover.classList.add('hidden');

        if (tag) {
          tag.textContent = '■ Dur';
          tag.classList.add('playing');
        }
      }


      /* --- DURDUR --- */
      function stop() {
        if (!hasStatic) return;
        img.src = staticSrc;
        playing = false;

        /* ESKİ — ÇALIŞMIYOR: */
        /* cover.style.display = 'flex'; */

        /* YENİ — ÇALIŞIYOR: */
        if (cover) cover.classList.remove('hidden');

        if (tag) {
          tag.textContent = 'GIF';
          tag.classList.remove('playing');
        }
      }

      /* --- OLAYLAR --- */
      if (cover) {
        cover.addEventListener('click', function (e) {
          e.stopPropagation();
          if (!playing) play();
        });
      }

      img.addEventListener('click', function () {
        if (playing && hasStatic) stop();
      });

      if (tag) {
        tag.style.cursor = 'pointer';
        tag.addEventListener('click', function (e) {
          e.stopPropagation();
          if (playing) stop();
          else play();
        });
      }

      /* --- HATA: dosya bulunamazsa --- */
      img.addEventListener('error', function () {
        area.style.minHeight  = '160px';
        area.style.background = '#1e272e';
        area.style.display    = 'flex';
        area.style.alignItems = 'center';
        area.style.justifyContent = 'center';
        area.style.flexDirection  = 'column';
        area.style.gap = '8px';
        area.style.padding = '20px';
        area.style.textAlign = 'center';

        area.innerHTML =
          '<div style="font-size:2rem">🎬</div>' +
          '<div style="color:#ecf0f1;font-size:0.88rem;font-weight:600">' +
            'GIF henüz eklenmedi' +
          '</div>' +
          '<div style="color:#7f8c8d;font-size:0.72rem;' +
            'font-family:monospace;word-break:break-all;max-width:280px">' +
            gifSrc +
          '</div>';
      });

    }); /* forEach sonu */

  } /* setupGifs sonu */

  /* ==========================================
     2. LİGHTBOX
  ========================================== */
  var lb, lbImg, lbCap;

  function setupLightbox() {

    /* Daha önce oluşturulmuşsa tekrar oluşturma */
    if (document.getElementById('uyap-lightbox')) {
      lb    = document.getElementById('uyap-lightbox');
      lbImg = document.getElementById('uyap-lb-img');
      lbCap = document.getElementById('uyap-lb-cap');
      return;
    }

    var el = document.createElement('div');
    el.id = 'uyap-lightbox';
    el.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.88);' +
      'z-index:9999;display:none;align-items:center;' +
      'justify-content:center;padding:20px;' +
      'opacity:0;transition:opacity 0.25s;' +
      'backdrop-filter:blur(5px);cursor:zoom-out;';

    el.innerHTML =
      '<div id="uyap-lb-wrap" style="position:relative;' +
        'max-width:88vw;max-height:88vh;cursor:default;">' +
        '<button id="uyap-lb-close" style="' +
          'position:absolute;top:-40px;right:0;' +
          'width:32px;height:32px;' +
          'background:rgba(255,255,255,0.14);' +
          'border:1.5px solid rgba(255,255,255,0.28);' +
          'border-radius:50%;color:white;font-size:1rem;' +
          'cursor:pointer;display:flex;align-items:center;' +
          'justify-content:center;">✕</button>' +
        '<img id="uyap-lb-img" src="" alt="" style="' +
          'display:block;max-width:100%;max-height:82vh;' +
          'border-radius:10px;' +
          'box-shadow:0 16px 64px rgba(0,0,0,0.55);" />' +
        '<div id="uyap-lb-cap" style="' +
          'color:rgba(255,255,255,0.82);text-align:center;' +
          'padding:10px 0 0;font-size:0.85rem;"></div>' +
      '</div>';

    document.body.appendChild(el);

    lb    = el;
    lbImg = document.getElementById('uyap-lb-img');
    lbCap = document.getElementById('uyap-lb-cap');

    document.getElementById('uyap-lb-close')
      .addEventListener('click', closeLB);

    lb.addEventListener('click', function (e) {
      if (e.target === lb) closeLB();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLB();
    });
  }

  function openLB(src, caption) {
    if (!lb) return;
    lbImg.src = src;
    lbCap.textContent = caption || '';
    lb.style.display = 'flex';
    /* Animasyon için kısa gecikme */
    requestAnimationFrame(function () {
      lb.style.opacity = '1';
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLB() {
    if (!lb) return;
    lb.style.opacity = '0';
    setTimeout(function () {
      lb.style.display = 'none';
      lbImg.src = '';
    }, 260);
    document.body.style.overflow = '';
  }

  /* ==========================================
     3. ZOOM & data-lightbox
  ========================================== */
  function setupZoom() {

    /* .zoom-btn */
    document.querySelectorAll('.zoom-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var area = btn.closest('.screen-area, .gif-area');
        if (!area) return;
        var img = area.querySelector('img');
        if (!img || !img.src) return;
        var cap = findCaption(btn);
        openLB(img.src, cap);
      });
    });

    /* data-lightbox */
    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', function () {
        var src = el.getAttribute('data-src') || el.src || '';
        var cap = el.getAttribute('data-caption') || el.alt || '';
        if (src) openLB(src, cap);
      });
    });
  }

  function findCaption(el) {
    var frame = el.closest('.browser');
    if (!frame) return '';
    var p = frame.querySelector('.caption-body p');
    return p ? p.textContent : '';
  }

})();