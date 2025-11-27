import { Asset, Template } from './types';

// Helper to generate placeholder images
const getPlaceholder = (text: string, bg: string, w = 400, h = 400) => 
  `https://placehold.co/${w}x${h}/${bg}/ffffff?text=${encodeURIComponent(text)}`;

export const LITURGICAL_COLORS = {
  white: { name: 'White', meaning: 'Joy, Purity, Victory' },
  red: { name: 'Red', meaning: 'Blood, Fire, Holy Spirit' },
  green: { name: 'Green', meaning: 'Hope, Life' },
  violet: { name: 'Violet', meaning: 'Penance, Preparation' },
  rose: { name: 'Rose', meaning: 'Joy in Penance' },
  black: { name: 'Black', meaning: 'Mourning' },
  gold: { name: 'Gold', meaning: 'Glory' },
};

export const TEMPLATES: Template[] = [
  {
    id: 'holy-card-portrait',
    name: 'Holy Card (Portrait)',
    description: 'Classic vertical prayer card format',
    width: 600,
    height: 900,
    backgroundColor: '#fdfbf7',
    layers: [
      {
        type: 'text',
        name: 'Saint Name',
        text: 'Saint Name',
        xPercent: 0.5,
        yPercent: 0.85,
        fontSize: 48,
        fontFamily: 'Cinzel',
        fill: '#965a3e'
      },
      {
        type: 'text',
        name: 'Pray for Us',
        text: 'Pray for Us',
        xPercent: 0.5,
        yPercent: 0.92,
        fontSize: 24,
        fontFamily: 'Lato',
        fill: '#653d31'
      }
    ]
  },
  {
    id: 'quote-square',
    name: 'Square Quote',
    description: 'Instagram style quote layout',
    width: 1080,
    height: 1080,
    backgroundColor: '#1e1e1e',
    baseImageSrc: 'https://images.unsplash.com/photo-1548625361-1888a7559e2b?q=80&w=1080&auto=format&fit=crop',
    layers: [
      {
        type: 'text',
        name: 'Quote',
        text: '"Preach the Gospel at all times. When necessary, use words."',
        xPercent: 0.5,
        yPercent: 0.5,
        fontSize: 60,
        fontFamily: 'Cinzel',
        fill: '#ffffff'
      },
      {
        type: 'text',
        name: 'Author',
        text: '- St. Francis of Assisi',
        xPercent: 0.5,
        yPercent: 0.7,
        fontSize: 32,
        fontFamily: 'Lato',
        fill: '#fbbf24'
      }
    ]
  },
  {
    id: 'header-banner',
    name: 'Website Banner',
    description: 'Wide format for headers',
    width: 1200,
    height: 400,
    backgroundColor: '#ffffff',
    baseImageSrc: 'https://images.unsplash.com/photo-1502003194781-a6c38210343a?q=80&w=1200&auto=format&fit=crop',
    layers: [
      {
        type: 'text',
        name: 'Title',
        text: 'Liturgy & Life',
        xPercent: 0.5,
        yPercent: 0.5,
        fontSize: 72,
        fontFamily: 'Cinzel',
        fill: '#ffffff'
      }
    ]
  }
];

export const ASSETS: Asset[] = [
  // --- SAINTS ---
  {
    id: 'saint-mary',
    name: 'Virgin Mary',
    category: 'saints',
    subCategory: 'Holy Family',
    src: 'https://images.unsplash.com/photo-1568222955523-28929b95988d?q=80&w=400&auto=format&fit=crop',
    description: 'Mother of God',
    feastDay: 'Aug 15',
    attributes: ['Blue Mantle', 'Crown', 'Stars']
  },
  {
    id: 'saint-joseph',
    name: 'Saint Joseph',
    category: 'saints',
    subCategory: 'Holy Family',
    src: 'https://images.unsplash.com/photo-1628604771746-0b190f77d32c?q=80&w=400&auto=format&fit=crop',
    description: 'Patron of the Universal Church',
    feastDay: 'Mar 19',
    attributes: ['Lily', 'Carpenter Tools']
  },
  {
    id: 'saint-peter',
    name: 'Saint Peter',
    category: 'saints',
    subCategory: 'Apostles',
    src: getPlaceholder('St.+Peter', '1e3a8a', 300, 400),
    description: 'The First Pope',
    feastDay: 'Jun 29',
    attributes: ['Keys to Heaven', 'Inverted Cross', 'Papal Tiara']
  },
  {
    id: 'saint-paul',
    name: 'Saint Paul',
    category: 'saints',
    subCategory: 'Apostles',
    src: getPlaceholder('St.+Paul', '7f1d1d', 300, 400),
    description: 'Apostle to the Gentiles',
    feastDay: 'Jun 29',
    attributes: ['Sword', 'Book', 'Scroll']
  },
  {
    id: 'saint-francis',
    name: 'St. Francis of Assisi',
    category: 'saints',
    subCategory: 'Founders',
    src: 'https://images.unsplash.com/photo-1544158485-618413809074?q=80&w=400&auto=format&fit=crop', 
    description: 'Founder of the Franciscans',
    feastDay: 'Oct 4',
    attributes: ['Brown Habit', 'Stigmata', 'Animals', 'Crucifix']
  },
  {
    id: 'saint-therese',
    name: 'St. Thérèse of Lisieux',
    category: 'saints',
    subCategory: 'Doctors',
    src: getPlaceholder('St.+Therese', 'fbcfe8', 300, 400),
    description: 'The Little Flower',
    feastDay: 'Oct 1',
    attributes: ['Roses', 'Crucifix']
  },
  {
    id: 'saint-anthony',
    name: 'St. Anthony of Padua',
    category: 'saints',
    subCategory: 'Doctors',
    src: getPlaceholder('St.+Anthony', '5d4037', 300, 400),
    description: 'Patron of Lost Things',
    feastDay: 'Jun 13',
    attributes: ['Child Jesus', 'Lily', 'Book']
  },
  {
    id: 'saint-michaell',
    name: 'St. Michael Archangel',
    category: 'saints',
    subCategory: 'Angels',
    src: getPlaceholder('St.+Michael', 'b91c1c', 300, 400),
    description: 'Prince of the Heavenly Host',
    feastDay: 'Sep 29',
    attributes: ['Sword', 'Scales', 'Demon']
  },

  // --- VESTMENTS ---
  {
    id: 'alb',
    name: 'Alb',
    category: 'vestments',
    subCategory: 'Base',
    src: getPlaceholder('Alb', 'f3f4f6', 300, 500),
    description: 'White vestment reaching to the feet',
    symbolism: 'Purity of Soul'
  },
  {
    id: 'chasuble-white',
    name: 'White Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('White+Chasuble', 'e5e7eb', 400, 500),
    description: 'For Easter, Christmas, and Saints',
    symbolism: LITURGICAL_COLORS.white.meaning
  },
  {
    id: 'chasuble-red',
    name: 'Red Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Red+Chasuble', '991b1b', 400, 500),
    description: 'For Pentecost and Martyrs',
    symbolism: LITURGICAL_COLORS.red.meaning
  },
  {
    id: 'chasuble-green',
    name: 'Green Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Green+Chasuble', '166534', 400, 500),
    description: 'For Ordinary Time',
    symbolism: LITURGICAL_COLORS.green.meaning
  },
  {
    id: 'chasuble-violet',
    name: 'Violet Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Violet+Chasuble', '581c87', 400, 500),
    description: 'For Advent and Lent',
    symbolism: LITURGICAL_COLORS.violet.meaning
  },
  {
    id: 'chasuble-rose',
    name: 'Rose Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Rose+Chasuble', 'fda4af', 400, 500),
    description: 'For Gaudete and Laetare Sundays',
    symbolism: LITURGICAL_COLORS.rose.meaning
  },
  {
    id: 'chasuble-black',
    name: 'Black Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Black+Chasuble', '1f2937', 400, 500),
    description: 'For All Souls Day',
    symbolism: LITURGICAL_COLORS.black.meaning
  },
  {
    id: 'chasuble-gold',
    name: 'Gold Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Gold+Chasuble', 'f59e0b', 400, 500),
    description: 'For Solemnities',
    symbolism: LITURGICAL_COLORS.gold.meaning
  },
  {
    id: 'stole-priest',
    name: 'Priest Stole',
    category: 'vestments',
    subCategory: 'Accessory',
    src: getPlaceholder('Stole', 'd97706', 150, 400),
    description: 'Symbol of priestly authority',
    symbolism: 'Yoke of Christ'
  },
  {
    id: 'dalmatic',
    name: 'Dalmatic',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Dalmatic', 'bfdbfe', 400, 500),
    description: 'Vestment of the Deacon',
    symbolism: 'Joy and Service'
  },
  {
    id: 'cope-gold',
    name: 'Gold Cope',
    category: 'vestments',
    subCategory: 'Outer',
    src: getPlaceholder('Cope', 'fbbf24', 500, 500),
    description: 'Ceremonial cape for processions',
    symbolism: LITURGICAL_COLORS.gold.meaning
  },
  {
    id: 'miter-precious',
    name: 'Precious Miter',
    category: 'vestments',
    subCategory: 'Headwear',
    src: getPlaceholder('Miter', 'fcd34d', 200, 300),
    description: 'Bishop\'s headwear'
  },
  {
    id: 'brown-scapular',
    name: 'Brown Scapular',
    category: 'vestments',
    subCategory: 'Devotional',
    src: getPlaceholder('Brown+Scapular', '5d4037', 150, 200),
    description: 'Our Lady of Mount Carmel'
  },

  // --- BACKGROUNDS ---
  {
    id: 'bg-church-altar',
    name: 'High Altar',
    category: 'backgrounds',
    subCategory: 'Interior',
    src: 'https://images.unsplash.com/photo-1548625361-1888a7559e2b?q=80&w=800&auto=format&fit=crop',
    description: 'Classic Cathedral Altar'
  },
  {
    id: 'bg-church-nave',
    name: 'Church Nave',
    category: 'backgrounds',
    subCategory: 'Interior',
    src: 'https://images.unsplash.com/photo-1548544149-4835e62ee5b3?q=80&w=800&auto=format&fit=crop',
    description: 'View down the aisle'
  },
  {
    id: 'bg-stained-glass',
    name: 'Rose Window',
    category: 'backgrounds',
    subCategory: 'Decorative',
    src: 'https://images.unsplash.com/photo-1502003194781-a6c38210343a?q=80&w=800&auto=format&fit=crop',
    description: 'Gothic Stained Glass'
  },
  {
    id: 'bg-stained-glass-blue',
    name: 'Blue Glass',
    category: 'backgrounds',
    subCategory: 'Decorative',
    src: getPlaceholder('Stained+Glass+Blue', '1e40af', 800, 600),
    description: 'Marian Theme Glass'
  },
  {
    id: 'bg-heaven-clouds',
    name: 'Heavenly Clouds',
    category: 'backgrounds',
    subCategory: 'Spiritual',
    src: 'https://images.unsplash.com/photo-1534234828563-025c04f98124?q=80&w=800&auto=format&fit=crop',
    description: 'Ethereal atmosphere'
  },
  {
    id: 'bg-heaven-golden',
    name: 'Golden Glory',
    category: 'backgrounds',
    subCategory: 'Spiritual',
    src: getPlaceholder('Golden+Heaven', 'fef3c7', 800, 600),
    description: 'Divine Light'
  },
  {
    id: 'bg-vatican',
    name: 'St. Peter\'s Square',
    category: 'backgrounds',
    subCategory: 'Location',
    src: 'https://images.unsplash.com/photo-1555696958-c5049b866f63?q=80&w=800&auto=format&fit=crop',
    description: 'Vatican City'
  },
  {
    id: 'bg-holy-land',
    name: 'Holy Land',
    category: 'backgrounds',
    subCategory: 'Location',
    src: 'https://images.unsplash.com/photo-1552423318-62183e207908?q=80&w=800&auto=format&fit=crop',
    description: 'Jerusalem Landscape'
  },

  // --- OBJECTS ---
  // Liturgical
  {
    id: 'obj-crucifix-wood',
    name: 'Wooden Crucifix',
    category: 'objects',
    subCategory: 'Liturgical',
    src: getPlaceholder('Crucifix', '57392d', 200, 300),
    description: 'Symbol of Sacrifice'
  },
  {
    id: 'obj-chalice',
    name: 'Gold Chalice',
    category: 'objects',
    subCategory: 'Liturgical',
    src: getPlaceholder('Chalice', 'f59e0b', 200, 200),
    description: 'Sacred Vessel'
  },
  {
    id: 'obj-monstrance',
    name: 'Monstrance',
    category: 'objects',
    subCategory: 'Liturgical',
    src: getPlaceholder('Monstrance', 'fcd34d', 200, 300),
    description: 'For Eucharistic Adoration'
  },
  {
    id: 'obj-candle',
    name: 'Altar Candle',
    category: 'objects',
    subCategory: 'Liturgical',
    src: 'https://images.unsplash.com/photo-1602602737528-662d55639146?q=80&w=200&auto=format&fit=crop',
    description: 'Light of Christ'
  },
  {
    id: 'obj-paschal-candle',
    name: 'Paschal Candle',
    category: 'objects',
    subCategory: 'Liturgical',
    src: getPlaceholder('Paschal+Candle', 'fff7ed', 100, 400),
    description: 'Alpha and Omega'
  },
  {
    id: 'obj-thurible',
    name: 'Thurible',
    category: 'objects',
    subCategory: 'Liturgical',
    src: getPlaceholder('Thurible', '9ca3af', 200, 300),
    description: 'Incense Burner'
  },
  {
    id: 'obj-bible',
    name: 'Holy Bible',
    category: 'objects',
    subCategory: 'Books',
    src: 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?q=80&w=200&auto=format&fit=crop',
    description: 'Word of God'
  },

  // Marian & Devotional
  {
    id: 'obj-rosary',
    name: 'Rosary',
    category: 'objects',
    subCategory: 'Devotional',
    src: 'https://images.unsplash.com/photo-1552599208-72b155543c74?q=80&w=200&auto=format&fit=crop',
    description: 'Marian Devotion'
  },
  {
    id: 'obj-medal',
    name: 'Miraculous Medal',
    category: 'objects',
    subCategory: 'Marian',
    src: getPlaceholder('Medal', 'e5e7eb', 150, 150),
    description: 'O Mary conceived without sin'
  },
  
  // Effects & Symbols
  {
    id: 'obj-dove',
    name: 'Holy Spirit Dove',
    category: 'objects',
    subCategory: 'Symbols',
    src: getPlaceholder('Dove', 'ffffff', 200, 200),
    description: 'Symbol of Peace and Spirit'
  },
  {
    id: 'obj-halo-gold',
    name: 'Golden Halo',
    category: 'objects',
    subCategory: 'Effects',
    src: getPlaceholder('Halo', 'fbbf24', 200, 200),
    description: 'Sign of Sanctity'
  },
  {
    id: 'obj-halo-cross',
    name: 'Cruciform Halo',
    category: 'objects',
    subCategory: 'Effects',
    src: getPlaceholder('Cross+Halo', 'f59e0b', 200, 200),
    description: 'For Christ'
  },
  {
    id: 'obj-light-rays',
    name: 'Divine Rays',
    category: 'objects',
    subCategory: 'Effects',
    src: getPlaceholder('Rays', 'fef3c7', 400, 400),
    description: 'Light from Heaven'
  },
  {
    id: 'obj-lily',
    name: 'White Lily',
    category: 'objects',
    subCategory: 'Nature',
    src: getPlaceholder('Lily', 'f3f4f6', 200, 200),
    description: 'Symbol of Purity'
  },
  {
    id: 'obj-rose-red',
    name: 'Red Rose',
    category: 'objects',
    subCategory: 'Nature',
    src: getPlaceholder('Rose', 'be123c', 200, 200),
    description: 'Symbol of Martyrdom'
  }
];