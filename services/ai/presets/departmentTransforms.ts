export interface DepartmentTransform {
  id: string;
  name: string;
  icon: string;
  category: string;
  prompt: string;
  description: string;
  contextTags: string[];
}

export const DEPARTMENT_TRANSFORMS: DepartmentTransform[] = [
  {
    id: 'fitter-turning',
    name: 'Fitter Turning',
    icon: '⚙️',
    category: 'Mechanical',
    prompt: 'Transform background to show precision metalworking workshop environment with lathes, cutting tools, metal shavings, industrial machinery, overhead workbench with measuring instruments, safety equipment, workshop lighting, mechanical precision atmosphere',
    description: 'Adds metalworking workshop context with precision tools and machinery',
    contextTags: ['workshop', 'machinery', 'tools', 'industrial']
  },
  {
    id: 'welding',
    name: 'Welding',
    icon: '🔥',
    category: 'Metalworking',
    prompt: 'Transform scene to welding workshop with welding equipment, sparks flying, protective gear hanging, welding masks, metal framework, industrial atmosphere, safety equipment, workshop tools, dramatic lighting effects',
    description: 'Creates welding workshop environment with sparks and industrial atmosphere',
    contextTags: ['welding', 'sparks', 'metalwork', 'industrial']
  },
  {
    id: 'masonry',
    name: 'Masonry',
    icon: '🧱',
    category: 'Construction',
    prompt: 'Transform background to masonry workshop with brick piles, cement mixing area, construction tools, scaffolding materials, stone blocks, measuring equipment, construction site atmosphere, building materials storage',
    description: 'Adds masonry and construction workshop context',
    contextTags: ['construction', 'bricks', 'mortar', 'building']
  },
  {
    id: 'tailoring',
    name: 'Tailoring',
    icon: '✂️',
    category: 'Textiles',
    prompt: 'Transform scene to professional tailoring workshop with sewing machines, fabric rolls, measuring tapes, mannequins, thread spools, cutting tables, textiles, fashion design atmosphere, craft workspace',
    description: 'Creates textile and fashion design workshop environment',
    contextTags: ['textiles', 'fashion', 'sewing', 'design']
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: '🔨',
    category: 'Woodworking',
    prompt: 'Transform background to carpentry workshop with wood planks, saws, chisels, workbenches, wood shavings, measuring tools, safety equipment, natural lighting, woodworking atmosphere, lumber storage',
    description: 'Adds woodworking shop context with tools and wood materials',
    contextTags: ['woodwork', 'tools', 'lumber', 'craft']
  },
  {
    id: 'motor-vehicle',
    name: 'Motor Vehicle',
    icon: '🚗',
    category: 'Automotive',
    prompt: 'Transform scene to automotive workshop with car parts, tools, garage lift, oil stains, tire racks, engine components, diagnostic equipment, workshop floor, industrial garage atmosphere',
    description: 'Creates automotive repair shop environment',
    contextTags: ['automotive', 'garage', 'repairs', 'tools']
  },
  {
    id: 'ict',
    name: 'ICT',
    icon: '💻',
    category: 'Technology',
    prompt: 'Transform background to modern IT workspace with computers, monitors, cables, servers, network equipment, coding environment, digital displays, tech laboratory atmosphere, clean tech environment',
    description: 'Adds information technology and computer lab context',
    contextTags: ['technology', 'computers', 'networking', 'digital']
  },
  {
    id: 'secretarial',
    name: 'Secretarial',
    icon: '📋',
    category: 'Administrative',
    prompt: 'Transform scene to professional office environment with desks, filing cabinets, documents, typewriters, office supplies, business atmosphere, administrative workspace, organized office setting',
    description: 'Creates traditional administrative office environment',
    contextTags: ['office', 'administration', 'business', 'documents']
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    category: 'Utilities',
    prompt: 'Transform background to plumbing workshop with pipes, fittings, water systems, plumbing tools, copper tubes, bathroom fixtures, workshop sink, utilities installation atmosphere',
    description: 'Adds plumbing and utilities workshop context',
    contextTags: ['plumbing', 'pipes', 'utilities', 'installation']
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    category: 'Utilities',
    prompt: 'Transform scene to electrical workshop with wire coils, electrical panels, circuit boards, testing equipment, safety gear, electrical components, power tools, electrical laboratory atmosphere',
    description: 'Creates electrical engineering workshop environment',
    contextTags: ['electrical', 'wiring', 'circuits', 'power']
  },
  {
    id: 'cosmetology',
    name: 'Cosmetology',
    icon: '💄',
    category: 'Beauty',
    prompt: 'Transform background to beauty salon with hair styling chairs, mirrors, beauty products, makeup stations, spa equipment, professional lighting, beauty treatment atmosphere, wellness environment',
    description: 'Adds cosmetology and beauty salon context',
    contextTags: ['beauty', 'salon', 'cosmetics', 'wellness']
  },
  {
    id: 'drafting',
    name: 'Drafting & Design',
    icon: '📐',
    category: 'Technical Drawing',
    prompt: 'Transform scene to technical drafting workspace with drawing boards, architectural plans, rulers, compasses, technical instruments, design sketches, precision drawing atmosphere, professional drafting environment',
    description: 'Creates technical drawing and design workspace',
    contextTags: ['drafting', 'design', 'technical', 'drawing']
  }
];

// Group departments by category for better organization
export const DEPARTMENT_CATEGORIES = [
  {
    name: 'Mechanical & Metalworking',
    departments: ['fitter-turning', 'welding', 'carpentry']
  },
  {
    name: 'Construction & Utilities', 
    departments: ['masonry', 'plumbing', 'electrical']
  },
  {
    name: 'Service Industries',
    departments: ['tailoring', 'motor-vehicle', 'cosmetology']
  },
  {
    name: 'Technology & Office',
    departments: ['ict', 'secretarial', 'drafting']
  }
];
