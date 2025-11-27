import { Asset, Template } from './types';

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
    src: 'https://images.unsplash.com/photo-1627821666687-1755a29c6c6b?q=80&w=400&auto=format&fit=crop',
    description: 'The First Pope',
    feastDay: 'Jun 29',
    attributes: ['Keys to Heaven', 'Inverted Cross', 'Papal Tiara']
  },
  {
    id: 'saint-paul',
    name: 'Saint Paul',
    category: 'saints',
    subCategory: 'Apostles',
    src: 'https://images.unsplash.com/photo-1609372957835-f0450b37494f?q=80&w=400&auto=format&fit=crop',
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
    src: 'https://images.unsplash.com/photo-1632832269557-010f3b0b7b1b?q=80&w=400&auto=format&fit=crop',
    description: 'The Little Flower',
    feastDay: 'Oct 1',
    attributes: ['Roses', 'Crucifix']
  },
  {
    id: 'saint-anthony',
    name: 'St. Anthony of Padua',
    category: 'saints',
    subCategory: 'Doctors',
    src: 'https://images.unsplash.com/photo-1610732360812-70678a1a3e3d?q=80&w=400&auto=format&fit=crop',
    description: 'Patron of Lost Things',
    feastDay: 'Jun 13',
    attributes: ['Child Jesus', 'Lily', 'Book']
  },
  {
    id: 'saint-michaell',
    name: 'St. Michael Archangel',
    category: 'saints',
    subCategory: 'Angels',
    src: 'https://images.unsplash.com/photo-1628045350329-8a8f1b1b3b2c?q=80&w=400&auto=format&fit=crop',
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
    src: 'https://images.unsplash.com/photo-1589992896388-3e4e393c0a4c?q=80&w=400&auto=format&fit=crop',
    description: 'White vestment reaching to the feet',
    symbolism: 'Purity of Soul'
  },
  {
    id: 'chasuble-white',
    name: 'White Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1628177461250-de572f3e4986?q=80&w=400&auto=format&fit=crop',
    description: 'For Easter, Christmas, and Saints',
    symbolism: LITURGICAL_COLORS.white.meaning
  },
  {
    id: 'chasuble-red',
    name: 'Red Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1616429329037-ea76935941a8?q=80&w=400&auto=format&fit=crop',
    description: 'For Pentecost and Martyrs',
    symbolism: LITURGICAL_COLORS.red.meaning
  },
  {
    id: 'chasuble-green',
    name: 'Green Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1618254536701-a3f2f81498a1?q=80&w=400&auto=format&fit=crop',
    description: 'For Ordinary Time',
    symbolism: LITURGICAL_COLORS.green.meaning
  },
  {
    id: 'chasuble-violet',
    name: 'Violet Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1611055903820-211420b92317?q=80&w=400&auto=format&fit=crop',
    description: 'For Advent and Lent',
    symbolism: LITURGICAL_COLORS.violet.meaning
  },
  {
    id: 'chasuble-rose',
    name: 'Rose Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1678729938217-374f67d4f0d2?q=80&w=400&auto=format&fit=crop',
    description: 'For Gaudete and Laetare Sundays',
    symbolism: LITURGICAL_COLORS.rose.meaning
  },
  {
    id: 'chasuble-black',
    name: 'Black Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1604586398438-a1c6e1e6b3b2?q=80&w=400&auto=format&fit=crop',
    description: 'For All Souls Day',
    symbolism: LITURGICAL_COLORS.black.meaning
  },
  {
    id: 'chasuble-gold',
    name: 'Gold Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1629733013233-2a4c3b0d740c?q=80&w=400&auto=format&fit=crop',
    description: 'For Solemnities',
    symbolism: LITURGICAL_COLORS.gold.meaning
  },
  {
    id: 'stole-priest',
    name: 'Priest Stole',
    category: 'vestments',
    subCategory: 'Accessory',
    src: 'https://images.unsplash.com/photo-1596707894341-a1d2d0c6fb0f?q=80&w=400&auto=format&fit=crop',
    description: 'Symbol of priestly authority',
    symbolism: 'Yoke of Christ'
  },
  {
    id: 'dalmatic',
    name: 'Dalmatic',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1632949666190-9c1e31d2a13f?q=80&w=400&auto=format&fit=crop',
    description: 'Vestment of the Deacon',
    symbolism: 'Joy and Service'
  },
  {
    id: 'cope-gold',
    name: 'Gold Cope',
    category: 'vestments',
    subCategory: 'Outer',
    src: 'https://images.unsplash.com/photo-1620002221652-337a6b0b31e9?q=80&w=400&auto=format&fit=crop',
    description: 'Ceremonial cape for processions',
    symbolism: LITURGICAL_COLORS.gold.meaning
  },
  {
    id: 'miter-precious',
    name: 'Precious Miter',
    category: 'vestments',
    subCategory: 'Headwear',
    src: 'https://images.unsplash.com/photo-1618366121233-14e3046755a9?q=80&w=400&auto=format&fit=crop',
    description: 'Bishop\'s headwear'
  },
  {
    id: 'brown-scapular',
    name: 'Brown Scapular',
    category: 'vestments',
    subCategory: 'Devotional',
    src: 'https://images.unsplash.com/photo-1601268243688-9f3730373e3a?q=80&w=400&auto=format&fit=crop',
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
    src: 'https://images.unsplash.com/photo-1593945391341-e94589d17f96?q=80&w=800&auto=format&fit=crop',
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
    src: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=800&auto=format&fit=crop',
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
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-crucifix-wood.png',
    description: 'Symbol of Sacrifice'
  },
  {
    id: 'obj-chalice',
    name: 'Gold Chalice',
    category: 'objects',
    subCategory: 'Liturgical',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-chalice.png',
    description: 'Sacred Vessel'
  },
  {
    id: 'obj-monstrance',
    name: 'Monstrance',
    category: 'objects',
    subCategory: 'Liturgical',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-monstrance.png',
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
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-paschal-candle.png',
    description: 'Alpha and Omega'
  },
  {
    id: 'obj-thurible',
    name: 'Thurible',
    category: 'objects',
    subCategory: 'Liturgical',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-thurible.png',
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
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-medal.png',
    description: 'O Mary conceived without sin'
  },
  
  // Effects & Symbols
  {
    id: 'obj-dove',
    name: 'Holy Spirit Dove',
    category: 'objects',
    subCategory: 'Symbols',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-dove.png',
    description: 'Symbol of Peace and Spirit'
  },
  {
    id: 'obj-halo-gold',
    name: 'Golden Halo',
    category: 'objects',
    subCategory: 'Effects',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-halo-gold.png',
    description: 'Sign of Sanctity'
  },
  {
    id: 'obj-halo-cross',
    name: 'Cruciform Halo',
    category: 'objects',
    subCategory: 'Effects',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-halo-cross.png',
    description: 'For Christ'
  },
  {
    id: 'obj-light-rays',
    name: 'Divine Rays',
    category: 'objects',
    subCategory: 'Effects',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-light-rays.png',
    description: 'Light from Heaven'
  },
  {
    id: 'obj-lily',
    name: 'White Lily',
    category: 'objects',
    subCategory: 'Nature',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-lily.png',
    description: 'Symbol of Purity'
  },
  {
    id: 'obj-rose-red',
    name: 'Red Rose',
    category: 'objects',
    subCategory: 'Nature',
    src: 'https://storage.googleapis.com/aistudio-hosting/saint-canvas/obj-rose-red.png',
    description: 'Symbol of Martyrdom'
  }
];