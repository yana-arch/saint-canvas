import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EditorState, Asset, Layer, HistoryState, Template } from './types';
import { v4 as uuidv4 } from 'uuid';

// Helper functions
const createSnapshot = (state: EditorState): HistoryState => ({
  baseImage: state.baseImage,
  layers: [...state.layers],
  canvasSettings: { ...state.canvasSettings }
});

// Validate layer data before applying changes
const validateLayerData = (changes: Partial<Layer>): Partial<Layer> => {
  const validated: Partial<Layer> = { ...changes };

  // Numeric validations
  if (changes.x !== undefined && (isNaN(changes.x) || !isFinite(changes.x))) validated.x = 0;
  if (changes.y !== undefined && (isNaN(changes.y) || !isFinite(changes.y))) validated.y = 0;
  if (changes.width !== undefined && (changes.width < 1 || isNaN(changes.width))) validated.width = 200;
  if (changes.height !== undefined && (changes.height < 1 || isNaN(changes.height))) validated.height = 200;
  if (changes.rotation !== undefined && isNaN(changes.rotation)) validated.rotation = 0;

  // Opacity range 0-1
  if (changes.opacity !== undefined) {
    if (changes.opacity < 0) validated.opacity = 0;
    if (changes.opacity > 1) validated.opacity = 1;
  }

  // Scale bounds
  if (changes.scaleX !== undefined && (changes.scaleX < 0.01 || changes.scaleX > 20)) {
    validated.scaleX = Math.max(0.01, Math.min(20, changes.scaleX));
  }
  if (changes.scaleY !== undefined && (changes.scaleY < 0.01 || changes.scaleY > 20)) {
    validated.scaleY = Math.max(0.01, Math.min(20, changes.scaleY));
  }

  // FontSize reasonable bounds
  if (changes.fontSize !== undefined && (changes.fontSize < 6 || changes.fontSize > 500)) {
    validated.fontSize = Math.max(6, Math.min(500, changes.fontSize));
  }

  // Blur radius reasonable
  if (changes.blur !== undefined && changes.blur < 0) validated.blur = 0;

  return validated;
};

// Auto-save key for localStorage
const AUTO_SAVE_KEY = 'saintcanvas-draft';

interface ExtendedEditorState extends EditorState {
  addLayer: (asset: Asset, position?: { x: number; y: number }, size?: { width: number; height: number }) => void;
  recoverDraft: () => boolean; // Returns true if draft was loaded
}

// Auto-save functionality
let autoSaveTimeout: NodeJS.Timeout | null = null;
const AUTO_SAVE_DELAY = 30000; // 30 seconds

const saveToLocalStorage = (state: EditorState) => {
  try {
    const draft = {
      baseImage: state.baseImage,
      layers: state.layers,
      canvasSettings: state.canvasSettings,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.warn('Failed to auto-save draft:', error);
  }
};

const scheduleAutoSave = (state: EditorState) => {
  if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => saveToLocalStorage(state), AUTO_SAVE_DELAY);
};

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
  selectedLayerIds: [],
  
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

  addLayer: (asset: Asset, position, size) => set((state) => {
    const snapshot = createSnapshot(state);

    // Use custom size if provided, otherwise default
    const defaultW = size?.width || 200;
    const defaultH = size?.height || 200;

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

  loadProject: (loadedState: HistoryState) => set(() => {
    // Clear history when loading a new project
    return {
      past: [],
      future: [],
      baseImage: loadedState.baseImage,
      layers: loadedState.layers,
      canvasSettings: loadedState.canvasSettings,
      selectedLayerId: null
    };
  }),

  updateLayer: (id, changes, saveToHistory = true) => set((state) => {
    // Validate changes before applying
    const validatedChanges = validateLayerData(changes);

    let updateObject: Partial<ExtendedEditorState> = {
      layers: state.layers.map(l => l.id === id ? { ...l, ...validatedChanges } : l)
    };

    if (saveToHistory) {
      const snapshot = createSnapshot(state);
      const newPast = [...state.past, snapshot].slice(-50); // Limit history to 50 steps
      updateObject = {
        ...updateObject,
        past: newPast,
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

  selectLayer: (id, multiSelect = false) => set((state) => {
    if (multiSelect && id) {
      // Multi-select: toggle the id in selectedLayerIds
      const isAlreadySelected = state.selectedLayerIds.includes(id);
      const newSelectedLayerIds = isAlreadySelected
        ? state.selectedLayerIds.filter(layerId => layerId !== id)
        : [...state.selectedLayerIds, id];

      return {
        selectedLayerId: newSelectedLayerIds.length === 1 ? id : null,
        selectedLayerIds: newSelectedLayerIds
      };
    } else {
      // Single select: deselect if same id, select if different
      const newId = state.selectedLayerId === id ? null : id;
      return {
        selectedLayerId: newId,
        selectedLayerIds: newId ? [newId] : []
      };
    }
  }),

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

  recoverDraft: () => {
    try {
      const draftStr = localStorage.getItem(AUTO_SAVE_KEY);
      if (!draftStr) return false;

      const draft = JSON.parse(draftStr);
      if (!draft.layers && !draft.baseImage) return false;

      // Load the draft
      set(() => ({
        baseImage: draft.baseImage,
        layers: draft.layers || [],
        canvasSettings: draft.canvasSettings,
        past: [],
        future: [],
        selectedLayerId: null
      }));

      // Clear the draft after recovery
      localStorage.removeItem(AUTO_SAVE_KEY);
      return true;
    } catch (error) {
      console.warn('Failed to recover draft:', error);
      return false;
    }
  },
}));

// Auto-save subscription
useStore.subscribe((state) => {
  // Trigger auto-save on any state change that affects the canvas
  if (state.layers.length > 0 || state.baseImage) {
    scheduleAutoSave(state);
  }
});
