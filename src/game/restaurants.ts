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
    country: 'Italia',
    blurb: 'Trattoria berdinding bata dengan taplak kotak-kotak, botol di rak kayu, dan oven batu.',
    scale: 14,
    unlockCost: 3_000,
    cookTime: 3.4,
    eatTime: 4.4,
    beltSpeed: 1.9,
    dishes: [
      { id: 'bruschetta', name: 'Bruschetta', tier: 1, description: 'Roti panggang dengan tomat cincang, bawang putih, dan daun basil.', details: ['3 iris', 'Vegan'] },
      { id: 'margherita', name: 'Pizza margherita', tier: 2, description: 'Saus tomat, mozzarella, dan basil di atas adonan tipis dari oven batu.', details: ['1 loyang kecil', 'Susu', 'Gandum'] },
      { id: 'spaghetti', name: 'Spaghetti pomodoro', tier: 2, description: 'Spaghetti dengan saus tomat yang dimasak pelan dan parutan parmesan.', details: ['1 piring', 'Gandum', 'Susu'] },
      { id: 'ravioli', name: 'Ravioli ricotta', tier: 3, description: 'Ravioli isi ricotta dan bayam dengan mentega sage.', details: ['6 buah', 'Susu', 'Telur'] },
      { id: 'lasagna', name: 'Lasagna', tier: 4, description: 'Lapisan pasta, ragù daging, dan béchamel yang dipanggang sampai kecokelatan.', details: ['1 potong', 'Daging sapi', 'Susu'] },
      { id: 'tiramisu', name: 'Tiramisu', tier: 5, description: 'Biskuit kopi, krim mascarpone, dan taburan kakao.', details: ['1 potong', 'Kopi', 'Pilihan chef'] },
    ],
    theme: {
      accent: '#b8402f',
      wall: '#c9764f', wallLow: '#a95c3c', floor: '#c98d5e', floorAlt: '#b97c4f',
      counter: '#f3ede2', counterEdge: '#c7b9a2', island: '#8a5a3a', islandEdge: '#6c432a',
      belt: '#a7a29b', beltSide: '#76716a', rail: '#e1ddd5', plate: '#fffdf8',
      chef: { hat: 'toque', coat: '#fbfaf6', apron: '#4d6b3a', trim: '#b8402f' },
    },
  },
  {
    id: 'indonesia',
    name: 'Rumah Makan Gonjong',
    country: 'Indonesia',
    blurb: 'Rumah makan Padang beratap gonjong, dengan ukiran kayu Minang dan tumpukan piring di etalase.',
    scale: 190,
    unlockCost: 180_000,
    cookTime: 3.8,
    eatTime: 4.8,
    beltSpeed: 1.95,
    dishes: [
      { id: 'cendol', name: 'Es cendol', tier: 1, description: 'Cendol hijau pandan dengan santan dan gula aren cair.', details: ['1 gelas', 'Santan'] },
      { id: 'sate', name: 'Sate ayam', tier: 2, description: 'Tusuk ayam bakar arang dengan saus kacang dan kecap manis.', details: ['5 tusuk', 'Kacang'] },
      { id: 'nasgor', name: 'Nasi goreng', tier: 2, description: 'Nasi goreng kecap dengan telur mata sapi, acar, dan kerupuk.', details: ['1 piring', 'Telur'] },
      { id: 'gado', name: 'Gado-gado', tier: 3, description: 'Sayur rebus, tahu, tempe, dan lontong bersiram saus kacang.', details: ['1 piring', 'Kacang', 'Vegetarian'] },
      { id: 'ayampop', name: 'Ayam pop', tier: 4, description: 'Ayam kampung rebus air kelapa yang digoreng sebentar, dengan sambal merah.', details: ['1 potong', 'Pedas'] },
      { id: 'rendang', name: 'Rendang', tier: 5, description: 'Daging sapi dimasak berjam-jam dalam santan dan rempah sampai kering.', details: ['3 potong', 'Daging sapi', 'Pilihan chef'] },
    ],
    theme: {
      accent: '#a3311f',
      wall: '#efe0bf', wallLow: '#ddc79b', floor: '#8b5a34', floorAlt: '#7c4e2c',
      counter: '#6e3a20', counterEdge: '#4f2814', island: '#7a4426', islandEdge: '#552d17',
      belt: '#b9a98e', beltSide: '#8a7a60', rail: '#e8dcc2', plate: '#fffaf0',
      chef: { hat: 'peci', coat: '#fbf7ee', apron: '#7a2a1c', trim: '#d9a521' },
    },
  },
  {
    id: 'meksiko',
    name: 'Taquería Nopal',
    country: 'Meksiko',
    blurb: 'Taqueria berdinding terakota dengan bendera kertas papel picado dan ubin talavera biru.',
    scale: 2_600,
    unlockCost: 7_500_000,
