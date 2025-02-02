import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/header.png'; // Adjust with your logo path

const Header = () => {
  return (
    <header className="game-header">
      <div className="header-content">
        <div className="title-wrapper">
          <img src={logo} alt="Farm Fun Logo" className="game-logo" />
        </div>
        <nav className="game-nav">
          <div className="nav-links">
            <Link to="/" className="pixel-button">HOME</Link>
            <span className="pixel-button disabled">PLAY</span>
            <a 
              href="-" 
              className="pixel-button" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              WHITEPAPER
            </a>
            <Link to="/demo" className="pixel-button">DEMO</Link>
          </div>
          <div className="nav-social">
            <a 
              href="https://x.com/FarmFunSOL" 
              className="social-icon twitter" 
              aria-label="Twitter"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a 
              href="https://github.com/Farmfun" 
              className="social-icon github" 
              aria-label="GitHub"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 