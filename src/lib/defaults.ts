export type WordToken = {
  text: string;
  type: "starter" | "subject" | "verb" | "adjective" | "connector";
  context?: number[];
  follows?: string[];
  priority?: number;
};

export const wordTokens: WordToken[] = [
  { text: "The", type: "starter", priority: 10 },
  { text: "I", type: "starter", priority: 10 },
  { text: "My experience", type: "starter", priority: 8 },
  { text: "This pie", type: "starter", priority: 8 },
  { text: "Honestly", type: "starter", priority: 7 },
  { text: "To be fair", type: "starter", priority: 6 },

  { text: "crust", type: "subject", follows: ["The", "This pie"] },
  { text: "filling", type: "subject", follows: ["The", "This pie"] },
  { text: "portion", type: "subject", follows: ["The"] },
  { text: "texture", type: "subject", follows: ["The"] },
  { text: "presentation", type: "subject", follows: ["The"] },
  { text: "aroma", type: "subject", follows: ["The"] },
  { text: "aftertaste", type: "subject", follows: ["The"] },

  {
    text: "was",
    type: "verb",
    follows: [
      "crust",
      "filling",
      "experience",
      "texture",
      "portion",
      "presentation",
      "aroma",
    ],
  },
  { text: "tasted", type: "verb", follows: ["filling", "pie", "it"] },
  { text: "felt", type: "verb", follows: ["experience", "it"] },
  { text: "looked", type: "verb", follows: ["pie", "crust", "presentation"] },
  { text: "needed", type: "verb", follows: ["it"] },
  { text: "was missing", type: "verb", follows: ["it"] },
  { text: "could use", type: "verb", follows: ["it"] },
  { text: "reminded me of", type: "verb", follows: ["It"] },

  {
    text: "too sweet",
    type: "adjective",
    follows: ["was"],
    context: [1, 2, 3],
  },
  { text: "undercooked", type: "adjective", follows: ["was"], context: [1, 2] },
  { text: "overcooked", type: "adjective", follows: ["was"], context: [1, 2] },
  { text: "just okay", type: "adjective", follows: ["was"], context: [3] },
  { text: "perfect", type: "adjective", follows: ["was"], context: [4, 5] },
  {
    text: "delicious",
    type: "adjective",
    follows: ["was", "tasted"],
    context: [4, 5],
  },
  { text: "satisfying", type: "adjective", follows: ["was"], context: [4, 5] },
  {
    text: "bland",
    type: "adjective",
    follows: ["was", "tasted"],
    context: [1, 2, 3],
  },
  { text: "rich", type: "adjective", follows: ["was"], context: [4, 5] },
  { text: "forgettable", type: "adjective", follows: ["was"], context: [2, 3] },
  { text: "comforting", type: "adjective", follows: ["was"], context: [4, 5] },

  {
    text: "but",
    type: "connector",
    follows: [
      "too sweet",
      "undercooked",
      "just okay",
      "delicious",
      "perfect",
      "forgettable",
      "comforting",
    ],
  },
  {
    text: "and",
    type: "connector",
    follows: ["delicious", "perfect", "rich", "satisfying"],
  },
  {
    text: "although",
    type: "connector",
    follows: ["too sweet", "bland", "forgettable"],
  },

  { text: "it", type: "subject", follows: ["but", "although"] },

  { text: "more apples", type: "adjective", follows: ["needed", "could use"] },
  { text: "less sugar", type: "adjective", follows: ["needed", "could use"] },
  {
    text: "a crispier texture",
    type: "adjective",
    follows: ["needed", "could use"],
  },
  {
    text: "a touch of cinnamon",
    type: "adjective",
    follows: ["needed", "could use"],
  },
  {
    text: "better balance",
    type: "adjective",
    follows: ["needed", "could use"],
  },
]; 
