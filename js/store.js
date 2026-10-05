// Хранилище: корзина, избранное, пользователь, заказы, валюта. localStorage с запасным вариантом в памяти.
(function () {
  var mem = {};
  function read(key, def) {
    try { var v = localStorage.getItem('yanki_' + key); return v ? JSON.parse(v) : def; }
    catch (e) { return key in mem ? mem[key] : def; }
  }
  function write(key, val) {
    mem[key] = val;
    try { localStorage.setItem('yanki_' + key, JSON.stringify(val)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('store', { detail: key }));
  }

  var Store = {
    // ---- корзина: [{pid, size, qty}] ----
    cart: function () {
      var c = read('cart', null);
      if (c === null) { c = [{ pid: 1, size: 'L', qty: 3 }, { pid: 2, size: 'M', qty: 2 }]; write('cart', c); }
      return c;
    },
    setCart: function (c) { write('cart', c); },
    add: function (pid, size, qty) {
      var c = this.cart(), f = c.filter(function (i) { return i.pid === pid && i.size === size; })[0];
      if (f) f.qty += qty || 1; else c.push({ pid: pid, size: size, qty: qty || 1 });
      this.setCart(c);
    },
    setQty: function (pid, size, qty) {
      var c = this.cart(); c.forEach(function (i) { if (i.pid === pid && i.size === size) i.qty = Math.max(1, Math.min(9, qty)); });
      this.setCart(c);
    },
    setSize: function (pid, oldSize, newSize) {
      var c = this.cart(), same = c.filter(function (i) { return i.pid === pid && i.size === newSize; })[0], cur = c.filter(function (i) { return i.pid === pid && i.size === oldSize; })[0];
      if (!cur) return;
      if (same && same !== cur) { same.qty = Math.min(9, same.qty + cur.qty); c = c.filter(function (i) { return i !== cur; }); } else cur.size = newSize;
      this.setCart(c);
    },
    remove: function (pid, size) { this.setCart(this.cart().filter(function (i) { return !(i.pid === pid && i.size === size); })); },
    clearCart: function () { write('cart', []); },
    count: function () { return this.cart().reduce(function (s, i) { return s + i.qty; }, 0); },
    sum: function () { return this.cart().reduce(function (s, i) { return s + productById(i.pid).price * i.qty; }, 0); },

    // ---- избранное ----
    favs: function () { return read('favs', [3, 8]); },
    isFav: function (id) { return this.favs().indexOf(id) >= 0; },
    toggleFav: function (id) { var f = this.favs(), i = f.indexOf(id); if (i < 0) f.push(id); else f.splice(i, 1); write('favs', f); return i < 0; },

    // ---- пользователь ----
    user: function () { return read('user', null); },
    setUser: function (u) { write('user', u); },
    logout: function () { write('user', null); },
    bonus: function () { return read('bonus', 69); },
    setBonus: function (n) { write('bonus', Math.max(0, Math.round(n))); },

    // ---- заказы: новые + демо-история ----
    orders: function () { return read('orders', []).concat(window.SEED_ORDERS); },
    addOrder: function (o) { var l = read('orders', []); l.unshift(o); write('orders', l); },
    nextOrderId: function () { return 719 + read('orders', []).length; },
    lastOrder: function () { return read('lastOrder', null); },
    setLastOrder: function (id) { write('lastOrder', id); },

    // ---- валюта и прочее ----
    currency: function () { return read('cur', 'UAH'); },
    setCurrency: function (c) { write('cur', c); },
    subscribed: function () { return read('sub', null); },
    setSubscribed: function (e) { write('sub', e); },
    draft: function () { return read('draft', {}); },
    setDraft: function (d) { write('draft', d); },
    reset: function () { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('yanki_') === 0) localStorage.removeItem(k); }); } catch (e) {} mem = {}; }
  };
  window.Store = Store;
})();
