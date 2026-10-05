// Страницы: главная, каталог, товар, избранное, корзина и оформление, успех, кабинет, инфо
(function () {
  var page = document.body.getAttribute('data-page');
  var root = document.getElementById('page');
  var qs = new URLSearchParams(location.search);
  var views = {};
  var sizeOrder = ['XS', 'S', 'M', 'L'];

  function crumbs(list) {
    return '<nav class="crumbs" aria-label="Хлебные крошки">' + list.map(function (c, i) { return (c[1] ? '<a href="' + c[1] + '">' + c[0] + '</a>' : '<span>' + c[0] + '</span>') + (i < list.length - 1 ? '<i>' + IC.right + '</i>' : ''); }).join('') + '</nav>';
  }
  function countUp(el, to) {
    var from = Number(el.getAttribute('data-from') || to), t0 = performance.now();
    el.setAttribute('data-from', to); el.setAttribute('data-p', to);
    (function step(t) { var k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3); el.textContent = moneyText(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  // Свой выпадающий список (размер): items = [[value, label, disabled]]
  function selectHtml(id, value, items) {
    return '<div class="sel" data-sel="' + id + '"><button type="button" class="sel-b"><span>' + value + '</span>' + IC.down + '</button><div class="sel-m">' + items.map(function (i) { return '<button type="button" data-v="' + i[0] + '"' + (i[2] ? ' disabled' : '') + (i[0] === value ? ' class="on"' : '') + '>' + i[1] + '</button>'; }).join('') + '</div></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.sel-b');
    Array.prototype.forEach.call(document.querySelectorAll('.sel.open'), function (s) { if (!b || s !== b.parentNode) s.classList.remove('open'); });
    if (b) b.parentNode.classList.toggle('open');
  });

  /* ======================= ГЛАВНАЯ ======================= */
  views.home = function () {
    var panes = ['white-short-coat', 'white-coat', 'ivory-fur'];
    root.innerHTML =
      '<section class="hero">' + panes.map(function (p, i) { return '<div class="h-pane p' + i + '" style="--i:' + i + '"><img src="assets/photos/' + p + '.jpg" alt=""></div>'; }).join('') +
      '<div class="h-copy"><h1>Новая коллекция</h1><span class="h-line"></span><a href="catalog.html?c=new" class="h-link">СМОТРЕТЬ НОВИНКИ <i>' + IC.right + '</i></a></div></section>' +
      '<section class="wrap cats"><h2 class="h2 reveal">Категории</h2><div class="slider reveal"><div class="s-track" id="track">' +
      CATEGORIES.map(function (c, i) { return '<a class="cat" href="catalog.html?c=' + c.id + '" style="--d:' + i * 90 + 'ms"><img src="' + c.photo + '" alt="' + c.name + '" loading="lazy"><span class="cat-l">' + c.name + '</span></a>'; }).join('') +
      '</div><button class="s-next" id="sNext" aria-label="Дальше">' + IC.right + '</button><button class="s-prev" id="sPrev" aria-label="Назад">' + IC.right + '</button></div></section>' +
      '<section class="sub"><div class="wrap"><h2 class="h2c reveal">Узнайте&nbsp; первым о новинках</h2><form class="sub-form reveal" id="subForm" novalidate><label class="fld"><input name="email" type="email" placeholder="Ваш e-mail*" autocomplete="email"><span class="err"></span></label><button class="btn" type="submit"><span>ПОДПИСАТЬСЯ</span></button><p class="legal">Нажимая на кнопку «Подписаться», я соглашаюсь на обработку моих персональных данных и ознакомлен(а) с условиями конфиденциальности.</p></form></div></section>';

    var track = document.getElementById('track'), nx = document.getElementById('sNext'), pv = document.getElementById('sPrev');
    function arrows() { var max = track.scrollWidth - track.clientWidth - 4; nx.classList.toggle('hide', track.scrollLeft >= max); pv.classList.toggle('hide', track.scrollLeft < 8); }
    var step = function () { var c = track.querySelector('.cat'); return c.offsetWidth + 12; };
    nx.onclick = function () { track.scrollBy({ left: step() * 2, behavior: 'smooth' }); };
    pv.onclick = function () { track.scrollBy({ left: -step() * 2, behavior: 'smooth' }); };
    track.addEventListener('scroll', arrows, { passive: true }); window.addEventListener('resize', arrows); arrows();
    // перетаскивание мышью
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; track.classList.add('drag'); } track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('drag'); });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);

    var f = document.getElementById('subForm');
    if (Store.subscribed()) f.innerHTML = '<div class="done"><span>' + IC.check + '</span><p>Вы уже с нами: ' + esc(Store.subscribed()) + '. Новинки пришлём первыми.</p></div>';
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var inp = f.elements.email, er = f.querySelector('.err'), ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value);
      inp.classList.toggle('bad', !ok); er.textContent = ok ? '' : 'Введите корректный e-mail';
      if (!ok) { void inp.offsetWidth; return; }
      Store.setSubscribed(inp.value); f.innerHTML = '<div class="done"><span>' + IC.check + '</span><p>Спасибо! Мы отправили письмо на ' + esc(inp.value) + ', чтобы подтвердить подписку.</p></div>';
    });
  };

  /* ======================= КАТАЛОГ ======================= */
  views.catalog = function () {
    var cat = qs.get('c') || 'all', size = qs.get('s') || '', sort = qs.get('o') || 'pop';
    var tabs = [['all', 'Все'], ['new', 'NEW']].concat(CATEGORIES.map(function (c) { return [c.id, c.name]; }));
    function list() {
      var l = PRODUCTS.filter(function (p) { return (cat === 'all' || (cat === 'new' ? p.new : p.cat === cat)) && (!size || (p.sizes.indexOf(size) >= 0 && p.soldOut.indexOf(size) < 0)); });
      if (sort === 'asc') l.sort(function (a, b) { return a.price - b.price; }); else if (sort === 'desc') l.sort(function (a, b) { return b.price - a.price; });
      return l;
    }
    var title = (tabs.filter(function (t) { return t[0] === cat; })[0] || tabs[0])[1];
    root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Каталог', cat === 'all' ? '' : 'catalog.html'].concat(), cat === 'all' ? null : [title]].filter(Boolean)) +
      '<div class="cat-head"><h1 class="h1">' + (cat === 'all' ? 'Каталог' : title) + '</h1><span class="cnt-t" id="ct"></span></div>' +
      '<div class="filters"><div class="f-tabs" id="ft">' + tabs.map(function (t) { return '<button class="' + (t[0] === cat ? 'on' : '') + '" data-c="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="f-right"><div class="f-size" id="fs"><span>Размер:</span>' + sizeOrder.map(function (z) { return '<button class="' + (z === size ? 'on' : '') + '" data-s="' + z + '">' + z + '</button>'; }).join('') + '</div>' +
      selectHtml('sort', { pop: 'По популярности', asc: 'Сначала дешевле', desc: 'Сначала дороже' }[sort], [['pop', 'По популярности'], ['asc', 'Сначала дешевле'], ['desc', 'Сначала дороже']]) + '</div></div>' +
      '<div class="grid" id="grid"></div></div>';
    function draw() {
      var l = list(), g = document.getElementById('grid');
      document.getElementById('ct').textContent = l.length + ' ' + plural(l.length, 'товар', 'товара', 'товаров');
      g.innerHTML = l.length ? l.map(function (p, i) { return productCard(p, i); }).join('') : '<div class="empty"><h3>Ничего не найдено</h3><p>Попробуйте другой размер или раздел</p><button class="btn" id="rst"><span>СБРОСИТЬ ФИЛЬТРЫ</span></button></div>';
      var r = document.getElementById('rst'); if (r) r.onclick = function () { size = ''; cat = 'all'; sync(); };
      rerender();
    }
    function sync() {
      var u = new URLSearchParams(); if (cat !== 'all') u.set('c', cat); if (size) u.set('s', size); if (sort !== 'pop') u.set('o', sort);
      history.replaceState(null, '', 'catalog.html' + (u.toString() ? '?' + u : ''));
      Array.prototype.forEach.call(document.querySelectorAll('#ft button'), function (b) { b.classList.toggle('on', b.getAttribute('data-c') === cat); });
      Array.prototype.forEach.call(document.querySelectorAll('#fs button'), function (b) { b.classList.toggle('on', b.getAttribute('data-s') === size); });
      var t = (tabs.filter(function (x) { return x[0] === cat; })[0] || tabs[0])[1]; document.querySelector('.h1').textContent = cat === 'all' ? 'Каталог' : t;
      draw();
    }
    document.getElementById('ft').onclick = function (e) { var b = e.target.closest('[data-c]'); if (b) { cat = b.getAttribute('data-c'); sync(); } };
    document.getElementById('fs').onclick = function (e) { var b = e.target.closest('[data-s]'); if (b) { size = size === b.getAttribute('data-s') ? '' : b.getAttribute('data-s'); sync(); } };
    document.querySelector('[data-sel="sort"]').addEventListener('click', function (e) { var b = e.target.closest('.sel-m button'); if (!b) return; sort = b.getAttribute('data-v'); this.querySelector('.sel-b span').textContent = b.textContent; this.classList.remove('open'); sync(); });
    draw();
  };

  /* ======================= ТОВАР ======================= */
  views.product = function () {
    var p = productById(qs.get('id')) || PRODUCTS[0], size = '', qty = 1;
    var rel = PRODUCTS.filter(function (x) { return x.id !== p.id && x.cat === p.cat; }).concat(PRODUCTS.filter(function (x) { return x.id !== p.id && x.cat !== p.cat; })).slice(0, 4);
    document.title = p.name + ' — YANKI';
    root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Каталог', 'catalog.html'], [catName(p.cat), 'catalog.html?c=' + p.cat], [p.name]]) +
      '<div class="pdp"><div class="pdp-img" id="zoom"><img src="' + p.photo + '" alt="' + esc(p.name) + '"><span class="z-hint">Наведите для увеличения</span></div>' +
      '<div class="pdp-info"><span class="art">арт. ' + p.art + '</span><h1 class="h1">' + esc(p.name) + '</h1><div class="pdp-price">' + money(p.price) + '</div>' +
      '<div class="pdp-row"><span class="lbl">Цвет</span><span class="clr"><i class="dot big" style="background:' + p.color[1] + '"></i>' + p.color[0] + '</span></div>' +
      '<div class="pdp-row col"><span class="lbl">Размер</span><div class="sizes" id="sizes">' + p.sizes.map(function (z) { var off = p.soldOut.indexOf(z) >= 0; return '<button class="' + (off ? 'off' : '') + '" data-z="' + z + '"' + (off ? ' title="Нет в наличии"' : '') + '>' + z + '</button>'; }).join('') + '</div><span class="sz-err" id="szErr"></span></div>' +
      '<div class="pdp-row"><span class="lbl">Количество</span><div class="qty" id="qty"><button data-q="-1" aria-label="Меньше">' + IC.minus + '</button><b id="qn">1</b><button data-q="1" aria-label="Больше">' + IC.plus + '</button></div></div>' +
      '<div class="pdp-cta"><button class="btn" id="add"><span>ДОБАВИТЬ В КОРЗИНУ</span></button><button class="fav-big' + (Store.isFav(p.id) ? ' on' : '') + '" data-fav="' + p.id + '" aria-label="В избранное">' + IC.heart + '</button></div>' +
      '<div class="acc"><div class="acc-i open"><button class="acc-h">Описание' + IC.down + '</button><div class="acc-b"><div><p>' + esc(p.desc) + '</p></div></div></div><div class="acc-i"><button class="acc-h">Состав и уход' + IC.down + '</button><div class="acc-b"><div><p>' + esc(p.comp) + '</p><p>Деликатная чистка или ручная стирка при 30 °C, не отжимать, сушить на плечиках.</p></div></div></div><div class="acc-i"><button class="acc-h">Доставка и возврат' + IC.down + '</button><div class="acc-b"><div><p>Самовывоз бесплатно, Новая Почта по тарифам перевозчика. Возврат в течение 14 дней, если вещь не была в носке.</p></div></div></div></div></div></div>' +
      '<section class="rel"><h2 class="h2 reveal">Вам может понравиться</h2><div class="grid">' + rel.map(function (x, i) { return productCard(x, i); }).join('') + '</div></section></div>';

    document.getElementById('sizes').onclick = function (e) {
      var b = e.target.closest('[data-z]'); if (!b || b.classList.contains('off')) return; size = b.getAttribute('data-z');
      Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle('on', x === b); }); document.getElementById('szErr').textContent = '';
    };
    document.getElementById('qty').onclick = function (e) { var b = e.target.closest('[data-q]'); if (!b) return; qty = Math.max(1, Math.min(9, qty + Number(b.getAttribute('data-q')))); var n = document.getElementById('qn'); n.textContent = qty; n.classList.remove('tick'); void n.offsetWidth; n.classList.add('tick'); };
    var add = document.getElementById('add');
    add.onclick = function () {
      if (!size) { var er = document.getElementById('szErr'), sz = document.getElementById('sizes'); er.textContent = 'Выберите размер'; sz.classList.remove('shake'); void sz.offsetWidth; sz.classList.add('shake'); return; }
      Store.add(p.id, size, qty); showMini(p, size, qty);
      add.classList.add('ok'); add.querySelector('span').innerHTML = IC.check + ' ДОБАВЛЕНО'; setTimeout(function () { add.classList.remove('ok'); add.querySelector('span').textContent = 'ДОБАВИТЬ В КОРЗИНУ'; }, 1800);
    };
    Array.prototype.forEach.call(document.querySelectorAll('.acc-h'), function (h) { h.onclick = function () { h.parentNode.classList.toggle('open'); }; });
    // лупа при наведении
    var z = document.getElementById('zoom'), zi = z.querySelector('img');
    z.addEventListener('mousemove', function (e) { var r = z.getBoundingClientRect(); zi.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%'; z.classList.add('zoom'); });
    z.addEventListener('mouseleave', function () { z.classList.remove('zoom'); });
  };

  /* ======================= ИЗБРАННОЕ ======================= */
  views.favorites = function () {
    function draw() {
      var l = Store.favs().map(function (id) { return productById(id); }).filter(Boolean);
      root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Избранное']]) + '<div class="cat-head"><h1 class="h1">Избранное</h1><span class="cnt-t">' + l.length + ' ' + plural(l.length, 'товар', 'товара', 'товаров') + '</span></div>' +
        (l.length ? '<div class="grid">' + l.map(function (p, i) { return productCard(p, i); }).join('') + '</div>' : '<div class="empty"><h3>В избранном пока пусто</h3><p>Нажмите на сердечко у вещи, которая понравилась, и она появится здесь.</p><a class="btn" href="catalog.html"><span>В КАТАЛОГ</span></a></div>') + '</div>';
      rerender();
    }
    draw();
    document.addEventListener('favchange', function (e) {
      var c = document.querySelector('.pcard [data-fav="' + e.detail + '"]'); c = c && c.closest('.pcard');
      if (c) { c.style.transition = 'opacity .4s, transform .4s'; c.style.opacity = '0'; c.style.transform = 'scale(.94)'; setTimeout(draw, 400); }
    });
  };

  /* ======================= КОРЗИНА И ОФОРМЛЕНИЕ ======================= */
  views.cart = function () {
    var user = Store.user() || {}, draft = Store.draft(), D = {
      name: draft.name || user.name || '', surname: draft.surname || user.surname || '', email: draft.email || user.email || '', phone: draft.phone || user.phone || '',
      city: draft.city || user.city || '', office: draft.office || user.office || '', address: draft.address || '', delivery: draft.delivery || 'pickup', pay: draft.pay || 'cod', bonus: ''
    };
    function lineHtml(i, k) {
      var p = productById(i.pid);
      return '<div class="line" data-k="' + i.pid + '|' + i.size + '" style="--d:' + k * 80 + 'ms"><a class="l-img" href="product.html?id=' + p.id + '"><img src="' + p.photo + '" alt=""></a>' +
        '<div class="l-name"><span class="art">арт. ' + p.art + '</span><a href="product.html?id=' + p.id + '">' + esc(p.name) + '</a></div><i class="dot big" style="background:' + p.color[1] + '" title="' + p.color[0] + '"></i>' +
        selectHtml('size', i.size, p.sizes.map(function (z) { return [z, z, p.soldOut.indexOf(z) >= 0]; })) +
        '<div class="qty"><button data-q="-1" aria-label="Меньше">' + IC.minus + '</button><b>' + i.qty + '</b><button data-q="1" aria-label="Больше">' + IC.plus + '</button></div>' +
        '<div class="l-price">' + money(p.price * i.qty) + '</div><button class="l-del" data-del aria-label="Удалить">' + IC.trash + '</button></div>';
    }
    function radios(group, name, items) {
      return items.map(function (k) { var d = DELIVERY[k] || null; return '<label class="rad"><input type="radio" name="' + name + '" value="' + k + '"' + (D[name] === k ? ' checked' : '') + '><i></i><span>' + (d ? d.name : PAYMENTS[k]) + '</span></label>'; }).join('');
    }
    function fieldsFor() {
      var f = DELIVERY[D.delivery].fields;
      if (!f.length) return '';
      return '<div class="lbl2">Адрес доставки:</div><div class="two">' + '<label class="fld"><input name="city" placeholder="Город*" value="' + esc(D.city) + '"><span class="err"></span></label>' +
        (f.indexOf('office') >= 0 ? '<label class="fld"><input name="office" placeholder="Отделение почты*" value="' + esc(D.office) + '"><span class="err"></span></label>' : '<label class="fld"><input name="address" placeholder="Адрес*" value="' + esc(D.address) + '"><span class="err"></span></label>') + '</div>';
    }
    function draw() {
      var cart = Store.cart();
      if (!cart.length) {
        root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Корзина']]) + '<div class="empty big"><h3>В корзине пока пусто</h3><p>Загляните в каталог: там много тёплых вещей на зиму.</p><a class="btn" href="catalog.html"><span>ПЕРЕЙТИ В КАТАЛОГ</span></a></div></div>'; rerender(); return;
      }
      var sum = Store.sum();
      root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Корзина']]) + '<h2 class="h2s">Ваш заказ</h2><div class="lines" id="lines">' + cart.map(lineHtml).join('') + '</div>' +
        '<div class="to-pay">К оплате: <b id="tp" data-p="' + sum + '">' + moneyText(sum) + '</b></div>' +
        '<h2 class="h2s co">Оформление заказа</h2><form id="co" novalidate class="co-grid"><div class="co-main"><div class="lbl2">Персональные данные:</div><div class="two">' +
        [['name', 'Ваше имя*'], ['surname', 'Ваша фамилия*'], ['email', 'Ваш e-mail*'], ['phone', 'Ваш телефон*']].map(function (f) { return '<label class="fld"><input name="' + f[0] + '" placeholder="' + f[1] + '" value="' + esc(D[f[0]]) + '"' + (f[0] === 'email' ? ' type="email"' : f[0] === 'phone' ? ' type="tel" inputmode="tel"' : '') + '><span class="err"></span></label>'; }).join('') + '</div>' +
        '<div class="lbl2">Способ доставки:</div><div class="two ship"><div><div class="sub-l">По Украине:</div>' + radios('ua', 'delivery', ['pickup', 'np']) + '</div><div><div class="sub-l">Международная доставка:</div>' + radios('int', 'delivery', ['ukrpost', 'dhl']) + '</div></div>' +
        '<div id="addr">' + fieldsFor() + '</div>' +
        '<div class="lbl2">Вы можете оплатить покупку одним из ниже перечисленных способов:</div><div class="pays">' + radios('pay', 'pay', ['privat', 'card', 'cod']) + '</div>' +
        '<div class="lbl2">Использование бонусного счёта:</div><label class="fld"><input name="bonus" inputmode="numeric" placeholder="Сумма списания бонусов*" value="' + D.bonus + '"><span class="err"></span><span class="hintb">Доступно: ' + Store.bonus() + ' грн</span></label></div>' +
        '<aside class="co-side"><div class="side-in"><a href="#" class="s-login" data-login' + (Store.user() ? ' style="display:none"' : '') + '>Войти в личный кабинет</a><a class="s-l" href="info.html?p=delivery">УСЛОВИЯ ДОСТАВКИ</a><a class="s-l" href="info.html?p=returns">УСЛОВИЯ ОБМЕНА И ВОЗВРАТА</a><a class="s-l" href="info.html?p=delivery">ИНФОРМАЦИЯ ОБ ОПЛАТЕ</a>' +
        '<div class="s-row"><span>ДОСТАВКА:</span><b>По тарифам перевозчика</b></div><div class="s-row"><span>БОНУСЫ:</span><b id="bn">−0 грн</b></div><div class="s-row"><span>ИТОГО:</span><b id="tt" data-p="' + sum + '">' + moneyText(sum) + '</b></div>' +
        '<button class="btn" type="submit"><span>ОФОРМИТЬ ЗАКАЗ</span></button><p class="legal2">Нажимая на кнопку «оплатить заказ», я принимаю условия <a href="info.html?p=offer">публичной оферты</a> и <a href="info.html?p=privacy">политики конфиденциальности</a></p></div></aside></form></div>';
      bindCart(); rerender();
    }
    function totals() {
      var sum = Store.sum(), max = Math.min(Store.bonus(), Math.floor(sum * 0.3)), b = Math.max(0, Math.min(max, parseInt(D.bonus, 10) || 0));
      return { sum: sum, bonus: b, total: sum - b, max: max };
    }
    function refreshTotals() {
      var t = totals(); var tp = document.getElementById('tp'), tt = document.getElementById('tt'), bn = document.getElementById('bn');
      if (tp) countUp(tp, t.sum); if (tt) countUp(tt, t.total); if (bn) bn.textContent = '−' + moneyText(t.bonus);
    }
    function save() { Store.setDraft({ name: D.name, surname: D.surname, email: D.email, phone: D.phone, city: D.city, office: D.office, address: D.address, delivery: D.delivery, pay: D.pay }); }
    function bindCart() {
      var lines = document.getElementById('lines'), form = document.getElementById('co');
      lines.addEventListener('click', function (e) {
        var row = e.target.closest('.line'); if (!row) return; var k = row.getAttribute('data-k').split('|'), pid = Number(k[0]), sz = k[1];
        var q = e.target.closest('[data-q]');
        if (q) { var it = Store.cart().filter(function (i) { return i.pid === pid && i.size === sz; })[0]; Store.setQty(pid, sz, it.qty + Number(q.getAttribute('data-q'))); var n = Store.cart().filter(function (i) { return i.pid === pid && i.size === sz; })[0]; var b = row.querySelector('.qty b'); b.textContent = n.qty; b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick'); var lp = row.querySelector('.l-price [data-p]'); countUp(lp, productById(pid).price * n.qty); refreshTotals(); return; }
        if (e.target.closest('[data-del]')) { row.classList.add('out'); setTimeout(function () { Store.remove(pid, sz); if (!Store.cart().length) draw(); else { row.remove(); refreshTotals(); } }, 420); return; }
        var o = e.target.closest('.sel-m button');
        if (o && !o.disabled) { Store.setSize(pid, sz, o.getAttribute('data-v')); draw(); }
      });
      form.addEventListener('input', function (e) {
        var t = e.target; if (t.name in D) { D[t.name] = t.value; if (t.name === 'bonus') refreshTotals(); save(); }
        t.classList.remove('bad'); var er = t.parentNode.querySelector('.err'); if (er) er.textContent = '';
      });
      form.addEventListener('change', function (e) {
        var t = e.target; if (t.type === 'radio') { D[t.name] = t.value; if (t.name === 'delivery') { document.getElementById('addr').innerHTML = fieldsFor(); } save(); }
      });
      var lg = form.querySelector('[data-login]'); if (lg) lg.addEventListener('click', function (e) { e.preventDefault(); Auth.open(function () { location.reload(); }); });
      form.addEventListener('submit', function (e) {
        e.preventDefault(); var bad = null;
        function chk(name, cond, msg) { var el = form.elements[name]; if (!el) return; var er = el.parentNode.querySelector('.err'); el.classList.remove('bad'); er.textContent = ''; if (cond) { el.classList.add('bad'); er.textContent = msg; void el.offsetWidth; if (!bad) bad = el; } }
        chk('name', D.name.trim().length < 2, 'Введите имя'); chk('surname', D.surname.trim().length < 2, 'Введите фамилию');
        chk('email', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(D.email), 'Проверьте e-mail'); chk('phone', D.phone.replace(/\D/g, '').length < 10, 'Введите телефон полностью');
        var f = DELIVERY[D.delivery].fields;
        if (f.length) { chk('city', !D.city.trim(), 'Укажите город'); if (f.indexOf('office') >= 0) chk('office', !D.office.trim(), 'Укажите отделение'); else chk('address', !D.address.trim(), 'Укажите адрес'); }
        if (D.bonus && parseInt(D.bonus, 10) > totals().max) chk('bonus', true, 'Можно списать до ' + totals().max + ' грн (30% заказа, не больше баланса)');
        if (bad) { bad.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
        var t = totals(), now = new Date(), dd = ('0' + now.getDate()).slice(-2) + '.' + ('0' + (now.getMonth() + 1)).slice(-2) + '.' + String(now.getFullYear()).slice(-2);
        var id = Store.nextOrderId(), btn = form.querySelector('.btn'); btn.disabled = true; btn.classList.add('load');
        Store.addOrder({ id: id, date: dd, status: 'В обработке', total: t.total, bonus: t.bonus, items: Store.cart().slice(), delivery: D.delivery, pay: D.pay, name: D.name, surname: D.surname, email: D.email, phone: D.phone, city: D.city, office: D.office, address: D.address });
        if (t.bonus) Store.setBonus(Store.bonus() - t.bonus);
        Store.setLastOrder(id); Store.clearCart();
        setTimeout(function () { location.href = 'order-success.html?id=' + id; }, 900);
      });
    }
    draw();
  };

  /* ======================= ЗАКАЗ ПРИНЯТ ======================= */
  views.success = function () {
    var id = Number(qs.get('id')) || Store.lastOrder(), o = Store.orders().filter(function (x) { return x.id === id; })[0];
    if (!o) { root.innerHTML = '<div class="wrap"><div class="empty big"><h3>Заказ не найден</h3><a class="btn" href="catalog.html"><span>В КАТАЛОГ</span></a></div></div>'; return; }
    root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Заказ оформлен']]) + '<div class="ok-box"><svg class="ok-ic" viewBox="0 0 80 80"><circle cx="40" cy="40" r="36"/><path d="M25 41l10 10 20-22"/></svg><h1 class="h1">Спасибо за заказ!</h1><p class="ok-n">Заказ № ' + o.id + ' принят</p><p class="ok-t">Мы отправили подтверждение на ' + esc(o.email || 'вашу почту') + '. Менеджер свяжется с вами в течение часа, чтобы уточнить детали доставки.</p>' +
      '<div class="ok-list">' + o.items.map(function (i) { var p = productById(i.pid); return '<div class="ok-i"><img src="' + p.photo + '" alt=""><div><b>' + esc(p.name) + '</b><span>Размер ' + i.size + ' · ' + i.qty + ' шт.</span></div><em>' + money(p.price * i.qty) + '</em></div>'; }).join('') + '<div class="ok-sum"><span>К оплате</span><b>' + money(o.total) + '</b></div></div>' +
      '<div class="ok-btns"><a class="btn" href="account.html"><span>МОИ ЗАКАЗЫ</span></a><a class="btn ghost" href="catalog.html"><span>ПРОДОЛЖИТЬ ПОКУПКИ</span></a></div></div></div>';
  };

  /* ======================= ЛИЧНЫЙ КАБИНЕТ ======================= */
  views.account = function () {
    var tab = qs.get('t') || 'orders';
    function draw() {
      var u = Store.user();
      if (!u) { root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Личный кабинет']]) + '<div class="empty big"><h3>Войдите в личный кабинет</h3><p>Здесь собраны история заказов и ваши данные.</p><button class="btn" id="lg"><span>ВОЙТИ</span></button></div></div>'; document.getElementById('lg').onclick = function () { Auth.open(draw); }; return; }
      root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], ['Личный кабинет']]) + '<div class="tabs" id="tabs"><span class="t-ind" id="ind"></span><button data-t="orders" class="' + (tab === 'orders' ? 'on' : '') + '">История заказов</button><button data-t="data" class="' + (tab === 'data' ? 'on' : '') + '">Личные данные</button><button data-t="out">Выйти</button></div><div id="tab-body"></div></div>';
      document.getElementById('tabs').onclick = function (e) { var b = e.target.closest('[data-t]'); if (!b) return; var t = b.getAttribute('data-t'); if (t === 'out') { Auth.logout(); draw(); return; } tab = t; history.replaceState(null, '', 'account.html?t=' + t); Array.prototype.forEach.call(this.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); }); moveInd(); body(); };
      moveInd(); body();
    }
    function moveInd() { var on = document.querySelector('#tabs button.on'), ind = document.getElementById('ind'); if (on && ind) { ind.style.width = on.offsetWidth + 'px'; ind.style.transform = 'translateX(' + on.offsetLeft + 'px)'; } }
    window.addEventListener('resize', moveInd);
    function body() { var b = document.getElementById('tab-body'); b.className = 'tab-body'; void b.offsetWidth; b.className = 'tab-body in'; if (tab === 'data') dataTab(b); else ordersTab(b); }
    function ordersTab(b) {
      var u = Store.user(), orders = Store.orders();
      b.innerHTML = '<div class="orders">' + orders.map(function (o, k) {
        var items = o.items.map(function (i) { var p = productById(i.pid); return '<div class="o-item"><a class="l-img" href="product.html?id=' + p.id + '"><img src="' + p.photo + '" alt=""></a><div class="l-name"><span class="art">арт. ' + p.art + '</span><a href="product.html?id=' + p.id + '">' + esc(p.name) + '</a></div><i class="dot big" style="background:' + p.color[1] + '"></i><span>Размер: ' + i.size + '</span><span>Количество: ' + i.qty + '</span><b>' + money(p.price * i.qty) + '</b></div>'; }).join('');
        var st = o.status === 'Отменён' ? ' cancel' : o.status === 'В обработке' ? ' wait' : '';
        return '<div class="ord reveal" style="--d:' + Math.min(k, 6) * 60 + 'ms"><button class="o-h"><span class="o-n">№ ' + o.id + ' от ' + o.date + '</span><span class="o-s">Статус:<b class="' + st.trim() + '">' + o.status + '</b></span><span class="o-t">Сумма заказа:<b>' + money(o.total) + '</b></span><i>' + IC.down + '</i></button><div class="o-b"><div class="o-in">' + items +
          '<div class="o-meta"><span>Имя Фамилия: <em>' + esc((o.name || u.name) + ' ' + (o.surname || u.surname)) + '</em></span><span>E-mail: <em>' + esc(o.email || u.email) + '</em></span><span>Номер телефона: <em>' + esc(o.phone || u.phone) + '</em></span><span>Способ доставки: <em>' + (o.delivery === 'np' ? 'Доставка Новой Почтой' : DELIVERY[o.delivery].name) + '</em></span><span class="r">Способ оплаты: <em>' + (o.pay === 'cod' ? 'Оплата при получении' : PAYMENTS[o.pay]) + '</em></span></div></div></div></div>';
      }).join('') + '</div>';
      var first = b.querySelector('.ord'); // как в макете: раскрыт заказ № 235 или первый
      var open = Array.prototype.filter.call(b.querySelectorAll('.ord'), function (x) { return x.textContent.indexOf('№ 235') >= 0; })[0] || first; if (open) { open.classList.add('open'); open.querySelector('.o-b').style.height = 'auto'; }
      b.querySelector('.orders').addEventListener('click', function (e) {
        var h = e.target.closest('.o-h'); if (!h) return; var o = h.parentNode, body = o.querySelector('.o-b'), isOpen = o.classList.contains('open');
        if (isOpen) { body.style.height = body.scrollHeight + 'px'; void body.offsetWidth; body.style.height = '0px'; o.classList.remove('open'); }
        else { o.classList.add('open'); body.style.height = body.scrollHeight + 'px'; setTimeout(function () { body.style.height = 'auto'; }, 420); }
      });
      rerender();
    }
    function dataTab(b) {
      var u = Store.user();
      b.innerHTML = '<form id="pf" novalidate><div class="lbl2">Персональные данные:</div><div class="four">' + [['name', 'Имя'], ['surname', 'Фамилия'], ['email', 'E-mail'], ['phone', 'Телефон']].map(function (f) { return '<label class="fld"><input name="' + f[0] + '" placeholder="' + f[1] + '*" value="' + esc(u[f[0]] || '') + '"><span class="err"></span></label>'; }).join('') + '</div>' +
        '<div class="lbl2">Адрес доставки:</div><div class="two"><label class="fld"><input name="city" placeholder="Город" value="' + esc(u.city || '') + '"></label><label class="fld"><input name="office" placeholder="Отделение почты" value="' + esc(u.office || '') + '"></label></div>' +
        '<div class="bonus-line">Бонусный счёт: <b>' + money(Store.bonus()) + '</b></div><button class="btn wide" type="submit"><span>ОБНОВИТЬ ИНФОРМАЦИЮ</span></button></form>';
      var f = document.getElementById('pf');
      f.addEventListener('input', function (e) { e.target.classList.remove('bad'); var er = e.target.parentNode.querySelector('.err'); if (er) er.textContent = ''; });
      f.addEventListener('submit', function (e) {
        e.preventDefault(); var bad = false, el = f.elements;
        function chk(n, c, m) { var x = el[n], er = x.parentNode.querySelector('.err'); x.classList.remove('bad'); er.textContent = ''; if (c) { x.classList.add('bad'); er.textContent = m; void x.offsetWidth; bad = true; } }
        chk('name', el.name.value.trim().length < 2, 'Введите имя'); chk('email', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.email.value), 'Проверьте e-mail'); chk('phone', el.phone.value.replace(/\D/g, '').length < 10, 'Введите телефон');
        if (bad) return; Store.setUser({ name: el.name.value.trim(), surname: el.surname.value.trim(), email: el.email.value, phone: el.phone.value, city: el.city.value, office: el.office.value }); toast('Данные обновлены');
      });
    }
    draw();
  };

  /* ======================= ИНФО-СТРАНИЦЫ ======================= */
  views.info = function () {
    var key = qs.get('p') || 'about', d = INFO[key] || INFO.about; document.title = d.title + ' — YANKI';
    var keys = ['about', 'contacts', 'delivery', 'returns', 'bonus', 'offer', 'privacy'];
    root.innerHTML = '<div class="wrap">' + crumbs([['Главная', 'index.html'], [d.title]]) + '<div class="info"><aside class="i-nav">' + keys.map(function (k) { return '<a href="info.html?p=' + k + '" class="' + (k === key ? 'on' : '') + '">' + INFO[k].title + '</a>'; }).join('') + '</aside><article class="i-body"><h1 class="h1">' + d.title + '</h1>' + d.body + '</article></div></div>';
  };

  if (views[page]) views[page]();
  rerender();
})();
