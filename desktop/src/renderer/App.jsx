import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Vault from './components/Vault';
import './styles.css';

export default function App() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="app">
      {unlocked ? (
        <Vault onLock={() => setUnlocked(false)} />
      ) : (
        <Login onUnlock={() => setUnlocked(true)} />
      )}
    </div>
  );
}
