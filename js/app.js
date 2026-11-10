/* ==========================================================
   Centrul de Tineret Călărași – aplicația (partea publică + nucleu)
   ========================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const para = s => { const t = String(s || '').trim(); return t ? '<p>' + esc(t).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>') + '</p>' : ''; };
  const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);
  const safeUrl = u => /^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '';

  /* ---------- pictograme ---------- */
  const IC = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10', calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M9 9.5h.01', users: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20v-1a5 5 0 0110 0v1M17 11a2.5 2.5 0 100-5M16 14.5a4 4 0 015 4V20',
    mail: 'M3 6h18v12H3zM3 7l9 7 9-7', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
    pin: 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z', search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
    plus: 'M12 5v14M5 12h14', edit: 'M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
    check: 'M5 12l5 5 9-10', x: 'M6 6l12 12M18 6L6 18', menu: 'M4 7h16M4 12h16M4 17h16', arrow: 'M5 12h14M13 6l6 6-6 6',
    send: 'M21 3L3 11l7 2 2 7 9-17zM10 13l11-10', book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zM6 19h13',
    bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z', heart: 'M12 20s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6-8 11-8 11z',
    video: 'M3 6h12v12H3zM15 10l6-3v10l-6-3', upload: 'M12 16V4M7 9l5-5 5 5M4 20h16', bell: 'M6 17V11a6 6 0 1112 0v6l2 2H4l2-2zM10 21h4',
    user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0', logout: 'M10 4H5v16h5M15 8l5 4-5 4M20 12H9',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 1a7 7 0 00-2-1l-.5-2h-5L9 7a7 7 0 00-2 1L5 7 3 11l2 1a7 7 0 000 2l-2 1 2 4 2-1a7 7 0 002 1l.5 2h5l.5-2a7 7 0 002-1l2 1 2-4-2-1a7 7 0 000-2z',
    chart: 'M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3', link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1',
    download: 'M12 4v12M7 11l5 5 5-5M4 20h16', play: 'M7 4l13 8-13 8z', chevL: 'M15 5l-7 7 7 7', chevR: 'M9 5l7 7-7 7',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z', clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    folder: 'M3 6h6l2 2h10v11H3z', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z', archive: 'M3 5h18v4H3zM5 9v10h14V9M10 13h4',
    info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01', handshake: 'M3 12l4-4 4 2 4-2 6 5-5 5-3-2-3 2-3-2zM7 8L3 12',
    facebook: 'M15 3h-2.5A3.5 3.5 0 009 6.5V9H6v4h3v8h4v-8h3l.7-4H13V6.5c0-.3.2-.5.5-.5H15z',
    instagram: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 16a4 4 0 100-8 4 4 0 000 8zM17.5 6.5h.01',
    youtube: 'M3 8a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H6a3 3 0 01-3-3zM10 9l5 3-5 3z', tiktok: 'M14 3v11a4 4 0 11-4-4M14 3c.3 2.5 2 4 5 4'
  };
  const ic = (n, cls = '') => '<svg class="ic ' + cls + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (IC[n] || IC.info) + '"/></svg>';

  /* ---------- date și constante ---------- */
  const CATS = ['Educație', 'Voluntariat', 'Sport', 'Cultură', 'Distracție', 'Dezvoltare personală', 'Proiecte comunitare'];
  const ROLE_RO = { owner: 'Administrator principal', admin: 'Administrator', member: 'Membru al echipei' };
  const pd = s => { const [y, m, d] = String(s || '').split('-').map(Number); return new Date(y || 1970, (m || 1) - 1, d || 1); };
  const dtLong = s => s ? pd(s).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const initials = n => String(n || '?').replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase() || '?';
  const mon3 = s => pd(s).toLocaleDateString('ro-RO', { month: 'short' }).replace('.', '');

  const DEFAULTS = {
    name: 'Centrul de Tineret Călărași',
    slogan: 'Împreună creștem, învățăm și construim viitorul comunității noastre!',
    lead: 'Un spațiu dedicat tinerilor, unde ideile prind viață, se nasc prietenii și se construiește viitorul!',
    history: '', mission: 'Să oferim tinerilor din Călărași un spațiu sigur și modern, în care pot învăța, participa la activități și își pot pune ideile în practică.',
    vision: 'O comunitate în care fiecare tânăr are șansa să se dezvolte, să fie auzit și să contribuie la schimbare.',
    values: 'Implicare\nRespect\nColaborare\nSpirit de inițiativă\nIncluziune',
    goals: 'Dezvoltarea abilităților tinerilor\nPromovarea voluntariatului\nSusținerea inițiativelor tinerești\nConectarea tinerilor cu comunitatea',
    impact: '', impactYouth: 0, address: 'Călărași, Republica Moldova', phone: '', email: '', lat: 47.2583, lng: 28.3033,
    facebook: '', instagram: '', tiktok: '', youtube: '', logo: '', heroImage: ''
  };

  /* ---------- stare ---------- */
  const S = { activities: [], events: [], albums: [], media: [], team: [], partners: [], stories: [], settings: [], applications: [], users: [] };
  const ui = { q: '', cat: '', limit: 9, cal: null, calSel: '', gType: '', gAct: '', gYear: '', lb: null, lbItems: [], joinDone: false, drawer: false, loaded: {} };
  const site = () => Object.assign({}, DEFAULTS, (S.settings.find(x => x.id === 'site') || {}));
  const logoSrc = () => esc(DB.url(site().logo) || 'assets/logo.png');
  const published = () => S.activities.filter(a => a.status === 'published').sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const byId = (col, id) => S[col].find(x => x.id === id);
  const cover = a => { const m = (a.media || []).find(x => x.type === 'image'); return DB.url(a.cover || (m && m.url) || ''); };
  const isImg = m => m.type === 'image';

  function ph(seed) {
    return '<div style="width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(135deg,#0B2D5C,#155EEF);color:#60C5FF">' + ic('star', 'lg') + '</div>';
  }
  const coverImg = (src, alt) => src ? '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy">' : ph();

  /* ---------- notificări UI ---------- */
  function toast(msg, bad) {
    const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : '');
    t.innerHTML = ic(bad ? 'info' : 'check') + '<span>' + esc(msg) + '</span>';
    $('#toasts').appendChild(t); setTimeout(() => { t.style.opacity = 0; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 400); }, bad ? 6000 : 3600);
  }
  function modal(html, wide) {
    const m = $('#modal'); m.hidden = false;
    m.innerHTML = '<div class="box' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.style.overflow = 'hidden';
    const f = $('input:not([type=hidden]):not([type=file]),textarea,select', m); if (f && !/Mobi|Android/i.test(navigator.userAgent)) f.focus();
  }
  function closeModal() { const m = $('#modal'); if (m.hidden) return; m.hidden = true; m.innerHTML = ''; document.body.style.overflow = ''; if (pendingRender) render(); }
  function busy(text, pct) {
    const b = $('#busy');
    if (text === false) { b.hidden = true; b.innerHTML = ''; return; }
    b.hidden = false;
    b.innerHTML = '<div class="bx"><div class="spin"></div><b>' + esc(text) + '</b>' + (pct != null ? '<div class="bar"><i style="width:' + Math.round(pct * 100) + '%"></i></div>' : '') + '</div>';
  }
  const mh = (title) => '<div class="mh"><h3>' + esc(title) + '</h3><button class="btn btn-icon" data-act="closeModal" aria-label="Închide">' + ic('x') + '</button></div>';
  function fdata(form) {
    const o = {}; new FormData(form).forEach((v, k) => { if (v instanceof File) return; if (k in o) { o[k] = [].concat(o[k], v); } else o[k] = v; });
    return o;
  }
  const arr = v => v == null ? [] : [].concat(v);

  /* ---------- ruter ---------- */
  const NAV = [['', 'Acasă', 'home'], ['activitati', 'Activități', 'calendar'], ['evenimente', 'Evenimente', 'clock'], ['echipa', 'Echipa', 'users'], ['despre', 'Despre noi', 'info'], ['contact', 'Contact', 'mail']];
  const parts = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  let pendingRender = false, renderTimer = null;

  function isEditing() {
    const a = document.activeElement;
    if (!$('#modal').hidden) return true;
    return !!(a && a !== document.body && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.type !== 'search' && a.closest('main'));
  }
  function schedule() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => { if (isEditing()) { pendingRender = true; return; } render(); }, 60);
  }
  document.addEventListener('focusout', () => setTimeout(() => { if (pendingRender && !isEditing()) render(); }, 150));

  function render(keepScroll) {
    pendingRender = false;
    const p = parts(); const admin = p[0] === 'admin';
    document.body.classList.toggle('is-adm', admin);
    const y = window.scrollY;
    if (admin) {
      $('#app').innerHTML = window.Admin ? Admin.render(p.slice(1)) : '';
      document.title = 'Panou de administrare – ' + site().name;
    } else {
      $('#siteHeader').innerHTML = headerHtml(p[0] || '');
      $('#app').innerHTML = pageHtml(p);
      $('#siteFooter').innerHTML = footerHtml();
      document.title = (pageTitle(p) ? pageTitle(p) + ' – ' : '') + site().name;
    }
    if (keepScroll !== false) window.scrollTo(0, y);
    reveal(); if (window.Admin && admin && Admin.after) Admin.after(p.slice(1));
  }
  let lastKey = '';
  function onRoute() {
    const key = parts().join('/');
    ui.drawer = false;
    if (key !== lastKey) { lastKey = key; render(false); window.scrollTo(0, 0); } else render();
  }
  function reveal() {
    const els = $$('.rv:not(.in)');
    if (!('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
    els.forEach(e => io.observe(e));
  }
  function pageTitle(p) { return ({ activitati: 'Activități', evenimente: 'Evenimente', galerie: 'Galerie', echipa: 'Echipa noastră', despre: 'Despre noi', contact: 'Contact', inscriere: 'Alătură-te comunității' })[p[0]] || ''; }

  /* ---------- antet / subsol ---------- */
  function headerHtml(cur) {
    const s = site(), u = DB.user;
    const nav = NAV.map(([h, l, i]) => '<a href="#/' + h + '" class="' + ((cur || '') === h ? 'on' : '') + '">' + ic(i) + '<span>' + l + '</span></a>').join('');
    const panel = u && u.role ? '<a class="btn btn-ghost btn-sm" href="#/admin">' + ic('settings') + 'Panou</a>' : '';
    return '<div class="container"><a class="brand" href="#/"><img src="' + logoSrc() + '" alt="Logo"><span>Centrul de Tineret<b>Călărași</b></span></a>' +
      '<nav class="nav" aria-label="Meniu principal">' + nav + '</nav><div class="hdr-cta">' + panel +
      '<a class="btn btn-ghost btn-sm" href="#/inscriere">' + ic('user') + 'Alătură-te</a>' +
      '<button class="burger" data-act="drawer" aria-label="Deschide meniul">' + ic('menu') + '</button></div></div>' +
      '<div class="drawer ' + (ui.drawer ? 'open' : '') + '" data-act="drawerBg"><nav aria-label="Meniu mobil"><button class="close" data-act="drawer" aria-label="Închide">' + ic('x') + '</button>' +
      NAV.map(([h, l, i]) => '<a href="#/' + h + '" class="' + ((cur || '') === h ? 'on' : '') + '">' + ic(i) + l + '</a>').join('') +
      '<a href="#/inscriere" class="on">' + ic('user') + 'Alătură-te comunității</a>' + (u && u.role ? '<a href="#/admin">' + ic('settings') + 'Panou de administrare</a>' : '') + '</nav></div>';
  }
  function socials(cls) {
    const s = site();
    return ['facebook', 'instagram', 'tiktok', 'youtube'].filter(k => safeUrl(s[k])).map(k => '<a class="soc ' + (cls || '') + '" href="' + esc(safeUrl(s[k])) + '" target="_blank" rel="noopener noreferrer" aria-label="' + k + '">' + ic(k) + '</a>').join('');
  }
  function footerHtml() {
    const s = site();
    const tel = s.phone ? '<a href="tel:' + esc(s.phone.replace(/[^+\d]/g, '')) + '">' + esc(s.phone) + '</a>' : '', mail = s.email ? '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>' : '';
    return '<div class="container"><div class="foot-row"><a class="brand" href="#/"><img src="' + logoSrc() + '" alt=""><span>Centrul de Tineret<b>Călărași</b></span></a><div class="motto">„Împreună pentru un viitor mai bun!”</div><div class="socials">' + socials() + '</div><div class="foot-loc"><span>' + ic('pin') + esc(s.address) + '</span>' + tel + mail + '</div></div>' +
      '<nav class="foot-links">' + NAV.map(([h, l]) => '<a href="#/' + h + '">' + l + '</a>').join('') + '<a href="#/inscriere">Alătură-te</a><a href="#/admin">Acces echipă</a></nav>' +
      '<div class="foot-bot"><span>© ' + new Date().getFullYear() + ' ' + esc(s.name) + '. Toate drepturile rezervate.</span><span>Datele personale din formulare sunt vizibile doar administratorilor.</span></div></div>';
  }

  /* ---------- componente ---------- */
  function actCard(a) {
    return '<a class="card rv" href="#/activitati/' + esc(a.id) + '"><div class="cover' + (cover(a) ? '' : ' nocover') + '">' + (cover(a) ? coverImg(cover(a), a.title) : '') + '<span class="badge">' + esc(a.category || '') + '</span></div><div class="body"><div class="meta"><span>' + ic('calendar') + dtLong(a.date) + '</span>' + (a.location ? '<span>' + ic('pin') + esc(a.location) + '</span>' : '') + '</div><h3>' + esc(a.title) + '</h3><p>' + esc(String(a.description || '').slice(0, 120)) + (String(a.description || '').length > 120 ? '…' : '') + '</p></div></a>';
  }
  function evRow(e) {
    const past = e.date < todayStr(); const d = pd(e.date);
    return '<button class="ev rv ' + (past ? 'past' : '') + '" data-act="event" data-id="' + esc(e.id) + '"><div class="date"><b>' + d.getDate() + '</b><small>' + mon3(e.date) + '</small></div><div><h3>' + esc(e.title) + '</h3><div class="meta"><span>' + ic('clock') + (e.time ? esc(e.time) : dtLong(e.date)) + '</span>' + (e.location ? '<span>' + ic('pin') + esc(e.location) + '</span>' : '') + '</div></div>' + (e.photo ? '<img class="thumb" src="' + esc(DB.url(e.photo)) + '" alt="" loading="lazy">' : '') + '</button>';
  }
  const empty = (icon, t, sub) => '<div class="empty">' + ic(icon) + '<b>' + esc(t) + '</b>' + (sub ? '<p style="margin:6px 0 0">' + esc(sub) + '</p>' : '') + '</div>';
  function head(eyebrow, title, link, sub) {
    return '<div class="section-head rv"><div><span class="eyebrow">' + esc(eyebrow) + '</span><h2>' + esc(title) + '</h2>' + (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</div>' + (link ? '<a class="link-arrow" href="' + link[0] + '">' + esc(link[1]) + ' ' + ic('arrow') + '</a>' : '') + '</div>';
  }
  function pageHero(title, sub, crumb) {
    return '<section class="page-hero"><div class="container">' + (crumb || '') + '<h1>' + esc(title) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div></section>';
  }

  /* statistici reale */
  function statsData() {
    const pub = published(); const today = todayStr();
    const mediaCount = S.media.length + pub.reduce((n, a) => n + (a.media || []).length, 0);
    const s = site();
    return [
      [pub.length, 'Activități realizate'], [S.events.filter(e => e.date < today).length, 'Evenimente desfășurate'],
      [S.team.length, 'Membri în echipă'], [S.partners.length, 'Parteneri'], [Number(s.impactYouth) || 0, 'Tineri implicați']
    ].filter(x => x[0] > 0);
  }
  const statsHtml = () => { const d = statsData(); return d.length ? '<div class="stats">' + d.map(([n, l]) => '<div class="stat rv"><b data-count="' + n + '">' + n + '</b><span>' + l + '</span></div>').join('') + '</div>' : ''; };

  /* ---------- galerie: elemente ---------- */
  function allMedia() {
    return []; // fără poze/video în această versiune
    const items = [];
    S.media.forEach(m => items.push({ url: m.url, type: m.type, description: m.description || '', date: m.date || '', albumId: m.albumId || '', activityId: m.activityId || '', title: (byId('albums', m.albumId) || {}).title || '' }));
    published().forEach(a => (a.media || []).forEach(m => items.push({ url: m.url, type: m.type, description: m.description || '', date: a.date, albumId: '', activityId: a.id, title: a.title })));
    return items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }
  function mItem(it, i) {
    const v = it.type === 'video';
    return '<button class="m-item rv" data-act="lb" data-i="' + i + '" aria-label="Deschide">' + (v ? '<video src="' + esc(DB.url(it.url)) + '#t=0.1" preload="metadata" muted></video><span class="vid">' + ic('play') + '</span>' : '<img src="' + esc(DB.url(it.url)) + '" alt="' + esc(it.description || it.title) + '" loading="lazy">') + (it.description || it.title ? '<span class="cap">' + esc(it.description || it.title) + '</span>' : '') + '</button>';
  }
  function openLb(items, i) { ui.lbItems = items; ui.lb = i; drawLb(); }
  function drawLb() {
    const lb = $('#lightbox'); if (ui.lb == null) { lb.hidden = true; lb.innerHTML = ''; document.body.style.overflow = ''; return; }
    const it = ui.lbItems[ui.lb]; if (!it) return; lb.hidden = false; document.body.style.overflow = 'hidden';
    lb.innerHTML = '<button class="lb-btn lb-x" data-act="lbClose" aria-label="Închide">' + ic('x') + '</button>' + (ui.lbItems.length > 1 ? '<button class="lb-btn lb-p" data-act="lbPrev" aria-label="Anterior">' + ic('chevL') + '</button><button class="lb-btn lb-n" data-act="lbNext" aria-label="Următor">' + ic('chevR') + '</button>' : '') +
      '<div class="stage">' + (it.type === 'video' ? '<video src="' + esc(DB.url(it.url)) + '" controls autoplay playsinline></video>' : '<img src="' + esc(DB.url(it.url)) + '" alt="' + esc(it.description || '') + '">') + '</div>' +
      '<div class="lb-cap"><b>' + esc(it.description || it.title || '') + '</b><small>' + (it.title && it.description ? esc(it.title) + ' · ' : '') + (it.date ? dtLong(it.date) : '') + ' · ' + (ui.lb + 1) + '/' + ui.lbItems.length + '</small></div>';
  }
  function lbStep(d) { if (ui.lb == null) return; ui.lb = (ui.lb + d + ui.lbItems.length) % ui.lbItems.length; drawLb(); }
  function ytEmbed(u) {
    const m = String(u || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? '<iframe class="vid-embed" src="https://www.youtube-nocookie.com/embed/' + m[1] + '" title="Video" allowfullscreen loading="lazy"></iframe>' : '';
  }

  /* ---------- pagini ---------- */
  function pageHtml(p) {
    switch (p[0] || '') {
      case '': return pHome();
      case 'activitati': return p[1] ? pActivity(p[1]) : pActivities();
      case 'evenimente': return pEvents();
      case 'echipa': return pTeam();
      case 'despre': return pAbout();
      case 'contact': return pContact();
      case 'inscriere': return pageHero('Alătură-te comunității', 'Completează formularul și un membru al echipei te va contacta.') + '<section class="section"><div class="container" style="max-width:820px"><div class="card" style="padding:clamp(20px,4vw,36px)">' + joinForm() + '</div></div></section>';
      default: return pageHero('Pagina nu a fost găsită') + '<section class="section"><div class="container">' + empty('search', 'Această pagină nu există.', 'Folosește meniul pentru a naviga.') + '</div></section>';
    }
  }

  function pHome() {
    const s = site(), pub = published(), today = todayStr();
    const recent = pub.slice(0, 3);
    const upcoming = S.events.filter(e => e.date >= today).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).slice(0, 4);
    const items = allMedia(); ui.lbItems = items.slice(0, 8);
    const projects = pub.filter(a => a.isProject || a.category === 'Proiecte comunitare').slice(0, 3);
    const story = S.stories.slice().sort((a, b) => String(b.month).localeCompare(String(a.month)))[0];
    const team = S.team.slice().sort((a, b) => (a.order || 99) - (b.order || 99)).slice(0, 4);
    const hero = esc(DB.url(s.heroImage) || 'assets/hero.jpg');
    const feats = [['users', 'Activități diverse', 'Evenimente, ateliere și proiecte pentru tineri'], ['book', 'Dezvoltare personală', 'Învață, crește, inspiră-te'], ['heart', 'Comunitate unită', 'Fă parte dintr-o echipă activă și prietenoasă'], ['bulb', 'Idei și inițiative', 'Propune, implică-te, schimbă ceva!']];
    return '<section class="hero"><div class="hero-bg"><img src="' + hero + '" alt="" fetchpriority="high" onerror="this.onerror=null;this.src=\'assets/hero.svg\'"></div><div class="hero-tag">Tineret. Comunitate. Viitor.</div><div class="container"><div class="hero-in">' +
      '<span class="script">Împreună creștem, învățăm și construim!</span><h1>Centrul de Tineret <em>Călărași</em></h1><p class="lead">' + esc(s.lead) + '</p><p class="lead" style="font-weight:700;color:#60C5FF">' + esc(s.slogan) + '</p>' +
      '<div class="hero-btns"><a class="btn btn-primary" href="#/activitati">Descoperă activitățile ' + ic('arrow') + '</a><a class="btn btn-ghost" href="#/inscriere">' + ic('users') + 'Alătură-te comunității</a></div></div></div></section>' +
      '<section class="features"><div class="container">' + feats.map(f => '<div class="feat rv">' + ic(f[0]) + '<div><b>' + f[1] + '</b><small>' + f[2] + '</small></div></div>').join('') + '</div></section>' +

      '<section class="section"><div class="container"><div class="trio">' +
      '<div class="tcard rv"><h2>Despre noi</h2><p><b>Centrul de Tineret Călărași</b> este un spațiu modern, dedicat tinerilor din comunitatea noastră, unde poți participa la activități educative, culturale, recreative și de voluntariat.</p><b class="pt">Pentru că tu contezi!</b><a class="btn btn-royal btn-sm" href="#/despre">Află mai multe ' + ic('arrow') + '</a></div>' +
      '<div class="tcard rv"><div class="th"><h2>Activități recente</h2><a href="#/activitati">Vezi toate</a></div>' + (recent.length ? recent.map(a => '<a class="trow" href="#/activitati/' + esc(a.id) + '"><b>' + esc(a.title) + '</b><span>' + ic('calendar') + dtLong(a.date) + '</span></a>').join('') : '<p>Încă nu au fost publicate activități.</p>') + '</div>' +
      '<div class="tcard join rv"><h2>Vrei să te alături?</h2><p>Completează formularul și devino membru al Centrului de Tineret!</p><a class="btn btn-primary" href="#/inscriere">' + ic('users') + 'Completează cererea</a></div>' +
      '</div></div></section>' +

      '<section class="section"><div class="container">' + head('Nu rata', 'Evenimente viitoare', ['#/evenimente', 'Calendar complet']) +
      (upcoming.length ? '<div class="stack">' + upcoming.map(evRow).join('') + '</div>' : empty('clock', 'Nu sunt evenimente programate momentan.', 'Vezi arhiva în pagina Evenimente.')) + '</div></section>' +

      (statsData().length ? '<section class="section dark"><div class="container">' + head('În cifre', 'Impactul centrului nostru') + statsHtml() + '</div></section>' : '') +

      (projects.length ? '<section class="section"><div class="container">' + head('Realizări', 'Proiectele centrului', ['#/activitati', 'Toate activitățile']) + '<div class="grid g3">' + projects.map(actCard).join('') + '</div></div></section>' : '') +

      (items.length ? '<section class="section alt"><div class="container">' + head('Momente', 'Galerie foto și video', ['#/galerie', 'Deschide galeria']) + '<div class="masonry">' + ui.lbItems.map(mItem).join('') + '</div></div></section>' : '') +

      (story ? '<section class="section"><div class="container">' + head('Inspirație', 'Povestea lunii') + '<div class="story rv"><div class="pic">' + (story.image ? '<img src="' + esc(DB.url(story.image)) + '" alt="' + esc(story.title) + '" loading="lazy">' : ph()) + '</div><div class="txt"><span class="script">' + esc(pd(story.month + '-01').toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })) + '</span><h3 style="font-size:1.6rem">' + esc(story.title) + '</h3><div class="prose">' + para(story.text) + '</div></div></div></div></section>' : '') +

      (team.length ? '<section class="section alt"><div class="container">' + head('Oamenii noștri', 'Echipa noastră', ['#/echipa', 'Toată echipa']) + '<div class="grid g4">' + team.map(memberCard).join('') + '</div></div></section>' : '') +

      (S.partners.length ? '<section class="section"><div class="container">' + head('Alături de noi', 'Partenerii noștri') + partnersHtml() + '</div></section>' : '') +

      '<section class="section alt" id="join"><div class="container"><div class="join-wrap rv"><div><span class="eyebrow">Înscriere</span><h2>Vrei să te alături?</h2><p style="color:rgba(255,255,255,.85)">Completează formularul și devino membru al Centrului de Tineret Călărași.</p><ul class="ticks"><li>' + ic('check') + 'Activități educative, culturale și sportive</li><li>' + ic('check') + 'Voluntariat și proiecte comunitare</li><li>' + ic('check') + 'O echipă prietenoasă și mulți prieteni noi</li></ul></div><div class="form-card">' + joinForm() + '</div></div></div></section>';
  }

  function partnersHtml() {
    return '<div class="partners rv">' + S.partners.map(p => { const inner = p.logo ? '<img src="' + esc(DB.url(p.logo)) + '" alt="' + esc(p.name) + '" loading="lazy">' : esc(p.name); const u = safeUrl(p.url); return u ? '<a class="partner" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.name) + '">' + inner + '</a>' : '<div class="partner" title="' + esc(p.name) + '">' + inner + '</div>'; }).join('') + '</div>';
  }
  function memberCard(m) {
    const acts = arr(m.activityIds).map(id => byId('activities', id)).filter(a => a && a.status === 'published');
    return '<div class="card member rv"><div class="ph">' + (m.photo ? '<img src="' + esc(DB.url(m.photo)) + '" alt="' + esc(m.name) + '" loading="lazy">' : '<div class="init">' + esc(initials(m.name)) + '</div>') + '</div><h3>' + esc(m.name) + '</h3><div class="role">' + esc(m.role) + '</div>' + para(m.bio) +
      (acts.length ? '<div class="chips">' + acts.map(a => '<a class="chip" href="#/activitati/' + esc(a.id) + '">' + esc(a.title.replace(/\s*\(exemplu\)/, '')) + '</a>').join('') + '</div>' : '') + '</div>';
  }

  function actListHtml() {
    const q = ui.q.trim().toLowerCase();
    const list = published().filter(a => (!ui.cat || a.category === ui.cat) && (!q || (a.title + ' ' + a.description + ' ' + a.location + ' ' + a.category).toLowerCase().includes(q)));
    if (!list.length) return empty('search', 'Nu am găsit activități.', 'Încearcă alt cuvânt sau altă categorie.');
    return '<div class="grid g3">' + list.slice(0, ui.limit).map(actCard).join('') + '</div>' + (list.length > ui.limit ? '<div style="text-align:center;margin-top:28px"><button class="btn btn-royal" data-act="more">Arată mai multe (' + (list.length - ui.limit) + ')</button></div>' : '');
  }
  function pActivities() {
    return pageHero('Activități', 'Tot ce organizăm pentru tineri: educație, voluntariat, sport, cultură și multe altele.') +
      '<section class="section"><div class="container"><div class="toolbar" style="display:flex;gap:10px;margin-bottom:14px"><div style="position:relative;flex:1;max-width:460px"><input type="search" placeholder="Caută activități…" value="' + esc(ui.q) + '" data-input="actSearch" aria-label="Caută activități" style="padding-left:2.6em"><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#155EEF">' + ic('search') + '</span></div></div>' +
      '<div class="filters" id="actCats">' + catChips() + '</div><div id="actList">' + actListHtml() + '</div></div></section>';
  }
  const catChips = () => ['', ...CATS].map(c => '<button class="chip ' + (ui.cat === c ? 'on' : '') + '" data-act="cat" data-c="' + esc(c) + '">' + (c || 'Toate') + '</button>').join('');

  function pActivity(id) {
    const a = byId('activities', id);
    if (!a || (a.status !== 'published' && !DB.isTeam())) return pageHero('Activitate negăsită') + '<section class="section"><div class="container">' + empty('search', 'Această activitate nu există sau nu mai este publică.') + '<p style="text-align:center;margin-top:18px"><a class="btn btn-royal" href="#/activitati">Înapoi la activități</a></p></div></section>';
    const imgs = (a.media || []).filter(isImg), vids = (a.media || []).filter(m => m.type === 'video');
    ui.lbItems = (a.media || []).map(m => ({ url: m.url, type: m.type, description: m.description || '', date: a.date, title: a.title }));
    const yts = lines(a.ytLinks).map(ytEmbed).filter(Boolean);
    const related = published().filter(x => x.id !== a.id && x.category === a.category).slice(0, 3);
    const people = S.team.filter(m => arr(m.activityIds).includes(a.id));
    return pageHero(a.title, '', '<div class="crumbs"><a href="#/activitati">Activități</a> / ' + esc(a.category) + '</div>') +
      '<section class="section"><div class="container"><div class="detail"><article>' +
      (a.status !== 'published' ? '<div class="note" style="margin-bottom:16px">Această publicație nu este încă publică (stare: ' + esc(a.status) + '). O vezi doar tu, ca membru al echipei.</div>' : '') +
      (cover(a) ? '<div class="main-img"><img src="' + esc(cover(a)) + '" alt="' + esc(a.title) + '"></div>' : '') +
      '<div class="prose">' + para(a.description) + '</div>' +
      (imgs.length ? '<h3 style="margin-top:28px">Fotografii</h3><div class="masonry">' + ui.lbItems.map((m, i) => m.type === 'image' ? mItem(m, i) : '').join('') + '</div>' : '') +
      ((vids.length || yts.length) ? '<h3 style="margin-top:28px">Videoclipuri</h3><div class="grid g2">' + ui.lbItems.map((m, i) => m.type === 'video' ? '<video src="' + esc(DB.url(m.url)) + '" controls preload="metadata"></video>' : '').join('') + yts.join('') + '</div>' : '') +
      '</article><aside class="side"><span class="badge solid">' + esc(a.category) + '</span><div class="meta" style="flex-direction:column;margin:16px 0;gap:10px"><span>' + ic('calendar') + dtLong(a.date) + '</span>' + (a.location ? '<span>' + ic('pin') + esc(a.location) + '</span>' : '') + '</div>' +
      (people.length ? '<b style="font-size:.85rem;color:#0B2D5C">Echipa implicată</b><div class="chips" style="justify-content:flex-start;margin-bottom:16px">' + people.map(m => '<a class="chip" href="#/echipa">' + esc(m.name.replace(/\s*\(exemplu\)/, '')) + '</a>').join('') + '</div>' : '') +
      '<a class="btn btn-royal" style="width:100%" href="#/inscriere">' + ic('users') + 'Vreau să particip</a></aside></div>' +
      (related.length ? '<div style="margin-top:56px">' + head('Mai multe', 'Activități similare') + '<div class="grid g3">' + related.map(actCard).join('') + '</div></div>' : '') + '</div></section>';
  }

  function calHtml() {
    const now = new Date(); if (!ui.cal) ui.cal = { y: now.getFullYear(), m: now.getMonth() };
    const { y, m } = ui.cal; const first = new Date(y, m, 1); const off = (first.getDay() + 6) % 7; const days = new Date(y, m + 1, 0).getDate(); const today = todayStr();
    const has = {}; S.events.forEach(e => { has[e.date] = (has[e.date] || 0) + 1; });
    let cells = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map(d => '<div class="dow">' + d + '</div>').join('');
    for (let i = 0; i < off; i++) cells += '<div class="cal-day off"></div>';
    for (let d = 1; d <= days; d++) {
      const ds = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      cells += '<button class="cal-day ' + (has[ds] ? 'has' : '') + (ds === today ? ' today' : '') + (ui.calSel === ds ? ' sel' : '') + '" data-act="calday" data-d="' + ds + '" aria-label="' + dtLong(ds) + (has[ds] ? ', ' + has[ds] + ' evenimente' : '') + '">' + d + '</button>';
    }
    return '<div class="cal-head"><button class="btn btn-icon" data-act="calprev" aria-label="Luna anterioară">' + ic('chevL') + '</button><h3>' + first.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }) + '</h3><button class="btn btn-icon" data-act="calnext" aria-label="Luna următoare">' + ic('chevR') + '</button></div><div class="cal-grid">' + cells + '</div>';
  }
  function evListHtml() {
    const today = todayStr();
    let list, title;
    if (ui.calSel) { list = S.events.filter(e => e.date === ui.calSel); title = 'Evenimente în ' + dtLong(ui.calSel); }
    else { list = S.events.filter(e => e.date >= today).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))); title = 'Evenimente viitoare'; }
    return '<h3>' + esc(title) + (ui.calSel ? ' <button class="chip" data-act="calclear">Arată toate viitoarele</button>' : '') + '</h3>' + (list.length ? '<div class="stack">' + list.map(evRow).join('') + '</div>' : empty('calendar', 'Niciun eveniment.', ui.calSel ? 'Alege altă zi din calendar.' : 'Revino curând!'));
  }
  function pEvents() {
    const past = S.events.filter(e => e.date < todayStr()).sort((a, b) => b.date.localeCompare(a.date));
    return pageHero('Evenimente', 'Calendarul evenimentelor centrului și arhiva celor desfășurate.') +
      '<section class="section"><div class="container"><div class="grid g2" style="grid-template-columns:minmax(300px,1fr) 1.2fr;align-items:start"><div class="cal" id="cal">' + calHtml() + '</div><div id="evList">' + evListHtml() + '</div></div></div></section>' +
      '<section class="section alt"><div class="container">' + head('Arhivă', 'Evenimente desfășurate') + (past.length ? '<div class="grid g2">' + past.map(evRow).join('') + '</div>' : empty('archive', 'Arhiva este goală.', 'Evenimentele încheiate vor apărea aici automat.')) + '</div></section>';
  }

  function pGallery(albumId) {
    const all = allMedia();
    if (albumId) {
      const al = byId('albums', albumId);
      if (!al) return pageHero('Album negăsit') + '<section class="section"><div class="container">' + empty('folder', 'Albumul nu există.') + '</div></section>';
      const items = all.filter(m => m.albumId === albumId); ui.lbItems = items;
      return pageHero(al.title, al.description || '', '<div class="crumbs"><a href="#/galerie">Galerie</a> / Album' + (al.date ? ' · ' + dtLong(al.date) : '') + '</div>') + '<section class="section"><div class="container">' + (items.length ? '<div class="masonry">' + items.map(mItem).join('') + '</div>' : empty('image', 'Albumul nu are încă fișiere.')) + '</div></section>';
    }
    const years = [...new Set(all.map(m => String(m.date).slice(0, 4)).filter(Boolean))].sort().reverse();
    const acts = published().filter(a => all.some(m => m.activityId === a.id));
    return pageHero('Galerie foto și video', 'Momente din activitățile și evenimentele noastre.') +
      '<section class="section"><div class="container">' +
      (S.albums.length ? head('Albume', 'Albume foto') + '<div class="grid g4" style="margin-bottom:48px">' + S.albums.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).map(al => { const items = all.filter(m => m.albumId === al.id); const c = al.cover || (items.find(m => m.type === 'image') || {}).url; return '<a class="album rv" href="#/galerie/' + esc(al.id) + '">' + (c ? '<img src="' + esc(DB.url(c)) + '" alt="" loading="lazy">' : ph()) + '<div class="lbl"><b>' + esc(al.title) + '</b><small>' + items.length + ' fișiere' + (al.date ? ' · ' + dtLong(al.date) : '') + '</small></div></a>'; }).join('') + '</div>' : '') +
      head('Arhivă', 'Toate fișierele') + '<div class="toolbar" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px"><select data-input="gType" aria-label="Tip" style="width:auto"><option value="">Foto și video</option><option value="image"' + (ui.gType === 'image' ? ' selected' : '') + '>Doar fotografii</option><option value="video"' + (ui.gType === 'video' ? ' selected' : '') + '>Doar video</option></select>' +
      '<select data-input="gAct" aria-label="Activitate" style="width:auto;max-width:300px"><option value="">Toate activitățile</option>' + acts.map(a => '<option value="' + esc(a.id) + '"' + (ui.gAct === a.id ? ' selected' : '') + '>' + esc(a.title) + '</option>').join('') + '</select>' +
      '<select data-input="gYear" aria-label="An" style="width:auto"><option value="">Toți anii</option>' + years.map(y => '<option' + (ui.gYear === y ? ' selected' : '') + '>' + y + '</option>').join('') + '</select></div><div id="gList">' + gListHtml() + '</div></div></section>';
  }
  function gListHtml() {
    const items = allMedia().filter(m => (!ui.gType || m.type === ui.gType) && (!ui.gAct || m.activityId === ui.gAct) && (!ui.gYear || String(m.date).startsWith(ui.gYear)));
    ui.lbItems = items; return items.length ? '<div class="masonry">' + items.map(mItem).join('') + '</div>' : empty('image', 'Nu există fișiere pentru filtrele alese.', 'Fotografiile și videoclipurile se adaugă din panoul de administrare.');
  }

  function pTeam() {
    const t = S.team.slice().sort((a, b) => (a.order || 99) - (b.order || 99));
    return pageHero('Echipa noastră', 'Oamenii care fac posibile activitățile centrului.') + '<section class="section"><div class="container">' + (t.length ? '<div class="grid g4">' + t.map(memberCard).join('') + '</div>' : empty('users', 'Echipa va fi prezentată în curând.')) + '</div></section>';
  }
  function pAbout() {
    const s = site();
    return pageHero('Despre noi', s.slogan) + '<section class="section"><div class="container">' +
      (s.history ? '<div class="rv" style="max-width:820px;margin-bottom:48px"><span class="eyebrow">Istoria centrului</span><h2>Cum am ajuns aici</h2><div class="prose">' + para(s.history) + '</div></div>' : '') +
      '<div class="grid g2"><div class="card vm rv"><div>' + ic('target') + '</div><h3>Misiunea</h3><p>' + esc(s.mission) + '</p></div><div class="card vm rv"><div>' + ic('eye') + '</div><h3>Viziunea</h3><p>' + esc(s.vision) + '</p></div>' +
      '<div class="card vm rv"><div>' + ic('heart') + '</div><h3>Valorile noastre</h3><ul class="ticks">' + lines(s.values).map(v => '<li>' + ic('check') + esc(v) + '</li>').join('') + '</ul></div><div class="card vm rv"><div>' + ic('star') + '</div><h3>Obiectivele</h3><ul class="ticks">' + lines(s.goals).map(v => '<li>' + ic('check') + esc(v) + '</li>').join('') + '</ul></div></div></div></section>' +
      '<section class="section dark"><div class="container">' + head('Impact', 'Impactul în comunitate', null, s.impact) + (statsHtml() || '<p class="sub">Statisticile vor apărea pe măsură ce sunt publicate activități și evenimente.</p>') + '</div></section>' +
      (S.partners.length ? '<section class="section"><div class="container">' + head('Alături de noi', 'Partenerii noștri') + partnersHtml() + '</div></section>' : '');
  }
  function pContact() {
    const s = site(); const lat = Number(s.lat) || 47.2583, lng = Number(s.lng) || 28.3033;
    const map = 'https://www.openstreetmap.org/export/embed.html?bbox=' + (lng - .02) + '%2C' + (lat - .012) + '%2C' + (lng + .02) + '%2C' + (lat + .012) + '&layer=mapnik&marker=' + lat + '%2C' + lng;
    return pageHero('Contact', 'Ne găsești în Călărași. Ne bucurăm să te cunoaștem!') + '<section class="section"><div class="container"><div class="contact-grid"><div>' +
      '<div class="c-item">' + ic('pin') + '<div><b>Adresa</b>' + esc(s.address) + '</div></div>' +
      '<div class="c-item">' + ic('phone') + '<div><b>Telefon</b>' + (s.phone ? '<a href="tel:' + esc(s.phone.replace(/[^+\d]/g, '')) + '">' + esc(s.phone) + '</a>' : '<span style="color:var(--muted)">Se va completa de administratori</span>') + '</div></div>' +
      '<div class="c-item">' + ic('mail') + '<div><b>E-mail</b>' + (s.email ? '<a href="mailto:' + esc(s.email) + '">' + esc(s.email) + '</a>' : '<span style="color:var(--muted)">Se va completa de administratori</span>') + '</div></div>' +
      '<b style="display:block;margin:20px 0 10px">Ne găsești și pe</b><div class="socials">' + (socials('lt') || '<span style="color:var(--muted)">Rețelele sociale vor fi adăugate în curând.</span>') + '</div>' +
      '<p style="margin-top:22px"><a class="btn btn-royal" href="#/inscriere">' + ic('users') + 'Alătură-te comunității</a></p></div>' +
      '<div class="map"><iframe title="Harta" loading="lazy" referrerpolicy="no-referrer" src="' + esc(map) + '"></iframe></div></div></div></section>';
  }

  /* ---------- formular de înscriere ---------- */
  function joinForm() {
    if (ui.joinDone) return '<div class="ok-box">' + ic('check') + '<h3>Cererea a fost trimisă!</h3><p>Mulțumim! Un membru al echipei te va contacta în curând. Datele tale sunt vizibile doar administratorilor centrului.</p><button class="btn btn-royal" data-act="joinAgain">Trimite o altă cerere</button></div>';
    return '<form class="form" data-form="join" novalidate autocomplete="on"><div class="err" hidden role="alert"></div>' +
      '<div class="row2"><div class="fld"><label for="j_name">Nume și prenume *</label><input id="j_name" name="name" type="text" autocomplete="name" maxlength="120" required></div><div class="fld"><label for="j_birth">Data nașterii *</label><input id="j_birth" name="birth" type="date" required max="' + todayStr() + '"></div></div>' +
      '<div class="row2"><div class="fld"><label for="j_phone">Număr de telefon *</label><input id="j_phone" name="phone" type="tel" autocomplete="tel" placeholder="+373 6X XXX XXX" maxlength="24" required></div><div class="fld"><label for="j_email">E-mail *</label><input id="j_email" name="email" type="email" autocomplete="email" maxlength="120" required></div></div>' +
      '<div class="row2"><div class="fld"><label for="j_loc">Localitate *</label><input id="j_loc" name="locality" type="text" maxlength="120" required></div><div class="fld"><label for="j_school">Instituție de învățământ <span class="hint">(opțional)</span></label><input id="j_school" name="school" type="text" maxlength="160"></div></div>' +
      '<div class="fld"><label for="j_reason">De ce vrei să te alături centrului? *</label><textarea id="j_reason" name="reason" maxlength="1500" required></textarea></div>' +
      '<div class="fld"><span class="lbl">Activitățile care te interesează *</span><div class="checks">' + CATS.map(c => '<label><input type="checkbox" name="interests" value="' + esc(c) + '">' + c + '</label>').join('') + '</div></div>' +
      '<div class="hp" aria-hidden="true"><label>Nu completa<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="consent"><input type="checkbox" name="consent" required><span>Sunt de acord ca datele mele să fie prelucrate de Centrul de Tineret Călărași exclusiv pentru a mă contacta. Dacă am sub 18 ani, am acordul părintelui/tutorelui.</span></label>' +
      '<button class="btn btn-primary" type="submit">' + ic('send') + 'Trimite cererea</button></form>';
  }
  async function submitJoin(form) {
    const err = $('.err', form); const f = fdata(form);
    const bad = m => { err.hidden = false; err.innerHTML = ic('info') + '<span>' + esc(m) + '</span>'; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
    err.hidden = true;
    if (f.website) { ui.joinDone = true; return render(); }
    const name = (f.name || '').trim(), phone = (f.phone || '').trim(), email = (f.email || '').trim(), loc = (f.locality || '').trim(), reason = (f.reason || '').trim(), interests = arr(f.interests);
    if (name.length < 3) return bad('Scrie numele și prenumele complet.');
    const bd = pd(f.birth); if (!f.birth || isNaN(bd) || bd > new Date() || bd.getFullYear() < 1930) return bad('Alege o dată de naștere validă.');
    if (!/^[+\d][\d\s()-]{5,22}$/.test(phone)) return bad('Numărul de telefon nu pare valid.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad('Adresa de e-mail nu pare validă.');
    if (loc.length < 2) return bad('Completează localitatea.');
    if (reason.length < 10) return bad('Spune-ne, pe scurt, de ce vrei să te alături.');
    if (!interests.length) return bad('Alege cel puțin o activitate care te interesează.');
    if (!f.consent) return bad('Pentru a trimite cererea, bifează acordul privind prelucrarea datelor.');
    const last = Number(localStorage.getItem('cctc_last_join') || 0); if (Date.now() - last < 45000) return bad('Ai trimis deja o cerere acum câteva secunde. Încearcă din nou puțin mai târziu.');
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try {
      await DB.add('applications', { name, birth: f.birth, phone, email, locality: loc, school: (f.school || '').trim(), reason, interests, status: 'new', consent: true });
      localStorage.setItem('cctc_last_join', String(Date.now()));
      ui.joinDone = true; render(false); toast('Cererea a fost trimisă. Mulțumim!');
    } catch (e) { console.error(e); btn.disabled = false; bad('Nu am putut trimite cererea. Verifică conexiunea la internet și încearcă din nou.'); }
  }

  /* ---------- evenimente: fereastră detalii ---------- */
  function eventModal(id) {
    const e = byId('events', id); if (!e) return;
    modal(mh(e.title) + '<div class="mb">' + (e.photo ? '<img src="' + esc(DB.url(e.photo)) + '" alt="" style="width:100%;max-height:340px;object-fit:cover;border-radius:14px;margin-bottom:16px">' : '') + '<div class="meta" style="margin-bottom:14px"><span>' + ic('calendar') + dtLong(e.date) + '</span>' + (e.time ? '<span>' + ic('clock') + esc(e.time) + '</span>' : '') + (e.location ? '<span>' + ic('pin') + esc(e.location) + '</span>' : '') + (e.date < todayStr() ? '<span class="badge night">Arhivă</span>' : '') + '</div><div class="prose">' + para(e.description) + '</div><div class="mf"><a class="btn btn-royal" href="#/inscriere" data-act="closeModal">' + ic('users') + 'Vreau să particip</a></div></div>');
  }

  /* ---------- acțiuni (delegare) ---------- */
  const ACT = {
    closeModal, drawer: () => { ui.drawer = !ui.drawer; $('.drawer').classList.toggle('open', ui.drawer); },
    drawerBg: (el, e) => { if (e.target === el) { ui.drawer = false; el.classList.remove('open'); } },
    cat: el => { ui.cat = el.dataset.c; ui.limit = 9; $('#actCats').innerHTML = catChips(); $('#actList').innerHTML = actListHtml(); reveal(); },
    more: () => { ui.limit += 9; $('#actList').innerHTML = actListHtml(); reveal(); },
    event: el => eventModal(el.dataset.id),
    lb: el => openLb(ui.lbItems, Number(el.dataset.i)), lbClose: () => { ui.lb = null; drawLb(); }, lbPrev: () => lbStep(-1), lbNext: () => lbStep(1),
    calprev: () => { ui.cal.m--; if (ui.cal.m < 0) { ui.cal.m = 11; ui.cal.y--; } $('#cal').innerHTML = calHtml(); },
    calnext: () => { ui.cal.m++; if (ui.cal.m > 11) { ui.cal.m = 0; ui.cal.y++; } $('#cal').innerHTML = calHtml(); },
    calday: el => { ui.calSel = ui.calSel === el.dataset.d ? '' : el.dataset.d; $('#cal').innerHTML = calHtml(); $('#evList').innerHTML = evListHtml(); reveal(); },
    calclear: () => { ui.calSel = ''; $('#cal').innerHTML = calHtml(); $('#evList').innerHTML = evListHtml(); reveal(); },
    joinAgain: () => { ui.joinDone = false; render(false); },
    resetDemo: () => { if (confirm('Resetezi datele demonstrative? Se șterg modificările făcute în acest browser.')) DB.resetDemo(); }
  };
  const FORMS = { join: submitJoin };
  const INPUT = {
    actSearch: el => { ui.q = el.value; ui.limit = 9; $('#actList').innerHTML = actListHtml(); reveal(); },
    gType: el => { ui.gType = el.value; $('#gList').innerHTML = gListHtml(); reveal(); },
    gAct: el => { ui.gAct = el.value; $('#gList').innerHTML = gListHtml(); reveal(); },
    gYear: el => { ui.gYear = el.value; $('#gList').innerHTML = gListHtml(); reveal(); }
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]'); if (!el) { if (e.target.id === 'modal') closeModal(); if (e.target.id === 'lightbox') ACT.lbClose(); return; }
    const fn = ACT[el.dataset.act]; if (fn) { if (el.tagName === 'A' && el.dataset.act !== 'closeModal') { } fn(el, e); }
  });
  document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault(); const fn = FORMS[f.dataset.form]; if (fn) fn(f, e); });
  const onInput = e => { const el = e.target.closest('[data-input]'); if (el && INPUT[el.dataset.input]) INPUT[el.dataset.input](el, e); };
  document.addEventListener('input', onInput); document.addEventListener('change', e => { if (e.target.tagName === 'SELECT') onInput(e); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (ui.lb != null) ACT.lbClose(); else closeModal(); }
    if (ui.lb != null) { if (e.key === 'ArrowLeft') lbStep(-1); if (e.key === 'ArrowRight') lbStep(1); }
  });

  /* ---------- pornire ---------- */
  function demoBar() {
    const b = $('#demoBar'); if (DB.live) return b.hidden = true;
    b.hidden = false; b.className = 'demobar';
    b.innerHTML = ic('info') + '<span>MOD DEMONSTRATIV – datele se salvează doar în acest browser. Conectează Firebase în <code>js/config.js</code> pentru funcționare reală.</span><button data-act="resetDemo">Resetează demo</button>';
  }
  window.App = { S, ui, ic, esc, para, lines, safeUrl, site, byId, toast, modal, closeModal, busy, mh, fdata, arr, ACT, FORMS, INPUT, render, CATS, ROLE_RO, pd, dtLong, todayStr, initials, DEFAULTS, ph, schedule, published };

  async function start() {
    try { await DB.init(); } catch (e) { console.error(e); $('#app').innerHTML = '<div class="container" style="padding:80px 0">' + empty('info', 'Eroare la inițializare', String(e.message || e)) + '</div>'; return; }
    ['activities', 'events', 'albums', 'media', 'team', 'partners', 'stories', 'settings', 'applications', 'users'].forEach(col => DB.subscribe(col, rows => { S[col] = rows; ui.loaded[col] = true; if (col === 'applications' && window.Admin && Admin.onNewApps) Admin.onNewApps(rows); schedule(); }));
    DB.onAuth(() => { schedule(); });
    demoBar(); window.addEventListener('hashchange', onRoute); onRoute();
    const lg = site().logo; const fav = $('link[rel=icon]'); if (fav && lg) fav.href = DB.url(lg);
  }
  document.addEventListener('DOMContentLoaded', start);
})();
