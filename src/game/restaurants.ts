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
    cookTime: 4.2,
    eatTime: 5.2,
    beltSpeed: 1.95,
    dishes: [
      { id: 'churros', name: 'Churros', tier: 1, description: 'Adonan goreng bergula kayu manis dengan saus cokelat.', details: ['4 batang', 'Gandum'] },
      { id: 'nachos', name: 'Nachos', tier: 2, description: 'Keripik tortila dengan keju leleh, jalapeño, dan guacamole.', details: ['1 piring', 'Susu', 'Pedas'] },
      { id: 'taco', name: 'Taco ayam', tier: 2, description: 'Tortila jagung isi ayam panggang, nanas, bawang, dan daun ketumbar.', details: ['3 buah', 'Jagung'] },
      { id: 'quesadilla', name: 'Quesadilla', tier: 3, description: 'Tortila lipat berisi keju leleh dan paprika panggang.', details: ['4 potong', 'Susu', 'Gandum'] },
      { id: 'burrito', name: 'Burrito', tier: 4, description: 'Tortila gandum besar berisi nasi, kacang merah, daging, dan salsa.', details: ['1 buah', 'Daging sapi', 'Gandum'] },
      { id: 'enchiladas', name: 'Enchiladas', tier: 5, description: 'Tortila gulung bersiram saus cabai merah dan keju panggang.', details: ['3 gulung', 'Pedas', 'Pilihan chef'] },
    ],
    theme: {
      accent: '#1f5fa8',
      wall: '#e7a26a', wallLow: '#cf8550', floor: '#b5653d', floorAlt: '#a45832',
      counter: '#f2e6cf', counterEdge: '#c9b48d', island: '#2f6fb3', islandEdge: '#204f85',
      belt: '#a99f92', beltSide: '#7a7063', rail: '#ebe3d6', plate: '#fffaf2',
      chef: { hat: 'bandana', coat: '#fbf8f1', apron: '#c8432b', trim: '#1f5fa8' },
    },
  },
  {
    id: 'india',
    name: 'Rasoi Kesar',
    country: 'India',
    blurb: 'Dapur India dengan lengkungan jharokha, kalung bunga marigold, dan lampu kuningan.',
    scale: 36_000,
    unlockCost: 330_000_000,
    cookTime: 4.6,
    eatTime: 5.6,
    beltSpeed: 2,
    dishes: [
      { id: 'samosa', name: 'Samosa', tier: 1, description: 'Pastri segitiga isi kentang berbumbu dengan chutney mint.', details: ['2 buah', 'Gandum', 'Vegan'] },
      { id: 'naan', name: 'Naan bawang putih', tier: 2, description: 'Roti tandoor yang empuk, diolesi mentega bawang putih.', details: ['1 lembar', 'Susu', 'Gandum'] },
      { id: 'dal', name: 'Dal tadka', tier: 2, description: 'Kari lentil kuning dengan tumisan jintan dan cabai kering.', details: ['1 mangkuk', 'Vegan'] },
      { id: 'biryani', name: 'Biryani ayam', tier: 3, description: 'Nasi basmati berlapis ayam berbumbu dan bawang goreng.', details: ['1 piring', 'Pedas sedang'] },
      { id: 'butterchicken', name: 'Butter chicken', tier: 4, description: 'Ayam tandoor dalam saus tomat bermentega dan krim.', details: ['1 mangkuk', 'Susu'] },
      { id: 'thali', name: 'Thali', tier: 5, description: 'Nampan bundar dengan nasi, roti, dan enam mangkuk kecil lauk.', details: ['1 nampan', 'Pilihan chef'] },
    ],
    theme: {
      accent: '#0f766e',
      wall: '#f1b84a', wallLow: '#d99a2b', floor: '#a7493a', floorAlt: '#943d30',
      counter: '#f6ecd6', counterEdge: '#cdb98d', island: '#0f766e', islandEdge: '#0a5650',
      belt: '#b4a58c', beltSide: '#83755d', rail: '#e9dcc0', plate: '#fff9ee',
      chef: { hat: 'cap', coat: '#fbf8f0', apron: '#e0762b', trim: '#0f766e' },
    },
  },
  {
    id: 'prancis',
    name: 'Bistro Lumière',
    country: 'Prancis',
    blurb: 'Bistro Paris dengan lantai mosaik hitam putih, cermin berbingkai emas, dan papan menu kapur.',
    scale: 520_000,
    unlockCost: 15_000_000_000,
    cookTime: 5,
    eatTime: 6,
    beltSpeed: 2,
    dishes: [
      { id: 'macaron', name: 'Macaron', tier: 1, description: 'Tiga macaron: pistachio, raspberry, dan vanila.', details: ['3 buah', 'Telur', 'Kacang'] },
      { id: 'croissant', name: 'Croissant', tier: 2, description: 'Pastri berlapis mentega yang renyah di luar dan lembut di dalam.', details: ['1 buah', 'Susu', 'Gandum'] },
      { id: 'crepe', name: 'Crêpe stroberi', tier: 2, description: 'Crêpe tipis terlipat dengan stroberi dan gula halus.', details: ['1 lembar', 'Telur', 'Susu'] },
      { id: 'quiche', name: 'Quiche bayam', tier: 3, description: 'Pai gurih berisi telur, krim, bayam, dan keju gruyère.', details: ['1 potong', 'Telur', 'Susu'] },
      { id: 'brulee', name: 'Crème brûlée', tier: 4, description: 'Custard vanila dengan lapisan gula karamel yang diketuk pecah.', details: ['1 ramekin', 'Telur', 'Susu'] },
