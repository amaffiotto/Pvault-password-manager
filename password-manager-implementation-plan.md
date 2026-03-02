# 🔐 Password Manager — Implementation Plan

> Piano completo per creare un password manager cross-platform (Linux, Mac, Windows) con estensione Chrome/Vivaldi.

---

## 🧠 Idea Generale

Creeremo un password manager composto da **due parti**:

1. **App Desktop** — interfaccia grafica che gira su Linux, Mac e Windows
2. **Estensione Browser** — per Chrome e Vivaldi (stessa estensione, funziona su entrambi)

Le due parti comunicano tra loro: l'estensione parla con l'app desktop per salvare/recuperare le password in modo sicuro.

---

## 🛠️ Tecnologie Scelte (e perché)

| Tecnologia | Ruolo | Perché |
|---|---|---|
| **Electron** | App desktop cross-platform | Scrive una volta, gira su Win/Mac/Linux |
| **React** | Interfaccia utente | Moderno, facile da imparare |
| **Node.js** | Backend locale | Gestisce file e crittografia |
| **SQLite** | Database locale | Salva le password sul tuo PC, non su cloud |
| **AES-256-GCM** | Crittografia | Standard militare, usato dalle banche |
| **bcrypt** | Hash della master password | Protegge la tua password principale |
| **Manifest V3** | Estensione browser | Standard attuale di Chrome |

---

## 📁 Struttura delle Cartelle

```
password-manager/
│
├── 📁 desktop/                    # App Electron (desktop)
│   ├── 📁 src/
│   │   ├── 📁 main/               # Processo principale Electron
│   │   │   ├── index.js           # Entry point dell'app
│   │   │   ├── database.js        # Gestione SQLite (salva/leggi password)
│   │   │   ├── crypto.js          # Funzioni di crittografia AES-256
│   │   │   ├── ipc-handlers.js    # Comunicazione tra finestra e backend
│   │   │   └── native-messaging.js # Comunicazione con l'estensione browser
│   │   │
│   │   └── 📁 renderer/           # Interfaccia utente (React)
│   │       ├── 📁 components/
│   │       │   ├── Login.jsx      # Schermata inserimento master password
│   │       │   ├── Vault.jsx      # Lista di tutte le password salvate
│   │       │   ├── AddEntry.jsx   # Form per aggiungere nuova password
│   │       │   └── Settings.jsx   # Impostazioni app
│   │       ├── App.jsx            # Componente principale React
│   │       └── index.html         # Pagina HTML base
│   │
│   ├── package.json               # Dipendenze Node.js per desktop
│   └── electron-builder.yml       # Config per creare .exe/.dmg/.AppImage
│
├── 📁 extension/                  # Estensione Chrome/Vivaldi
│   ├── manifest.json              # Config dell'estensione (obbligatorio)
│   ├── 📁 popup/                  # Popup che appare cliccando l'icona
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── 📁 content/
│   │   └── content-script.js      # Si inietta nelle pagine web (autofill)
│   ├── 📁 background/
│   │   └── service-worker.js      # Background service dell'estensione
│   └── 📁 icons/                  # Icone 16x16, 48x48, 128x128
│
├── 📁 shared/                     # Codice condiviso tra desktop ed estensione
│   ├── constants.js               # Costanti condivise (es. nome app)
│   └── validators.js              # Validazione input (email, URL, ecc.)
│
├── .gitignore
├── README.md
└── package.json                   # Root package.json (gestisce entrambi)
```

---

## 📋 Step by Step — Piano di Sviluppo

### ✅ FASE 0 — Setup Ambiente (Giorno 1)

**Cosa serve installare:**
```bash
# Installa Node.js (scaricalo da nodejs.org, versione LTS)
node --version   # deve dare v18+ 

# Installa le dipendenze globali
npm install -g electron electron-builder
```

**Inizializza il progetto:**
```bash
mkdir password-manager
cd password-manager
npm init -y
mkdir desktop extension shared
```

**Obiettivo:** Avere Node.js funzionante e la struttura delle cartelle creata.

---

### ✅ FASE 1 — Database e Crittografia (Giorno 2-3)

**File da creare:** `desktop/src/main/crypto.js` e `desktop/src/main/database.js`

**Cosa fa questa fase:**
- Crea la funzione per **cifrare** una password (la trasforma in stringa illeggibile)
- Crea la funzione per **decifrare** (la riporta leggibile con la master password)
- Crea il database SQLite con la tabella `entries` (sito, username, password cifrata)

**Schema del database:**
```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL,        -- es. "Google"
  url TEXT,                       -- es. "google.com"
  username TEXT NOT NULL,          -- es. "mia@email.com"
  password_encrypted TEXT NOT NULL, -- password cifrata con AES-256
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master (
  hash TEXT NOT NULL               -- hash bcrypt della master password
);
```

**Obiettivo:** Poter salvare e recuperare password cifrate da codice.

---

### ✅ FASE 2 — App Electron Base (Giorno 4-5)

**File da creare:** `desktop/src/main/index.js`

**Cosa fa questa fase:**
- Avvia una finestra Electron (tipo browser ma è la tua app)
- Carica l'interfaccia React
- Imposta la comunicazione IPC (Inter-Process Communication) tra UI e backend

**Cosa è IPC?**
```
[React UI] ---> manda messaggio "get-passwords" ---> [Backend Node.js]
[Backend]  ---> risponde con lista password cifrate ---> [React UI]
```
È come una chiamata API, ma tutto avviene in locale sul tuo PC.

**Obiettivo:** Aprire l'app e vedere una finestra vuota funzionante.

---

### ✅ FASE 3 — Interfaccia Utente React (Giorno 6-8)

**File da creare:** tutti i file in `desktop/src/renderer/`

**Schermate da costruire:**

#### 3a. Schermata di Login (`Login.jsx`)
- Campo per inserire la master password
- Pulsante "Sblocca"
- Se è il primo avvio → chiede di creare la master password

#### 3b. Vault — Lista Password (`Vault.jsx`)
- Lista di tutte le password salvate (sito, username, azioni)
- Pulsante "Copia password" (copia negli appunti per 30 secondi poi si cancella)
- Pulsante "Aggiungi nuova"
- Barra di ricerca

#### 3c. Form Aggiungi Password (`AddEntry.jsx`)
- Campi: Nome sito, URL, Username, Password
- Pulsante "Genera password sicura" (genera random es. `xK9#mP2@qL`)
- Pulsante "Salva"

**Obiettivo:** App completamente usabile come password manager desktop.

---

### ✅ FASE 4 — Estensione Browser (Giorno 9-11)

**File da creare:** tutto in `extension/`

#### 4a. `manifest.json` — Il "Documento d'identità" dell'estensione
```json
{
  "manifest_version": 3,
  "name": "My Password Manager",
  "version": "1.0",
  "permissions": ["activeTab", "nativeMessaging", "storage"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": "icons/icon48.png"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"]
  }],
  "background": {
    "service_worker": "background/service-worker.js"
  }
}
```

#### 4b. Popup (`popup.html` + `popup.js`)
- Mostra le password per il sito attuale
- Pulsante "Autofill" per riempire automaticamente login
- Pulsante "Aggiungi" per salvare nuova password dal browser

#### 4c. Content Script (`content-script.js`)
- Si inietta in ogni pagina web
- Rileva i campi `<input type="password">` e `<input type="email">`
- Quando l'utente clicca "Autofill" dal popup → riempie i campi

#### 4d. Native Messaging — La parte più complessa
L'estensione **non può** leggere direttamente i file sul PC per sicurezza.
Deve comunicare con l'app desktop tramite **Native Messaging**:

```
[Estensione] ---(porta sicura)---> [App Desktop] ---> [Database]
```

Per abilitarlo serve registrare un "host" sul sistema operativo:
- **Windows:** una chiave nel registro di sistema
- **Mac/Linux:** un file JSON in una cartella specifica del sistema

**Obiettivo:** Cliccare sull'icona nel browser e vedere le password per il sito corrente.

---

### ✅ FASE 5 — Autofill Automatico (Giorno 12-13)

**Miglioria al Content Script:**
- Aggiunge un piccolo pulsante/icona vicino ai campi password nelle pagine web
- Cliccandolo appare un mini popup con le credenziali disponibili
- Selezionando → riempie username e password automaticamente

**Obiettivo:** Esperienza simile a Bitwarden o 1Password.

---

### ✅ FASE 6 — Build e Distribuzione (Giorno 14-15)

**Creare i file installabili:**
```bash
# Crea .exe per Windows, .dmg per Mac, .AppImage per Linux
cd desktop
npm run build

# Output nella cartella dist/
# dist/MyPasswordManager.exe
# dist/MyPasswordManager.dmg  
# dist/MyPasswordManager.AppImage
```

**Installare l'estensione:**
1. Apri Chrome/Vivaldi → `chrome://extensions/`
2. Attiva "Modalità sviluppatore" (toggle in alto a destra)
3. Clicca "Carica estensione non pacchettizzata"
4. Seleziona la cartella `extension/`

**Obiettivo:** App installabile su qualsiasi PC e estensione funzionante nel browser.

---

## 🔒 Note di Sicurezza Importanti

| Cosa | Come lo gestiamo |
|---|---|
| Master password | **MAI** salvata in chiaro — solo il suo hash bcrypt |
| Password salvate | Cifrate con AES-256-GCM, decrittate solo in RAM |
| Chiave di cifratura | Derivata dalla master password con PBKDF2 (100.000 iterazioni) |
| Appunti | Si puliscono automaticamente dopo 30 secondi |
| Database | File locale sul tuo PC, **nessun cloud** |
| Lock automatico | App si blocca dopo X minuti di inattività |

---

## 📦 Dipendenze NPM Necessarie

```bash
# Desktop
cd desktop
npm install electron react react-dom better-sqlite3 bcryptjs

# Dev dependencies
npm install --save-dev @electron/forge electron-builder vite @vitejs/plugin-react
```

---

## 🚀 Come Iniziare ORA con Claude Code

Quando apri Claude Code, dagli questo file e digli:

> "Leggi questo implementation plan e inizia dalla FASE 0 e FASE 1. Crea la struttura delle cartelle, inizializza i package.json e scrivi i file crypto.js e database.js"

Poi fase per fase continua con:

> "Ora procedi con la FASE 2 — crea index.js di Electron e configura IPC"

---

## ⏱️ Timeline Stimata

| Fase | Giorni | Difficoltà |
|---|---|---|
| 0 — Setup | 1 | 🟢 Facile |
| 1 — Crypto/DB | 2 | 🟡 Media |
| 2 — Electron | 2 | 🟡 Media |
| 3 — UI React | 3 | 🟡 Media |
| 4 — Estensione | 3 | 🔴 Difficile |
| 5 — Autofill | 2 | 🔴 Difficile |
| 6 — Build | 2 | 🟡 Media |
| **Totale** | **~15 giorni** | |

> 💡 Lavorando 1-2 ore al giorno, in un mese hai un password manager funzionante che puoi mettere nel CV!
