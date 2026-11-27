/* NAVI KING — tương tác landing page (không phụ thuộc thư viện)
   Thông tin liên hệ, kênh bán hàng, form: chỉnh trong assets/js/config.js */
(function () {
  'use strict';

  var CFG = window.NAVI_CONFIG || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var get = function (path) {
    return path.split('.').reduce(function (o, k) { return o && o[k] != null ? o[k] : ''; }, CFG);
  };
  var clean = function (v) { return String(v || '').trim(); };

  /* ---------- Đổ dữ liệu từ config vào trang ---------- */
  document.querySelectorAll('[data-config-row]').forEach(function (row) {
    row.hidden = !clean(get(row.getAttribute('data-config-row')));
  });
  document.querySelectorAll('[data-config]').forEach(function (el) {
    var v = clean(get(el.getAttribute('data-config')));
    if (!v) return;
    el.textContent = v.replace(/^https?:\/\//, '');
    var kind = el.getAttribute('data-config-href');
    if (kind === 'tel') el.href = 'tel:' + v.replace(/[^\d+]/g, '');
    if (kind === 'mailto') el.href = 'mailto:' + v;
    if (kind === 'url') el.href = /^https?:\/\//.test(v) ? v : 'https://' + v;
  });

  /* Kênh mua hàng: có link → bấm được; chưa có → "Đang cập nhật" */
  var channelUrl = function (key) {
    var v = clean((CFG.channels || {})[key]);
    if (!v) return '';
    if (key === 'zalo' && /^[\d\s+.-]+$/.test(v)) return 'https://zalo.me/' + v.replace(/\D/g, '');
    return /^https?:\/\//.test(v) ? v : 'https://' + v;
  };
  var footerList = document.querySelector('[data-footer-channels]');
  document.querySelectorAll('[data-channel]').forEach(function (card) {
    var key = card.getAttribute('data-channel');
    var url = channelUrl(key);
    var name = card.querySelector('.channel__name').textContent;
    if (url) {
      card.href = url; card.target = '_blank'; card.rel = 'noopener';
      if (footerList) {
        var li = document.createElement('li'), a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = name;
        li.appendChild(a); footerList.appendChild(li);
      }
    } else {
      card.removeAttribute('href');
      card.classList.add('is-pending');
      card.setAttribute('aria-disabled', 'true');
      card.querySelector('[data-channel-cta]').textContent = 'Đang cập nhật';
    }
  });

  /* Bản đồ Google Maps theo địa chỉ trong config */
  var map = document.querySelector('[data-map]');
  var address = clean(get('company.address'));
  if (map && address) {
    var q = encodeURIComponent(address);
    var link = map.querySelector('[data-map-link]');
    if (link) link.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
    if ((CFG.map || {}).embed) {
      var frame = document.createElement('iframe');
      frame.src = 'https://maps.google.com/maps?q=' + q + '&z=16&output=embed';
      frame.title = 'Bản đồ: ' + address;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      map.insertBefore(frame, map.firstChild);
    }
  }

  /* ---------- Menu di động ---------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
    menu.hidden = !open;
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Hiện dần khi cuộn (kèm xuất hiện lần lượt trong nhóm) ---------- */
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
  });
  var revealEls = document.querySelectorAll('[data-reveal], [data-stagger]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Cuộn: thanh tiến trình, header ẩn/hiện, parallax ảnh ---------- */
  var header = document.querySelector('[data-header]');
  var progress = document.querySelector('[data-progress]');
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var visibleParallax = new Set();
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? visibleParallax.add(e.target) : visibleParallax.delete(e.target); });
    }, { rootMargin: '100px 0px' });
    parallaxEls.forEach(function (el) { pio.observe(el); });
  }
  var lastY = window.scrollY, ticking = false;
  var onScroll = function () {
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    if (progress) progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      var menuOpen = toggle && toggle.getAttribute('aria-expanded') === 'true';
      if (!menuOpen && Math.abs(y - lastY) > 6) header.classList.toggle('is-hidden', y > lastY && y > 320);
    }
    if (!reduceMotion) {
      visibleParallax.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        var t = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1 quanh tâm màn hình
        el.style.setProperty('--py', (t * -24).toFixed(1) + 'px');
      });
    }
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Ảnh nghiêng theo chuột + vệt sáng (chỉ chuột, không áp dụng màn cảm ứng) ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = el.classList.contains('hero__banner') ? 3 : 6;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', ((x - .5) * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - y) * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- Hero: cả quạt thẻ sản phẩm nghiêng theo chuột ---------- */
  var hero = document.querySelector('[data-hero]');
  var fan = document.querySelector('.hero__fan');
  if (hero && fan && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      fan.style.setProperty('--sy', (x * 14).toFixed(2) + 'deg');
      fan.style.setProperty('--sx', (-y * 8).toFixed(2) + 'deg');
    });
    hero.addEventListener('pointerleave', function () {
      fan.style.setProperty('--sy', '0deg'); fan.style.setProperty('--sx', '0deg');
    });
  }

  /* ---------- Showroom sản phẩm: tab + liên kết #p-... từ hero/footer ---------- */
  var sc = document.querySelector('[data-showcase]');
  if (sc) {
    var scTabs = Array.prototype.slice.call(sc.querySelectorAll('[role="tab"]'));
    var activate = function (tab, focus) {
      scTabs.forEach(function (t) {
        var on = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panel.classList.toggle('is-active', on);
        if (on) panel.removeAttribute('inert'); else panel.setAttribute('inert', '');
      });
      if (focus) tab.focus();
      if (tab.scrollIntoView && window.matchMedia('(max-width: 960px)').matches) tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    sc.querySelector('[role="tablist"]').addEventListener('click', function (e) {
      var t = e.target.closest('[role="tab"]'); if (t) activate(t, false);
    });
    sc.querySelector('[role="tablist"]').addEventListener('keydown', function (e) {
      var i = scTabs.indexOf(document.activeElement); if (i < 0) return;
      var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: scTabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault(); activate(scTabs[(n + scTabs.length) % scTabs.length], true);
    });
    var openProduct = function (hash) {
      var tab = sc.querySelector('[aria-controls="' + hash.slice(1) + '"]');
      if (!tab) return false;
      activate(tab, false);
      document.getElementById('products').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      return true;
    };
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#p-"]');
      if (a && openProduct(a.getAttribute('href'))) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); }
    });
    if (/^#p-/.test(location.hash)) openProduct(location.hash);
  }

  /* ---------- Đánh dấu mục đang xem trên menu và chip sản phẩm ---------- */
  if ('IntersectionObserver' in window) {
    var spy = function (selector, links) {
      var map = {};
      links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) { a.classList.remove('is-active'); });
          var link = map[e.target.id];
          if (link) link.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      document.querySelectorAll(selector).forEach(function (sec) { if (map[sec.id]) sio.observe(sec); });
    };
    spy('main > section[id]', Array.prototype.slice.call(document.querySelectorAll('.site-nav__link')));
  }

  /* ---------- Form liên hệ ---------- */
  var form = document.querySelector('[data-inquiry-form]');
  if (form) {
    var formCfg = CFG.form || {};
    var success = document.querySelector('[data-form-success]');
    var alertBox = form.querySelector('[data-form-error]');
    var submitBtn = form.querySelector('[data-submit]');
    var submitLabel = form.querySelector('[data-submit-label]');

    var rules = {
      name: function (v) { return v.trim() ? '' : 'Vui lòng nhập họ và tên.'; },
      phone: function (v) { return /^\+?[\d\s.-]{9,15}$/.test(v.trim()) ? '' : 'Số điện thoại chưa hợp lệ.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Email chưa hợp lệ.'; },
      need: function (v) { return v ? '' : 'Vui lòng chọn nhu cầu.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'Nội dung tối thiểu 10 ký tự.'; }
    };

    var showError = function (field, msg) {
      var errEl = document.getElementById(field.getAttribute('aria-describedby'));
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (errEl) errEl.textContent = msg;
    };
    var validateField = function (field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var msg = rule(field.value);
      showError(field, msg);
      return !msg;
    };

    form.addEventListener('focusout', function (e) {
      if (e.target.name && rules[e.target.name] && e.target.value) validateField(e.target);
    });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') validateField(e.target);
    });

    var setLoading = function (on) {
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-loading', on);
      submitBtn.setAttribute('aria-busy', String(on));
      submitLabel.textContent = on ? 'Đang gửi…' : 'Gửi yêu cầu';
    };

    var send = function (data) {
      var endpoint = clean(formCfg.endpoint);
      if (!endpoint) {
        // Chưa có nơi nhận: chỉ giả lập khi demo hoặc chạy trên máy, không giả vờ thành công trên site thật.
        var simulate = formCfg.demo || location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
        if (!formCfg.demo) console.warn('[NAVI KING] Chưa cấu hình form.endpoint trong assets/js/config.js');
        return new Promise(function (resolve, reject) {
          setTimeout(simulate ? resolve : function () { reject(new Error('no-endpoint')); }, 1200);
        });
      }
      return fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); });
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alertBox.hidden = true;

      var fields = Array.prototype.slice.call(form.elements).filter(function (f) { return rules[f.name]; });
      var invalid = fields.filter(function (f) { return !validateField(f); });
      if (invalid.length) { invalid[0].focus(); return; }

      var data = Object.fromEntries(new FormData(form).entries());
      if (data.website) return; // bot điền ô ẩn
      delete data.website;
      data.page = location.href;

      setLoading(true);
      send(data)
        .then(function () { form.hidden = true; success.hidden = false; success.focus(); })
        .catch(function () { alertBox.hidden = false; })
        .then(function () { setLoading(false); });
    });

    var resetBtn = document.querySelector('[data-form-reset]');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach(function (f) { showError(f, ''); });
      success.hidden = true;
      form.hidden = false;
      form.querySelector('input').focus();
    });
  }

  /* ---------- Năm bản quyền ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
