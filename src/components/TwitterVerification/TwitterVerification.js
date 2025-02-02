import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './TwitterVerification.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TwitterVerification = () => {
  const navigate = useNavigate();
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [hasClickedTweet, setHasClickedTweet] = useState(false);
  const [hasClickedReply, setHasClickedReply] = useState(false);
  const [allActionsClicked, setAllActionsClicked] = useState(false);

  const TWITTER_ACCOUNT = '@FarmFunSOL';
  const TWEET_TEXT = `Farming is Fun! @FarmFunSOL! 🌱\n#FarmFun`;
  const PIN_POST_URL = 'https://twitter.com/FarmFunSOL/status/1885717623230619675';

  useEffect(() => {
    // Check localStorage on component mount
    const savedActions = localStorage.getItem('twitterActions');
    if (savedActions) {
      const { follow, tweet, reply } = JSON.parse(savedActions);
      setHasClickedFollow(follow);
      setHasClickedTweet(tweet);
      setHasClickedReply(reply);
      if (follow && tweet && reply) {
        setAllActionsClicked(true);
      }
    }
  }, []);

  useEffect(() => {
    // Update localStorage and allActionsClicked when any action changes
    if (hasClickedFollow && hasClickedTweet && hasClickedReply) {
      setAllActionsClicked(true);
      localStorage.setItem('twitterActions', JSON.stringify({
        follow: hasClickedFollow,
        tweet: hasClickedTweet,
        reply: hasClickedReply
      }));
    }
  }, [hasClickedFollow, hasClickedTweet, hasClickedReply]);

  const handleFollow = () => {
    window.open(`https://twitter.com/intent/follow?screen_name=FarmFunSOL`, '_blank');
    setHasClickedFollow(true);
    toast.success('Redirecting to Twitter...');
  };

  const handleTweet = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(TWEET_TEXT)}`, '_blank');
    setHasClickedTweet(true);
    toast.success('Redirecting to Twitter...');
  };

  const handlePinPostClick = () => {
    window.open(PIN_POST_URL, '_blank');
    setHasClickedReply(true);
    toast.success('Redirecting to pinned post...');
  };

  const handleContinue = () => {
    if (allActionsClicked) {
      navigate('/demo');
      toast.success('Welcome to Demo!');
    }
  };

  useEffect(() => {
    const savedActions = localStorage.getItem('twitterActions');
    if (savedActions) {
      const { follow, tweet, reply } = JSON.parse(savedActions);
      if (follow && tweet && reply) {
        navigate('/demo');
      }
    }
  }, [navigate]);

  return (
    <div className="page-container">
      <Header />
      <div className="twitter-verification-container">
        <div className="twitter-verification-card">
          <h2>Complete Twitter Actions</h2>
          <p className="description">
            Click all buttons below to access the demo:
          </p>

          <div className="twitter-actions">
            <div className="action-item">
              <span className={`status-icon ${hasClickedFollow ? 'clicked' : ''}`}>
                1
              </span>
              <div className="action-content">
                <h3>Follow on Twitter</h3>
                <p>Follow {TWITTER_ACCOUNT} to stay updated</p>
                <button 
                  className={`twitter-button ${hasClickedFollow ? 'clicked' : ''}`}
                  onClick={handleFollow}
                  disabled={hasClickedFollow}
                >
                  {hasClickedFollow ? 'Opening Twitter ✓' : `Follow ${TWITTER_ACCOUNT}`}
                </button>
              </div>
            </div>

            <div className="action-item">
              <span className={`status-icon ${hasClickedTweet ? 'clicked' : ''}`}>
                2
              </span>
              <div className="action-content">
                <h3>Share on Twitter</h3>
                <p>Tweet about our game</p>
                <button 
                  className={`twitter-button ${hasClickedTweet ? 'clicked' : ''}`}
                  onClick={handleTweet}
                  disabled={hasClickedTweet}
                >
                  {hasClickedTweet ? 'Opening Twitter ✓' : 'Post Tweet'}
                </button>
              </div>
            </div>

            <div className="action-item">
              <span className={`status-icon ${hasClickedReply ? 'clicked' : ''}`}>
                3
              </span>
              <div className="action-content">
                <h3>Reply to Pinned Post</h3>
                <p>Reply with your wallet address on our pinned post</p>
                <button 
                  className={`twitter-button pin-button ${hasClickedReply ? 'clicked' : ''}`}
                  onClick={handlePinPostClick}
                  disabled={hasClickedReply}
                >
                  {hasClickedReply ? 'Opening Post ✓' : 'Go to Pinned Post'}
                </button>
              </div>
            </div>

            <button 
              className={`continue-button ${allActionsClicked ? 'enabled' : 'disabled'}`}
              onClick={handleContinue}
              disabled={!allActionsClicked}
            >
              {allActionsClicked ? 'Continue to Demo →' : 'Click All Buttons Above'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-center" theme="dark" />
    </div>
  );
};

export default TwitterVerification; 