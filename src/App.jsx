import { useState } from 'react';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import Desktop from './components/Desktop';

export default function App() {
  const [screen, setScreen] = useState('boot');

  return (
    <>
      {screen === 'boot' && <BootScreen onEnter={() => setScreen('login')} />}
      {screen === 'login' && <LoginScreen onConfirm={() => setScreen('desktop')} />}
      {screen === 'desktop' && <Desktop />}
    </>
  );
}
