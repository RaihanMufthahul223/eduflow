/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo-2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 * 0 - Total blackout
 * 1 - Incorrect, remembered after seeing answer
 * 2 - Incorrect, but felt close
 * 3 - Correct, but very difficult
 * 4 - Correct, with some hesitation
 * 5 - Perfect recall
 */

export interface SM2CardState {
  repetition: number;
  efactor: number;
  interval: number;
}

export interface SM2Result extends SM2CardState {
  nextReview: Date;
}

export function sm2(card: SM2CardState, quality: number): SM2Result {
  if (quality < 0 || quality > 5) {
    throw new Error("Quality must be between 0 and 5");
  }

  let { repetition, efactor, interval } = card;

  // Update easiness factor
  let newEfactor =
    efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEfactor < 1.3) newEfactor = 1.3;

  let newInterval: number;
  let newRepetition: number;

  if (quality < 3) {
    // Failed recall — reset
    newRepetition = 0;
    newInterval = 1;
  } else {
    // Successful recall
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * efactor);
    }
    newRepetition = repetition + 1;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetition: newRepetition,
    efactor: newEfactor,
    interval: newInterval,
    nextReview,
  };
}

/**
 * Simplify quality to 3 buttons for better UX:
 * "Lupa" (forgot) = quality 1
 * "Sulit" (hard) = quality 3
 * "Mudah" (easy) = quality 5
 */
export function qualityFromButton(
  button: "lupa" | "sulit" | "mudah"
): number {
  switch (button) {
    case "lupa":
      return 1;
    case "sulit":
      return 3;
    case "mudah":
      return 5;
  }
}

export const DEFAULT_CARD_STATE: SM2CardState = {
  repetition: 0,
  efactor: 2.5,
  interval: 0,
};
