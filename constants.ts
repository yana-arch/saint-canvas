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
    baseImageSrc: 'https://images.unsplash.com/photo-1502003194781-a6c38210343a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&q=80&w=1200&auto=format&fit=crop',
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
  // --- SAINTS --- (All verified working)
  {
    id: 'saint-mary',
    name: 'Virgin Mary',
    category: 'saints',
    subCategory: 'Holy Family',
    src: '../../assets/saints/virgin-mary.png',
    description: 'Mother of God',
    feastDay: 'Aug 15',
    attributes: ['Blue Mantle', 'Crown', 'Stars']
  },
  {
    id: 'saint-joseph',
    name: 'Saint Joseph',
    category: 'saints',
    subCategory: 'Holy Family',
    src: '../../assets/saints/saint-joseph.png',
    description: 'Patron of the Universal Church',
    feastDay: 'Mar 19',
    attributes: ['Lily', 'Carpenter Tools']
  },
  {
    id: 'saint-peter',
    name: 'Saint Peter',
    category: 'saints',
    subCategory: 'Apostles',
    src: '../../assets/saints/saint-peter.png',
    description: 'The First Pope',
    feastDay: 'Jun 29',
    attributes: ['Keys to Heaven', 'Inverted Cross', 'Papal Tiara']
  },
  {
    id: 'saint-paul',
    name: 'Saint Paul',
    category: 'saints',
    subCategory: 'Apostles',
    src: '../../assets/saints/saint-paul.png',
    description: 'Apostle to the Gentiles',
    feastDay: 'Jun 29',
    attributes: ['Sword', 'Book', 'Scroll']
  },
  {
    id: 'saint-francis',
    name: 'St. Francis of Assisi',
    category: 'saints',
    subCategory: 'Founders',
    src: '../../assets/saints/francis-of-assisi.png',
    description: 'Founder of the Franciscans',
    feastDay: 'Oct 4',
    attributes: ['Brown Habit', 'Stigmata', 'Animals', 'Crucifix']
  },
  {
    id: 'saint-therese',
    name: 'St. Thérèse of Lisieux',
    category: 'saints',
    subCategory: 'Doctors',
    src: '../../assets/saints/therese-of-lisieux.png',
    description: 'The Little Flower',
    feastDay: 'Oct 1',
    attributes: ['Roses', 'Crucifix']
  },
  {
    id: 'saint-anthony',
    name: 'St. Anthony of Padua',
    category: 'saints',
    subCategory: 'Doctors',
    src: '../../assets/saints/anthony-of-padua.png',
    description: 'Patron of Lost Things',
    feastDay: 'Jun 13',
    attributes: ['Child Jesus', 'Lily', 'Book']
  },
  {
    id: 'saint-michael',
    name: 'St. Michael Archangel',
    category: 'saints',
    subCategory: 'Angels',
    src: '../../assets/saints/michael-archangel.png',
    description: 'Prince of the Heavenly Host',
    feastDay: 'Sep 29',
    attributes: ['Sword', 'Scales', 'Demon']
  },

  // --- VESTMENTS --- (All verified working)
  {
    id: 'alb',
    name: 'Alb',
    category: 'vestments',
    subCategory: 'Base',
    src: '../../assets/vests/alb.png',
    description: 'White vestment reaching to the feet',
    symbolism: 'Purity of Soul'
  },
  {
    id: 'chasuble-white',
    name: 'White Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/white-chasuble.png',
    description: 'For Easter, Christmas, and Saints',
    symbolism: LITURGICAL_COLORS.white.meaning
  },
  {
    id: 'chasuble-red',
    name: 'Red Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/red-chasuble.png',
    description: 'For Pentecost and Martyrs',
    symbolism: LITURGICAL_COLORS.red.meaning
  },
  {
    id: 'chasuble-green',
    name: 'Green Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/green-chasuble.png',
    description: 'For Ordinary Time',
    symbolism: LITURGICAL_COLORS.green.meaning
  },
  {
    id: 'chasuble-violet',
    name: 'Violet Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/violet-chasuble.png',
    description: 'For Advent and Lent',
    symbolism: LITURGICAL_COLORS.violet.meaning
  },
  {
    id: 'chasuble-rose',
    name: 'Rose Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/rose-chasuble.png',
    description: 'For Gaudete and Laetare Sundays',
    symbolism: LITURGICAL_COLORS.rose.meaning
  },
  {
    id: 'chasuble-black',
    name: 'Black Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/black-chasuble.png',
    description: 'For All Souls Day',
    symbolism: LITURGICAL_COLORS.black.meaning
  },
  {
    id: 'chasuble-gold',
    name: 'Gold Chasuble',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/gold-chasuble.png',
    description: 'For Solemnities',
    symbolism: LITURGICAL_COLORS.gold.meaning
  },
  {
    id: 'stole-priest',
    name: 'Priest Stole',
    category: 'vestments',
    subCategory: 'Accessory',
    src: '../../assets/vests/priest-stole.png',
    description: 'Symbol of priestly authority',
    symbolism: 'Yoke of Christ'
  },
  {
    id: 'dalmatic',
    name: 'Dalmatic',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/dalmatic.png',
    description: 'Vestment of the Deacon',
    symbolism: 'Joy and Service'
  },
  {
    id: 'cope-gold',
    name: 'Gold Cope',
    category: 'vestments',
    subCategory: 'Outer',
    src: '../../assets/vests/gold-cope.png',
    description: 'Ceremonial cape for processions',
    symbolism: LITURGICAL_COLORS.gold.meaning
  },
  {
    id: 'miter-precious',
    name: 'Precious Miter',
    category: 'vestments',
    subCategory: 'Headwear',
    src: '../../assets/vests/precious-miter.png',
    description: "Bishop's headwear"
  },
  {
    id: 'brown-scapular',
    name: 'Brown Scapular',
    category: 'vestments',
    subCategory: 'Devotional',
    src: '../../assets/vests/brown-scapular.png',
    description: 'Our Lady of Mount Carmel'
  },

  // --- BACKGROUNDS --- (All verified working)
  {
    id: 'bg-church-altar',
    name: 'High Altar',
    category: 'backgrounds',
    subCategory: 'Interior',
    src: '../../assets/backgrounds/high-altar.png',
    description: 'Classic Cathedral Altar'
  },
  {
    id: 'bg-church-nave',
    name: 'Church Nave',
    category: 'backgrounds',
    subCategory: 'Interior',
    src: '../../assets/backgrounds/church-nave.png',
    description: 'View down the aisle'
  },
  {
    id: 'bg-stained-glass',
    name: 'Rose Window',
    category: 'backgrounds',
    subCategory: 'Decorative',
    src: '../../assets/backgrounds/rose-window.png',
    description: 'Gothic Stained Glass'
  },
  {
    id: 'bg-stained-glass-blue',
    name: 'Blue Glass',
    category: 'backgrounds',
    subCategory: 'Decorative',
    src: '../../assets/backgrounds/blue-glass.png',
    description: 'Marian Theme Glass'
  },
  {
    id: 'bg-heaven-clouds',
    name: 'Heavenly Clouds',
    category: 'backgrounds',
    subCategory: 'Spiritual',
    src: '../../assets/backgrounds/heavenly-clouds.png',
    description: 'Ethereal atmosphere'
  },
  {
    id: 'bg-heaven-golden',
    name: 'Golden Glory',
    category: 'backgrounds',
    subCategory: 'Spiritual',
    src: '../../assets/backgrounds/golden-glory.png',
    description: 'Divine Light'
  },
  {
    id: 'bg-vatican',
    name: "St. Peter's Square",
    category: 'backgrounds',
    subCategory: 'Location',
    src: '../../assets/backgrounds/st-peter-square.png',
    description: 'Vatican City'
  },
  {
    id: 'bg-holy-land',
    name: 'Holy Land',
    category: 'backgrounds',
    subCategory: 'Location',
    src: '../../assets/backgrounds/holy-land.png',
    description: 'Jerusalem Landscape'
  },

  // --- OBJECTS --- (Custom GCS + verified Unsplash)
  {
    id: 'obj-crucifix-wood',
    name: 'Wooden Crucifix',
    category: 'objects',
    subCategory: 'Liturgical',
    src: '../../assets/objects/wooden-crucifix.png',
    description: 'Symbol of Sacrifice'
  },
  {
    id: 'obj-chalice',
    name: 'Gold Chalice',
    category: 'objects',
    subCategory: 'Liturgical',
    src: '../../assets/objects/gold-chalice.png',
    description: 'Sacred Vessel'
  },
  {
    id: 'obj-monstrance',
    name: 'Monstrance',
    category: 'objects',
    subCategory: 'Liturgical',
    src: '../../assets/objects/monstrance.png',
    description: 'For Eucharistic Adoration'
  },
  {
    id: 'obj-candle',
    name: 'Altar Candle',
    category: 'objects',
    subCategory: 'Liturgical',
    src: '../../assets/objects/altar-candles.png',
    description: 'Light of Christ'
  },
  {
    id: 'obj-paschal-candle',
    name: 'Paschal Candle',
    category: 'objects',
    subCategory: 'Liturgical',
    src: '../../assets/objects/paschal-candle.png',
    description: 'Alpha and Omega'
  },
  {
    id: 'obj-thurible',
    name: 'Thurible',
    category: 'objects',
    subCategory: 'Liturgical',
    src: '../../assets/objects/thurible.png',
    description: 'Incense Burner'
  },
  {
    id: 'obj-bible',
    name: 'Holy Bible',
    category: 'objects',
    subCategory: 'Books',
    src: '../../assets/objects/holy-bible.png',
    description: 'Word of God'
  },
  {
    id: 'obj-rosary',
    name: 'Rosary',
    category: 'objects',
    subCategory: 'Devotional',
    src: '../../assets/objects/rosary.png',
    description: 'Marian Devotion'
  },
  {
    id: 'obj-medal',
    name: 'Miraculous Medal',
    category: 'objects',
    subCategory: 'Marian',
    src: '../../assets/objects/miraculous-medal.png',
    description: 'O Mary conceived without sin'
  },
  {
    id: 'obj-dove',
    name: 'Holy Spirit Dove',
    category: 'objects',
    subCategory: 'Symbols',
    src: '../../assets/objects/holy-spirit-dove.png',
    description: 'Symbol of Peace and Spirit'
  },
  {
    id: 'obj-halo-gold',
    name: 'Golden Halo',
    category: 'objects',
    subCategory: 'Effects',
    src: '../../assets/objects/golden-halo.png',
    description: 'Sign of Sanctity'
  },
  {
    id: 'obj-halo-cross',
    name: 'Cruciform Halo',
    category: 'objects',
    subCategory: 'Effects',
    src: '../../assets/objects/cruciform-halo.png',
    description: 'For Christ'
  },
  {
    id: 'obj-light-rays',
    name: 'Divine Rays',
    category: 'objects',
    subCategory: 'Effects',
    src: '../../assets/objects/divine-rays.png',
    description: 'Light from Heaven'
  },
  {
    id: 'obj-lily',
    name: 'White Lily',
    category: 'objects',
    subCategory: 'Nature',
    src: '../../assets/objects/white-lily.png',
    description: 'Symbol of Purity'
  },
  {
    id: 'obj-rose-red',
    name: 'Red Rose',
    category: 'objects',
    subCategory: 'Nature',
    src: '../../assets/objects/red-rose.png',
    description: 'Symbol of Martyrdom'
  }
];
