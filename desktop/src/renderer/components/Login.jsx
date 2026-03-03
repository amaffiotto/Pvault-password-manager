import React, { useState, useEffect } from 'react';

export default function Login({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.hasMasterPassword().then((has) => {
      setIsFirstTime(!has);
      setLoading(false);
    });
  }, []);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');

    if (isFirstTime) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      try {
        await window.api.setMasterPassword(password);
        onUnlock();
      } catch (err) {
        setError(err.message);
      }
    } else {
      const valid = await window.api.verifyMasterPassword(password);
      if (valid) {
        onUnlock();
      } else {
        setError('Incorrect master password');
      }
    }
  };

  if (loading) return null;

  return (
    <div className="login-container">
      <h1>Password Manager</h1>
      <p>{isFirstTime ? 'Create your master password' : 'Enter your master password'}</p>

      <form className="login-form" onSubmit={handleUnlock}>
        <input
          type="password"
          placeholder="Master password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />

        {isFirstTime && (
          <input
            type="password"
            placeholder="Confirm master password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        {error && <span className="error">{error}</span>}

        <button type="submit" className="btn btn-primary">
          {isFirstTime ? 'Create' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
