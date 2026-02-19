/* ============================================
   UYAP EĞİTİM PORTALI
   Ekran Görüntüsü & GIF Sistemi
   screenshots.js
   ============================================ */

(function () {
  'use strict';

  /* ------------------------------------------
     1. LIGHTBOX SİSTEMİ
  ------------------------------------------ */
  const LightBox = {
    el: null,
    inner: null,
    img: null,
    cap: null,
    images: [],   // Sayfadaki tüm SS görselleri
    current: 0,

    init() {
      // Overlay oluştur
      this.el = document.createElement('div');
      this.el.className = 'ss-lightbox';
      this.el.setAttribute('role', 'dialog');
      this.el.setAttribute('aria-modal', 'true');
      this.el.setAttribute('aria-label', 'Görüntü büyütme');

      this.el.innerHTML = `
        <button class="ss-lightbox-prev" aria-label="Önceki">&#8592;</button>
        <div class="ss-lightbox-inner">
          <button class="ss-lightbox-close" aria-label="Kapat">&#10005;</button>
          <img src="" alt="" />
          <div class="ss-lightbox-caption"></div>
        </div>
        <button class="ss-lightbox-next" aria-label="Sonraki">&#8594;</button>`;

      document.body.appendChild(this.el);

      this.inner = this.el.querySelector('.ss-lightbox-inner');
      this.img   = this.el.querySelector('img');
      this.cap   = this.el.querySelector('.ss-lightbox-caption');

      // Olaylar
      this.el.querySelector('.ss-lightbox-close')
        .addEventListener('click', () => this.close());

      this.el.querySelector('.ss-lightbox-prev')
        .addEventListener('click', () => this.navigate(-1));

      this.el.querySelector('.ss-lightbox-next')
        .addEventListener('click', () => this.navigate(1));

      this.el.addEventListener('click', (e) => {
        if (e.target === this.el) this.close();
      });

      document.addEventListener('keydown', (e) => {
        if (!this.el.classList.contains('active')) return;
        if (e.key === 'Escape')      this.close();
        if (e.key === 'ArrowRight')  this.navigate(1);
        if (e.key === 'ArrowLeft')   this.navigate(-1);
      });

      // Tüm lightbox görselleri topla
      this.collectImages();
    },

    collectImages() {
      this.images = [];
      document.querySelectorAll('[data-lightbox]').forEach((el, i) => {
        el.dataset.lbIndex = i;
        this.images.push({
          src: el.dataset.src || el.src || '',
          alt: el.dataset.alt || el.alt || '',
          cap: el.dataset.caption || ''
        });
        el.style.cursor = 'zoom-in';
        el.addEventListener('click', () => this.open(i));
      });
    },

    open(index) {
      this.current = index;
      this.render();
      this.el.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.img.focus();
    },

    close() {
      this.el.classList.remove('active');
      document.body.style.overflow = '';
    },

    navigate(dir) {
      this.current = (this.current + dir + this.images.length) % this.images.length;
      this.render();
    },

    render() {
      const item = this.images[this.current];
      if (!item) return;
      this.img.src = item.src;
      this.img.alt = item.alt;
      this.cap.textContent = item.cap || item.alt;

      const prev = this.el.querySelector('.ss-lightbox-prev');
      const next = this.el.querySelector('.ss-lightbox-next');
      prev.style.display = this.images.length > 1 ? 'flex' : 'none';
      next.style.display = this.images.length > 1 ? 'flex' : 'none';
    }
  };

  /* ------------------------------------------
     2. GIF OYNATICI
  ------------------------------------------ */
  const GifPlayer = {
    init() {
      document.querySelectorAll('.ss-gif-container').forEach(container => {
        const img     = container.querySelector('img');
        const overlay = container.querySelector('.ss-gif-overlay');
        const btn     = container.querySelector('.ss-gif-play-btn');

        if (!img || !overlay) return;

        // Statik önizleme ve GIF src'leri data attribute'dan al
        const staticSrc = img.dataset.static || img.src;
        const gifSrc    = img.dataset.gif    || img.src;

        let isPlaying = false;

        // Başlangıçta statik görüntü göster
        img.src = staticSrc;

        const play = () => {
          img.src = gifSrc + '?t=' + Date.now(); // cache busting
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
          if (btn) btn.textContent = '⏸';
          isPlaying = true;
        };

        const pause = () => {
          img.src = staticSrc;
          overlay.style.opacity = '1';
          overlay.style.pointerEvents = 'all';
          if (btn) btn.textContent = '▶';
          isPlaying = false;
        };

        if (overlay) {
          overlay.addEventListener('click', () => {
            isPlaying ? pause() : play();
          });
        }

        // GIF yüklendi mi kontrol et
        img.addEventListener('load', () => {
          container.classList.remove('loading');
        });

        img.addEventListener('error', () => {
          // Görsel bulunamazsa placeholder göster
          container.innerHTML = `
            <div class="ss-placeholder orange" style="min-height:180px;">
              <div class="ss-ph-icon">🎬</div>
              <div class="ss-ph-title dark">GIF bulunamadı</div>
              <div class="ss-ph-sub">${gifSrc}</div>
            </div>`;
        });
      });
    }
  };

  /* ------------------------------------------
     3. GÖRSEL HATA YÖNETİMİ
     Görsel yüklenemezse placeholder gösterir
  ------------------------------------------ */
  const ImageFallback = {
    init() {
      document.querySelectorAll('.ss-image-area img, .ss-frame img').forEach(img => {
        if (img.complete && img.naturalWidth === 0) {
          this.replace(img);
          return;
        }
        img.addEventListener('error', () => this.replace(img));
      });
    },

    replace(img) {
      const filename = img.src.split('/').pop() || 'görsel';
      const type     = img.closest('.ss-gif-container') ? '🎬 GIF' : '🖼️ PNG/JPG';
      const ph = document.createElement('div');
      ph.className = 'ss-placeholder';
      ph.style.minHeight = '180px';
      ph.innerHTML = `
        <div class="ss-ph-icon">📷</div>
        <div class="ss-ph-title dark">Ekran görüntüsü eklenecek</div>
        <div class="ss-ph-sub">${type}</div>
        <div class="ss-ph-filename">${filename}</div>`;
      img.parentNode.replaceChild(ph, img);
    }
  };

  /* ------------------------------------------
     4. ZOOM BUTONU
  ------------------------------------------ */
  const ZoomBtn = {
    init() {
      document.querySelectorAll('.ss-zoom-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const area = btn.closest('.ss-image-area, .ss-gif-container');
          if (!area) return;
          const img = area.querySelector('img');
          if (!img) return;
          const src = img.dataset.src || img.src;
          const cap = btn.closest('.ss-frame')
            ?.querySelector('.ss-caption-text p')?.textContent || '';

          // Lightbox ile aç
          const tempIndex = LightBox.images.length;
          LightBox.images.push({ src, alt: cap, cap });
          LightBox.open(tempIndex);
        });
      });
    }
  };

  /* ------------------------------------------
     5. PLACEHOLDER TIKLAMA
     (Geliştirici için dosya adını kopyalar)
  ------------------------------------------ */
  const PlaceholderClick = {
    init() {
      document.querySelectorAll('.ss-placeholder').forEach(ph => {
        const fn = ph.querySelector('.ss-ph-filename');
        if (!fn) return;

        ph.style.cursor = 'pointer';
        ph.title = 'Dosya adını kopyalamak için tıkla';

        ph.addEventListener('click', () => {
          const text = fn.textContent.trim();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
              const orig = ph.querySelector('.ss-ph-sub')?.textContent || '';
              const sub  = ph.querySelector('.ss-ph-sub');
              if (sub) {
                sub.textContent = '✓ Kopyalandı!';
                sub.style.color = '#27ae60';
                setTimeout(() => {
                  sub.textContent = orig;
                  sub.style.color = '';
                }, 1500);
              }
            });
          }
        });
      });
    }
  };

  /* ------------------------------------------
     6. YARDIMCI FONKSİYONLAR
     HTML şablonları oluşturmak için
  ------------------------------------------ */
  window.SSHelper = {

    /**
     * Tarayıcı çerçeveli görsel oluştur
     * @param {Object} opts
     *   src        - Görsel yolu (img/ klasöründen)
     *   alt        - Alt metin
     *   url        - URL bar metni
     *   caption    - Altyazı metni
     *   step       - Adım numarası (opsiyonel)
     *   zoom       - Büyütme butonu göster (default: true)
     *   size       - 'full'|'large'|'medium'|'small' (default: 'large')
     *   center     - Ortalansın mı (default: false)
     *   figNum     - Şekil numarası (opsiyonel)
     */
    browserFrame(opts = {}) {
      const {
        src      = '',
        alt      = 'Ekran görüntüsü',
        url      = 'uyap.gov.tr',
        caption  = '',
        step     = null,
        zoom     = true,
        size     = 'large',
        center   = true,
        figNum   = null
      } = opts;

      const filename = src || 'img/screenshots/gorsel.png';
      const centerClass = center ? ' center' : '';

      return `
<div class="ss-wrapper ${size}${centerClass}">
  <div class="ss-frame">
    <div class="ss-frame-bar">
      <div class="ss-frame-dots">
        <div class="ss-dot red"></div>
        <div class="ss-dot yellow"></div>
        <div class="ss-dot green"></div>
      </div>
      <div class="ss-frame-url">
        <span class="lock-icon">🔒</span>
        <span class="url-text">${url}</span>
      </div>
    </div>
    <div class="ss-image-area">
      ${step ? `<div class="ss-step-badge gold">${step}</div>` : ''}
      ${figNum ? `<div class="ss-step-badge" style="left:auto;right:10px;">Şekil ${figNum}</div>` : ''}
      <img
        src="${filename}"
        alt="${alt}"
        data-lightbox
        data-caption="${caption || alt}"
        loading="lazy"
      />
      ${zoom ? '<button class="ss-zoom-btn" title="Büyüt">🔍</button>' : ''}
    </div>
    ${caption ? `
    <div class="ss-caption">
      <div class="ss-caption-icon">📌</div>
      <div class="ss-caption-text">
        ${figNum ? `<strong>Şekil ${figNum}</strong>` : ''}
        <p>${caption}</p>
      </div>
    </div>` : ''}
  </div>
</div>`;
    },

    /**
     * GIF oynatıcı oluştur
     * @param {Object} opts
     *   gif        - GIF dosya yolu
     *   static     - Önizleme görseli (PNG)
     *   alt        - Alt metin
     *   caption    - Altyazı
     *   url        - URL bar
     *   size       - Boyut
     */
    gifPlayer(opts = {}) {
      const {
        gif     = '',
        static: staticImg = '',
        alt     = 'Animasyon',
        caption = '',
        url     = 'uyap.gov.tr',
        size    = 'large',
        center  = true
      } = opts;

      const centerClass = center ? ' center' : '';
      const gifFile    = gif     || 'img/gifs/animasyon.gif';
      const staticFile = staticImg || gif || 'img/gifs/animasyon.gif';

      return `
<div class="ss-wrapper ${size}${centerClass}">
  <div class="ss-frame">
    <div class="ss-frame-bar">
      <div class="ss-frame-dots">
        <div class="ss-dot red"></div>
        <div class="ss-dot yellow"></div>
        <div class="ss-dot green"></div>
      </div>
      <div class="ss-frame-url">
        <span class="lock-icon">🔒</span>
        <span class="url-text">${url}</span>
      </div>
    </div>
    <div class="ss-gif-container loading">
      <img
        src="${staticFile}"
        data-static="${staticFile}"
        data-gif="${gifFile}"
        alt="${alt}"
        loading="lazy"
      />
      <div class="ss-gif-overlay">
        <button class="ss-gif-play-btn" aria-label="Oynat">▶</button>
      </div>
      <div class="ss-gif-badge">GIF</div>
    </div>
    ${caption ? `
    <div class="ss-caption">
      <div class="ss-caption-icon">🎬</div>
      <div class="ss-caption-text">
        <strong>Animasyon</strong>
        <p>${caption}</p>
      </div>
    </div>` : ''}
  </div>
</div>`;
    },

    /**
     * Yalnızca placeholder (görsel henüz yok)
     */
    placeholder(opts = {}) {
      const {
        title    = 'Ekran görüntüsü eklenecek',
        sub      = 'Bu alana görsel veya GIF gelecek',
        filename = 'img/screenshots/gorsel.png',
        icon     = '📷',
        color    = 'blue',
        size     = 'large',
        center   = true,
        height   = '200px'
      } = opts;

      const centerClass = center ? ' center' : '';

      return `
<div class="ss-wrapper ${size}${centerClass}">
  <div class="ss-placeholder ${color}" style="min-height:${height};">
    <div class="ss-ph-icon">${icon}</div>
    <div class="ss-ph-title dark">${title}</div>
    <div class="ss-ph-sub">${sub}</div>
    <div class="ss-ph-filename">${filename}</div>
  </div>
</div>`;
    }
  };

  /* ------------------------------------------
     7. BAŞLAT
  ------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    LightBox.init();
    GifPlayer.init();
    ImageFallback.init();
    ZoomBtn.init();
    PlaceholderClick.init();

    // DOM değişikliklerini izle (dinamik içerik için)
    const observer = new MutationObserver(() => {
      ImageFallback.init();
      LightBox.collectImages();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });

})();