import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NotFound from './components/NotFound/NotFound';
import Garden from './components/Garden/Garden';
import Demo from './components/Demo/Demo';
import Join from './components/Join/Join';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import './App.css';
import { WalletProvider } from './context/WalletContext';
import { ErrorBoundary } from 'react-error-boundary';
import { GameProvider } from './context/GameContext';
import Login from './components/Login/Login';
import TwitterVerification from './components/TwitterVerification/TwitterVerification';
import ProtectedDemo from './components/ProtectedDemo/ProtectedDemo';

function ErrorFallback({error}) {
  if (error.message?.includes('object.extension.inIncognitoContext')) {
    return null;
  }
  
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <WalletProvider>
        <GameProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Garden />} />
              <Route path="/join" element={<Join />} />
              <Route path="/twitter-verify" element={<TwitterVerification />} />
              <Route path="/demo" element={<ProtectedDemo />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MusicPlayer />
          </Router>
        </GameProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;