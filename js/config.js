/*
  CONFIGURARE FIREBASE
  --------------------
  1. Intră pe https://console.firebase.google.com și creează un proiect.
  2. Adaugă o aplicație Web (</>) și copiază valorile de configurare mai jos.
  3. Cât timp apiKey începe cu "PUNE_", site-ul rulează în MOD DEMONSTRATIV
     (datele se salvează doar în browserul tău, nu se sincronizează).
  Detalii complete: vezi README.md
*/
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBAR1mgO-45tzE7v2IzKPGlVP2G097mnRQ",
  authDomain: "ctc-calarasi.firebaseapp.com",
  projectId: "ctc-calarasi",
  storageBucket: "ctc-calarasi.firebasestorage.app",
  messagingSenderId: "609375745182",
  appId: "1:609375745182:web:11fe443c95b903845d378f"
};

/* Adresa de e-mail a Administratorului principal (singura care poate face "Prima configurare").
   Trebuie să fie identică cu cea din firestore.rules. */
window.OWNER_EMAIL = "bespalicoa@gmail.com";
