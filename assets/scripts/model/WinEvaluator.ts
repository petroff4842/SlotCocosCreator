import { PAYLINES, SymbolId, PAYTABLE } from "../config/SlotConfig";

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  payout: number;
  cells: { row: number; reel: number }[];
}

function getLineMatch(lineSymbols: SymbolId[]): {
  symbol: SymbolId;
  count: number;
} | null {
  let targetSymbol: SymbolId | null = null;
  let count = 0;

  for (const symbol of lineSymbols) {
    if (symbol === SymbolId.Wild) {
      count++;
      continue;
    }

    if (targetSymbol === null) {
      targetSymbol = symbol;
      count++;
      continue;
    }

    if (symbol === targetSymbol) {
      count++;
      continue;
    }

    break;
  }

  if (targetSymbol === null) {
    return {
      symbol: SymbolId.Wild,
      count,
    };
  }

  return {
    symbol: targetSymbol,
    count,
  };
}

export function evaluateWins(grid: SymbolId[][]): LineWin[] {
  const wins: LineWin[] = [];

  PAYLINES.forEach((line, lineIndex) => {
    const lineSymbols = line.map((row, reel) => grid[row][reel]);

    const match = getLineMatch(lineSymbols);

    if (match && match.count >= 3) {
      const cells = line.slice(0, match.count).map((row, reel) => ({
        row,
        reel,
      }));
      wins.push({
        lineIndex,
        symbol: match.symbol,
        count: match.count,
        payout: PAYTABLE[match.symbol][match.count],
        cells,
      });
    }
  });

  return wins;
}
