import React, { useState, useEffect } from 'react';
import AddEntry from './AddEntry';

export default function Vault({ onLock }) {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadEntries = async () => {
    const data = await window.api.getEntries();
    setEntries(data);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleCopy = async (id) => {
    const password = await window.api.getDecryptedPassword(id);
    await window.api.copyToClipboard(password);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    await window.api.deleteEntry(id);
    loadEntries();
  };

  const handleAdded = () => {
    setShowAdd(false);
    loadEntries();
  };

  const filtered = entries.filter(
    (e) =>
      e.site_name.toLowerCase().includes(search.toLowerCase()) ||
      (e.url && e.url.toLowerCase().includes(search.toLowerCase())) ||
      e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1>Vault</h1>
        <div className="header-actions">
          <button className="btn btn-primary btn-small" onClick={() => setShowAdd(true)}>
            + Add
          </button>
          <button className="btn btn-secondary btn-small" onClick={onLock}>
            Lock
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="entry-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            {entries.length === 0
              ? 'No passwords saved yet. Click "+ Add" to get started.'
              : 'No results found.'}
          </div>
        )}

        {filtered.map((entry) => (
          <div key={entry.id} className="entry-card">
            <div className="entry-info">
              <h3>{entry.site_name}</h3>
              <p>{entry.username}{entry.url ? ` — ${entry.url}` : ''}</p>
            </div>
            <div className="entry-actions">
              <button
                className="btn btn-secondary btn-small"
                onClick={() => handleCopy(entry.id)}
              >
                {copiedId === entry.id ? 'Copied!' : 'Copy'}
              </button>
              <button
                className="btn btn-danger btn-small"
                onClick={() => handleDelete(entry.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddEntry onClose={() => setShowAdd(false)} onSaved={handleAdded} />}
    </div>
  );
}
