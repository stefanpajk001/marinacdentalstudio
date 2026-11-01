(function () {
  // Meni na telefonu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
    // klik na zamucenu pozadinu zatvara meni
    document.querySelector('.site-header').addEventListener('click', function (e) {
      if (e.target === e.currentTarget && nav.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // Linija ispod headera posle skrolovanja
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Usluge: aktivna kartica se širi (hover, klik, fokus)
  var cards = document.querySelectorAll('.svc-card');
  function openCard(card) {
    cards.forEach(function (c) { c.classList.toggle('is-open', c === card); });
  }
  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () { openCard(card); });
    card.addEventListener('focus', function () { openCard(card); });
    card.addEventListener('click', function () { openCard(card); });
  });

  // Pre / posle klizači (uvodno pomeranje kad uđu u ekran)
  var reduceBA = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var easeBA = function (x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  document.querySelectorAll('.ba').forEach(function (ba, idx) {
    var range = ba.querySelector('.ba-range');
    var touched = false, raf = null;
    var setPos = function (v) { range.value = v; ba.style.setProperty('--pos', v + '%'); };
    var stopIntro = function () { touched = true; if (raf) cancelAnimationFrame(raf); ba.classList.remove('is-demo'); };
    range.addEventListener('input', function () { stopIntro(); setPos(range.value); });
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { range.addEventListener(ev, stopIntro, { passive: true }); });
    if (reduceBA || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      var keys = [[0, 50], [900, 18], [1900, 82], [2900, 50]], t0 = null;
      ba.classList.add('is-demo');
      var step = function (ts) {
        if (touched) return;
        if (t0 === null) t0 = ts + 500 + idx * 350;
        var e = ts - t0;
        if (e < 0) { raf = requestAnimationFrame(step); return; }
        for (var i = 1; i < keys.length; i++) {
          if (e <= keys[i][0]) {
            var k = (e - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
            setPos((keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * easeBA(k)).toFixed(1));
            raf = requestAnimationFrame(step); return;
          }
        }
        setPos(50); ba.classList.remove('is-demo');
      };
      raf = requestAnimationFrame(step);
    }, { threshold: .6 });
    obs.observe(ba);
  });

  // Recenzije – strelice
  var rvTrack = document.querySelector('.rv-track');
  if (rvTrack) {
    var rvPrev = document.querySelector('.rv-prev'), rvNext = document.querySelector('.rv-next');
    var rvStep = function () { var c = rvTrack.querySelector('.rv-card'); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rvTrack).columnGap || 24) : 300; };
    var rvUpd = function () {
      var max = rvTrack.scrollWidth - rvTrack.clientWidth - 4;
      rvPrev.disabled = rvTrack.scrollLeft <= 4;
      rvNext.disabled = rvTrack.scrollLeft >= max;
    };
    rvPrev.addEventListener('click', function () { rvTrack.scrollBy({ left: -rvStep(), behavior: 'smooth' }); });
    rvNext.addEventListener('click', function () { rvTrack.scrollBy({ left: rvStep(), behavior: 'smooth' }); });
    rvTrack.addEventListener('scroll', function () { window.requestAnimationFrame(rvUpd); }, { passive: true });
    window.addEventListener('resize', rvUpd);
    rvUpd();
    var rvMore = function () {
      rvTrack.querySelectorAll('.rv-card').forEach(function (card) {
        var p = card.querySelector('.rv-text p'), b = card.querySelector('.rv-more');
        if (card.classList.contains('is-open')) return;
        b.hidden = p.scrollHeight <= p.clientHeight + 2;
      });
    };
    rvTrack.querySelectorAll('.rv-more').forEach(function (b) {
      b.addEventListener('click', function () {
        var card = b.closest('.rv-card'), open = card.classList.toggle('is-open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        b.textContent = open ? 'Prikaži manje' : 'Pročitaj više';
      });
    });
    rvMore();
    window.addEventListener('resize', rvMore);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rvMore);
  }

  // Kalkulator orijentacione cene (cene su primer)
  var form = document.getElementById('calc');
  if (form) {
    var opcije = {
      popravka:  [{ n: 'Plomba', c: 4500, s: .25, p: '1' }, { n: 'Lečenje kanala', c: 9000, s: .55, p: '2–3' }],
      nadoknada: [{ n: 'Metalokeramička krunica', c: 14000, s: .5, p: '2–3' }, { n: 'Cirkonijum krunica', c: 28000, s: .6, p: '2–3' }, { n: 'Most', c: 14000, s: .7, p: '3–4', most: true }],
      estetika:  [{ n: 'Izbeljivanje', c: 20000, s: .2, p: '1', fiksno: true }, { n: 'Kompozitna ljuskica', c: 9000, s: .35, p: '1–2' }, { n: 'Keramička ljuskica', c: 30000, s: .55, p: '2–3' }],
      proteza:   [{ n: 'Totalna proteza', c: 45000, s: .7, p: '4–5', vilica: true }, { n: 'Parcijalna proteza', c: 55000, s: .75, p: '4–5', vilica: true }]
    };
    var chips = document.getElementById('chips');
    var broj = document.getElementById('broj');
    var cela = document.getElementById('cela');
    var plus = document.getElementById('plus'), minus = document.getElementById('minus');
    var n = 1, izbor = 0;
    var fmt = function (x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };

    function cilj() { return form.querySelector('input[name="cilj"]:checked').value; }
    function crtajChips() {
      chips.innerHTML = '';
      opcije[cilj()].forEach(function (o, k) {
        var b = document.createElement('button');
        b.type = 'button'; b.textContent = o.n;
        b.setAttribute('aria-pressed', k === izbor ? 'true' : 'false');
        b.addEventListener('click', function () { izbor = k; crtajChips(); racunaj(); });
        chips.appendChild(b);
      });
    }
    function racunaj() {
      var o = opcije[cilj()][izbor];
      var poVilici = o.vilica || o.fiksno;
      cela.disabled = poVilici;
      plus.disabled = minus.disabled = poVilici || cela.checked;
      var kom = cela.checked ? 14 : n;
      broj.textContent = poVilici ? '1' : String(kom);
      var pregled = Number(form.querySelector('input[name="pregled"]:checked').value);
      var cena = poVilici ? o.c : o.c * (o.most ? Math.max(kom, 3) : kom);
      var ukupno = cena + pregled;
      document.getElementById('res-price').textContent = fmt(ukupno) + ' RSD';
      document.getElementById('res-bar').style.width = Math.min(100, 6 + ukupno / 2500) + '%';
      var sl = Math.min(1, o.s + (poVilici ? 0 : (kom - 1) * 0.03));
      document.getElementById('res-gauge').style.setProperty('--v', sl);
      document.getElementById('res-slozenost').textContent = sl < .4 ? 'mala' : sl < .65 ? 'srednja' : 'veća';
      document.getElementById('res-posete').textContent = o.p;
      var segs = document.querySelectorAll('#res-segs i');
      var max = parseInt(o.p.split('–').pop(), 10);
      segs.forEach(function (sg, k) { sg.classList.toggle('off', k >= max); });
      var plan = ['Pregled i snimak'];
      plan.push(o.n + (poVilici ? (o.vilica ? ', jedna vilica' : '') : ' × ' + (o.most ? Math.max(kom, 3) : kom)));
      plan.push('Kontrola');
      document.getElementById('res-list').innerHTML = plan.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    }
    form.querySelectorAll('input[name="cilj"]').forEach(function (r) { r.addEventListener('change', function () { izbor = 0; crtajChips(); racunaj(); }); });
    form.querySelectorAll('input[name="pregled"]').forEach(function (r) { r.addEventListener('change', racunaj); });
    cela.addEventListener('change', racunaj);
    plus.addEventListener('click', function () { n = Math.min(14, n + 1); racunaj(); });
    minus.addEventListener('click', function () { n = Math.max(1, n - 1); racunaj(); });
    crtajChips(); racunaj();
  }

  // Status u heroju: otvoreno / zatvoreno po radnom vremenu (lokalno vreme posetioca)
  var st = document.getElementById('status');
  if (st) {
    var now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var open = (d >= 1 && d <= 5 && h >= 11 && h < 19) || (d === 6 && h >= 10 && h < 15);
    st.classList.toggle('is-open', open);
    document.getElementById('status-txt').textContent = (open ? 'Sada otvoreno' : 'Sada zatvoreno') + ' · pon–pet 11–19, sub 10–15';
  }

  // Ocena: brojevi se odbrojavaju kad sekcija uđe u ekran
  var rating = document.querySelector('.doc-rating');
  if (rating && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var nums = rating.querySelectorAll('[data-to]');
    nums.forEach(function (el) { el.textContent = el.dataset.dec ? '0,0' : '0'; });
    var ro = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      ro.disconnect();
      rating.classList.add('is-on');
      nums.forEach(function (el) {
        var to = parseFloat(el.dataset.to), dec = +el.dataset.dec || 0, t0 = null, dur = 1600;
        function step(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / dur), v = to * (1 - Math.pow(1 - k, 3));
          el.textContent = v.toFixed(dec).replace('.', ',');
          if (k < 1) requestAnimationFrame(step);
        }
        setTimeout(function () { requestAnimationFrame(step); }, 250);
      });
    }, { threshold: .5 });
    ro.observe(rating);
  } else if (rating) { rating.classList.add('is-on'); }

  // Radno vreme danas
  // dan se računa po beogradskom vremenu i osvežava se svakog minuta (i posle ponoći)
  var bgDay = function () {
    try {
      var n = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Belgrade', weekday: 'short' }).format(new Date());
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(n);
    } catch (e) { return new Date().getDay(); }
  };
  var day = bgDay(); // 0 = nedelja
  var rows = document.querySelectorAll('.hours tr');
  var markToday = function () {
    if (rows.length !== 3) return;
    var d = bgDay(), idx = d === 0 ? 2 : d === 6 ? 1 : 0;
    rows.forEach(function (r, i) { r.classList.toggle('is-today', i === idx); });
  };
  markToday();
  setInterval(markToday, 60000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) markToday(); });
  var danas = document.getElementById('danas');
  if (danas) danas.textContent = day === 0 ? 'Danas zatvoreno' : day === 6 ? 'Danas 10–15 h' : 'Danas 11–19 h';
  var week = document.querySelectorAll('.widget-week i');
  if (week.length === 7) week[(day + 6) % 7].classList.add('today');

  // Godina u footeru
  var y = document.getElementById('godina');
  if (y) y.textContent = new Date().getFullYear();

  // Blago pojavljivanje pri skrolu
  var items = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

/* Dugmad za poziv: na telefonu zovu, na racunaru (bez mogucnosti poziva) imaju korisnu radnju */
(function () {
  var desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
  var call = document.querySelector('.ct-call');
  var sm = call && call.querySelector('.ct-call-sm');
  if (call && sm) call.addEventListener('click', function (e) {
    if (!desktop.matches || !navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard.writeText('064 537 9901').then(function () {
      sm.textContent = 'Broj je kopiran';
      clearTimeout(call._t);
      call._t = setTimeout(function () { sm.textContent = 'Pozovite odmah'; }, 2200);
    }, function () { location.href = call.href; });
  });
  if (call && sm && desktop.matches) call.title = 'Kliknite da kopirate broj';
})();

/* Ucitavanje: minimum ~1.7s da animacija prodje, najvise ~4s, jednom po poseti */
(function () {
  var html = document.documentElement;
  if (!html.classList.contains('is-loading')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var minT = reduce ? 300 : 2000, t0 = performance.now(), done = false;
  function finish() {
    if (done) return; done = true;
    var wait = Math.max(0, minT - (performance.now() - t0));
    setTimeout(function () {
      html.classList.add('ld-out');
      try { sessionStorage.setItem('mds-ld', '1'); } catch (e) {}
      setTimeout(function () { html.classList.remove('is-loading', 'ld-out'); }, reduce ? 320 : 900);
    }, wait);
  }
  if (document.readyState === 'complete') finish(); else window.addEventListener('load', finish);
  setTimeout(finish, 4000);
})();

/* Motion efekti pri skrolovanju */
(function () {
  var html = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  html.classList.add('motion');
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // naslove delimo na reci (cuvamo em, mark, span unutra)
  function split(h) {
    var n = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parts = c.textContent.split(/(\s+)/), f = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { f.appendChild(document.createTextNode(p)); return; }
            var o = document.createElement('span'), i = document.createElement('span');
            o.className = 'mw'; o.style.setProperty('--w', n++); i.textContent = p; o.appendChild(i); f.appendChild(o);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(h);
  }
  var heads = $$('main section h2, .hero h1');
  heads.forEach(split);

  $$('.doc-eyebrow, .eyebrow').forEach(function (el) { el.classList.add('m-pill'); });

  // grupe koje se pojavljuju jedna za drugom
  var groups = [
    '.doc-body > :not(h2):not(.doc-eyebrow)', '.svc-intro > p:not(.doc-eyebrow)', '.svc-item',
    '.why-lead', '.why-item', '.pp-text > p:not(.doc-eyebrow)', '.pp-case',
    '.rv-head > :not(h2):not(.doc-eyebrow)', '.rv-card', '.ct-main > :not(h2):not(.doc-eyebrow)',
    '.ct-side > *', '.footer-grid > *', '.map-wrap'
  ];
  groups.forEach(function (sel) {
    var seen = new Map();
    $$(sel).forEach(function (el) {
      var k = el.parentNode, i = seen.get(k) || 0; seen.set(k, i + 1);
      el.classList.add('m-up'); el.style.setProperty('--s', Math.min(i, 6));
    });
  });
  $$('.why-media').forEach(function (el) { el.classList.add('m-img'); });

  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      t.classList.add('m-in'); io.unobserve(t);
      // ceo red (npr. kartice u slajderu) krece zajedno, jedna za drugom
      if (t.classList.contains('m-up') && t.parentNode) Array.prototype.forEach.call(t.parentNode.children, function (c) {
        if (c.classList.contains('m-up') && !c.classList.contains('m-in')) { c.classList.add('m-in'); io.unobserve(c); }
      });
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  $$('main section h2, .m-pill, .m-up, .m-img').forEach(function (el) { io.observe(el); });

  // hero kreće kad se zavesa podigne
  function heroGo() {
    html.classList.add('hero-go');
    var h1 = document.querySelector('.hero h1');
    if (h1) { h1.style.setProperty('--d', '150ms'); h1.classList.add('m-in'); }
  }
  if (html.classList.contains('is-loading')) {
    new MutationObserver(function (m, o) {
      if (html.classList.contains('ld-out')) { o.disconnect(); setTimeout(heroGo, 250); }
    }).observe(html, { attributes: true, attributeFilter: ['class'] });
  } else requestAnimationFrame(function () { requestAnimationFrame(heroGo); });

  // blagi parallax na velikim slikama (samo racunar)
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var par = $$('.hero-bg');
  par.forEach(function (el) { el.classList.add('m-par'); });
  var ticking = false;
  function upd() {
    ticking = false;
    var vh = window.innerHeight;
    par.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var k = el.classList.contains('hero-bg') ? -0.12 : -0.05;
      var off = el.classList.contains('hero-bg') ? -r.top : (r.top + r.height / 2 - vh / 2);
      el.style.transform = 'translate3d(0,' + (off * k).toFixed(1) + 'px,0)';
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
  upd();
})();

/* Radovi na telefonu: strelice + tackice (prevlacenje preko slike pomera liniju, ne slajder) */
(function () {
  var track = document.querySelector('.pp-cases'), nav = document.querySelector('.pp-nav');
  if (!track || !nav) return;
  var cases = track.querySelectorAll('.pp-case'), dots = nav.querySelectorAll('.pp-dots i');
  var prev = nav.querySelector('.pp-prev'), next = nav.querySelector('.pp-next');
  function idx() {
    var best = 0, d = Infinity;
    cases.forEach(function (c, i) { var x = Math.abs(c.offsetLeft - track.scrollLeft - track.offsetLeft * 0); if (x < d) { d = x; best = i; } });
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = cases.length - 1;
    return best;
  }
  function go(i) { i = Math.max(0, Math.min(cases.length - 1, i)); track.scrollTo({ left: cases[i].offsetLeft - cases[0].offsetLeft, behavior: 'smooth' }); }
  function upd() { var i = idx(); dots.forEach(function (d, k) { d.classList.toggle('on', k === i); }); prev.disabled = i === 0; next.disabled = i === cases.length - 1; }
  prev.addEventListener('click', function () { go(idx() - 1); });
  next.addEventListener('click', function () { go(idx() + 1); });
  var tm; track.addEventListener('scroll', function () { requestAnimationFrame(upd); clearTimeout(tm); tm = setTimeout(upd, 140); }, { passive: true });
  upd();
})();
