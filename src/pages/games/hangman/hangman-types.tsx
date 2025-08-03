//Tipo de la puntuación
export type Score = {
  date: string;
  word: string;
  score: number;
  difficulty: string;
  user: string;
  wordValue?: number;
  remainingTime?: number;
  remainingAttempts?: number;
};

//Tipo del estado del juego como objeto
export type GameData = {
  wordToGuess: string;
  guessedLetters: Set<string>;
  incorrectGuesses: number;
  status: "playing" | "won" | "lost";
  timer: number;
  finalScore: number;
};