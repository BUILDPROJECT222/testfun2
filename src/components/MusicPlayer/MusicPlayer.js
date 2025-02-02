import React, { useState, useEffect } from 'react';
import './MusicPlayer.css';
import gardenTheme from '../../assets/music/garden_theme.mp3';

const MusicPlayer = () => {
  // Get music preference, default to true (music on) if not set
  const [isPlaying, setIsPlaying] = useState(() => {
    const savedPreference = localStorage.getItem('musicPreference');
    // If no preference saved, return true for autoplay
    return savedPreference === null ? true : savedPreference === 'true';
  });

  const [audio] = useState(new Audio(gardenTheme));

  // Initial setup and autoplay
  useEffect(() => {
    const initializeAudio = async () => {
      audio.loop = true;
      audio.volume = 0.5;

      // Try to play if isPlaying is true
      if (isPlaying) {
        try {
          await audio.play();
          console.log('Autoplay successful');
        } catch (error) {
          console.error('Autoplay failed, waiting for user interaction:', error);
          // Don't set isPlaying to false here, we'll try again on user interaction
        }
      }
    };

    initializeAudio();

    // Cleanup
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio, isPlaying]);

  // Handle user interaction to start audio if it failed to autoplay
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (isPlaying && audio.paused) {
        try {
          await audio.play();
          console.log('Music started after user interaction');
        } catch (error) {
          console.error('Failed to play after user interaction:', error);
        }
      }
    };

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [audio, isPlaying]);

  // Toggle music
  const handleToggleMusic = async () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    // Save user preference
    localStorage.setItem('musicPreference', newState.toString());

    if (newState) {
      try {
        await audio.play();
        console.log('Music turned on by user');
      } catch (error) {
        console.error('Failed to play when toggling on:', error);
      }
    } else {
      audio.pause();
      console.log('Music turned off by user');
    }
  };

  return (
    <div className="music-player-container">
      <div className="music-player">
        <button 
          className={`music-toggle ${!isPlaying ? 'disabled' : ''}`}
          onClick={handleToggleMusic}
          title={isPlaying ? "Mute Music" : "Play Music"}
        >
          <span className="music-icon">{isPlaying ? "🔊" : "🔇"}</span>
          <span className="music-label">MUSIC</span>
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer; 