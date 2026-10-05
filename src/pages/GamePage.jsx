import { useState, useCallback, useEffect } from 'react';
import './GamePage.css';
import {
  createInitialBoard,
  PIECES,
  getPieceColor,
  getLegalMoves,
  makeMove,
  getGameStatus,
  isInCheck,
  getSquareNotation,
  PIECE_NAMES_VI,
} from '../utils/chessEngine';

const PROMOTION_PIECES = ['Q', 'R', 'B', 'N'];

export default function GamePage({ onNavigate }) {
  const [board, setBoard] = useState(createInitialBoard);
  const [currentTurn, setCurrentTurn] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [castlingRights, setCastlingRights] = useState({ K: true, Q: true, k: true, q: true });
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');
  const [moveHistory, setMoveHistory] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [lastMove, setLastMove] = useState(null);
  const [promotionData, setPromotionData] = useState(null);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [kingInCheck, setKingInCheck] = useState(null);
  const [animatingPiece, setAnimatingPiece] = useState(null);

  // Check game status after each move
  useEffect(() => {
    const status = getGameStatus(board, currentTurn, castlingRights, enPassantTarget);
    setGameStatus(status);

    if (isInCheck(board, currentTurn)) {
      // Find king position for check highlighting
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.toUpperCase() === 'K' && getPieceColor(piece) === currentTurn) {
            setKingInCheck([r, c]);
            return;
          }
        }
      }
    } else {
      setKingInCheck(null);
    }
  }, [board, currentTurn, castlingRights, enPassantTarget]);

  const handleSquareClick = useCallback((row, col) => {
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'insufficient') return;
    if (promotionData) return;

    const piece = board[row][col];

    // If a square is selected, try to move
    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare;
      
      // Clicking on own piece - reselect
      if (piece && getPieceColor(piece) === currentTurn) {
        if (row === selRow && col === selCol) {
          // Deselect
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
        // Select new piece
        setSelectedSquare([row, col]);
        const moves = getLegalMoves(board, row, col, castlingRights, enPassantTarget);
        setLegalMoves(moves);
        return;
      }

      // Check if this is a legal move
      const isLegal = legalMoves.some(m => m[0] === row && m[1] === col);
      if (isLegal) {
        const movingPiece = board[selRow][selCol];
        
        // Check for pawn promotion
        const promotionRow = currentTurn === 'white' ? 0 : 7;
        if (movingPiece.toUpperCase() === 'P' && row === promotionRow) {
          setPromotionData({ fromRow: selRow, fromCol: selCol, toRow: row, toCol: col });
          return;
        }

        executeMove(selRow, selCol, row, col, null);
        return;
      }

      // Click on empty or opponent square that's not a legal move - deselect
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // No square selected - select a piece
    if (piece && getPieceColor(piece) === currentTurn) {
      setSelectedSquare([row, col]);
      const moves = getLegalMoves(board, row, col, castlingRights, enPassantTarget);
      setLegalMoves(moves);
    }
  }, [board, currentTurn, selectedSquare, legalMoves, castlingRights, enPassantTarget, gameStatus, promotionData]);

  const executeMove = useCallback((fromRow, fromCol, toRow, toCol, promotionPiece) => {
    const movingPiece = board[fromRow][fromCol];
    const result = makeMove(board, fromRow, fromCol, toRow, toCol, castlingRights, enPassantTarget, promotionPiece);

    // Set animation
    setAnimatingPiece({ fromRow, fromCol, toRow, toCol });
    setTimeout(() => setAnimatingPiece(null), 300);

    // Record captured piece
    if (result.captured) {
      setCapturedPieces(prev => {
        const capturedColor = getPieceColor(result.captured);
        return {
          ...prev,
          [capturedColor]: [...prev[capturedColor], result.captured],
        };
      });
    }

    // Handle en passant capture recording
    if (movingPiece.toUpperCase() === 'P' && enPassantTarget &&
        toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
      const capturedPawn = currentTurn === 'white' ? 'p' : 'P';
      setCapturedPieces(prev => {
        const capturedColor = getPieceColor(capturedPawn);
        return {
          ...prev,
          [capturedColor]: [...prev[capturedColor], capturedPawn],
        };
      });
    }

    // Record move
    const notation = `${PIECES[movingPiece]} ${getSquareNotation(fromRow, fromCol)}→${getSquareNotation(toRow, toCol)}`;
    setMoveHistory(prev => [...prev, notation]);
    setMoveCount(prev => prev + 1);

    setBoard(result.board);
    setCastlingRights(result.castlingRights);
    setEnPassantTarget(result.enPassantTarget);
    setLastMove({ from: [fromRow, fromCol], to: [toRow, toCol] });
    setSelectedSquare(null);
    setLegalMoves([]);
    setCurrentTurn(prev => prev === 'white' ? 'black' : 'white');
  }, [board, castlingRights, enPassantTarget, currentTurn]);

  const handlePromotion = useCallback((piece) => {
    if (!promotionData) return;
    const { fromRow, fromCol, toRow, toCol } = promotionData;
    setPromotionData(null);
    executeMove(fromRow, fromCol, toRow, toCol, piece);
  }, [promotionData, executeMove]);

  const resetGame = useCallback(() => {
    setBoard(createInitialBoard());
    setCurrentTurn('white');
    setSelectedSquare(null);
    setLegalMoves([]);
    setCastlingRights({ K: true, Q: true, k: true, q: true });
    setEnPassantTarget(null);
    setGameStatus('playing');
    setMoveHistory([]);
    setCapturedPieces({ white: [], black: [] });
    setLastMove(null);
    setPromotionData(null);
    setShowNewGameModal(false);
    setMoveCount(0);
    setKingInCheck(null);
    setAnimatingPiece(null);
  }, []);

  const getSquareClasses = (row, col) => {
    const classes = ['square'];
    const isLight = (row + col) % 2 === 0;
    classes.push(isLight ? 'light' : 'dark');

    if (selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col) {
      classes.push('selected');
    }

    if (legalMoves.some(m => m[0] === row && m[1] === col)) {
      classes.push(board[row][col] ? 'capture-move' : 'valid-move');
    }

    if (lastMove) {
      if ((lastMove.from[0] === row && lastMove.from[1] === col) ||
          (lastMove.to[0] === row && lastMove.to[1] === col)) {
        classes.push('last-move');
      }
    }

    if (kingInCheck && kingInCheck[0] === row && kingInCheck[1] === col) {
      classes.push('in-check');
    }

    return classes.join(' ');
  };

  const getStatusText = () => {
    switch (gameStatus) {
      case 'checkmate':
        const winner = currentTurn === 'white' ? 'Đen' : 'Trắng';
        return `🏆 Chiếu hết! ${winner} thắng!`;
      case 'stalemate':
        return '🤝 Hòa cờ - Hết nước đi!';
      case 'insufficient':
        return '🤝 Hòa cờ - Thiếu quân!';
      case 'check':
        return `⚠️ Chiếu! ${currentTurn === 'white' ? 'Trắng' : 'Đen'} phải thoát chiếu`;
      default:
        return `Lượt ${currentTurn === 'white' ? 'Trắng' : 'Đen'}`;
    }
  };

  const isGameOver = gameStatus === 'checkmate' || gameStatus === 'stalemate' || gameStatus === 'insufficient';

  return (
    <div className="game-page">
      {/* Header */}
      <header className="game-header">
        <button 
          id="btn-back-from-game"
          className="game-back-button"
          onClick={() => onNavigate('home')}
        >
          ← Trang Chủ
        </button>
        <h1 className="game-title">♛ Chess Master</h1>
        <button
          id="btn-new-game"
          className="new-game-button"
          onClick={() => setShowNewGameModal(true)}
        >
          🔄 Ván Mới
        </button>
      </header>

      <div className="game-layout">
        {/* Left sidebar - Captured pieces & info */}
        <aside className="game-sidebar sidebar-left">
          <div className="sidebar-card">
            <h3 className="sidebar-title">Quân Đen</h3>
            <div className="player-info">
              <div className={`player-indicator ${currentTurn === 'black' ? 'active' : ''}`}>
                <span className="player-piece">♚</span>
                <span className="player-name">Người chơi 2</span>
              </div>
            </div>
            <div className="captured-pieces">
              <span className="captured-label">Quân bị bắt:</span>
              <div className="captured-list">
                {capturedPieces.black.map((p, i) => (
                  <span key={i} className="captured-piece">{PIECES[p]}</span>
                ))}
                {capturedPieces.black.length === 0 && <span className="no-captures">—</span>}
              </div>
            </div>
          </div>

          <div className="sidebar-card game-info-card">
            <div className="game-stat">
              <span className="stat-label">Nước đi</span>
              <span className="stat-value">{moveCount}</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">Trạng thái</span>
              <span className={`stat-value status-${gameStatus}`}>
                {gameStatus === 'playing' ? 'Đang chơi' : 
                 gameStatus === 'check' ? 'Chiếu' :
                 gameStatus === 'checkmate' ? 'Chiếu hết' : 'Hòa'}
              </span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-title">Quân Trắng</h3>
            <div className="player-info">
              <div className={`player-indicator ${currentTurn === 'white' ? 'active' : ''}`}>
                <span className="player-piece white-piece">♔</span>
                <span className="player-name">Người chơi 1</span>
              </div>
            </div>
            <div className="captured-pieces">
              <span className="captured-label">Quân bị bắt:</span>
              <div className="captured-list">
                {capturedPieces.white.map((p, i) => (
                  <span key={i} className="captured-piece">{PIECES[p]}</span>
                ))}
                {capturedPieces.white.length === 0 && <span className="no-captures">—</span>}
              </div>
            </div>
          </div>
        </aside>

        {/* Chess Board */}
        <div className="board-container">
          {/* Status bar */}
          <div className={`game-status-bar ${gameStatus}`}>
            <span className="status-text">{getStatusText()}</span>
          </div>

          <div className="board-wrapper">
            {/* Column labels top */}
            <div className="board-labels labels-cols">
              {['a','b','c','d','e','f','g','h'].map(l => (
                <span key={l} className="board-label">{l}</span>
              ))}
            </div>

            <div className="board-with-rows">
              {/* Row labels */}
              <div className="board-labels labels-rows">
                {[8,7,6,5,4,3,2,1].map(n => (
                  <span key={n} className="board-label">{n}</span>
                ))}
              </div>

              {/* Board */}
              <div className="chess-board" id="chess-board">
                {board.map((rowArr, row) =>
                  rowArr.map((piece, col) => (
                    <div
                      key={`${row}-${col}`}
                      className={getSquareClasses(row, col)}
                      onClick={() => handleSquareClick(row, col)}
                      data-row={row}
                      data-col={col}
                    >
                      {piece && (
                        <span className={`piece ${getPieceColor(piece)} ${
                          animatingPiece && animatingPiece.toRow === row && animatingPiece.toCol === col ? 'piece-animate' : ''
                        }`}>
                          {PIECES[piece]}
                        </span>
                      )}
                      {legalMoves.some(m => m[0] === row && m[1] === col) && !piece && (
                        <span className="move-dot"></span>
                      )}
                      {legalMoves.some(m => m[0] === row && m[1] === col) && piece && (
                        <span className="capture-ring"></span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Row labels right */}
              <div className="board-labels labels-rows">
                {[8,7,6,5,4,3,2,1].map(n => (
                  <span key={n} className="board-label">{n}</span>
                ))}
              </div>
            </div>

            {/* Column labels bottom */}
            <div className="board-labels labels-cols">
              {['a','b','c','d','e','f','g','h'].map(l => (
                <span key={l} className="board-label">{l}</span>
              ))}
            </div>
          </div>

          {isGameOver && (
            <div className="game-over-actions">
              <button className="play-again-button" onClick={resetGame}>
                🔄 Chơi Lại
              </button>
              <button className="home-button-game" onClick={() => onNavigate('home')}>
                🏠 Trang Chủ
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar - Move history */}
        <aside className="game-sidebar sidebar-right">
          <div className="sidebar-card move-history-card">
            <h3 className="sidebar-title">📜 Lịch Sử Nước Đi</h3>
            <div className="move-history-list" id="move-history">
              {moveHistory.length === 0 ? (
                <p className="no-moves">Chưa có nước đi nào</p>
              ) : (
                moveHistory.map((move, i) => (
                  <div key={i} className={`move-entry ${i % 2 === 0 ? 'white-move' : 'black-move'}`}>
                    <span className="move-number">{Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'}</span>
                    <span className="move-notation">{move}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <button 
              className="rules-link-button"
              onClick={() => onNavigate('rules')}
            >
              📖 Xem Luật Chơi
            </button>
          </div>
        </aside>
      </div>

      {/* Promotion Modal */}
      {promotionData && (
        <div className="modal-overlay" onClick={() => setPromotionData(null)}>
          <div className="promotion-modal" onClick={e => e.stopPropagation()}>
            <h3 className="promotion-title">👑 Phong Cấp</h3>
            <p className="promotion-subtitle">Chọn quân để phong cấp</p>
            <div className="promotion-options">
              {PROMOTION_PIECES.map(p => {
                const displayPiece = currentTurn === 'white' ? p : p.toLowerCase();
                return (
                  <button
                    key={p}
                    className="promotion-option"
                    onClick={() => handlePromotion(p)}
                    title={PIECE_NAMES_VI[p]}
                  >
                    <span className="promotion-piece">{PIECES[displayPiece]}</span>
                    <span className="promotion-name">{PIECE_NAMES_VI[p]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Game Modal */}
      {showNewGameModal && (
        <div className="modal-overlay" onClick={() => setShowNewGameModal(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">🔄 Ván Mới</h3>
            <p className="modal-text">Bạn có chắc muốn bắt đầu ván mới? Ván hiện tại sẽ bị hủy.</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowNewGameModal(false)}>
                Hủy
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={resetGame}>
                Bắt Đầu Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
