import { PAYLINES, SymbolId, PAYTABLE } from "../config/SlotConfig";

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  payout: number;
}

export function evaluateWins(grid: SymbolId[][]): LineWin[] {
  const wins: LineWin[] = [];

  PAYLINES.forEach((line, lineIndex) => {
    const firstSymbol = grid[line[0]][0];

    let count = 1;

    for (let reel = 1; reel < line.length; reel++) {
      const row = line[reel];
      const symbol = grid[row][reel];

      if (symbol !== firstSymbol) {
        break;
      }

      count++;
    }

    if (count >= 3) {
      wins.push({
        lineIndex,
        symbol: firstSymbol,
        count,
        payout: PAYTABLE[firstSymbol][count],
      });
    }
  });

  return wins;
}
