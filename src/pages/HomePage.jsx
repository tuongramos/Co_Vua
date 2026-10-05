import { useState, useEffect } from 'react';
import './HomePage.css';

const CHESS_PIECES = ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'];

function FloatingPiece({ piece, style }) {
  return (
    <div className="floating-piece" style={style}>
      {piece}
    </div>
  );
}

export default function HomePage({ onNavigate }) {
  const [floatingPieces, setFloatingPieces] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const pieces = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      piece: CHESS_PIECES[i % CHESS_PIECES.length],
      style: {
        left: `${Math.random() * 90 + 5}%`,
        top: `${Math.random() * 90 + 5}%`,
        fontSize: `${Math.random() * 30 + 20}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 4 + 4}s`,
        opacity: Math.random() * 0.08 + 0.03,
      }
    }));
    setFloatingPieces(pieces);
  }, []);

  return (
    <div className={`home-page ${loaded ? 'loaded' : ''}`}>
      {/* Background floating pieces */}
      <div className="floating-pieces-bg">
        {floatingPieces.map(fp => (
          <FloatingPiece key={fp.id} piece={fp.piece} style={fp.style} />
        ))}
      </div>

      {/* Decorative elements */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      <div className="home-content">
        {/* Header decoration */}
        <div className="crown-icon">♛</div>
        
        <h1 className="home-title">
          <span className="title-line-1">Chess</span>
          <span className="title-line-2">Master</span>
        </h1>

        <p className="home-subtitle">
          Trải nghiệm trí tuệ cờ vua đỉnh cao
        </p>

        {/* Mini chess board decoration */}
        <div className="mini-board-container">
          <div className="mini-board">
            {Array.from({ length: 64 }, (_, i) => {
              const row = Math.floor(i / 8);
              const col = i % 8;
              const isLight = (row + col) % 2 === 0;
              return (
                <div 
                  key={i} 
                  className={`mini-square ${isLight ? 'light' : 'dark'}`}
                  style={{ animationDelay: `${(row + col) * 0.05}s` }}
                />
              );
            })}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="home-buttons">
          <button 
            id="btn-play-now"
            className="btn-primary"
            onClick={() => onNavigate('game')}
          >
            <span className="btn-icon">♟</span>
            <span className="btn-text">Chơi Ngay</span>
            <span className="btn-arrow">→</span>
          </button>

          <button 
            id="btn-rules"
            className="btn-secondary"
            onClick={() => onNavigate('rules')}
          >
            <span className="btn-icon">📖</span>
            <span className="btn-text">Luật Chơi</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Features */}
        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">⚔️</div>
            <div className="feature-text">2 Người Chơi</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <div className="feature-text">Luật Chuẩn FIDE</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <div className="feature-text">Giao Diện Đẹp</div>
          </div>
        </div>

        <footer className="home-footer">
          <p>♔ Chess Master — Cờ Vua Việt Nam ♚</p>
        </footer>
      </div>
    </div>
  );
}
