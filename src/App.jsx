import React, { useState, useEffect } from 'react';
import { achievementsList } from './achievements';

function App() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showAchievementsList, setShowAchievementsList] = useState(false);

  // Check if Web Share API is available
  useEffect(() => {
    if (navigator.share) {
      setCanShare(true);
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('searchCount');
    const savedHistory = localStorage.getItem('searchHistory');
    const savedMuted = localStorage.getItem('isMuted');
    const savedAchievements = localStorage.getItem('unlockedAchievements');

    if (savedCount) setCount(parseInt(savedCount));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMuted) setIsMuted(savedMuted === 'true');
    if (savedAchievements) setUnlockedAchievements(JSON.parse(savedAchievements));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('searchCount', count.toString());
    localStorage.setItem('searchHistory', JSON.stringify(history));
    localStorage.setItem('isMuted', isMuted.toString());
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
  }, [count, history, isMuted, unlockedAchievements]);

  // PWA Install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const playSound = (type = 'sine', freq = 800, duration = 0.1, vol = 0.3) => {
    if (isMuted) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

    gainNode.gain.setValueAtTime(vol, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  const playSadTrombone = () => {
    if (isMuted) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const playNote = (freq, startTime, duration) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        // Slide down
        osc.frequency.linearRampToValueAtTime(freq - 20, startTime + duration);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    playNote(392, now, 0.3);       // G4
    playNote(370, now + 0.3, 0.3); // F#4
    playNote(349, now + 0.6, 0.3); // F4
    playNote(330, now + 0.9, 0.8); // E4 (long)
  };

  const playGlitch = () => {
    if (isMuted) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'square';
    const now = audioContext.currentTime;

    // Rapid random frequency changes
    for(let i = 0; i < 10; i++) {
        osc.frequency.setValueAtTime(200 + Math.random() * 800, now + i * 0.05);
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
  };

  const playCartoonFall = () => {
    if (isMuted) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = 'triangle';
    const now = audioContext.currentTime;

    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 1); // Slide down

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 1);

    osc.start(now);
    osc.stop(now + 1);
  };

  const playMockingSound = () => {
    const sounds = [playSadTrombone, playGlitch, playCartoonFall];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    randomSound();
  };

  const checkAchievements = (newCount) => {
    const achievement = achievementsList[newCount];
    if (achievement) {
        setShowAchievement(achievement);
        setUnlockedAchievements(prev => {
            if (!prev.includes(newCount)) {
                return [...prev, newCount];
            }
            return prev;
        });
        setTimeout(() => setShowAchievement(null), 3000);
    }
  };

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleClick = () => {
    const newCount = count + 1;
    setCount(newCount);
    setHistory([...history, new Date().toISOString()]);
    playMockingSound();
    vibrate();
    checkAchievements(newCount);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Handy Such-Tracker',
          text: `Ich habe mein Handy schon ${count} mal gesucht! Wie oft suchst du deins? 🤦‍♂️`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleUndo = () => {
    if (count > 0) {
        setCount(count - 1);
        setHistory(history.slice(0, -1));
    }
  };

  const handleReset = () => {
    if (window.confirm('Wirklich alles zurücksetzen? 🤔')) {
        setCount(0);
        setHistory([]);
        setUnlockedAchievements([]);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
        setInstallPrompt(null);
    }
  };

  const getStats = () => {
    if (history.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = history.filter(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    }).length;

    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    const weekCount = history.filter(date => new Date(date) > thisWeek).length;

    const firstSearch = new Date(history[0]);
    const daysSince = Math.floor((Date.now() - firstSearch.getTime()) / (1000 * 60 * 60 * 24));
    const avgPerDay = daysSince > 0 ? (count / daysSince).toFixed(1) : count;

    return { todayCount, weekCount, avgPerDay, daysSince };
  };

  const stats = getStats();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      {installPrompt && (
          <div className="install-banner">
              <span>📱 Als App installieren?</span>
              <button onClick={handleInstall}>Installieren</button>
          </div>
      )}

      <div className="glass-panel" style={{ textAlign: 'center', position: 'relative' }}>
          <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? "Ton einschalten" : "Ton ausschalten"}
              style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255,255,255,0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(4px)'
              }}
          >
              {isMuted ? "🔇" : "🔊"}
          </button>

          <h1 style={{
              fontSize: '32px',
              marginBottom: '8px',
              color: '#2D3436',
              fontFamily: 'var(--font-heading)',
              fontWeight: '700'
          }}>
              Handy Such-Tracker
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              Wie oft suchst du dein Handy? 🤦‍♂️
          </p>
      </div>

      <div className="glass-panel" style={{ textAlign: 'center', position: 'relative' }}>
          {showAchievement && (
              <div
                  role="alert"
                  style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  padding: '15px 25px',
                  borderRadius: '15px',
                  boxShadow: '0 8px 24px rgba(255,215,0,0.4)',
                  zIndex: 10,
                  animation: 'slideDown 0.3s ease-out',
                  minWidth: '280px'
              }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                      {showAchievement.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {showAchievement.text}
                  </div>
              </div>
          )}

          <div key={count} className="counter-display" role="status" aria-label={`Aktuelle Suche: ${count}`} style={{ animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              {count}
          </div>

          <button
              className="main-button"
              onClick={handleClick}
              aria-label="Handy gesucht! Suche zählen"
          >
              <span style={{fontSize: '40px', marginBottom: '8px', display: 'block'}}>🔍</span>
              Handy gesucht!
          </button>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                  onClick={handleUndo}
                  disabled={count === 0}
                  className={`action-btn secondary`}
                  style={{ opacity: count === 0 ? 0.5 : 1, cursor: count === 0 ? 'not-allowed' : 'pointer' }}
              >
                  <span>↩️</span> Rückgängig
              </button>
              <button
                  onClick={() => setShowStats(!showStats)}
                  className={`action-btn ${showStats ? 'primary-ghost' : 'secondary'}`}
              >
                  <span>📊</span> Statistik
              </button>
              <button
                  onClick={() => setShowAchievementsList(!showAchievementsList)}
                  className={`action-btn ${showAchievementsList ? 'primary-ghost' : 'secondary'}`}
              >
                  <span>🏆</span> Erfolge
              </button>
              <button
                  onClick={handleReset}
                  className="action-btn secondary"
              >
                  <span>🗑️</span> Reset
              </button>
              {canShare && (
                <button
                    onClick={handleShare}
                    className="action-btn secondary"
                    aria-label="Ergebnis teilen"
                >
                    <span>📤</span> Teilen
                </button>
              )}
          </div>
      </div>

      {showStats && stats && (
          <div className="glass-panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <h2 style={{
                  marginBottom: '20px',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px'
              }}>
                  📊 Deine Such-Statistik
              </h2>
              <div className="stat-grid">
                  <StatCard label="Heute" value={stats.todayCount} emoji="📅" />
                  <StatCard label="Diese Woche" value={stats.weekCount} emoji="📆" />
                  <StatCard label="Ø pro Tag" value={stats.avgPerDay} emoji="📈" />
                  <StatCard label="Tage dabei" value={stats.daysSince} emoji="⏰" />
              </div>
          </div>
      )}

      {showAchievementsList && (
        <div className="glass-panel" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h2 style={{
                marginBottom: '20px',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-heading)',
                fontSize: '20px'
            }}>
                🏆 Deine Erfolge ({unlockedAchievements.length}/{Object.keys(achievementsList).length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(achievementsList).map(([key, value]) => {
                    const isUnlocked = unlockedAchievements.includes(parseInt(key));
                    return (
                        <div key={key} style={{
                            padding: '16px',
                            borderRadius: '16px',
                            background: isUnlocked ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            opacity: isUnlocked ? 1 : 0.6,
                            textAlign: 'left'
                        }}>
                            <div style={{ fontSize: '24px' }}>{isUnlocked ? '🔓' : '🔒'}</div>
                            <div>
                                <div style={{ fontWeight: '700', color: isUnlocked ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                                    {value.title}
                                </div>
                                {isUnlocked && (
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        {value.text}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, emoji }) {
  return (
      <div className="stat-item">
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>{emoji}</div>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
      </div>
  );
}

export default App;
