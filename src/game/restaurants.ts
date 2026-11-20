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
