// Chess piece unicode symbols
export const PIECES = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

// Piece names in Vietnamese
export const PIECE_NAMES_VI = {
  K: 'Vua', Q: 'Hậu', R: 'Xe', B: 'Tượng', N: 'Mã', P: 'Tốt',
  k: 'Vua', q: 'Hậu', r: 'Xe', b: 'Tượng', n: 'Mã', p: 'Tốt',
};

// Initial board setup
export function createInitialBoard() {
  return [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ];
}

export function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}

export function isBlack(piece) {
  return piece && piece === piece.toLowerCase();
}

export function getPieceColor(piece) {
  if (!piece) return null;
  return isWhite(piece) ? 'white' : 'black';
}

export function isInBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Deep clone the board
function cloneBoard(board) {
  return board.map(row => [...row]);
}

// Find king position
function findKing(board, color) {
  const king = color === 'white' ? 'K' : 'k';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] === king) return [r, c];
    }
  }
  return null;
}

// Check if a square is attacked by the given color
function isSquareAttacked(board, row, col, attackerColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if (getPieceColor(piece) !== attackerColor) continue;
      
      const moves = getRawMoves(board, r, c, null);
      if (moves.some(m => m[0] === row && m[1] === col)) return true;
    }
  }
  return false;
}

// Get raw moves without checking for self-check (to avoid infinite recursion)
function getRawMoves(board, row, col, enPassantTarget) {
  const piece = board[row][col];
  if (!piece) return [];
  
  const color = getPieceColor(piece);
  const type = piece.toUpperCase();
  const moves = [];

  switch (type) {
    case 'P':
      getPawnMoves(board, row, col, color, moves, enPassantTarget);
      break;
    case 'R':
      getSlidingMoves(board, row, col, color, moves, [[0,1],[0,-1],[1,0],[-1,0]]);
      break;
    case 'N':
      getKnightMoves(board, row, col, color, moves);
      break;
    case 'B':
      getSlidingMoves(board, row, col, color, moves, [[1,1],[1,-1],[-1,1],[-1,-1]]);
      break;
    case 'Q':
      getSlidingMoves(board, row, col, color, moves, [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
      break;
    case 'K':
      getKingBasicMoves(board, row, col, color, moves);
      break;
  }

  return moves;
}

function getPawnMoves(board, row, col, color, moves, enPassantTarget) {
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // Forward one
  const r1 = row + direction;
  if (isInBounds(r1, col) && !board[r1][col]) {
    moves.push([r1, col]);
    // Forward two from starting position
    const r2 = row + 2 * direction;
    if (row === startRow && !board[r2][col]) {
      moves.push([r2, col]);
    }
  }

  // Captures diagonally
  for (const dc of [-1, 1]) {
    const nc = col + dc;
    if (isInBounds(r1, nc)) {
      const target = board[r1][nc];
      if (target && getPieceColor(target) !== color) {
        moves.push([r1, nc]);
      }
      // En passant
      if (enPassantTarget && enPassantTarget[0] === r1 && enPassantTarget[1] === nc) {
        moves.push([r1, nc]);
      }
    }
  }

  return moves;
}

function getSlidingMoves(board, row, col, color, moves, directions) {
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (isInBounds(r, c)) {
      const target = board[r][c];
      if (!target) {
        moves.push([r, c]);
      } else {
        if (getPieceColor(target) !== color) {
          moves.push([r, c]);
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
}

function getKnightMoves(board, row, col, color, moves) {
  const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (const [dr, dc] of offsets) {
    const r = row + dr;
    const c = col + dc;
    if (isInBounds(r, c)) {
      const target = board[r][c];
      if (!target || getPieceColor(target) !== color) {
        moves.push([r, c]);
      }
    }
  }
}

function getKingBasicMoves(board, row, col, color, moves) {
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (isInBounds(r, c)) {
        const target = board[r][c];
        if (!target || getPieceColor(target) !== color) {
          moves.push([r, c]);
        }
      }
    }
  }
}

// Check if the king of the given color is in check
export function isInCheck(board, color) {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponentColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos[0], kingPos[1], opponentColor);
}

// Get all legal moves for a piece at (row, col)
export function getLegalMoves(board, row, col, castlingRights, enPassantTarget) {
  const piece = board[row][col];
  if (!piece) return [];
  
  const color = getPieceColor(piece);
  let moves = getRawMoves(board, row, col, enPassantTarget);

  // Add castling moves for king
  if (piece.toUpperCase() === 'K') {
    const castlingMoves = getCastlingMoves(board, row, col, color, castlingRights);
    moves = [...moves, ...castlingMoves];
  }

  // Filter out moves that leave the king in check
  return moves.filter(([toRow, toCol]) => {
    const newBoard = cloneBoard(board);
    
    // Handle en passant capture
    if (piece.toUpperCase() === 'P' && enPassantTarget && 
        toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
      const capturedPawnRow = color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedPawnRow][toCol] = null;
    }
    
    newBoard[toRow][toCol] = piece;
    newBoard[row][col] = null;
    
    return !isInCheck(newBoard, color);
  });
}

function getCastlingMoves(board, row, col, color, castlingRights) {
  const moves = [];
  if (!castlingRights) return moves;
  
  const opponentColor = color === 'white' ? 'black' : 'white';
  
  // Can't castle if in check
  if (isInCheck(board, color)) return moves;

  // Kingside castling
  const kingSide = color === 'white' ? castlingRights.K : castlingRights.k;
  if (kingSide) {
    if (!board[row][col + 1] && !board[row][col + 2]) {
      if (!isSquareAttacked(board, row, col + 1, opponentColor) &&
          !isSquareAttacked(board, row, col + 2, opponentColor)) {
        moves.push([row, col + 2]);
      }
    }
  }

  // Queenside castling
  const queenSide = color === 'white' ? castlingRights.Q : castlingRights.q;
  if (queenSide) {
    if (!board[row][col - 1] && !board[row][col - 2] && !board[row][col - 3]) {
      if (!isSquareAttacked(board, row, col - 1, opponentColor) &&
          !isSquareAttacked(board, row, col - 2, opponentColor)) {
        moves.push([row, col - 2]);
      }
    }
  }

  return moves;
}

// Execute a move and return new game state
export function makeMove(board, fromRow, fromCol, toRow, toCol, castlingRights, enPassantTarget, promotionPiece = null) {
  const newBoard = cloneBoard(board);
  const piece = newBoard[fromRow][fromCol];
  const color = getPieceColor(piece);
  const captured = newBoard[toRow][toCol];
  let newEnPassant = null;
  
  const newCastling = { ...castlingRights };

  // Handle pawn special moves
  if (piece.toUpperCase() === 'P') {
    // En passant capture
    if (enPassantTarget && toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
      const capturedPawnRow = color === 'white' ? toRow + 1 : toRow - 1;
      newBoard[capturedPawnRow][toCol] = null;
    }
    
    // Double push - set en passant target
    if (Math.abs(toRow - fromRow) === 2) {
      const epRow = (fromRow + toRow) / 2;
      newEnPassant = [epRow, fromCol];
    }

    // Promotion
    const promotionRow = color === 'white' ? 0 : 7;
    if (toRow === promotionRow) {
      const promo = promotionPiece || 'Q';
      newBoard[toRow][toCol] = color === 'white' ? promo.toUpperCase() : promo.toLowerCase();
      newBoard[fromRow][fromCol] = null;
      
      updateCastlingRights(newCastling, fromRow, fromCol, toRow, toCol, piece);
      
      return {
        board: newBoard,
        castlingRights: newCastling,
        enPassantTarget: newEnPassant,
        captured,
        isPromotion: false, // already handled
      };
    }
  }

  // Handle castling
  if (piece.toUpperCase() === 'K' && Math.abs(toCol - fromCol) === 2) {
    // Move the rook
    if (toCol > fromCol) {
      // Kingside
      newBoard[fromRow][5] = newBoard[fromRow][7];
      newBoard[fromRow][7] = null;
    } else {
      // Queenside
      newBoard[fromRow][3] = newBoard[fromRow][0];
      newBoard[fromRow][0] = null;
    }
  }

  // Move the piece
  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  // Update castling rights
  updateCastlingRights(newCastling, fromRow, fromCol, toRow, toCol, piece);

  // Check for pawn promotion (return flag)
  const promotionRow = color === 'white' ? 0 : 7;
  const needsPromotion = piece.toUpperCase() === 'P' && toRow === promotionRow;

  return {
    board: newBoard,
    castlingRights: newCastling,
    enPassantTarget: newEnPassant,
    captured,
    isPromotion: needsPromotion,
  };
}

function updateCastlingRights(rights, fromRow, fromCol, toRow, toCol, piece) {
  // King moved
  if (piece === 'K') { rights.K = false; rights.Q = false; }
  if (piece === 'k') { rights.k = false; rights.q = false; }
  
  // Rook moved or captured
  if (fromRow === 7 && fromCol === 0) rights.Q = false;
  if (fromRow === 7 && fromCol === 7) rights.K = false;
  if (fromRow === 0 && fromCol === 0) rights.q = false;
  if (fromRow === 0 && fromCol === 7) rights.k = false;
  
  if (toRow === 7 && toCol === 0) rights.Q = false;
  if (toRow === 7 && toCol === 7) rights.K = false;
  if (toRow === 0 && toCol === 0) rights.q = false;
  if (toRow === 0 && toCol === 7) rights.k = false;
}

// Check for checkmate or stalemate
export function getGameStatus(board, currentTurn, castlingRights, enPassantTarget) {
  // Check if current player has any legal moves
  let hasLegalMoves = false;
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if (getPieceColor(piece) !== currentTurn) continue;
      
      const moves = getLegalMoves(board, r, c, castlingRights, enPassantTarget);
      if (moves.length > 0) {
        hasLegalMoves = true;
        break;
      }
    }
    if (hasLegalMoves) break;
  }

  if (!hasLegalMoves) {
    if (isInCheck(board, currentTurn)) {
      return 'checkmate';
    }
    return 'stalemate';
  }

  // Check for insufficient material
  if (isInsufficientMaterial(board)) {
    return 'insufficient';
  }

  if (isInCheck(board, currentTurn)) {
    return 'check';
  }

  return 'playing';
}

function isInsufficientMaterial(board) {
  const pieces = { white: [], black: [] };
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const color = getPieceColor(p);
      pieces[color].push(p.toUpperCase());
    }
  }

  const w = pieces.white.filter(p => p !== 'K');
  const b = pieces.black.filter(p => p !== 'K');

  // King vs King
  if (w.length === 0 && b.length === 0) return true;
  // King vs King + Bishop
  if (w.length === 0 && b.length === 1 && b[0] === 'B') return true;
  if (b.length === 0 && w.length === 1 && w[0] === 'B') return true;
  // King vs King + Knight
  if (w.length === 0 && b.length === 1 && b[0] === 'N') return true;
  if (b.length === 0 && w.length === 1 && w[0] === 'N') return true;

  return false;
}

// Get notation for column
export function getColNotation(col) {
  return String.fromCharCode(97 + col); // a-h
}

// Get notation for a square
export function getSquareNotation(row, col) {
  return getColNotation(col) + (8 - row);
}
