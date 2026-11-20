export type RestaurantId = 'jepang' | 'italia' | 'indonesia' | 'meksiko' | 'india' | 'prancis'
export type Tier = 1 | 2 | 3 | 4 | 5

export interface DishDef {
  id: string
  name: string
  description: string
  details: string[]
  tier: Tier
}

export type HatKind = 'hachimaki' | 'toque' | 'peci' | 'bandana' | 'cap' | 'tall'

export interface ThemeDef {
  /** Restaurant colour: lanterns and progress rings on the stage, tab marker and meters in the UI. */
  accent: string
  wall: string
  wallLow: string
  floor: string
  floorAlt: string
  counter: string
  counterEdge: string
  island: string
  islandEdge: string
  belt: string
  beltSide: string
  rail: string
  plate: string
  chef: { hat: HatKind; coat: string; apron: string; trim: string }
}

export interface RestaurantDef {
  id: RestaurantId
  name: string
  country: string
  blurb: string
  /** Price of a tier 1 plate at income level 1. */
  scale: number
  /** Price to open this restaurant. The first one is free. */
  unlockCost: number
  /** Seconds one chef needs for a dish at speed level 1. */
  cookTime: number
  /** Seconds a customer takes to eat one plate at speed level 1. */
  eatTime: number
  /** Belt speed in plate diameters per second at speed level 1. */
  beltSpeed: number
  dishes: DishDef[]
  theme: ThemeDef
}

export const RESTAURANTS: RestaurantDef[] = [
  {
    id: 'jepang',
    name: 'Kaiten Hinoki',
    country: 'Jepang',
    blurb: 'Bar sushi kaiten berdinding kayu hinoki, dengan lentera kertas dan tirai noren di pintu.',
    scale: 1,
    unlockCost: 0,
    cookTime: 3,
    eatTime: 4,
    beltSpeed: 1.9,
    dishes: [
      { id: 'edamame', name: 'Edamame garam', tier: 1, description: 'Semangkuk kedelai muda rebus dengan garam laut kasar.', details: ['1 mangkuk', 'Vegan'] },
      { id: 'tamago', name: 'Tamago nigiri', tier: 2, description: 'Telur dadar manis yang diikat ke nasi dengan pita nori.', details: ['2 potong', 'Telur'] },
      { id: 'kappa', name: 'Kappa maki', tier: 2, description: 'Gulungan nasi dan timun segar berbalut nori.', details: ['6 potong', 'Vegan'] },
      { id: 'salmon', name: 'Salmon nigiri', tier: 3, description: 'Dua iris salmon segar di atas nasi berbumbu cuka.', details: ['2 potong', 'Ikan'] },
      { id: 'ikura', name: 'Ikura gunkan', tier: 4, description: 'Telur ikan salmon yang berkilau di atas nasi berbalut nori.', details: ['2 potong', 'Telur ikan'] },
      { id: 'otoro', name: 'Otoro nigiri', tier: 5, description: 'Perut tuna berlemak yang meleleh di lidah.', details: ['2 potong', 'Ikan', 'Pilihan chef'] },
    ],
    theme: {
      accent: '#c8432b',
      wall: '#e9d3ad', wallLow: '#d8bb8c', floor: '#7a5a3c', floorAlt: '#6e4f33',
      counter: '#e2c08d', counterEdge: '#b98d55', island: '#d9b47d', islandEdge: '#a77b45',
      belt: '#9aa3a8', beltSide: '#6b7479', rail: '#d7dde0', plate: '#fbf8f1',
      chef: { hat: 'hachimaki', coat: '#f7f5ef', apron: '#2f3a4f', trim: '#c8432b' },
    },
  },
  {
    id: 'italia',
    name: 'Trattoria Basilico',
