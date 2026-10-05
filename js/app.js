// Оболочка сайта: шапка, подвал, меню, поиск, вход, мини-корзина, валюты, тосты, анимации.
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  window.$ = $; window.$$ = $$;
  window.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  window.plural = function (n, a, b, c) { var m = n % 10, h = n % 100; return h > 10 && h < 15 ? c : m === 1 ? a : m > 1 && m < 5 ? b : c; };

  /* ---------- деньги ---------- */
  function fmt(uah) {
    var cur = CURRENCIES[Store.currency()] || CURRENCIES.UAH, v = Math.round(uah * cur.rate);
    return cur.pos === 'before' ? cur.sym + v : v + ' ' + cur.sym;
  }
  window.money = function (uah) { return '<span data-p="' + uah + '">' + fmt(uah) + '</span>'; };
  window.moneyText = fmt;
  window.refreshPrices = function () { $$('[data-p]').forEach(function (el) { el.textContent = fmt(Number(el.getAttribute('data-p'))); }); };

  /* ---------- иконки ---------- */
  var s = function (b, vb) { return '<svg viewBox="' + (vb || '0 0 24 24') + '" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + b + '</svg>'; };
  window.IC = {
    burger: '<svg viewBox="0 0 34 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M2 4h30M2 12h20M2 20h12"/></svg>',
    search: s('<circle cx="11" cy="11" r="7.500"/><path d="m20.500 20.500-4.800-4.800"/>'),
    user: s('<circle cx="12" cy="8" r="4"/><path d="M4 21c.6-4.200 3.800-6.500 8-6.500s7.400 2.300 8 6.500"/>'),
    heart: s('<path d="M12 20.500S3.500 15.300 3.500 9.200C3.500 6.300 5.600 4.500 8 4.500c1.700 0 3.100.9 4 2.500.9-1.600 2.300-2.500 4-2.500 2.400 0 4.500 1.800 4.500 4.700 0 6.100-8.500 11.300-8.500 11.300z"/>'),
    cart: s('<path d="M2.500 3.500h3l2.600 11.800h10.500L21 7H6.400"/><circle cx="9.500" cy="19.500" r="1.400"/><circle cx="17.500" cy="19.500" r="1.400"/>'),
    trash: s('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    down: s('<path d="m6 9 6 6 6-6"/>', '0 0 24 24'),
    right: s('<path d="m9 5 7 7-7 7"/>'),
    close: s('<path d="M5 5l14 14M19 5 5 19"/>'),
    minus: s('<path d="M6 12h12"/>'),
    plus: s('<path d="M6 12h12M12 6v12"/>'),
    insta: s('<rect x="3.500" y="3.500" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r=".6" fill="currentColor"/>'),
    tg: s('<circle cx="12" cy="12" r="9"/><path d="m7 12.500 9.500-4-2 8-3-2.300-1.800 1.600-.4-3z"/>'),
    check: s('<path d="m5 12.500 4.500 4.500L19 7"/>')
  };

  /* ---------- шапка ---------- */
  var body = document.body, hero = body.hasAttribute('data-hero');
  function ddHtml(id, label, items) {
    return '<div class="dd" data-dd="' + id + '"><button class="dd-btn" aria-haspopup="true"><span>' + label + '</span>' + IC.down + '</button><div class="dd-menu">' + items.map(function (i) { return '<button data-v="' + i[0] + '"' + (i[2] ? ' disabled' : '') + '>' + i[1] + '</button>'; }).join('') + '</div></div>';
  }
  function headerHtml() {
    var cur = Store.currency();
    return '<header class="hdr' + (hero ? ' over' : '') + '" id="hdr"><div class="hdr-in">' +
      '<div class="hl"><button class="burger" id="burger" aria-label="Меню">' + IC.burger + '</button>' +
      '<nav class="hnav"><a href="catalog.html?c=new">NEW</a><a href="catalog.html">КАТАЛОГ</a><a href="info.html?p=about">О НАС</a></nav>' +
      '<div class="hlang m-only">' + ddHtml('lang', 'RU', [['ru', 'Русский'], ['ua', 'Українська', 1], ['en', 'English', 1]]) + '</div></div>' +
      '<a class="logo" href="index.html" aria-label="YANKI"><span class="l-sans">YANKI</span><span class="l-serif">YANKI</span></a>' +
      '<div class="hr"><div class="hd-only">' + ddHtml('lang', 'RU', [['ru', 'Русский'], ['ua', 'Українська', 1], ['en', 'English', 1]]) + ddHtml('cur', cur, [['UAH', 'UAH — гривна'], ['USD', 'USD — доллар'], ['EUR', 'EUR — евро']]) + '</div>' +
      '<div class="icons"><button class="hi hd-only" id="bSearch" aria-label="Поиск">' + IC.search + '</button><button class="hi hd-only" id="bUser" aria-label="Личный кабинет">' + IC.user + '</button>' +
      '<a class="hi" href="favorites.html" aria-label="Избранное">' + IC.heart + '<b class="cnt" id="favCnt"></b></a>' +
      '<a class="hi" href="cart.html" id="cartIc" aria-label="Корзина">' + IC.cart + '<b class="cnt" id="cartCnt"></b></a></div></div></div></header>';
  }
  function footerHtml() {
    var col = function (t, links) { return '<div class="fcol"><button class="fh" aria-expanded="false">' + t + IC.down + '</button><div class="fl">' + links + '</div></div>'; };
    var a = function (h, t) { return '<a href="' + h + '">' + t + '</a>'; };
    return '<footer class="ftr"><div class="wrap"><div class="fgrid">' +
      col('КОМПАНИЯ', a('info.html?p=about', 'О нас') + a('info.html?p=contacts', 'Контакты')) +
      col('ПОЛЕЗНОЕ', a('info.html?p=delivery', 'Оплата и доставка') + a('info.html?p=returns', 'Условия возврата') + a('info.html?p=bonus', 'Бонусная система')) +
      col('ПОКУПАТЕЛЮ', a('favorites.html', 'Избранное') + a('info.html?p=offer', 'Публичная оферта') + a('info.html?p=privacy', 'Политика конфиденциальности')) +
      '<div class="fcol fcont"><div class="fh static">КОНТАКТЫ</div><div class="fl open"><div class="soc"><a href="#" aria-label="Instagram" data-soc>' + IC.insta + '</a><a href="#" aria-label="Telegram" data-soc>' + IC.tg + '</a></div><a href="tel:+380730963644">+38(073) 096 36 44</a><a href="mailto:info@yanki.com">info@yanki.com</a></div></div>' +
      '</div><p class="copy">© 2021 Yanki. All rights reserved</p></div></footer>';
  }

  var hdrWrap = document.getElementById('hdr-slot'), ftrWrap = document.getElementById('ftr-slot');
  if (hdrWrap) hdrWrap.outerHTML = headerHtml();
  if (ftrWrap) ftrWrap.outerHTML = footerHtml();

  // оверлеи: меню, поиск, вход, мини-корзина
  var layer = document.createElement('div');
  layer.innerHTML =
    '<div class="scrim" id="scrim"></div>' +
    '<aside class="drawer" id="drawer" aria-hidden="true"><button class="x" data-close aria-label="Закрыть">' + IC.close + '</button><div class="dr-t">Меню</div><nav class="dr-nav"><a href="catalog.html?c=new">NEW</a><a href="catalog.html">Весь каталог</a>' +
    CATEGORIES.map(function (c) { return '<a class="sub" href="catalog.html?c=' + c.id + '">' + c.name + '</a>'; }).join('') + '<a href="info.html?p=about">О нас</a><a href="info.html?p=delivery">Оплата и доставка</a><a href="info.html?p=contacts">Контакты</a><a href="favorites.html">Избранное</a><a href="account.html" data-acc>Личный кабинет</a></nav>' +
    '<div class="dr-cur m-only">' + ['UAH', 'USD', 'EUR'].map(function (c) { return '<button data-cur="' + c + '">' + c + '</button>'; }).join('') + '</div></aside>' +
    '<section class="search" id="searchPanel" aria-hidden="true"><div class="wrap"><div class="s-row"><span class="s-ic">' + IC.search + '</span><input id="sInput" type="search" placeholder="Поиск по каталогу" autocomplete="off"><button class="x" data-close aria-label="Закрыть">' + IC.close + '</button></div><div class="s-res" id="sRes"></div></div></section>' +
    '<div class="modal" id="authModal" aria-hidden="true"><div class="m-box"><button class="x" data-close aria-label="Закрыть">' + IC.close + '</button><div class="m-tabs"><button class="on" data-t="in">Вход</button><button data-t="up">Регистрация</button></div>' +
    '<form id="authForm" novalidate><label class="fld up-only"><input name="name" placeholder="Ваше имя*"><span class="err"></span></label><label class="fld"><input name="email" type="email" placeholder="Ваш e-mail*"><span class="err"></span></label><label class="fld"><input name="pass" type="password" placeholder="Пароль*"><span class="err"></span></label>' +
    '<button class="btn" type="submit"><span>ВОЙТИ</span></button><p class="hint">Демо: подойдут любая почта и пароль от 4 символов. Данные остаются в вашем браузере.</p></form></div></div>' +
    '<div class="mini" id="mini" aria-hidden="true"></div>' +
    '<div class="toast" id="toast" role="status"></div>';
  document.body.appendChild(layer);

  /* ---------- состояние шапки ---------- */
  function updateCounts() {
    var c = Store.count(), f = Store.favs().length, ce = $('#cartCnt'), fe = $('#favCnt');
    if (ce) { ce.textContent = c; ce.style.display = c ? '' : 'none'; }
    if (fe) { fe.textContent = f; fe.style.display = f ? '' : 'none'; }
  }
  var lastC = null;
  function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  updateCounts();
  document.addEventListener('store', function (e) {
    if (e.detail === 'cart') { var n = Store.count(); if (lastC !== null && n > lastC) bump($('#cartCnt')); lastC = n; updateCounts(); }
    if (e.detail === 'favs') { updateCounts(); bump($('#favCnt')); }
    if (e.detail === 'cur') { $$('.dd[data-dd="cur"] .dd-btn span').forEach(function (x) { x.textContent = Store.currency(); }); refreshPrices(); }
  });
  lastC = Store.count();
  var hdr = $('#hdr');
  function onScroll() { if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var curLabel = $$('.dd[data-dd="cur"] .dd-btn span'); curLabel.forEach(function (x) { x.textContent = Store.currency(); });

  /* ---------- выпадающие списки ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.dd-btn');
    $$('.dd.open').forEach(function (d) { if (!btn || d !== btn.parentNode) d.classList.remove('open'); });
    if (btn) { btn.parentNode.classList.toggle('open'); return; }
    var it = e.target.closest('.dd-menu button');
    if (it && !it.disabled) {
      var dd = it.closest('.dd'), id = dd.getAttribute('data-dd');
      if (id === 'cur') Store.setCurrency(it.getAttribute('data-v')); else toast('Пока доступна только русская версия');
      dd.classList.remove('open');
    } else if (it) toast('Эта версия сайта скоро появится');
  });

  /* ---------- слои: меню, поиск, вход ---------- */
  var scrim = $('#scrim'), openEl = null;
  function openLayer(el) {
    closeLayer(true); openEl = el; el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); scrim.classList.add('open'); body.classList.add('lock');
  }
  function closeLayer(silent) {
    if (openEl) { openEl.classList.remove('open'); openEl.setAttribute('aria-hidden', 'true'); }
    openEl = null; scrim.classList.remove('open'); body.classList.remove('lock');
  }
  window.closeLayer = closeLayer;
  scrim.addEventListener('click', function () { closeLayer(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLayer(); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeLayer();
    if (e.target.closest('#burger')) openLayer($('#drawer'));
    if (e.target.closest('#bSearch')) { openLayer($('#searchPanel')); setTimeout(function () { $('#sInput').focus(); }, 250); }
    if (e.target.closest('#bUser') || e.target.closest('[data-acc]')) {
      var a = e.target.closest('#bUser') || e.target.closest('[data-acc]');
      if (!Store.user()) { e.preventDefault(); Auth.open(function () { location.href = 'account.html'; }); }
      else if (a.id === 'bUser') location.href = 'account.html';
    }
    var cb = e.target.closest('[data-cur]'); if (cb) { Store.setCurrency(cb.getAttribute('data-cur')); }
    if (e.target.closest('[data-soc]')) { e.preventDefault(); toast('Это учебный проект: ссылки на соцсети отключены'); }
    var fh = e.target.closest('.fh:not(.static)');
    if (fh) { var l = fh.nextElementSibling, open = fh.getAttribute('aria-expanded') === 'true'; fh.setAttribute('aria-expanded', String(!open)); l.classList.toggle('open', !open); }
  });

  // поиск
  var sIn = $('#sInput'), sRes = $('#sRes');
  sIn.addEventListener('input', function () {
    var q = sIn.value.trim().toLowerCase();
    if (!q) { sRes.innerHTML = '<p class="s-hint">Начните вводить: «пальто», «шуба», «парка»…</p>'; return; }
    var r = PRODUCTS.filter(function (p) { return (p.name + ' ' + catName(p.cat) + ' ' + p.color[0] + ' ' + p.art).toLowerCase().indexOf(q) >= 0; }).slice(0, 6);
    sRes.innerHTML = r.length ? r.map(function (p, i) { return '<a class="s-item" style="animation-delay:' + i * 50 + 'ms" href="product.html?id=' + p.id + '"><img src="' + p.photo + '" alt=""><span>' + esc(p.name) + '</span><em>' + money(p.price) + '</em></a>'; }).join('') : '<p class="s-hint">Ничего не найдено по запросу «' + esc(sIn.value) + '»</p>';
  });
  sRes.innerHTML = '<p class="s-hint">Начните вводить: «пальто», «шуба», «парка»…</p>';

  /* ---------- вход / регистрация ---------- */
  var modal = $('#authModal'), form = $('#authForm'), mode = 'in', after = null;
  window.Auth = {
    open: function (cb) { after = cb || null; setMode('in'); openLayer(modal); },
    logout: function () { Store.logout(); toast('Вы вышли из аккаунта'); }
  };
  function setMode(m) {
    mode = m; $$('.m-tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-t') === m); });
    form.classList.toggle('up', m === 'up'); $('.btn span', form).textContent = m === 'in' ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ';
    $$('.err', form).forEach(function (x) { x.textContent = ''; }); $$('input', form).forEach(function (x) { x.classList.remove('bad'); });
  }
  $('.m-tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setMode(b.getAttribute('data-t')); });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var bad = false, f = form.elements;
    function chk(el, cond, msg) { var er = el.parentNode.querySelector('.err'); el.classList.remove('bad'); er.textContent = ''; if (cond) { el.classList.add('bad'); er.textContent = msg; void el.offsetWidth; bad = true; } }
    if (mode === 'up') chk(f.name, f.name.value.trim().length < 2, 'Введите имя');
    chk(f.email, !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value), 'Проверьте адрес почты');
    chk(f.pass, f.pass.value.length < 4, 'Минимум 4 символа');
    if (bad) return;
    var u = mode === 'up' ? { name: f.name.value.trim(), surname: '', email: f.email.value, phone: '', city: '', office: '' } : { name: 'Елизавета', surname: 'Станиславчук', email: f.email.value || 'ella.s97@gmail.com', phone: '+38(067)470 20 66', city: 'Черновцы', office: '№4' };
    Store.setUser(u); closeLayer(); toast(mode === 'up' ? 'Аккаунт создан' : 'С возвращением, ' + u.name + '!'); form.reset();
    if (after) { var cb = after; after = null; setTimeout(cb, 500); }
  });

  /* ---------- мини-корзина ---------- */
  var miniT;
  window.showMini = function (p, size, qty) {
    var m = $('#mini');
    m.innerHTML = '<div class="mi-h">Товар добавлен в корзину</div><div class="mi-b"><img src="' + p.photo + '" alt=""><div><b>' + esc(p.name) + '</b><span>Размер ' + size + ' · ' + qty + ' шт.</span><em>' + money(p.price * qty) + '</em></div></div><a class="btn sm" href="cart.html"><span>ПЕРЕЙТИ В КОРЗИНУ</span></a>';
    m.classList.add('open'); m.setAttribute('aria-hidden', 'false'); m.setAttribute('data-t', Date.now()); clearTimeout(miniT);
    miniT = setTimeout(function () { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); }, 4200);
  };
  document.addEventListener('click', function (e) { var m = $('#mini'); if (!e.target.closest('#mini') && !e.target.closest('[data-add]') && Date.now() - Number(m.getAttribute('data-t') || 0) > 400) m.classList.remove('open'); });

  /* ---------- тосты ---------- */
  var tt;
  window.toast = function (msg) { var t = $('#toast'); t.textContent = msg; void t.offsetWidth; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2600); };

  /* ---------- карточка товара ---------- */
  window.productCard = function (p, i) {
    var fav = Store.isFav(p.id), free = p.sizes.filter(function (z) { return p.soldOut.indexOf(z) < 0; })[0];
    return '<article class="pcard reveal" style="--d:' + ((i || 0) % 4) * 80 + 'ms"><a class="pc-img" href="product.html?id=' + p.id + '"><img src="' + p.photo + '" alt="' + esc(p.name) + '" loading="lazy">' +
      (p.new ? '<span class="pc-tag">NEW</span>' : '') + '<button class="pc-fav' + (fav ? ' on' : '') + '" data-fav="' + p.id + '" aria-label="В избранное">' + IC.heart + '</button>' +
      '<button class="pc-quick" data-add="' + p.id + '" data-size="' + free + '"><span>+ В КОРЗИНУ, ' + free + '</span></button></a>' +
      '<div class="pc-info"><a href="product.html?id=' + p.id + '" class="pc-name">' + esc(p.name) + '</a><div class="pc-row"><span class="pc-price">' + money(p.price) + '</span><i class="dot" style="background:' + p.color[1] + '" title="' + p.color[0] + '"></i></div></div></article>';
  };

  // сердечко и быстрое добавление (делегирование)
  document.addEventListener('click', function (e) {
    var h = e.target.closest('[data-fav]');
    if (h) {
      e.preventDefault(); e.stopPropagation(); var id = Number(h.getAttribute('data-fav')), on = Store.toggleFav(id);
      $$('[data-fav="' + id + '"]').forEach(function (x) { x.classList.toggle('on', on); });
      toast(on ? 'Добавлено в избранное' : 'Убрано из избранного'); document.dispatchEvent(new CustomEvent('favchange', { detail: id }));
      return;
    }
    var q = e.target.closest('.pc-quick');
    if (q) {
      e.preventDefault(); var p = productById(q.getAttribute('data-add')), sz = q.getAttribute('data-size');
      Store.add(p.id, sz, 1); showMini(p, sz, 1);
    }
  }, true);

  /* ---------- плавное появление ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -4% 0px' }) : null;
  window.observeReveal = function (root) { $$('.reveal:not(.in)', root).forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); }); };
  window.rerender = function () { setTimeout(function () { observeReveal(document); refreshPrices(); $$('img[loading="lazy"]').forEach(function (i) { if (i.complete) i.classList.add('ld'); }); }, 30); };
  // картинки: плавная подгрузка
  document.addEventListener('load', function (e) { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);
  rerender();
})();
