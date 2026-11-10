/* ==========================================================
   Panou de administrare – roluri, publicare, aprobări, cereri
   ========================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const A0 = window.App;
  const { S, ui, ic, esc, para, site, byId, toast, modal, closeModal, busy, mh, fdata, arr, ACT, FORMS, INPUT, CATS, ROLE_RO, dtLong, todayStr, initials, DEFAULTS } = A0;
  const st = { q: '', status: '', cat: '', appStatus: '', album: '', sideOpen: false, setup: null, setupAsked: false, perm: false };
  const STAT = { published: 'Publicat', pending: 'În așteptare', draft: 'Ciornă', rejected: 'Respins' };
  const APP_ST = { new: 'Nouă', review: 'În analiză', accepted: 'Acceptată', declined: 'Respinsă', archived: 'Arhivată' };
  const staff = () => DB.isStaff();
  const owner = () => DB.user && DB.user.role === 'owner';
  const canPub = () => staff() || !!(DB.user && DB.user.canPublish);
  const canUp = () => staff() || !!(DB.user && DB.user.role === 'member' && DB.user.canUpload !== false);
  const mine = a => DB.user && a.authorId === DB.user.uid;
  const when = t => t ? new Date(t).toLocaleString('ro-RO', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  const SECTIONS = [
    ['panou', 'Panou general', 'chart', () => true],
    ['activitati', 'Activități', 'calendar', () => true],
    ['evenimente', 'Evenimente', 'clock', staff],
    ['echipa', 'Echipa', 'users', staff],
    ['cereri', 'Cereri de înscriere', 'mail', staff],
    ['parteneri', 'Parteneri', 'handshake', staff],
    ['poveste', 'Povestea lunii', 'star', staff],
    ['utilizatori', 'Conturi și roluri', 'shield', staff],
    ['setari', 'Informații site', 'settings', staff]
  ];


  function setSide(v) {
    st.sideOpen = !!v;
    document.querySelectorAll('.adm-side,.adm-bg').forEach(e => e.classList.toggle('open', st.sideOpen));
    document.body.classList.toggle('adm-lock', st.sideOpen);
  }
  /* meniul se închide la orice navigare, la apăsarea unui link sau la Escape */
  window.addEventListener('hashchange', () => setSide(false));
  document.addEventListener('click', e => { if (st.sideOpen && e.target.closest('.adm-side a')) setSide(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && st.sideOpen) setSide(false); });

  /* ---------- helpers ---------- */
  const newApps = () => S.applications.filter(a => a.status === 'new').length;
  const pendingActs = () => S.activities.filter(a => a.status === 'pending').length;
  async function guard(fn) {
    try { await fn(); } catch (e) {
      console.error(e); busy(false);
      const m = {
        'permission-denied': 'Nu ai permisiunea pentru această acțiune.', 'auth/invalid-credential': 'E-mail sau parolă incorecte.', 'auth/wrong-password': 'E-mail sau parolă incorecte.',
        'auth/user-not-found': 'E-mail sau parolă incorecte.', 'auth/invalid-email': 'Adresa de e-mail nu este validă.', 'auth/email-already-in-use': 'Există deja un cont cu acest e-mail.',
        'auth/weak-password': 'Parola trebuie să aibă cel puțin 8 caractere.', 'auth/too-many-requests': 'Prea multe încercări. Așteaptă puțin și reîncearcă.', 'auth/network-request-failed': 'Fără conexiune la internet.'
      }[e.code] || e.message || 'A apărut o eroare. Încearcă din nou.';
      toast(m, true);
    }
  }
  async function uploadAll(files, folder) {
    const out = []; const list = Array.from(files || []).filter(f => f && f.size); let i = 0;
    for (const f of list) { i++; out.push(await DB.upload(f, folder, p => busy('Se încarcă ' + i + '/' + list.length + ': ' + f.name, p))); }
    return out;
  }
  const opt = (v, l, cur) => '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
  const fld = (label, inner, hint) => String(inner).includes('type="file"') ? '' : '<div class="fld"><label>' + label + '</label>' + inner + (hint ? '<span class="hint">' + hint + '</span>' : '') + '</div>';
  const stBadge = s => '<span class="st ' + esc(s) + '">' + esc(STAT[s] || APP_ST[s] || s) + '</span>';
  const thumb = u => u ? '<img class="thumb" src="' + esc(DB.url(u)) + '" alt="" loading="lazy">' : '<div class="thumb" style="display:grid;place-items:center;color:#60C5FF">' + ic('image') + '</div>';
  const emptyRow = (c, t) => '<tr><td colspan="' + c + '" style="text-align:center;padding:36px;color:var(--muted)">' + esc(t) + '</td></tr>';
  const delBtn = (act, id, title) => '<button class="btn btn-icon" data-act="' + act + '" data-id="' + esc(id) + '" title="' + (title || 'Șterge') + '" aria-label="' + (title || 'Șterge') + '">' + ic('trash') + '</button>';
  const editBtn = (act, id) => '<button class="btn btn-icon" data-act="' + act + '" data-id="' + esc(id) + '" title="Modifică" aria-label="Modifică">' + ic('edit') + '</button>';
  const filesHint = 'Imagini (JPG, PNG, WebP) se redimensionează automat. Video: max. 150 MB.';

  /* ======================================================
     LOGIN / PRIMA CONFIGURARE
     ====================================================== */
  function loginView() {
    if (DB.live && st.setup === null && !st.setupAsked) { st.setupAsked = true; DB.needsSetup().then(v => { st.setup = v; A0.render(); }); }
    const setup = DB.live && st.setup === true;
    const u = DB.user;
    let body;
    if (u && !u.role) {
      body = '<h2>Cont fără permisiuni</h2><p>Ești autentificat ca <b>' + esc(u.email) + '</b>, dar contul nu are un rol în platformă. Cere unui administrator să îți acorde acces.</p><button class="btn btn-royal" data-act="a_logout">' + ic('logout') + 'Deconectează-te</button>';
    } else if (u && u.active === false) {
      body = '<h2>Cont dezactivat</h2><p>Accesul tău a fost dezactivat. Contactează un administrator.</p><button class="btn btn-royal" data-act="a_logout">' + ic('logout') + 'Deconectează-te</button>';
    } else if (setup) {
      body = '<h2>Prima configurare</h2><p>Creează contul <b>Administratorului principal</b>. Acest pas apare o singură dată.</p><form class="form" data-form="a_setup"><div class="err" hidden role="alert"></div>' + fld('Nume complet', '<input name="name" required maxlength="100">') + fld('E-mail', '<input name="email" type="email" required autocomplete="username" value="' + esc(window.OWNER_EMAIL || '') + '"' + (window.OWNER_EMAIL ? ' readonly' : '') + '>') + fld('Parolă (min. 8 caractere)', '<input name="pw" type="password" minlength="8" required autocomplete="new-password">') + fld('Repetă parola', '<input name="pw2" type="password" minlength="8" required autocomplete="new-password">') + '<button class="btn btn-royal" type="submit">' + ic('shield') + 'Creează contul principal</button></form>';
    } else {
      body = '<h2>Acces pentru echipă</h2><p style="color:var(--muted)">Autentifică-te pentru a gestiona activitățile, evenimentele și cererile.</p><form class="form" data-form="a_login"><div class="err" hidden role="alert"></div>' + fld('E-mail', '<input name="email" type="email" required autocomplete="username">') + fld('Parolă', '<input name="pw" type="password" required autocomplete="current-password">') + '<button class="btn btn-royal" type="submit">' + ic('logout') + 'Intră în panou</button><button type="button" class="btn btn-outline btn-sm" data-act="a_forgot">Am uitat parola</button></form>' +
        (!DB.live ? '<div class="demo-accts"><span class="lbl">Conturi demonstrative (parola: demo1234)</span><button class="btn btn-outline btn-sm" data-act="a_demo" data-e="principal@demo.md">Administrator principal</button><button class="btn btn-outline btn-sm" data-act="a_demo" data-e="admin@demo.md">Administrator</button><button class="btn btn-outline btn-sm" data-act="a_demo" data-e="membru@demo.md">Membru al echipei</button></div>' : '');
    }
    return '<div class="adm-login"><div class="login-box"><a class="brand" href="#/"><img src="' + esc(DB.url(site().logo) || 'assets/logo.png') + '" alt=""><span>Centrul de Tineret<b>Călărași</b></span></a>' + body + '<p style="margin:18px 0 0;font-size:.88rem"><a href="#/">← Înapoi la site</a></p></div></div>';
  }

  /* ======================================================
     STRUCTURA PANOULUI
     ====================================================== */
  function render(p) {
    const u = DB.user;
    if (!u || !u.role || u.active === false) return loginView();
    const sec = SECTIONS.find(s => s[0] === (p[0] || 'panou') && s[3]()) || SECTIONS[0];
    const key = sec[0];
    const pills = { cereri: newApps(), activitati: staff() ? pendingActs() : 0 };
    const side = '<div class="adm-bg ' + (st.sideOpen ? 'open' : '') + '" data-act="a_sideClose"></div><aside class="adm-side ' + (st.sideOpen ? 'open' : '') + '"><button class="adm-close" data-act="a_sideClose" aria-label="Închide meniul">' + ic('x') + '</button><a class="brand" href="#/"><img src="' + esc(DB.url(site().logo) || 'assets/logo.png') + '" alt=""><span>Centrul de Tineret<b>Călărași</b></span></a>' +
      SECTIONS.filter(s => s[3]()).map(s => '<a class="it ' + (s[0] === key ? 'on' : '') + '" href="#/admin/' + (s[0] === 'panou' ? '' : s[0]) + '">' + ic(s[2]) + s[1] + (pills[s[0]] ? '<span class="pill">' + pills[s[0]] + '</span>' : '') + '</a>').join('') +
      '<div class="sp"></div><a class="it" href="#/">' + ic('home') + 'Vezi site-ul</a><div class="me"><b>' + esc(u.name || u.email) + '</b>' + esc(ROLE_RO[u.role] || '') + '<br><button class="btn btn-sm btn-ghost" style="margin-top:10px;width:100%" data-act="a_logout">' + ic('logout') + 'Deconectare</button></div></aside>';
    return '<div class="adm">' + side + '<div class="adm-main"><div class="adm-top"><button class="btn btn-icon adm-burger" data-act="a_side" aria-label="Meniu">' + ic('menu') + '</button><h1>' + esc(sec[1]) + '</h1><div class="sp"></div>' + topActions(key) + '<a class="btn btn-outline btn-sm adm-site" href="#/" title="Vezi site-ul" aria-label="Vezi site-ul">' + ic('home') + '<span>Vezi site-ul</span></a></div>' + body(key) + '</div></div>';
  }
  function topActions(k) {
    const b = (act, label, icon) => '<button class="btn btn-royal btn-sm" data-act="' + act + '">' + ic(icon || 'plus') + label + '</button>';
    return ({
      activitati: b('a_editAct', 'Activitate nouă'), evenimente: b('a_editEv', 'Eveniment nou'), echipa: b('a_editMember', 'Membru nou'), parteneri: b('a_editPartner', 'Partener nou'),
      poveste: b('a_editStory', 'Poveste nouă'), utilizatori: b('a_editUser', 'Cont nou'),
      galerie: b('a_upload', 'Încarcă fișiere', 'upload') + ' <button class="btn btn-outline btn-sm" data-act="a_editAlbum">' + ic('folder') + 'Album nou</button>',
      cereri: staff() ? '<button class="btn btn-outline btn-sm" data-act="a_csv">' + ic('download') + 'Export CSV</button>' : ''
    })[k] || '';
  }
  function body(k) {
    return ({ panou: bDash, activitati: bActs, evenimente: bEvents, galerie: bGallery, echipa: bTeam, cereri: bApps, parteneri: bPartners, poveste: bStories, utilizatori: bUsers, setari: bSettings })[k]();
  }
  const table = (heads, rows, id) => '<div class="tbl-w' + (heads[0] === '' ? ' nothumb' : '') + '"><table><thead><tr>' + heads.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody' + (id ? ' id="' + id + '"' : '') + '>' + rows + '</tbody></table></div>';

  /* ---------- panou general ---------- */
  function bDash() {
    const today = todayStr(); const u = DB.user;
    const tiles = [['calendar', S.activities.filter(a => a.status === 'published').length, 'Activități publicate'], ['clock', S.events.filter(e => e.date >= today).length, 'Evenimente viitoare']];
    if (staff()) tiles.unshift(['mail', newApps(), 'Cereri noi'], ['shield', pendingActs(), 'De aprobat']); else tiles.unshift(['edit', S.activities.filter(mine).length, 'Publicațiile mele']);
    tiles.push(['users', S.team.length, 'Membri în echipă']);
    const pend = S.activities.filter(a => a.status === 'pending');
    const apps = S.applications.filter(a => a.status === 'new').sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    const myList = S.activities.filter(mine).sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    return '<div class="tiles">' + tiles.map(t => '<div class="tile"><div class="ic-w">' + ic(t[0]) + '</div><div><b>' + t[1] + '</b><small>' + t[2] + '</small></div></div>').join('') + '</div>' +
      (!DB.live ? '<div class="note" style="margin-bottom:22px"><b>Mod demonstrativ.</b> Datele sunt salvate doar în acest browser. Pentru funcționare reală cu conturi, baze de date și stocare permanentă, urmează pașii din README.md (configurare Firebase).</div>' : '') +
      '<div class="panel"><h2>' + ic('plus') + 'Acțiuni rapide</h2><div class="toolbar" style="margin:0"><button class="btn btn-royal btn-sm" data-act="a_editAct">' + ic('calendar') + 'Publică o activitate</button>' + (staff() ? '<button class="btn btn-royal btn-sm" data-act="a_editEv">' + ic('clock') + 'Publică un eveniment</button>' : '') + ('Notification' in window && Notification.permission === 'default' && staff() ? '<button class="btn btn-outline btn-sm" data-act="a_notif">' + ic('bell') + 'Activează notificările din browser</button>' : '') + '</div></div>' +
      (staff() ? '<div class="grid g2"><div class="panel"><h2>' + ic('shield') + 'Publicații de aprobat</h2>' + (pend.length ? '<div class="stack">' + pend.map(a => '<div class="ev" style="cursor:default"><div><h3>' + esc(a.title) + '</h3><div class="meta"><span>' + esc(a.authorName || '') + '</span><span>' + dtLong(a.date) + '</span></div></div><div class="acts" style="margin-left:auto"><button class="btn btn-royal btn-sm" data-act="a_approve" data-id="' + esc(a.id) + '">' + ic('check') + 'Aprobă</button><button class="btn btn-icon" data-act="a_editAct" data-id="' + esc(a.id) + '">' + ic('eye') + '</button></div></div>').join('') + '</div>' : '<p style="color:var(--muted)">Nu există publicații în așteptare.</p>') + '</div>' +
        '<div class="panel"><h2>' + ic('mail') + 'Cereri noi de înscriere</h2>' + (apps.length ? '<div class="stack">' + apps.map(a => '<button class="ev" data-act="a_viewApp" data-id="' + esc(a.id) + '"><div><h3>' + esc(a.name) + '</h3><div class="meta"><span>' + esc(a.locality) + '</span><span>' + when(a.createdAt) + '</span></div></div></button>').join('') + '</div><p style="margin:14px 0 0"><a class="link-arrow" href="#/admin/cereri">Toate cererile ' + ic('arrow') + '</a></p>' : '<p style="color:var(--muted)">Nicio cerere nouă.</p>') + '</div></div>'
        : '<div class="panel"><h2>' + ic('edit') + 'Publicațiile mele</h2>' + (myList.length ? table(['Titlu', 'Data', 'Stare'], myList.map(a => '<tr><td>' + esc(a.title) + '</td><td>' + dtLong(a.date) + '</td><td>' + stBadge(a.status) + (a.status === 'rejected' && a.rejectNote ? '<br><small>' + esc(a.rejectNote) + '</small>' : '') + '</td></tr>').join('')) : '<p style="color:var(--muted)">Încă nu ai publicat nimic. ' + (canPub() ? '' : 'Publicațiile tale vor fi verificate de un administrator înainte de a deveni publice.') + '</p>') + '</div>');
  }

  /* ---------- activități ---------- */
  function actRows() {
    const q = st.q.toLowerCase();
    let list = S.activities.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (!staff()) list = list.filter(a => mine(a) || a.status === 'published');
    list = list.filter(a => (!st.status || a.status === st.status) && (!st.cat || a.category === st.cat) && (!q || (a.title + ' ' + (a.authorName || '')).toLowerCase().includes(q)));
    return list.length ? list.map(a => {
      const own = staff() || mine(a);
      return '<tr><td>' + thumb(a.cover || (a.media || []).find(m => m.type === 'image')?.url) + '</td><td><b>' + esc(a.title) + '</b><br><small style="color:var(--muted)">' + esc(a.authorName || '') + '</small></td><td>' + esc(a.category) + '</td><td>' + dtLong(a.date) + '</td><td>' + stBadge(a.status) + '</td><td><div class="acts">' +
        (staff() && a.status === 'pending' ? '<button class="btn btn-royal btn-sm" data-act="a_approve" data-id="' + esc(a.id) + '">' + ic('check') + 'Aprobă</button><button class="btn btn-outline btn-sm" data-act="a_reject" data-id="' + esc(a.id) + '">Respinge</button>' : '') +
        (a.status === 'published' ? '<a class="btn btn-icon" href="#/activitati/' + esc(a.id) + '" title="Vezi pe site" aria-label="Vezi pe site">' + ic('eye') + '</a>' : '') + (own ? editBtn('a_editAct', a.id) + delBtn('a_delAct', a.id) : '') + '</div></td></tr>';
    }).join('') : emptyRow(6, 'Nu există activități.');
  }
  function listTools(extra) {
    return '<div class="toolbar"><input type="search" name="q" placeholder="Caută…" value="' + esc(st.q) + '" data-input="a_filter" aria-label="Caută">' + (extra || '') + '</div>';
  }
  function bActs() {
    return '<div class="panel">' + listTools('<select name="cat" data-input="a_filter" aria-label="Categorie"><option value="">Toate categoriile</option>' + CATS.map(c => opt(c, c, st.cat)).join('') + '</select><select name="status" data-input="a_filter" aria-label="Stare"><option value="">Toate stările</option>' + Object.keys(STAT).map(s => opt(s, STAT[s], st.status)).join('') + '</select>') +
      table(['', 'Titlu', 'Categorie', 'Data', 'Stare', ''], actRows(), 'aRows') + '</div>';
  }
  function actForm(id) {
    const a = id ? byId('activities', id) : null; const u = DB.user;
    if (a && !(staff() || mine(a))) return toast('Poți modifica doar publicațiile tale.', true);
    const v = a || { date: todayStr(), category: CATS[0], status: 'published', media: [] };
    modal(mh(a ? 'Modifică activitatea' : 'Activitate nouă') + '<div class="mb"><form class="form" data-form="a_saveAct" data-id="' + esc(id || '') + '" novalidate><div class="err" hidden role="alert"></div>' +
      fld('Titlu *', '<input name="title" required maxlength="160" value="' + esc(v.title || '') + '">') +
      '<div class="row2">' + fld('Categorie *', '<select name="category">' + CATS.map(c => opt(c, c, v.category)).join('') + '</select>') + fld('Data activității *', '<input type="date" name="date" required value="' + esc(v.date) + '">') + '</div>' +
      fld('Locație', '<input name="location" maxlength="160" value="' + esc(v.location || '') + '">') +
      fld('Imagine (link)', '<input name="coverUrl" maxlength="400" placeholder="https://… sau assets/poza.jpg" value="' + esc(v.cover || '') + '">', 'Opțional. Pune poza în folderul assets din GitHub și scrie assets/numele-pozei.jpg') +
      fld('Descriere *', '<textarea name="description" required maxlength="8000">' + esc(v.description || '') + '</textarea>') +
      '<label class="consent"><input type="checkbox" name="isProject"' + (v.isProject ? ' checked' : '') + '><span>Afișează ca <b>proiect al centrului</b> pe pagina principală</span></label>' +
      fld('Imagine de copertă', (v.cover ? '<div class="me-i" style="max-width:160px"><img src="' + esc(DB.url(v.cover)) + '" alt=""><label><input type="checkbox" name="rmCover" value="1">Elimină</label></div>' : '') + '<input type="file" name="coverFile" accept="image/*">', 'Opțional. Dacă lipsește, se folosește prima fotografie.') +
      fld('Fotografii', '<input type="file" name="photos" accept="image/*" multiple>', filesHint) +
      fld('Videoclipuri', '<input type="file" name="videos" accept="video/*" multiple>', filesHint) +
      fld('Linkuri YouTube', '<textarea name="ytLinks" style="min-height:70px" placeholder="Un link pe fiecare rând">' + esc(v.ytLinks || '') + '</textarea>', 'Opțional – pentru videoclipuri găzduite pe YouTube.') +
      ((v.media || []).length ? fld('Fișiere existente', '<div class="media-edit">' + v.media.map((m, i) => '<div class="me-i">' + (m.type === 'video' ? '<video src="' + esc(DB.url(m.url)) + '#t=0.1" preload="metadata" muted></video>' : '<img src="' + esc(DB.url(m.url)) + '" alt="">') + '<label><input type="checkbox" name="rm" value="' + i + '">Elimină</label></div>').join('') + '</div>') : '') +
      (canPub() ? fld('Stare', '<select name="status">' + ['published', 'draft'].concat(a && a.status === 'pending' ? ['pending'] : []).map(s => opt(s, STAT[s], v.status === 'rejected' ? 'draft' : v.status)).join('') + '</select>') : '<div class="note">' + ic('info') + ' Publicația va fi trimisă spre <b>aprobare</b> și devine publică după ce un administrator o verifică.</div>') +
      '<div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>', true);
  }
  async function saveAct(form) {
    const f = fdata(form); const err = $('.err', form); err.hidden = true;
    const bad = m => { err.hidden = false; err.innerHTML = ic('info') + '<span>' + esc(m) + '</span>'; err.scrollIntoView({ block: 'center' }); };
    if (!(f.title || '').trim()) return bad('Completează titlul.'); if (!f.date) return bad('Alege data activității.'); if (!(f.description || '').trim()) return bad('Completează descrierea.');
    await guard(async () => {
      const id = form.dataset.id; const old = id ? byId('activities', id) : null; const u = DB.user;
      const rm = arr(f.rm).map(Number); const keep = (old?.media || []).filter((m, i) => !rm.includes(i));
      (old?.media || []).forEach((m, i) => { if (rm.includes(i)) DB.deleteFile(m.path); });
      const up = [...await uploadAll(form.elements.photos?.files, 'activitati'), ...await uploadAll(form.elements.videos?.files, 'activitati')];
      let cover = String(f.coverUrl || '').trim(), coverPath = ''; if (cover && !/^(https:\/\/|assets\/)/.test(cover)) return bad('Linkul imaginii trebuie să înceapă cu https:// sau assets/');
      if (f.rmCover) { DB.deleteFile(coverPath); cover = ''; coverPath = ''; }
      const cf = await uploadAll(form.elements.coverFile?.files, 'activitati'); if (cf[0]) { DB.deleteFile(coverPath); cover = cf[0].url; coverPath = cf[0].path; }
      const status = canPub() ? (f.status || 'published') : 'pending';
      const data = { title: f.title.trim(), category: f.category, date: f.date, location: (f.location || '').trim(), description: f.description.trim(), ytLinks: (f.ytLinks || '').trim(), isProject: !!f.isProject, status, media: keep.concat(up.map(x => ({ url: x.url, path: x.path, type: x.type, name: x.name }))), cover, coverPath, authorId: old?.authorId || u.uid, authorName: old?.authorName || u.name || u.email, rejectNote: status === 'pending' ? '' : (old?.rejectNote || '') };
      busy('Se salvează…'); if (id) await DB.update('activities', id, data); else await DB.add('activities', data);
      busy(false); closeModal(); toast(status === 'pending' ? 'Trimisă spre aprobare.' : 'Activitatea a fost salvată.');
    });
  }

  /* ---------- evenimente ---------- */
  function bEvents() {
    const list = S.events.slice().sort((a, b) => b.date.localeCompare(a.date));
    return '<div class="panel">' + table(['', 'Eveniment', 'Data', 'Locația', 'Stare', ''], list.length ? list.map(e => '<tr><td>' + thumb(e.photo) + '</td><td><b>' + esc(e.title) + '</b></td><td>' + dtLong(e.date) + (e.time ? ', ' + esc(e.time) : '') + '</td><td>' + esc(e.location || '') + '</td><td>' + (e.date < todayStr() ? '<span class="st archived">Arhivă</span>' : '<span class="st published">Viitor</span>') + '</td><td><div class="acts">' + editBtn('a_editEv', e.id) + delBtn('a_delEv', e.id) + '</div></td></tr>').join('') : emptyRow(6, 'Nu există evenimente.')) + '</div>';
  }
  function evForm(id) {
    const e = id ? byId('events', id) : { date: todayStr() };
    modal(mh(id ? 'Modifică evenimentul' : 'Eveniment nou') + '<div class="mb"><form class="form" data-form="a_saveEv" data-id="' + esc(id || '') + '" novalidate><div class="err" hidden role="alert"></div>' + fld('Titlu *', '<input name="title" required maxlength="160" value="' + esc(e.title || '') + '">') +
      '<div class="row2">' + fld('Data *', '<input type="date" name="date" required value="' + esc(e.date) + '">') + fld('Ora', '<input type="time" name="time" value="' + esc(e.time || '') + '">') + '</div>' + fld('Locația', '<input name="location" maxlength="160" value="' + esc(e.location || '') + '">') + fld('Descriere', '<textarea name="description" maxlength="4000">' + esc(e.description || '') + '</textarea>') +
      fld('Fotografia evenimentului', (e.photo ? '<div class="me-i" style="max-width:160px"><img src="' + esc(DB.url(e.photo)) + '" alt=""><label><input type="checkbox" name="rmPhoto" value="1">Elimină</label></div>' : '') + '<input type="file" name="photo" accept="image/*">') +
      '<div class="note">Evenimentele cu data trecută sunt mutate automat în arhivă.</div><div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>');
  }
  async function saveEv(form) {
    const f = fdata(form); const err = $('.err', form); if (!(f.title || '').trim() || !f.date) { err.hidden = false; err.innerHTML = ic('info') + '<span>Completează titlul și data.</span>'; return; }
    await guard(async () => {
      const id = form.dataset.id; const old = id ? byId('events', id) : null; let photo = old?.photo || '', photoPath = old?.photoPath || '';
      if (f.rmPhoto) { DB.deleteFile(photoPath); photo = ''; photoPath = ''; }
      const up = await uploadAll(form.elements.photo?.files, 'evenimente'); if (up[0]) { DB.deleteFile(photoPath); photo = up[0].url; photoPath = up[0].path; }
      const data = { title: f.title.trim(), date: f.date, time: f.time || '', location: (f.location || '').trim(), description: (f.description || '').trim(), photo, photoPath };
      busy('Se salvează…'); if (id) await DB.update('events', id, data); else await DB.add('events', data); busy(false); closeModal(); toast('Evenimentul a fost salvat.');
    });
  }

  /* ---------- galerie ---------- */
  function bGallery() {
    const albums = S.albums.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const media = S.media.filter(m => !st.album || (st.album === '_none' ? !m.albumId : m.albumId === st.album)).sort((a, b) => String(b.date).localeCompare(String(a.date)) || b.createdAt - a.createdAt);
    return '<div class="panel"><h2>' + ic('folder') + 'Albume</h2>' + (albums.length ? '<div class="grid g4">' + albums.map(al => { const n = S.media.filter(m => m.albumId === al.id).length; const c = al.cover || (S.media.find(m => m.albumId === al.id && m.type === 'image') || {}).url; return '<div class="card"><div class="cover">' + (c ? '<img src="' + esc(DB.url(c)) + '" alt="">' : A0.ph()) + '</div><div class="body"><b>' + esc(al.title) + '</b><div class="meta"><span>' + n + ' fișiere</span><span>' + dtLong(al.date) + '</span></div><div class="acts" style="margin-top:12px;justify-content:flex-start">' + (staff() ? editBtn('a_editAlbum', al.id) + delBtn('a_delAlbum', al.id) : '') + '<button class="btn btn-sm btn-outline" data-act="a_filterAlbum" data-id="' + esc(al.id) + '">Vezi fișierele</button></div></div></div>'; }).join('') + '</div>' : '<p style="color:var(--muted)">Nu ai creat încă albume. Folosește „Album nou”.</p>') + '</div>' +
      '<div class="panel"><h2>' + ic('image') + 'Fișiere încărcate</h2><div class="toolbar"><select data-input="a_album" aria-label="Album"><option value="">Toate fișierele</option><option value="_none"' + (st.album === '_none' ? ' selected' : '') + '>Fără album</option>' + albums.map(al => opt(al.id, al.title, st.album)).join('') + '</select></div>' +
      (media.length ? '<div class="media-edit" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">' + media.map(m => '<div class="me-i">' + (m.type === 'video' ? '<video src="' + esc(DB.url(m.url)) + '#t=0.1" preload="metadata" muted style="height:110px"></video>' : '<img src="' + esc(DB.url(m.url)) + '" alt="" loading="lazy" style="height:110px">') + '<div style="padding:8px"><small>' + esc(m.description || 'Fără descriere') + '</small><div class="acts" style="margin-top:8px;justify-content:flex-start">' + ((staff() || (DB.user && m.uploaderId === DB.user.uid)) ? editBtn('a_editMedia', m.id) + delBtn('a_delMedia', m.id) : '') + '</div></div></div>').join('') + '</div>' : '<div class="empty">' + ic('image') + '<b>Nu există fișiere.</b><p style="margin:6px 0 0">Încarcă fotografii și videoclipuri cu butonul de sus.</p></div>') + '</div>';
  }
  function uploadForm() {
    const albums = S.albums.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))); const acts = S.activities.filter(a => a.status === 'published');
    modal(mh('Încarcă fotografii și videoclipuri') + '<div class="mb"><form class="form" data-form="a_saveUpload" novalidate><div class="err" hidden role="alert"></div>' + fld('Fișiere * (poți alege mai multe)', '<input type="file" name="files" accept="image/*,video/*" multiple required>', filesHint) +
      '<div class="row2">' + fld('Album', '<select name="albumId"><option value="">— fără album —</option>' + albums.map(a => opt(a.id, a.title, st.album)).join('') + '</select>') + fld('Data', '<input type="date" name="date" value="' + todayStr() + '">') + '</div>' +
      fld('Activitate asociată', '<select name="activityId"><option value="">— niciuna —</option>' + acts.map(a => opt(a.id, a.title, '')).join('') + '</select>') + fld('Descriere (pentru toate fișierele)', '<textarea name="description" style="min-height:80px" maxlength="500"></textarea>', 'O poți modifica ulterior pentru fiecare fișier.') +
      '<div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('upload') + 'Încarcă</button></div></form></div>');
  }
  async function saveUpload(form) {
    const f = fdata(form); const files = form.elements.files?.files; if (!files.length) return toast('Alege cel puțin un fișier.', true);
    await guard(async () => {
      const up = await uploadAll(files, 'galerie'); busy('Se salvează…');
      for (const x of up) await DB.add('media', { url: x.url, path: x.path, type: x.type, name: x.name, description: (f.description || '').trim(), albumId: f.albumId || '', activityId: f.activityId || '', date: f.date || todayStr(), uploaderId: DB.user.uid, uploaderName: DB.user.name || DB.user.email });
      busy(false); closeModal(); toast(up.length + ' fișiere încărcate.');
    });
  }
  function mediaForm(id) {
    const m = byId('media', id); if (!m) return; const albums = S.albums;
    modal(mh('Modifică fișierul') + '<div class="mb"><form class="form" data-form="a_saveMedia" data-id="' + esc(id) + '"><div style="max-width:320px">' + (m.type === 'video' ? '<video src="' + esc(DB.url(m.url)) + '" controls></video>' : '<img src="' + esc(DB.url(m.url)) + '" alt="" style="border-radius:12px">') + '</div>' + fld('Descriere', '<textarea name="description" maxlength="500">' + esc(m.description || '') + '</textarea>') + '<div class="row2">' + fld('Album', '<select name="albumId"><option value="">— fără album —</option>' + albums.map(a => opt(a.id, a.title, m.albumId)).join('') + '</select>') + fld('Data', '<input type="date" name="date" value="' + esc(m.date || '') + '">') + '</div><div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>');
  }
  function albumForm(id) {
    const a = id ? byId('albums', id) : { date: todayStr() }; const acts = S.activities.filter(x => x.status === 'published'); const items = id ? S.media.filter(m => m.albumId === id && m.type === 'image') : [];
    modal(mh(id ? 'Modifică albumul' : 'Album nou') + '<div class="mb"><form class="form" data-form="a_saveAlbum" data-id="' + esc(id || '') + '"><div class="err" hidden></div>' + fld('Titlu *', '<input name="title" required maxlength="160" value="' + esc(a.title || '') + '">') + fld('Descriere', '<textarea name="description" style="min-height:90px" maxlength="1000">' + esc(a.description || '') + '</textarea>') +
      '<div class="row2">' + fld('Data', '<input type="date" name="date" value="' + esc(a.date || '') + '">') + fld('Activitate asociată', '<select name="activityId"><option value="">— niciuna —</option>' + acts.map(x => opt(x.id, x.title, a.activityId)).join('') + '</select>') + '</div>' +
      (items.length ? fld('Imagine de copertă', '<select name="cover"><option value="">Automată (prima fotografie)</option>' + items.map(m => opt(m.url, m.description || m.name || 'Fotografie', a.cover)).join('') + '</select>') : '') +
      '<div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>');
  }

  /* ---------- echipă ---------- */
  function bTeam() {
    const list = S.team.slice().sort((a, b) => (a.order || 99) - (b.order || 99));
    return '<div class="panel">' + table(['', 'Nume', 'Funcție', 'Ordine', ''], list.length ? list.map(m => '<tr><td>' + thumb(m.photo) + '</td><td><b>' + esc(m.name) + '</b></td><td>' + esc(m.role) + '</td><td>' + (m.order || '') + '</td><td><div class="acts">' + editBtn('a_editMember', m.id) + delBtn('a_delMember', m.id) + '</div></td></tr>').join('') : emptyRow(5, 'Nu ai adăugat membri în echipă.')) + '</div>';
  }
  function memberForm(id) {
    const m = id ? byId('team', id) : { order: S.team.length + 1, activityIds: [] }; const acts = S.activities.filter(a => a.status === 'published');
    modal(mh(id ? 'Modifică membrul' : 'Membru nou în echipă') + '<div class="mb"><form class="form" data-form="a_saveMember" data-id="' + esc(id || '') + '"><div class="err" hidden></div><div class="row2">' + fld('Nume și prenume *', '<input name="name" required maxlength="120" value="' + esc(m.name || '') + '">') + fld('Funcție *', '<input name="role" required maxlength="120" value="' + esc(m.role || '') + '">') + '</div>' + fld('Prezentare', '<textarea name="bio" maxlength="1500">' + esc(m.bio || '') + '</textarea>') +
      fld('Fotografie', (m.photo ? '<div class="me-i" style="max-width:120px"><img src="' + esc(DB.url(m.photo)) + '" alt=""><label><input type="checkbox" name="rmPhoto" value="1">Elimină</label></div>' : '') + '<input type="file" name="photo" accept="image/*">') + fld('Ordinea în listă', '<input type="number" name="order" min="1" max="999" value="' + (m.order || 1) + '">') +
      fld('Activități în care este implicat', acts.length ? '<div class="checks">' + acts.map(a => '<label><input type="checkbox" name="activityIds" value="' + esc(a.id) + '"' + (arr(m.activityIds).includes(a.id) ? ' checked' : '') + '>' + esc(a.title) + '</label>').join('') + '</div>' : '<span class="hint">Publică mai întâi activități.</span>') + '<div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>', true);
  }

  /* ---------- parteneri / povești ---------- */
  function bPartners() {
    return '<div class="panel">' + table(['', 'Partener', 'Link', ''], S.partners.length ? S.partners.map(p => '<tr><td>' + thumb(p.logo) + '</td><td><b>' + esc(p.name) + '</b></td><td>' + esc(p.url || '') + '</td><td><div class="acts">' + editBtn('a_editPartner', p.id) + delBtn('a_delPartner', p.id) + '</div></td></tr>').join('') : emptyRow(4, 'Nu există parteneri.')) + '</div>';
  }
  function partnerForm(id) {
    const p = id ? byId('partners', id) : {};
    modal(mh(id ? 'Modifică partenerul' : 'Partener nou') + '<div class="mb"><form class="form" data-form="a_savePartner" data-id="' + esc(id || '') + '"><div class="err" hidden></div>' + fld('Denumire *', '<input name="name" required maxlength="120" value="' + esc(p.name || '') + '">') + fld('Site web', '<input name="url" type="url" placeholder="https://" maxlength="300" value="' + esc(p.url || '') + '">') +
      fld('Logo', (p.logo ? '<div class="me-i" style="max-width:140px"><img src="' + esc(DB.url(p.logo)) + '" alt=""><label><input type="checkbox" name="rmLogo" value="1">Elimină</label></div>' : '') + '<input type="file" name="logo" accept="image/*">') + '<div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>');
  }
  function bStories() {
    const list = S.stories.slice().sort((a, b) => String(b.month).localeCompare(String(a.month)));
    return '<div class="note" style="margin-bottom:18px">Pe pagina principală apare povestea cu luna cea mai recentă.</div><div class="panel">' + table(['', 'Titlu', 'Luna', ''], list.length ? list.map(s => '<tr><td>' + thumb(s.image) + '</td><td><b>' + esc(s.title) + '</b></td><td>' + esc(s.month) + '</td><td><div class="acts">' + editBtn('a_editStory', s.id) + delBtn('a_delStory', s.id) + '</div></td></tr>').join('') : emptyRow(4, 'Nu există povești.')) + '</div>';
  }
  function storyForm(id) {
    const s = id ? byId('stories', id) : { month: todayStr().slice(0, 7) };
    modal(mh(id ? 'Modifică povestea' : 'Povestea lunii') + '<div class="mb"><form class="form" data-form="a_saveStory" data-id="' + esc(id || '') + '"><div class="err" hidden></div><div class="row2">' + fld('Titlu *', '<input name="title" required maxlength="160" value="' + esc(s.title || '') + '">') + fld('Luna *', '<input type="month" name="month" required value="' + esc(s.month || '') + '">') + '</div>' + fld('Povestea *', '<textarea name="text" required maxlength="6000" style="min-height:180px">' + esc(s.text || '') + '</textarea>') +
      fld('Imagine', (s.image ? '<div class="me-i" style="max-width:140px"><img src="' + esc(DB.url(s.image)) + '" alt=""><label><input type="checkbox" name="rmImg" value="1">Elimină</label></div>' : '') + '<input type="file" name="image" accept="image/*">') + '<div class="mf"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></form></div>');
  }

  /* ---------- cereri de înscriere ---------- */
  function appRows() {
    const q = st.q.toLowerCase();
    const list = S.applications.slice().sort((a, b) => b.createdAt - a.createdAt).filter(a => (!st.appStatus || a.status === st.appStatus) && (!q || (a.name + ' ' + a.email + ' ' + a.locality + ' ' + a.phone).toLowerCase().includes(q)));
    return list.length ? list.map(a => '<tr><td><b>' + esc(a.name) + '</b><br><small style="color:var(--muted)">' + esc(a.locality) + '</small></td><td>' + esc(a.phone) + '<br><small>' + esc(a.email) + '</small></td><td>' + arr(a.interests).map(i => '<span class="badge" style="margin:2px">' + esc(i) + '</span>').join('') + '</td><td>' + when(a.createdAt) + '</td><td>' + stBadge(a.status) + '</td><td><div class="acts"><button class="btn btn-royal btn-sm" data-act="a_viewApp" data-id="' + esc(a.id) + '">' + ic('eye') + 'Deschide</button></div></td></tr>').join('') : emptyRow(6, 'Nu există cereri.');
  }
  function bApps() {
    return '<div class="note" style="margin-bottom:18px">' + ic('shield') + ' Datele solicitanților sunt vizibile doar administratorilor și nu sunt publicate niciodată pe site.</div><div class="panel">' + listTools('<select name="appStatus" data-input="a_filter" aria-label="Stare"><option value="">Toate cererile</option>' + Object.keys(APP_ST).map(s => opt(s, APP_ST[s], st.appStatus)).join('') + '</select>') + table(['Solicitant', 'Contact', 'Interese', 'Trimisă', 'Stare', ''], appRows(), 'aRows') + '</div>';
  }
  function appModal(id) {
    const a = byId('applications', id); if (!a) return;
    const age = a.birth ? Math.floor((Date.now() - A0.pd(a.birth)) / 31557600000) : '';
    modal(mh('Cerere de înscriere') + '<div class="mb"><dl class="kv"><dt>Nume și prenume</dt><dd>' + esc(a.name) + '</dd><dt>Data nașterii</dt><dd>' + dtLong(a.birth) + (age !== '' ? ' (' + age + ' ani)' : '') + '</dd><dt>Telefon</dt><dd><a href="tel:' + esc(String(a.phone).replace(/[^+\d]/g, '')) + '">' + esc(a.phone) + '</a></dd><dt>E-mail</dt><dd><a href="mailto:' + esc(a.email) + '">' + esc(a.email) + '</a></dd><dt>Localitate</dt><dd>' + esc(a.locality) + '</dd><dt>Instituție</dt><dd>' + esc(a.school || '—') + '</dd><dt>Interese</dt><dd>' + arr(a.interests).map(esc).join(', ') + '</dd><dt>Motivație</dt><dd>' + para(a.reason) + '</dd><dt>Trimisă la</dt><dd>' + when(a.createdAt) + '</dd></dl>' +
      '<form class="form" data-form="a_saveApp" data-id="' + esc(id) + '" style="margin-top:20px;padding-top:18px;border-top:1px solid var(--line)">' + fld('Stare', '<select name="status">' + Object.keys(APP_ST).map(s => opt(s, APP_ST[s], a.status)).join('') + '</select>') + fld('Notă internă (nu e vizibilă solicitantului)', '<textarea name="note" style="min-height:80px" maxlength="1000">' + esc(a.note || '') + '</textarea>') +
      '<div class="mf" style="justify-content:space-between"><button type="button" class="btn btn-outline" data-act="a_delApp" data-id="' + esc(id) + '">' + ic('trash') + 'Șterge cererea</button><div style="display:flex;gap:10px"><button type="button" class="btn btn-outline" data-act="closeModal">Închide</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></div></form></div>', true);
  }
  function exportCsv() {
    const cell = v => { let s = String(v == null ? '' : v).replace(/"/g, '""'); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s + '"'; };
    const rows = [['Nume', 'Data nașterii', 'Telefon', 'E-mail', 'Localitate', 'Instituție', 'Motivație', 'Interese', 'Stare', 'Trimisă la'].map(cell).join(',')].concat(S.applications.map(a => [a.name, a.birth, a.phone, a.email, a.locality, a.school, a.reason, arr(a.interests).join('; '), APP_ST[a.status] || a.status, when(a.createdAt)].map(cell).join(',')));
    const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob);
    const l = document.createElement('a'); l.href = url; l.download = 'cereri-inscriere-' + todayStr() + '.csv'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ---------- utilizatori ---------- */
  function bUsers() {
    const list = S.users.slice().sort((a, b) => ['owner', 'admin', 'member'].indexOf(a.role) - ['owner', 'admin', 'member'].indexOf(b.role));
    return '<div class="note" style="margin-bottom:18px"><b>Roluri:</b> Administratorul principal are acces complet; Administratorul gestionează platforma (conținut, cereri, membri echipă); Membrul echipei publică activități (pot necesita aprobare). Vizitatorii văd doar informațiile publice și pot trimite formularul de înscriere.</div><div class="panel">' +
      table(['Nume', 'E-mail', 'Rol', 'Permisiuni', 'Stare', ''], list.length ? list.map(u => { const me = DB.user && u.id === DB.user.uid; const can = !me && u.role !== 'owner' && (owner() || u.role === 'member'); return '<tr><td><b>' + esc(u.name || '—') + '</b>' + (me ? ' <span class="badge">tu</span>' : '') + '</td><td>' + esc(u.email) + '</td><td>' + esc(ROLE_RO[u.role] || u.role) + '</td><td>' + (u.role === 'member' ? (u.canPublish ? 'Publică direct' : 'Necesită aprobare') : 'Complete') + '</td><td>' + (u.active === false ? '<span class="st archived">Dezactivat</span>' : '<span class="st published">Activ</span>') + '</td><td><div class="acts">' + (can ? editBtn('a_editUser', u.id) : '') + '</div></td></tr>'; }).join('') : emptyRow(6, 'Nu există conturi.')) + '</div>';
  }
  function userForm(id) {
    const u = id ? byId('users', id) : { role: 'member', canUpload: true, canPublish: false, active: true };
    if (id && !(owner() || u.role === 'member')) return toast('Nu ai permisiunea să modifici acest cont.', true);
    const roles = owner() ? [['admin', 'Administrator'], ['member', 'Membru al echipei']] : [['member', 'Membru al echipei']];
    modal(mh(id ? 'Modifică contul' : 'Cont nou') + '<div class="mb"><form class="form" data-form="a_saveUser" data-id="' + esc(id || '') + '"><div class="err" hidden role="alert"></div>' + fld('Nume complet *', '<input name="name" required maxlength="120" value="' + esc(u.name || '') + '">') +
      (id ? fld('E-mail', '<input value="' + esc(u.email) + '" disabled>') : fld('E-mail *', '<input name="email" type="email" required>') + fld('Parolă temporară * (min. 8 caractere)', '<input name="pw" type="text" minlength="8" required autocomplete="off">', 'Comunic-o persoanei; după prima autentificare poate folosi „Am uitat parola” pentru a o schimba.')) +
      fld('Rol', '<select name="role">' + roles.map(r => opt(r[0], r[1], u.role)).join('') + '</select>') +
      '<label class="consent"><input type="checkbox" name="canPublish"' + (u.canPublish ? ' checked' : '') + '><span>Poate publica activități <b>direct</b> (fără aprobare)</span></label>' + (id ? '<label class="consent"><input type="checkbox" name="active"' + (u.active !== false ? ' checked' : '') + '><span>Cont activ</span></label>' : '') +
      '<div class="mf" style="justify-content:space-between">' + (id && DB.live ? '<button type="button" class="btn btn-outline" data-act="a_resetPw" data-e="' + esc(u.email) + '">Trimite resetare parolă</button>' : '<span></span>') + '<div style="display:flex;gap:10px"><button type="button" class="btn btn-outline" data-act="closeModal">Anulează</button><button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează</button></div></div></form></div>');
  }


  /* câmp de imagine (previzualizare + încărcare + eliminare) – stocat direct în baza de date */
  function imgField(label, kind, rmName, fileName, cur, contain, hint) {
    const prev = cur ? '<div class="img-prev' + (kind === 'hero' ? ' wide' : '') + '"><img src="' + esc(DB.url(cur)) + '" alt="" style="object-fit:' + (contain ? 'contain' : 'cover') + '"><label class="rm"><input type="checkbox" name="' + rmName + '" value="1">Elimină imaginea</label></div>' : '<div class="img-prev empty' + (kind === 'hero' ? ' wide' : '') + '"><span>' + (kind === 'hero' ? 'Imagine implicită (fundal albastru)' : 'Logo implicit') + '</span></div>';
    return '<div class="fld"><label>' + label + '</label>' + prev + '<input type="file" name="' + fileName + '" accept="image/*"><span class="hint">' + hint + '</span></div>';
  }

  /* ---------- setări site ---------- */
  function bSettings() {
    const s = site(); const T = (n, l, t, h) => fld(l, '<input name="' + n + '" type="' + (t || 'text') + '" value="' + esc(s[n] || '') + '" maxlength="300">', h); const TA = (n, l, h) => fld(l, '<textarea name="' + n + '" maxlength="6000">' + esc(s[n] || '') + '</textarea>', h);
    return '<form class="form" data-form="a_saveSite">' +
      '<div class="panel"><h2>' + ic('home') + 'Pagina principală</h2>' + T('slogan', 'Slogan') + TA('lead', 'Text de prezentare (sub titlu)') + '<div class="row2">' + imgField('Logo oficial', 'logo', 'rmLogo', 'logoFile', s.logo, true, 'Logo-ul poate păstra culorile originale (PNG cu fundal transparent).') + imgField('Imagine principală (prima pagină)', 'hero', 'rmHero', 'heroFile', s.heroImage, false, 'Fotografie orizontală, de preferat 1600 px lățime. Se micșorează automat. Dacă o elimini, revine fundalul albastru implicit.') + '</div></div>' +
      '<div class="panel"><h2>' + ic('info') + 'Despre noi</h2>' + TA('history', 'Istoria centrului') + TA('mission', 'Misiunea') + TA('vision', 'Viziunea') + '<div class="row2">' + TA('values', 'Valorile', 'Câte una pe rând.') + TA('goals', 'Obiectivele', 'Câte unul pe rând.') + '</div>' + TA('impact', 'Impactul în comunitate') + T('impactYouth', 'Număr de tineri implicați (opțional)', 'number', 'Apare în statistici doar dacă este mai mare ca 0. Celelalte cifre se calculează automat din datele reale.') + '</div>' +
      '<div class="panel"><h2>' + ic('pin') + 'Contact și rețele sociale</h2>' + T('address', 'Adresa centrului') + '<div class="row2">' + T('phone', 'Telefon', 'tel') + T('email', 'E-mail', 'email') + '</div><div class="row2">' + T('lat', 'Latitudine hartă', 'text', 'Ex.: 47.2583') + T('lng', 'Longitudine hartă', 'text', 'Ex.: 28.3033') + '</div><div class="row2">' + T('facebook', 'Facebook (link)', 'url') + T('instagram', 'Instagram (link)', 'url') + '</div><div class="row2">' + T('tiktok', 'TikTok (link)', 'url') + T('youtube', 'YouTube (link)', 'url') + '</div></div>' +
      '<button class="btn btn-royal" type="submit">' + ic('check') + 'Salvează informațiile site-ului</button></form>';
  }
  async function saveSite(form) {
    const f = fdata(form);
    await guard(async () => {
      const s = site(); const keys = ['slogan', 'lead', 'history', 'mission', 'vision', 'values', 'goals', 'impact', 'address', 'phone', 'email', 'lat', 'lng', 'facebook', 'instagram', 'tiktok', 'youtube'];
      const data = {}; keys.forEach(k => data[k] = (f[k] || '').trim()); data.impactYouth = Math.max(0, parseInt(f.impactYouth, 10) || 0);
      ['facebook', 'instagram', 'tiktok', 'youtube'].forEach(k => { if (data[k] && !A0.safeUrl(data[k])) throw new Error('Linkul ' + k + ' trebuie să înceapă cu https://'); });
      data.lat = String(parseFloat(data.lat) || DEFAULTS.lat); data.lng = String(parseFloat(data.lng) || DEFAULTS.lng);
      const lf = form.elements.logoFile && form.elements.logoFile.files[0], hf = form.elements.heroFile && form.elements.heroFile.files[0];
      if (f.rmLogo) { data.logo = ''; data.logoPath = ''; }
      if (f.rmHero) { data.heroImage = ''; data.heroPath = ''; }
      if (lf || hf) busy('Se pregătește imaginea…');
      if (lf) { data.logo = await DB.imageData(lf, { max: 512, bytes: 110 * 1024, alpha: true }); data.logoPath = ''; }
      if (hf) { data.heroImage = await DB.imageData(hf, { max: 1600, bytes: 380 * 1024 }); data.heroPath = ''; }
      busy('Se salvează…'); await DB.set('settings', 'site', data); busy(false); toast('Informațiile site-ului au fost salvate.');
    });
  }

  /* ======================================================
     GENERIC: salvări simple (echipă, parteneri, povești, albume, utilizatori)
     ====================================================== */
  const required = (form, names) => { const f = fdata(form); const err = $('.err', form); const miss = names.find(n => !String(f[n] || '').trim()); if (miss) { if (err) { err.hidden = false; err.innerHTML = ic('info') + '<span>Completează câmpurile obligatorii (*).</span>'; } return null; } return f; };
  async function saveWithImage(form, col, field, inputName, rmName, folder, build) {
    const id = form.dataset.id; const old = id ? byId(col, id) : null; let url = old?.[field] || '', path = old?.[field + 'Path'] || '';
    if (fdata(form)[rmName]) { DB.deleteFile(path); url = ''; path = ''; }
    const up = await uploadAll(form.elements[inputName]?.files, folder); if (up[0]) { DB.deleteFile(path); url = up[0].url; path = up[0].path; }
    const data = Object.assign(build(), { [field]: url, [field + 'Path']: path });
    busy('Se salvează…'); if (id) await DB.update(col, id, data); else await DB.add(col, data); busy(false); closeModal(); toast('Salvat.');
  }
  const FM = {
    a_login: async form => { const f = fdata(form); const err = $('.err', form); err.hidden = true; await guard(async () => { try { await DB.signIn(f.email.trim(), f.pw); } catch (e) { err.hidden = false; err.innerHTML = ic('info') + '<span>' + esc(e.code && /invalid|wrong|not-found/.test(e.code) ? 'E-mail sau parolă incorecte.' : (e.message || 'Autentificare eșuată.')) + '</span>'; } }); },
    a_setup: async form => { const f = fdata(form); const err = $('.err', form); const bad = m => { err.hidden = false; err.innerHTML = ic('info') + '<span>' + esc(m) + '</span>'; }; if (window.OWNER_EMAIL && String(f.email || '').trim().toLowerCase() !== window.OWNER_EMAIL.toLowerCase()) return bad('Doar ' + window.OWNER_EMAIL + ' poate crea contul principal.'); if (f.pw !== f.pw2) return bad('Parolele nu coincid.'); if ((f.pw || '').length < 8) return bad('Parola trebuie să aibă minimum 8 caractere.'); await guard(async () => { await DB.createOwner(f.email.trim(), f.pw, f.name.trim()); st.setup = false; toast('Cont creat. Bun venit!'); }); },
    a_saveAct: saveAct, a_saveEv: saveEv, a_saveUpload: saveUpload, a_saveSite: saveSite,
    a_saveMedia: form => guard(async () => { const f = fdata(form); await DB.update('media', form.dataset.id, { description: (f.description || '').trim(), albumId: f.albumId || '', date: f.date || '' }); closeModal(); toast('Salvat.'); }),
    a_saveAlbum: form => { const f = required(form, ['title']); if (!f) return; return guard(async () => { const id = form.dataset.id; const data = { title: f.title.trim(), description: (f.description || '').trim(), date: f.date || '', activityId: f.activityId || '', cover: f.cover || '' }; if (id) await DB.update('albums', id, data); else await DB.add('albums', data); closeModal(); toast('Albumul a fost salvat.'); }); },
    a_saveMember: form => { const f = required(form, ['name', 'role']); if (!f) return; return guard(() => saveWithImage(form, 'team', 'photo', 'photo', 'rmPhoto', 'echipa', () => ({ name: f.name.trim(), role: f.role.trim(), bio: (f.bio || '').trim(), order: parseInt(f.order, 10) || 99, activityIds: arr(f.activityIds) }))); },
    a_savePartner: form => { const f = required(form, ['name']); if (!f) return; if (f.url && !A0.safeUrl(f.url)) return toast('Linkul trebuie să înceapă cu https://', true); return guard(() => saveWithImage(form, 'partners', 'logo', 'logo', 'rmLogo', 'parteneri', () => ({ name: f.name.trim(), url: (f.url || '').trim() }))); },
    a_saveStory: form => { const f = required(form, ['title', 'month', 'text']); if (!f) return; return guard(() => saveWithImage(form, 'stories', 'image', 'image', 'rmImg', 'povesti', () => ({ title: f.title.trim(), month: f.month, text: f.text.trim() }))); },
    a_saveApp: form => guard(async () => { const f = fdata(form); await DB.update('applications', form.dataset.id, { status: f.status, note: (f.note || '').trim() }); closeModal(); toast('Cererea a fost actualizată.'); }),
    a_saveUser: form => { const f = fdata(form); const err = $('.err', form); const bad = m => { err.hidden = false; err.innerHTML = ic('info') + '<span>' + esc(m) + '</span>'; }; const id = form.dataset.id; if (!(f.name || '').trim()) return bad('Completează numele.'); if (!id && (!f.email || (f.pw || '').length < 8)) return bad('Completează e-mailul și o parolă de minimum 8 caractere.');
      return guard(async () => { const role = (owner() ? f.role : 'member') || 'member'; const prof = { name: f.name.trim(), role, canPublish: !!f.canPublish, canUpload: !!f.canUpload }; busy('Se salvează…'); if (id) { prof.active = !!f.active; await DB.update('users', id, prof); } else { prof.email = f.email.trim(); await DB.createAccount(f.email.trim(), f.pw, prof); } busy(false); closeModal(); toast('Contul a fost salvat.'); }); }
  };
  Object.assign(FORMS, FM);

  /* ---------- acțiuni ---------- */
  const conf = m => confirm(m);
  async function delAct(id) {
    const a = byId('activities', id); if (!a || !conf('Ștergi definitiv activitatea „' + a.title + '” și fișierele ei?')) return;
    await guard(async () => { busy('Se șterge…'); for (const m of a.media || []) await DB.deleteFile(m.path); await DB.deleteFile(a.coverPath); await DB.remove('activities', id); busy(false); toast('Activitatea a fost ștearsă.'); });
  }
  Object.assign(ACT, {
    a_logout: () => guard(() => DB.signOut()),
    a_side: () => setSide(!st.sideOpen),
    a_sideClose: () => setSide(false),
    a_demo: el => guard(async () => { await DB.signIn(el.dataset.e, 'demo1234'); location.hash = '#/admin'; }),
    a_forgot: () => { const e = prompt('Introdu adresa de e-mail a contului:'); if (e) guard(async () => { await DB.resetPassword(e.trim()); toast(DB.live ? 'Dacă adresa există, ți-am trimis un e-mail de resetare.' : 'În modul demo parola este demo1234.'); }); },
    a_resetPw: el => guard(async () => { await DB.resetPassword(el.dataset.e); toast('E-mail de resetare trimis.'); }),
    a_editAct: el => actForm(el.dataset.id), a_delAct: el => delAct(el.dataset.id),
    a_approve: el => guard(async () => { await DB.update('activities', el.dataset.id, { status: 'published', approvedBy: DB.user.name || DB.user.email, rejectNote: '' }); toast('Activitatea a fost aprobată și publicată.'); }),
    a_reject: el => { const r = prompt('Motivul respingerii (vizibil autorului):', ''); if (r === null) return; guard(async () => { await DB.update('activities', el.dataset.id, { status: 'rejected', rejectNote: r.trim() }); toast('Publicația a fost respinsă.'); }); },
    a_editEv: el => evForm(el.dataset.id), a_delEv: el => { const e = byId('events', el.dataset.id); if (e && conf('Ștergi evenimentul „' + e.title + '”?')) guard(async () => { await DB.deleteFile(e.photoPath); await DB.remove('events', e.id); toast('Eveniment șters.'); }); },
    a_upload: uploadForm, a_editMedia: el => mediaForm(el.dataset.id),
    a_delMedia: el => { const m = byId('media', el.dataset.id); if (m && conf('Ștergi acest fișier din galerie?')) guard(async () => { await DB.deleteFile(m.path); await DB.remove('media', m.id); toast('Fișier șters.'); }); },
    a_editAlbum: el => albumForm(el.dataset && el.dataset.id), a_filterAlbum: el => { st.album = el.dataset.id; A0.render(); },
    a_delAlbum: el => { const al = byId('albums', el.dataset.id); if (al && conf('Ștergi albumul „' + al.title + '”? Fișierele rămân în galerie, fără album.')) guard(async () => { for (const m of S.media.filter(x => x.albumId === al.id)) await DB.update('media', m.id, { albumId: '' }); await DB.remove('albums', al.id); toast('Album șters.'); }); },
    a_editMember: el => memberForm(el.dataset.id), a_delMember: el => { const m = byId('team', el.dataset.id); if (m && conf('Elimini „' + m.name + '” din echipă?')) guard(async () => { await DB.deleteFile(m.photoPath); await DB.remove('team', m.id); toast('Membru eliminat.'); }); },
    a_editPartner: el => partnerForm(el.dataset.id), a_delPartner: el => { const p = byId('partners', el.dataset.id); if (p && conf('Ștergi partenerul „' + p.name + '”?')) guard(async () => { await DB.deleteFile(p.logoPath); await DB.remove('partners', p.id); toast('Partener șters.'); }); },
    a_editStory: el => storyForm(el.dataset.id), a_delStory: el => { const s = byId('stories', el.dataset.id); if (s && conf('Ștergi povestea „' + s.title + '”?')) guard(async () => { await DB.deleteFile(s.imagePath); await DB.remove('stories', s.id); toast('Poveste ștearsă.'); }); },
    a_viewApp: el => appModal(el.dataset.id), a_delApp: el => { if (conf('Ștergi definitiv această cerere? Acțiunea nu poate fi anulată.')) guard(async () => { await DB.remove('applications', el.dataset.id); closeModal(); toast('Cerere ștearsă.'); }); },
    a_csv: exportCsv, a_editUser: el => userForm(el.dataset.id),
    a_notif: () => { Notification.requestPermission().then(() => A0.render()); }
  });
  Object.assign(INPUT, {
    a_filter: el => { st[el.name] = el.value; const r = $('#aRows'); if (r) { const sec = (location.hash.split('/')[2] || ''); r.innerHTML = sec === 'cereri' ? appRows() : actRows(); } },
    a_album: el => { st.album = el.value; A0.render(); }
  });

  /* ---------- notificări pentru cereri noi ---------- */
  let known = null;
  function onNewApps(rows) {
    if (!DB.isStaff()) { known = null; return; }
    const ids = new Set(rows.map(r => r.id));
    if (known) {
      rows.filter(r => !known.has(r.id) && r.status === 'new').forEach(r => {
        toast('Cerere nouă de înscriere: ' + r.name);
        try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Cerere nouă de înscriere', { body: r.name + ' – ' + r.locality }); } catch (e) { }
      });
    }
    known = ids;
    document.title = (newApps() ? '(' + newApps() + ') ' : '') + document.title.replace(/^\(\d+\)\s*/, '');
  }

  window.Admin = { render, onNewApps };
})();
