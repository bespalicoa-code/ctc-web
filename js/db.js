/* ==========================================================
   Strat de date – Firebase (producție) sau MOD DEMO (local)
   ========================================================== */
(function () {
  'use strict';
  const cfg = window.FIREBASE_CONFIG || {};
  const LIVE = !!(window.firebase && cfg.apiKey && !/^PUNE_/i.test(cfg.apiKey));
  const COLS = ['activities', 'events', 'albums', 'media', 'team', 'partners', 'applications', 'users', 'stories', 'settings'];
  const STAFF_ONLY = ['applications', 'users'];
  const DB = { live: LIVE, user: null, ready: false };
  const authCbs = [];
  const subs = [];
  const now = () => Date.now();
  const rid = () => Math.random().toString(36).slice(2, 10) + now().toString(36).slice(-4);
  const isTeam = () => !!(DB.user && ['owner', 'admin', 'member'].includes(DB.user.role) && DB.user.active !== false);
  const isStaff = () => !!(DB.user && ['owner', 'admin'].includes(DB.user.role) && DB.user.active !== false);
  DB.isTeam = isTeam; DB.isStaff = isStaff;

  /* ---------- fișiere: redimensionare imagini ---------- */
  async function shrink(file, max = 1920, q = 0.86) {
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) return file;
    try {
      const bmp = await createImageBitmap(file);
      const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      if (k === 1 && file.size < 900 * 1024) return file;
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
      return blob && blob.size < file.size ? blob : file;
    } catch (e) { return file; }
  }
  const safeName = n => String(n || 'fisier').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-60);

  /* ======================================================
     MOD DEMO
     ====================================================== */
  const LS = 'cctc_demo_v2', SS = 'cctc_demo_session';
  let demo = null;
  const blobUrls = {};
  let idb = null;

  function openIdb() {
    return new Promise(res => {
      try {
        const r = indexedDB.open('cctc_demo_files', 1);
        r.onupgradeneeded = () => r.result.createObjectStore('f');
        r.onsuccess = () => { idb = r.result; res(); };
        r.onerror = () => res();
      } catch (e) { res(); }
    });
  }
  const idbOp = (mode, fn) => new Promise(res => {
    if (!idb) return res();
    const tx = idb.transaction('f', mode); const out = fn(tx.objectStore('f'));
    tx.oncomplete = () => res(out && out.result); tx.onerror = () => res();
  });
  async function loadBlobs() {
    if (!idb) return;
    await new Promise(res => {
      const tx = idb.transaction('f', 'readonly'); const st = tx.objectStore('f');
      const req = st.openCursor();
      req.onsuccess = () => { const c = req.result; if (c) { blobUrls['idb:' + c.key] = URL.createObjectURL(c.value); c.continue(); } };
      tx.oncomplete = res; tx.onerror = res;
    });
  }

  const D = (off) => { const d = new Date(); d.setDate(d.getDate() + off); return d.toISOString().slice(0, 10); };
  function seed() {
    const t = now();
    const s = {};
    COLS.forEach(c => s[c] = {});
    s.users = {
      u_owner: { email: 'principal@demo.md', password: 'demo1234', name: 'Administrator Principal (demo)', role: 'owner', active: true, canPublish: true, canUpload: true, createdAt: t },
      u_admin: { email: 'admin@demo.md', password: 'demo1234', name: 'Administrator (demo)', role: 'admin', active: true, canPublish: true, canUpload: true, createdAt: t },
      u_member: { email: 'membru@demo.md', password: 'demo1234', name: 'Membru Echipă (demo)', role: 'member', active: true, canPublish: false, canUpload: true, createdAt: t }
    };
    s.settings.site = {
      name: 'Centrul de Tineret Călărași',
      slogan: 'Împreună creștem, învățăm și construim viitorul comunității noastre!',
      lead: 'Un spațiu dedicat tinerilor, unde ideile prind viață, se nasc prietenii și se construiește viitorul!',
      history: 'Text demonstrativ. Aici administratorii povestesc istoria centrului: cum a început, etapele importante și realizările din ultimii ani.',
      mission: 'Să oferim tinerilor din Călărași un spațiu sigur și modern, în care pot învăța, participa la activități și își pot pune ideile în practică.',
      vision: 'O comunitate în care fiecare tânăr are șansa să se dezvolte, să fie auzit și să contribuie la schimbare.',
      values: 'Implicare\nRespect\nColaborare\nSpirit de inițiativă\nIncluziune',
      goals: 'Dezvoltarea abilităților tinerilor\nPromovarea voluntariatului\nSusținerea inițiativelor tinerești\nConectarea tinerilor cu comunitatea',
      impact: 'Prin activitățile noastre, tinerii învață, se implică în viața comunității și dezvoltă proiecte care aduc schimbări reale.',
      impactYouth: 0,
      address: 'Or. Călărași, Republica Moldova (completați adresa exactă)',
      phone: '', email: '', lat: 47.2583, lng: 28.3033,
      facebook: '', instagram: '', tiktok: '', youtube: ''
    };
    const mk = (id, o) => { s.activities[id] = Object.assign({ status: 'published', authorId: 'u_admin', authorName: 'Administrator (demo)', media: [], createdAt: t, updatedAt: t }, o); };
    mk('a1', { title: 'Workshop de dezvoltare personală (exemplu)', category: 'Dezvoltare personală', date: D(-12), location: 'Centrul de Tineret Călărași', description: 'Activitate demonstrativă. Tinerii au învățat tehnici de comunicare, gestionarea timpului și stabilirea obiectivelor personale.\n\nÎnlocuiți acest text cu activități reale din panoul de administrare.' });
    mk('a2', { title: 'Seară de film pentru tineri (exemplu)', category: 'Distracție', date: D(-20), location: 'Sala de evenimente', description: 'Activitate demonstrativă: o seară relaxantă, cu film și discuții.' });
    mk('a3', { title: 'Campania de voluntariat „Fii activ!” (exemplu)', category: 'Voluntariat', date: D(-30), location: 'Parcul orașului', description: 'Activitate demonstrativă: tineri voluntari au amenajat spații verzi din oraș.', isProject: true });
    mk('a4', { title: 'Turneu de volei (exemplu)', category: 'Sport', date: D(-45), location: 'Sala de sport', description: 'Activitate demonstrativă: competiție sportivă între echipe de tineri.' });
    mk('a5', { title: 'Atelier de artă și cultură (exemplu)', category: 'Cultură', date: D(-60), location: 'Centrul de Tineret', description: 'Activitate demonstrativă.', isProject: true });
    mk('a6', { title: 'Propunere: Curs de limbi străine (exemplu)', category: 'Educație', date: D(10), location: 'Centrul de Tineret', description: 'Publicație trimisă de un membru – așteaptă aprobarea unui administrator.', status: 'pending', authorId: 'u_member', authorName: 'Membru Echipă (demo)' });
    const ev = (id, o) => { s.events[id] = Object.assign({ createdAt: t }, o); };
    ev('e1', { title: 'Ziua porților deschise (exemplu)', date: D(6), time: '16:00', location: 'Centrul de Tineret Călărași', description: 'Eveniment demonstrativ: vino să cunoști echipa și activitățile centrului.' });
    ev('e2', { title: 'Atelier de comunicare (exemplu)', date: D(13), time: '17:30', location: 'Sala de seminar', description: 'Eveniment demonstrativ.' });
    ev('e3', { title: 'Acțiune de curățenie în comunitate (exemplu)', date: D(24), time: '10:00', location: 'Centrul orașului', description: 'Eveniment demonstrativ.' });
    ev('e4', { title: 'Seara jocurilor de societate (exemplu)', date: D(-8), time: '18:00', location: 'Centrul de Tineret', description: 'Eveniment desfășurat – păstrat în arhivă.' });
    s.team.m1 = { name: 'Nume Prenume (exemplu)', role: 'Coordonator', bio: 'Prezentare demonstrativă a unui membru al echipei.', activityIds: ['a1', 'a3'], order: 1, createdAt: t };
    s.team.m2 = { name: 'Nume Prenume (exemplu)', role: 'Responsabil activități', bio: 'Prezentare demonstrativă a unui membru al echipei.', activityIds: ['a2'], order: 2, createdAt: t };
    s.team.m3 = { name: 'Nume Prenume (exemplu)', role: 'Voluntar', bio: 'Prezentare demonstrativă a unui membru al echipei.', activityIds: ['a4'], order: 3, createdAt: t };
    s.partners.p1 = { name: 'Partener 1 (exemplu)', url: '', createdAt: t };
    s.partners.p2 = { name: 'Partener 2 (exemplu)', url: '', createdAt: t };
    s.partners.p3 = { name: 'Partener 3 (exemplu)', url: '', createdAt: t };
    s.albums.al1 = { title: 'Workshop dezvoltare personală (exemplu)', description: 'Album demonstrativ – adăugați fotografii din panou.', date: D(-12), activityId: 'a1', createdAt: t };
    s.stories.st1 = { title: 'Povestea lunii (exemplu)', month: D(0).slice(0, 7), text: 'Aici se publică o poveste de succes din comunitatea tinerilor: un proiect, un voluntar sau o inițiativă care a făcut diferența.', createdAt: t };
    s.applications.ap1 = { name: 'Solicitant Exemplu', birth: '2008-05-12', phone: '+37360000000', email: 'exemplu@demo.md', locality: 'Călărași', school: 'Liceul (exemplu)', reason: 'Cerere demonstrativă: vreau să particip la activitățile centrului.', interests: ['Voluntariat', 'Sport'], status: 'new', consent: true, createdAt: t - 3600000 };
    return s;
  }
  const saveDemo = () => { try { localStorage.setItem(LS, JSON.stringify(demo)); } catch (e) { console.warn('Spațiu local plin', e); } };
  function visibleDemo(col) {
    const rows = Object.entries(demo[col] || {}).map(([id, v]) => Object.assign({ id }, v));
    if (STAFF_ONLY.includes(col) && !isStaff()) return [];
    if (col === 'activities' && !isTeam()) return rows.filter(r => r.status === 'published');
    return rows;
  }
  function notifyDemo(col) { subs.filter(s => s.col === col).forEach(s => s.cb(visibleDemo(col))); }
  function demoUserView(id) { const u = demo.users[id]; if (!u) return null; const { password, ...rest } = u; return Object.assign({ uid: id }, rest); }

  /* ======================================================
     FIREBASE
     ====================================================== */
  let fb = null;
  function fsSub(s) {
    if (STAFF_ONLY.includes(s.col) && !isStaff()) { s.cb([]); return () => {}; }
    let q = fb.db.collection(s.col);
    if (s.col === 'activities' && !isTeam()) q = q.where('status', '==', 'published');
    return q.onSnapshot(
      snap => s.cb(snap.docs.map(d => Object.assign({ id: d.id }, d.data()))),
      err => { console.warn('Firestore [' + s.col + ']', err.code || err); s.cb([]); }
    );
  }
  function resubscribeAll() {
    subs.forEach(s => { if (s.unsub) s.unsub(); s.unsub = DB.live ? fsSub(s) : null; if (!DB.live) notifyDemo(s.col); });
  }

  /* ======================================================
     API public
     ====================================================== */
  DB.url = u => (u && String(u).startsWith('idb:')) ? (blobUrls[u] || '') : (u || '');

  DB.init = async function () {
    if (LIVE) {
      fb = {};
      firebase.initializeApp(cfg);
      fb.auth = firebase.auth(); fb.db = firebase.firestore();
      fb.auth.onAuthStateChanged(async u => {
        if (!u) { DB.user = null; }
        else {
          try {
            const snap = await fb.db.collection('users').doc(u.uid).get();
            DB.user = snap.exists ? Object.assign({ uid: u.uid, email: u.email }, snap.data()) : { uid: u.uid, email: u.email, role: null, noProfile: true };
          } catch (e) { DB.user = { uid: u.uid, email: u.email, role: null, noProfile: true }; }
        }
        resubscribeAll(); authCbs.forEach(cb => cb(DB.user));
      });
    } else {
      try { demo = JSON.parse(localStorage.getItem(LS)); } catch (e) { demo = null; }
      if (!demo) { demo = seed(); saveDemo(); }
      await openIdb(); await loadBlobs();
      const sid = localStorage.getItem(SS);
      DB.user = sid && demo.users[sid] ? demoUserView(sid) : null;
      setTimeout(() => authCbs.forEach(cb => cb(DB.user)), 0);
    }
    DB.ready = true;
  };
  DB.onAuth = cb => authCbs.push(cb);

  DB.subscribe = function (col, cb) {
    const s = { col, cb, unsub: null };
    subs.push(s);
    if (DB.live) { if (fb) s.unsub = fsSub(s); } else setTimeout(() => cb(visibleDemo(col)), 0);
    return () => { const i = subs.indexOf(s); if (i > -1) subs.splice(i, 1); if (s.unsub) s.unsub(); };
  };

  DB.add = async function (col, data) {
    data = Object.assign({}, data, { createdAt: now() });
    if (LIVE) { const r = await fb.db.collection(col).add(data); return r.id; }
    const id = rid(); demo[col][id] = data; saveDemo(); notifyDemo(col); return id;
  };
  DB.set = async function (col, id, data, merge = true) {
    data = Object.assign({}, data, { updatedAt: now() });
    if (LIVE) { await fb.db.collection(col).doc(id).set(data, { merge }); return id; }
    demo[col][id] = merge ? Object.assign({}, demo[col][id] || {}, data) : data; saveDemo(); notifyDemo(col); return id;
  };
  DB.update = (col, id, data) => DB.set(col, id, data, true);
  DB.remove = async function (col, id) {
    if (LIVE) { await fb.db.collection(col).doc(id).delete(); return; }
    delete demo[col][id]; saveDemo(); notifyDemo(col);
  };

  /* ---------- încărcare fișiere ---------- */
  DB.upload = async function (file, folder, onProgress) {
    throw new Error('Încărcarea de fotografii și videoclipuri este dezactivată în această versiune.');
    const isImg = file.type.startsWith('image/'), isVid = file.type.startsWith('video/');
    if (!isImg && !isVid) throw new Error('Format nepermis: ' + file.name + ' (doar imagini și video).');
    if (isVid && file.size > 150 * 1024 * 1024) throw new Error('Videoclipul „' + file.name + '” depășește 150 MB.');
    if (isImg && file.size > 40 * 1024 * 1024) throw new Error('Imaginea „' + file.name + '” depășește 40 MB.');
    const blob = isImg ? await shrink(file) : file;
    const type = isImg ? 'image' : 'video';
    const key = folder + '/' + now() + '-' + rid().slice(0, 4) + '-' + safeName(file.name);
    if (LIVE) {
      const ref = fb.storage.ref(key);
      const task = ref.put(blob, { contentType: blob.type || file.type });
      task.on('state_changed', sn => onProgress && onProgress(sn.bytesTransferred / sn.totalBytes));
      await task;
      const url = await ref.getDownloadURL();
      return { url, path: key, type, name: file.name, size: blob.size };
    }
    if (!idb) throw new Error('Browserul nu permite stocarea locală pentru modul demo.');
    await idbOp('readwrite', st => st.put(blob, key));
    const path = 'idb:' + key; blobUrls[path] = URL.createObjectURL(blob);
    onProgress && onProgress(1);
    return { url: path, path, type, name: file.name, size: blob.size };
  };

  /* ---------- imagini mici salvate direct în baza de date (fără Storage) ---------- */
  DB.imageData = async function (file, opt) {
    opt = Object.assign({ max: 1600, bytes: 380 * 1024, alpha: false }, opt || {});
    if (!file || !/^image\//i.test(file.type)) throw new Error('Alege o imagine (JPG, PNG sau WebP).');
    if (file.size > 25 * 1024 * 1024) throw new Error('Imaginea este prea mare (max. 25 MB).');
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { throw new Error('Imaginea nu a putut fi citită. Încearcă un fișier JPG sau PNG.'); }
    const mime = opt.alpha ? 'image/webp' : 'image/jpeg';
    let dim = opt.max, q = opt.alpha ? 0.92 : 0.86, out = '';
    for (let i = 0; i < 12; i++) {
      const k = Math.min(1, dim / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
      const ctx = c.getContext('2d');
      if (!opt.alpha) { ctx.fillStyle = '#061A40'; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      out = c.toDataURL(mime, q);
      if (opt.alpha && !out.startsWith('data:image/webp')) out = c.toDataURL('image/png');
      if (out.length * 0.75 <= opt.bytes) return out;
      if (q > 0.6) q -= 0.08; else dim = Math.round(dim * 0.82);
    }
    throw new Error('Imaginea este prea complexă. Alege o altă fotografie.');
  };
  DB.deleteFile = async function (path) {
    if (!path) return;
    try {
      if (LIVE) { return; }
      else if (path.startsWith('idb:')) { await idbOp('readwrite', st => st.delete(path.slice(4))); delete blobUrls[path]; }
    } catch (e) { console.warn('Ștergere fișier eșuată', e); }
  };

  /* ---------- autentificare ---------- */
  DB.signIn = async function (email, pw) {
    if (LIVE) { await fb.auth.signInWithEmailAndPassword(email, pw); return; }
    const e = String(email).trim().toLowerCase();
    const id = Object.keys(demo.users).find(k => demo.users[k].email === e && demo.users[k].password === pw);
    if (!id || demo.users[id].active === false) { const er = new Error('auth'); er.code = 'auth/invalid-credential'; throw er; }
    localStorage.setItem(SS, id); DB.user = demoUserView(id); resubscribeAll(); authCbs.forEach(cb => cb(DB.user));
  };
  DB.signOut = async function () {
    if (LIVE) { await fb.auth.signOut(); return; }
    localStorage.removeItem(SS); DB.user = null; resubscribeAll(); authCbs.forEach(cb => cb(null));
  };
  DB.resetPassword = async function (email) {
    if (LIVE) return fb.auth.sendPasswordResetEmail(email);
    return true;
  };
  /* Prima configurare: contul Administratorului principal */
  DB.needsSetup = async function () {
    if (!LIVE) return false;
    try { const d = await fb.db.collection('settings').doc('bootstrap').get(); return !d.exists; } catch (e) { return false; }
  };
  DB.createOwner = async function (email, pw, name) {
    const cred = await fb.auth.createUserWithEmailAndPassword(email, pw);
    const batch = fb.db.batch();
    batch.set(fb.db.collection('users').doc(cred.user.uid), { email, name, role: 'owner', active: true, canPublish: true, canUpload: true, createdAt: now() });
    batch.set(fb.db.collection('settings').doc('bootstrap'), { done: true, at: now() });
    await batch.commit();
    await fb.auth.signOut(); await fb.auth.signInWithEmailAndPassword(email, pw);
  };
  /* Creare cont nou de către administrator (aplicație secundară, ca să nu fim deconectați) */
  DB.createAccount = async function (email, pw, profile) {
    if (!LIVE) {
      const e = email.trim().toLowerCase();
      if (Object.values(demo.users).some(u => u.email === e)) { const er = new Error('dup'); er.code = 'auth/email-already-in-use'; throw er; }
      const id = 'u_' + rid(); demo.users[id] = Object.assign({ email: e, password: pw, active: true, createdAt: now() }, profile); saveDemo(); notifyDemo('users'); return id;
    }
    let app2;
    try { app2 = firebase.app('second'); } catch (e) { app2 = firebase.initializeApp(cfg, 'second'); }
    const a2 = app2.auth();
    const cred = await a2.createUserWithEmailAndPassword(email, pw);
    try {
      await fb.db.collection('users').doc(cred.user.uid).set(Object.assign({ email, active: true, createdAt: now() }, profile));
    } finally { await a2.signOut(); }
    return cred.user.uid;
  };

  window.DB = DB;
  DB.resetDemo = function () { if (LIVE) return; localStorage.removeItem(LS); localStorage.removeItem(SS); indexedDB.deleteDatabase('cctc_demo_files'); location.hash = '#/'; location.reload(); };
})();
