import { useEffect, useState } from 'react';

const PASSWORD = '********';

export default function LoginScreen({ onConfirm }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function typePassword() {
      for (let i = 0; i < PASSWORD.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 250));
        if (cancelled) return;
        const s = new Audio('/sounds/typing-sound.mp3');
        s.volume = 0.5;
        s.play().catch(err => console.error('play failed:', err));
        setTimeout(() => { s.pause(); s.currentTime = 0; }, 400);
        setDisplay(prev => prev + '*');
      }
    }
    typePassword();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = e => { if (e.key === 'Enter') onConfirm(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onConfirm]);

  return (
    <div id="login-screen" style={{ display: 'flex', height: '100vh' }} onClick={onConfirm}>
      <div id="profile-picture">
        <img src="imgs/retro_cat.png" alt="Cat Profile" />
      </div>
      <div id="login-box">
        <div className="password-label">Enter password</div>
        <div id="password-container">
          <div id="password-field">
            <div id="password-display">{display}</div>
          </div>
          <button id="confirm-button" onClick={e => { e.stopPropagation(); onConfirm(); }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
