// Pidey Store - data.js
// Default games data schema
// Each game: { id, name, active, server, description, products: [ { nominal, price, stock } ] }
const DEFAULT_GAMES = [
  {
    id: 'mlbb',
    name: 'Mobile Legends',
    active: true,
    server: 'Global',
    description: 'Top up diamond Mobile Legends',
    products: [
      { nominal: '65 Diamonds', price: 10000, stock: 10 },
      { nominal: '86 Diamonds', price: 12500, stock: 10 },
      { nominal: '172 Diamonds', price: 25000, stock: 8 },
      { nominal: '355 Diamonds', price: 50000, stock: 6 },
      { nominal: '720 Diamonds', price: 100000, stock: 4 },
      { nominal: '1440 Diamonds', price: 190000, stock: 2 },
      { nominal: '3010 Diamonds', price: 380000, stock: 2 },
      { nominal: '6050 Diamonds', price: 750000, stock: 1 },
      { nominal: '12500 Diamonds', price: 1500000, stock: 0 },
      { nominal: 'Custom Pack', price: 0, stock: 5 }
    ]
  },
  {
    id: 'ff',
    name: 'Free Fire',
    active: true,
    server: 'NA',
    description: 'Top up diamond Free Fire',
    products: [
      { nominal: 'Diamonds 50', price: 8000, stock: 10 },
      { nominal: 'Diamonds 140', price: 20000, stock: 10 },
      { nominal: 'Diamonds 355', price: 50000, stock: 7 },
      { nominal: 'Diamonds 720', price: 100000, stock: 5 },
      { nominal: 'Diamonds 1450', price: 200000, stock: 3 },
      { nominal: 'Diamonds 3000', price: 380000, stock: 2 },
      { nominal: 'Diamonds 7000', price: 800000, stock: 1 },
      { nominal: 'Top Up Bundle', price: 150000, stock: 6 },
      { nominal: 'Big Pack', price: 400000, stock: 1 },
      { nominal: 'Custom Pack', price: 0, stock: 5 }
    ]
  },
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    active: true,
    server: 'Asia',
    description: 'Top up UC PUBG',
    products: [
      { nominal: 'UC 60', price: 12000, stock: 6 },
      { nominal: 'UC 180', price: 35000, stock: 5 },
      { nominal: 'UC 300', price: 50000, stock: 4 },
      { nominal: 'UC 600', price: 95000, stock: 3 },
      { nominal: 'UC 1200', price: 180000, stock: 2 },
      { nominal: 'UC 2400', price: 350000, stock: 1 },
      { nominal: 'UC 5000', price: 700000, stock: 0 },
      { nominal: 'UC 10000', price: 1300000, stock: 0 },
      { nominal: 'Season Pass', price: 450000, stock: 5 },
      { nominal: 'Custom Pack', price: 0, stock: 4 }
    ]
  },
  {
    id: 'genshin',
    name: 'Genshin Impact',
    active: true,
    server: 'Global',
    description: 'Top up Genesis Crystals Genshin Impact',
    products: [
      { nominal: '60 Crystals', price: 15000, stock: 10 },
      { nominal: '300 Crystals', price: 75000, stock: 8 },
      { nominal: '980 Crystals', price: 240000, stock: 5 },
      { nominal: '1980 Crystals', price: 480000, stock: 3 },
      { nominal: '3280 Crystals', price: 800000, stock: 2 },
      { nominal: '6480 Crystals', price: 1600000, stock: 1 },
      { nominal: 'Blessing of the Welkin Moon', price: 125000, stock: 6 },
      { nominal: 'Custom Pack', price: 0, stock: 5 }
    ]
  },
  {
    id: 'hok',
    name: 'Honor of Kings',
    active: true,
    server: 'Global',
    description: 'Top up Hero Tokens Honor of Kings',
    products: [
      { nominal: '120 Tokens', price: 20000, stock: 10 },
      { nominal: '610 Tokens', price: 100000, stock: 7 },
      { nominal: '1200 Tokens', price: 200000, stock: 5 },
      { nominal: '2500 Tokens', price: 400000, stock: 3 },
      { nominal: '6500 Tokens', price: 1000000, stock: 1 },
      { nominal: 'Custom Pack', price: 0, stock: 5 }
    ]
  },
  {
    id: 'codm',
    name: 'Call of Duty Mobile',
    active: true,
    server: 'Global',
    description: 'Top up CP Call of Duty Mobile',
    products: [
      { nominal: '60 CP', price: 10000, stock: 10 },
      { nominal: '120 CP', price: 20000, stock: 8 },
      { nominal: '240 CP', price: 40000, stock: 6 },
      { nominal: '500 CP', price: 80000, stock: 4 },
      { nominal: '1000 CP', price: 150000, stock: 2 },
      { nominal: '2400 CP', price: 350000, stock: 1 },
      { nominal: '5000 CP', price: 700000, stock: 0 },
      { nominal: 'Custom Pack', price: 0, stock: 5 }
    ]
  }
];