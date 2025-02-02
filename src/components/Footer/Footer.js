import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="game-footer">
      <div className="footer-content">
        <div className="footer-links">
          {/* <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/contact" className="footer-link">Contact Us</a> */}
        </div>
        <div className="footer-social">
          <a href="/twitter" className="footer-icon" aria-label="Twitter">𝕏</a>
          <a href="/github" className="footer-icon" aria-label="GitHub">⌥</a>
          <a href="/discord" className="footer-icon" aria-label="Discord">◈</a>
        </div>
        <p className="footer-copyright">© 2025 Farm Fun. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 