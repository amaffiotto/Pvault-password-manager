import React, { useState } from 'react';

export default function AddEntry({ onClose, onSaved }) {
  const [siteName, setSiteName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    const generated = await window.api.generatePassword(16);
    setPassword(generated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!siteName.trim()) {
      setError('Site name is required');
      return;
    }
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await window.api.addEntry(siteName, url, username, password);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="form-overlay" onClick={onClose}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Password</h2>
        <form onSubmit={handleSubmit}>
          <label>Site Name</label>
          <input
            type="text"
            placeholder="e.g. Google"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            autoFocus
          />

          <label>URL (optional)</label>
          <input
            type="text"
            placeholder="e.g. google.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <label>Username / Email</label>
          <input
            type="text"
            placeholder="e.g. user@email.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type="text"
              placeholder="Enter or generate"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="btn btn-secondary btn-small" onClick={handleGenerate}>
              Generate
            </button>
          </div>

          {error && <span className="error">{error}</span>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
