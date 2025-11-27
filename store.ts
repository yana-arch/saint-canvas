import { create } from 'zustand';
import { EditorState, Asset, Layer, HistoryState, Template } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper to create a snapshot of the current state
const createSnapshot = (state: EditorState): HistoryState => ({
  baseImage: state.baseImage,
  layers: [...state.layers],
  canvasSettings: { ...state.canvasSettings }
});

interface ExtendedEditorState extends EditorState {
  addLayer: (asset: Asset, position?: { x: number; y: number }) => void;
}

export const useStore = create<ExtendedEditorState>((set, get) => ({
  baseImage: null,
  canvasSettings: {
    width: 800,
    height: 600,
    zoom: 1,
    backgroundColor: '#ffffff',
  },
  layers: [],
  selectedLayerId: null,
  
  past: [],
  future: [],

  setBaseImage: (src, width, height) => set((state) => {
    const snapshot = createSnapshot(state);
    return { 
      past: [...state.past, snapshot],
      future: [],
      baseImage: { src, width, height },
      // Automatically resize canvas to fit the new base image
      canvasSettings: {
        ...state.canvasSettings,
        width: width,
        height: height
      }
    };
  }),

  resizeCanvas: (width, height) => set((state) => {
    const snapshot = createSnapshot(state);
    return {
      past: [...state.past, snapshot],
      future: [],
      canvasSettings: {
        ...state.canvasSettings,
        width,
        height
      }
    };
  }),

  updateCanvasSettings: (settings) => set((state) => {
     const isVisualChange = settings.backgroundColor !== undefined || settings.width !== undefined || settings.height !== undefined;
     
     let newState = {
       canvasSettings: { ...state.canvasSettings, ...settings }
     };

     if (isVisualChange) {
        const snapshot = createSnapshot(state);
        return {
           ...newState,
           past: [...state.past, snapshot],
           future: []
        }
     }
     
     return newState;
  }),

  addLayer: (asset: Asset, position) => set((state) => {
    const snapshot = createSnapshot(state);
    
    // Default width/height
    const defaultW = 200;
    const defaultH = 200;

    // Calculate position: use provided drop position or center
    const x = position ? position.x : state.canvasSettings.width / 2 - (defaultW / 2);
    const y = position ? position.y : state.canvasSettings.height / 2 - (defaultH / 2);

    const newLayer: Layer = {
      id: uuidv4(),
      assetId: asset.id,
      type: asset.category,
      name: asset.name,
      src: asset.src,
      x: x,
      y: y,
      width: defaultW,
      height: defaultH,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'source-over',
      blur: 0,
      brightness: 0,
      contrast: 0,
      grayscale: false,
      sepia: false,
      invert: false,
      // Default Shadow
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0.5
    };
    return {
      past: [...state.past, snapshot],
      future: [],
      layers: [...state.layers, newLayer],
      selectedLayerId: newLayer.id,
    };
  }),

  addTextLayer: () => set((state) => {
    const snapshot = createSnapshot(state);
    const newLayer: Layer = {
      id: uuidv4(),
      type: 'text',
      name: 'Text Layer',
      text: 'Double click to edit',
      fontSize: 24,
      fill: '#000000',
      stroke: '',
      strokeWidth: 0,
      fontFamily: 'Cinzel',
      x: state.canvasSettings.width / 2 - 100,
      y: state.canvasSettings.height / 2 - 20,
      width: 200,
      height: 50,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      locked: false,
      blendMode: 'source-over',
      blur: 0,
      brightness: 0,
      contrast: 0,
      grayscale: false,
      sepia: false,
      invert: false,
      // Default Shadow
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0.5
    };
    return {
      past: [...state.past, snapshot],
      future: [],
      layers: [...state.layers, newLayer],
      selectedLayerId: newLayer.id,
    };
  }),

  loadTemplate: (template: Template) => set((state) => {
    const snapshot = createSnapshot(state);
    
    // Convert template layers to actual layers
    const newLayers: Layer[] = template.layers.map(tl => {
        const id = uuidv4();
        // Calculate centered positions based on percentage
        const x = template.width * tl.xPercent;
        const y = template.height * tl.yPercent;
        
        const baseLayer: Partial<Layer> = {
            id,
            name: tl.name,
            x, 
            y,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            visible: true,
            locked: false,
            // Default effects
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowOpacity: 0.5,
            grayscale: false,
            sepia: false,
            invert: false
        };

        if (tl.type === 'text') {
            return {
                ...baseLayer,
                type: 'text',
                text: tl.text || 'Text',
                fontSize: tl.fontSize || 24,
                fontFamily: tl.fontFamily || 'Cinzel',
                fill: tl.fill || '#000000',
                stroke: '',
                strokeWidth: 0,
                width: 200, // Approximate
                height: 50,
                x: x - 100,
                y: y - 25
            } as Layer;
        } else {
            return {
                ...baseLayer,
                type: tl.type as any,
                src: tl.src || '',
                width: 200,
                height: 200,
                x: x - 100,
                y: y - 100
            } as Layer;
        }
    });

    return {
      past: [...state.past, snapshot],
      future: [],
      baseImage: template.baseImageSrc ? { src: template.baseImageSrc, width: template.width, height: template.height } : null,
      layers: newLayers,
      selectedLayerId: null,
      canvasSettings: {
        ...state.canvasSettings,
        width: template.width,
        height: template.height,
        backgroundColor: template.backgroundColor
      }
    };
  }),

  loadProject: (loadedState: HistoryState) => set((state) => {
    const snapshot = createSnapshot(state);
    return {
      past: [...state.past, snapshot],
      future: [],
      baseImage: loadedState.baseImage,
      layers: loadedState.layers,
      canvasSettings: loadedState.canvasSettings,
      selectedLayerId: null
    };
  }),

  updateLayer: (id, changes, saveToHistory = true) => set((state) => {
    let updateObject: Partial<ExtendedEditorState> = {
      layers: state.layers.map(l => l.id === id ? { ...l, ...changes } : l)
    };

    if (saveToHistory) {
      const snapshot = createSnapshot(state);
      updateObject = {
        ...updateObject,
        past: [...state.past, snapshot],
        future: []
      };
    }
    
    return updateObject;
  }),

  removeLayer: (id) => set((state) => {
    const snapshot = createSnapshot(state);
    return {
      past: [...state.past, snapshot],
      future: [],
      layers: state.layers.filter(l => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    };
  }),

  clearLayers: () => set((state) => {
    const snapshot = createSnapshot(state);
    return {
      past: [...state.past, snapshot],
      future: [],
      layers: [],
      selectedLayerId: null
    };
  }),

  selectLayer: (id) => set({ selectedLayerId: id }),

  moveLayer: (fromIndex, toIndex) => set((state) => {
    const snapshot = createSnapshot(state);
    const newLayers = [...state.layers];
    const [moved] = newLayers.splice(fromIndex, 1);
    newLayers.splice(toIndex, 0, moved);
    return { 
      past: [...state.past, snapshot],
      future: [],
      layers: newLayers 
    };
  }),

  toggleLayerVisibility: (id) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l)
  })),

  toggleLayerLock: (id) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l)
  })),

  resetCanvas: () => set((state) => {
    const snapshot = createSnapshot(state);
    return {
      past: [...state.past, snapshot],
      future: [],
      baseImage: null,
      layers: [],
      selectedLayerId: null,
      canvasSettings: { 
        width: 800, 
        height: 600, 
        zoom: 1, 
        backgroundColor: '#ffffff' 
      }
    };
  }),

  setZoom: (zoom) => set((state) => ({
    canvasSettings: { ...state.canvasSettings, zoom: Math.max(0.05, Math.min(5, zoom)) }
  })),

  undo: () => set((state) => {
    if (state.past.length === 0) return {};
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    
    const currentSnapshot = createSnapshot(state);
    
    return {
      baseImage: previous.baseImage,
      layers: previous.layers,
      canvasSettings: previous.canvasSettings,
      past: newPast,
      future: [currentSnapshot, ...state.future],
      selectedLayerId: null,
    };
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return {};
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    
    const currentSnapshot = createSnapshot(state);

    return {
      baseImage: next.baseImage,
      layers: next.layers,
      canvasSettings: next.canvasSettings,
      past: [...state.past, currentSnapshot],
      future: newFuture,
      selectedLayerId: null,
    };
  }),
}));