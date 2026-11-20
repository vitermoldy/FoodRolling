// Every tuning number of the game lives here. Prices and costs are multiplied by the restaurant's
// `scale` (the price of its cheapest plate), so the same curves serve all six restaurants.
// `npm run balance` plays the game with a greedy bot and prints when each restaurant opens.

export const BALANCE = {
  chefs: { start: 1, max: 6 },
  seats: { start: 4, max: 16 },
  income: { max: 40, growth: 1.1 },
  speed: { max: 25, cook: 0.1, eat: 0.06, belt: 0.035 },

  costs: {
    income: { base: 8, growth: 1.24 },
