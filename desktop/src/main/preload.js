const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process via window.api
contextBridge.exposeInMainWorld('api', {
  // Master password
  hasMasterPassword: () => ipcRenderer.invoke('has-master-password'),
  setMasterPassword: (password) => ipcRenderer.invoke('set-master-password', password),
  verifyMasterPassword: (password) => ipcRenderer.invoke('verify-master-password', password),

  // Vault entries
  getEntries: () => ipcRenderer.invoke('get-entries'),
  addEntry: (siteName, url, username, password) =>
    ipcRenderer.invoke('add-entry', siteName, url, username, password),
  updateEntry: (id, siteName, url, username, password) =>
    ipcRenderer.invoke('update-entry', id, siteName, url, username, password),
  deleteEntry: (id) => ipcRenderer.invoke('delete-entry', id),
  getDecryptedPassword: (id) => ipcRenderer.invoke('get-decrypted-password', id),
  searchEntries: (query) => ipcRenderer.invoke('search-entries', query),

  // Utilities
  generatePassword: (length) => ipcRenderer.invoke('generate-password', length),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
});
