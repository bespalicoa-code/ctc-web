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
  apiKey: "PUNE_AICI_apiKey",
  authDomain: "PUNE_AICI.firebaseapp.com",
  projectId: "PUNE_AICI",
  storageBucket: "PUNE_AICI.appspot.com",
  messagingSenderId: "PUNE_AICI",
  appId: "PUNE_AICI"
};

/* Adresa de e-mail a Administratorului principal (singura care poate face "Prima configurare").
   Trebuie să fie identică cu cea din firestore.rules. */
window.OWNER_EMAIL = "bespalicoa@gmail.com";
