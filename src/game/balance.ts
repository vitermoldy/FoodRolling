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
    speed: { base: 20, growth: 1.3 },
    // Chef 2 to 6.
    chefs: [60, 700, 7000, 60000, 500000],
    seats: { base: 20, growth: 1.48 },
  },

  /** Price of each plate colour (tier 1 to 5), times the restaurant scale. Same colour, same price. */
  tierPrice: [1, 1.8, 3.2, 5.5, 9],
  /** Income level at which each of the six dishes joins the menu. */
  dishUnlock: [1, 1, 5, 12, 20, 30],

  customer: {
    arrive: 0.8,
