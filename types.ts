

export type AssetCategory = 'saints' | 'vestments' | 'backgrounds' | 'objects' | 'ai-generated' | 'text';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subCategory?: string;
  src: string; // URL for the image
  description?: string;
  feastDay?: string;
  symbolism?: string;
  attributes?: string[];
}

export interface Layer {
  id: string;
  assetId?: string; // Optional for text layers
  type: AssetCategory | 'user-upload';
  name: string;
  src?: string; // Optional for text layers
  
  // Text specific
  text?: string;
  fontSize?: number;
  fill?: string; // Color
  fontFamily?: string;
  stroke?: string; // Text outline color
  strokeWidth?: number; // Text outline width

  // Transform
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  blendMode?: string; // GlobalCompositeOperation

  // Filters
  blur?: number;        // 0 to 40
  brightness?: number;  // -1 to 1
  contrast?: number;    // -100 to 100
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;

  // Shadows
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

export interface CanvasSettings {
  width: number;
  height: number;
  zoom: number;
  backgroundColor: string;
}

// Snapshot for history
export interface HistoryState {
  baseImage: { src: string; width: number; height: number } | null;
  layers: Layer[];
  canvasSettings: CanvasSettings;
}

// Project File Structure
export interface ProjectFile {
  version: string;
  timestamp: number;
  state: HistoryState;
}

export interface TemplateLayer {
  type: 'text' | 'image' | AssetCategory;
  name: string;
  text?: string; // For text layers
  src?: string; // For image layers
  assetId?: string; // If referencing a known asset
  xPercent: number; // 0-1 relative to canvas width
  yPercent: number; // 0-1 relative to canvas height
  widthPercent?: number;
  heightPercent?: number; // For images
  fontSize?: number;
  fill?: string;
  fontFamily?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  width: number;
  height: number;
  backgroundColor: string;
  baseImageSrc?: string; // Optional background image
  layers: TemplateLayer[];
}

export interface EditorState {
  // Canvas
  baseImage: { src: string; width: number; height: number } | null;
  canvasSettings: CanvasSettings;
  
  // Layers
  layers: Layer[];
  selectedLayerId: string | null;
  selectedLayerIds: string[]; // For multi-select
  
  // History
  past: HistoryState[];
  future: HistoryState[];
  
  // Actions
  setBaseImage: (src: string, width: number, height: number) => void;
  resizeCanvas: (width: number, height: number) => void;
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void;
  addLayer: (asset: Asset) => void;
  addTextLayer: () => void;
  loadTemplate: (template: Template) => void;
  loadProject: (state: HistoryState) => void;
  updateLayer: (id: string, changes: Partial<Layer>, saveToHistory?: boolean) => void;
  removeLayer: (id: string) => void;
  clearLayers: () => void;
  selectLayer: (id: string | null, multiSelect?: boolean) => void;
  moveLayer: (fromIndex: number, toIndex: number) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  resetCanvas: () => void;
  
  // Canvas View Actions
  setZoom: (zoom: number) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
}
