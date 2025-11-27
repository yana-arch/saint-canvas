import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Stage, Layer as KonvaLayer, Image as KonvaImage, Text as KonvaText, Transformer, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import { useStore } from '../store';
import { Layer, Asset } from '../types';
import Konva from 'konva';
import { ZoomIn, ZoomOut, Maximize, Scan } from 'lucide-react';

interface CanvasItemProps {
  layer: Layer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<Layer>, saveToHistory: boolean) => void;
}

// Unified component for Image or Text layers
const CanvasItem: React.FC<CanvasItemProps> = ({ 
  layer, 
  isSelected, 
  onSelect, 
  onChange 
}) => {
  const [image] = useImage(layer.src || '', 'anonymous');
  const shapeRef = useRef<any>(null); // Type is roughly Konva.Image | Konva.Text
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Apply filters when image loads or filter props change
  useEffect(() => {
    if (layer.type !== 'text' && shapeRef.current && image) {
      // Re-apply cache if needed for some filters, but standard filters work dynamically
      // For best performance/rendering with filters like blur, caching is often required by Konva
      if (layer.blur || layer.brightness || layer.contrast || layer.grayscale || layer.sepia || layer.invert) {
        shapeRef.current.cache();
      } else {
        shapeRef.current.clearCache();
      }
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [image, layer.blur, layer.brightness, layer.contrast, layer.grayscale, layer.sepia, layer.invert, layer.width, layer.height]);

  // For text editing
  const handleTextDblClick = () => {
    if (layer.type !== 'text') return;
    const newText = prompt("Edit Text:", layer.text);
    if (newText !== null) {
      onChange({ text: newText }, true);
    }
  };

  if (!layer.visible) return null;

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    x: layer.x,
    y: layer.y,
    rotation: layer.rotation,
    scaleX: layer.scaleX,
    scaleY: layer.scaleY,
    opacity: layer.opacity,
    draggable: !layer.locked,
    globalCompositeOperation: (layer.blendMode || 'source-over') as any,
    // Shadow Props
    shadowColor: layer.shadowColor || '#000000',
    shadowBlur: layer.shadowBlur || 0,
    shadowOpacity: layer.shadowOpacity ?? 0.5,
    shadowOffset: { x: layer.shadowOffsetX || 0, y: layer.shadowOffsetY || 0 },
    
    onDragEnd: (e: any) => {
      onChange({
        x: e.target.x(),
        y: e.target.y(),
      }, true); // Save history on drag end
    },
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      if (!node) return;
      onChange({
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      }, true);
    }
  };

  // Prepare filters array
  const filters = [];
  if (layer.blur) filters.push(Konva.Filters.Blur);
  if (layer.brightness) filters.push(Konva.Filters.Brighten);
  if (layer.contrast) filters.push(Konva.Filters.Contrast);
  if (layer.grayscale) filters.push(Konva.Filters.Grayscale);
  if (layer.sepia) filters.push(Konva.Filters.Sepia);
  if (layer.invert) filters.push(Konva.Filters.Invert);

  return (
    <>
      {layer.type === 'text' ? (
        <KonvaText
          {...commonProps}
          text={layer.text}
          fontSize={layer.fontSize}
          fontFamily={layer.fontFamily}
          fill={layer.fill}
          stroke={layer.stroke}
          strokeWidth={layer.strokeWidth}
          onDblClick={handleTextDblClick}
        />
      ) : (
        <KonvaImage
          {...commonProps}
          image={image}
          width={layer.width}
          height={layer.height}
          filters={filters}
          blurRadius={layer.blur || 0}
          brightness={layer.brightness || 0}
          contrast={layer.contrast || 0}
        />
      )}

      {isSelected && !layer.locked && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
          anchorStroke="#d97706"
          anchorFill="#ffffff"
          anchorSize={8}
          borderStroke="#d97706"
          enabledAnchors={layer.type === 'text' ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] : undefined} 
        />
      )}
    </>
  );
};

export const EditorCanvas: React.FC<{ stageRef: React.RefObject<Konva.Stage> }> = ({ stageRef }) => {
  const { layers, selectedLayerId, selectLayer, updateLayer, addLayer, canvasSettings, baseImage, setZoom } = useStore();
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [bgImage] = useImage(baseImage?.src || '', 'anonymous');

  useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Auto-fit when base image (and thus canvas size) changes
  useEffect(() => {
    if (containerSize.width > 0 && canvasSettings.width > 0 && baseImage) {
        handleFitToScreen();
    }
  }, [baseImage?.src, baseImage?.width, baseImage?.height]); // Only trigger when source/dimensions change

  const handleFitToScreen = () => {
    if (containerSize.width === 0 || canvasSettings.width === 0) return;
    
    const padding = 60;
    const scaleX = (containerSize.width - padding) / canvasSettings.width;
    const scaleY = (containerSize.height - padding) / canvasSettings.height;
    
    // Fit completely visible, but don't zoom in excessively if image is tiny
    const fitZoom = Math.min(scaleX, scaleY);
    setZoom(fitZoom);
  };

  const handleDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectLayer(null);
    }
  };

  const stageWidth = containerSize.width;
  const stageHeight = containerSize.height;
  const zoom = canvasSettings.zoom;

  // Center the workspace content based on zoom
  const workAreaX = (stageWidth - canvasSettings.width * zoom) / 2;
  const workAreaY = (stageHeight - canvasSettings.height * zoom) / 2;

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    try {
        const assetData = e.dataTransfer.getData('application/json');
        if (!assetData) return;
        
        const asset: Asset = JSON.parse(assetData);
        
        // Get drop position relative to the stage container
        // Note: stage.getPointerPosition() works with mouse events, but here we have a native DragEvent.
        // We need to calculate manually relative to the container.
        const stageRect = containerRef.current?.getBoundingClientRect();
        if (!stageRect) return;

        const pointerX = e.clientX - stageRect.left;
        const pointerY = e.clientY - stageRect.top;

        // The workArea is transformed by {x: workAreaX, y: workAreaY, scale: zoom}
        // LocalX = (PointerX - WorkAreaX) / Zoom
        
        const localX = (pointerX - workAreaX) / zoom;
        const localY = (pointerY - workAreaY) / zoom;
        
        // Center the new asset (assuming 200x200 default size from store) around the cursor
        // Store defaultW/H is 200, so subtract 100 to center
        const centeredX = localX - 100;
        const centeredY = localY - 100;

        addLayer(asset, { x: centeredX, y: centeredY });

    } catch (err) {
        console.error("Failed to parse dropped asset", err);
    }
  };

  return (
    <div 
      className="w-full h-full bg-stone-200 overflow-hidden relative group" 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{backgroundImage: 'radial-gradient(#965a3e 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
       </div>

      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleDeselect}
        onTouchStart={handleDeselect}
        ref={stageRef}
      >
        <KonvaLayer>
          {/* Main Content Group transformed by Zoom and centered */}
          <Group 
             name="workArea"
             x={workAreaX} 
             y={workAreaY} 
             scaleX={zoom} 
             scaleY={zoom}
          >
            {/* Work Area Background */}
            <Rect
              x={0}
              y={0}
              width={canvasSettings.width}
              height={canvasSettings.height}
              fill={canvasSettings.backgroundColor || "#ffffff"}
              shadowBlur={20}
              shadowColor="rgba(0,0,0,0.2)"
            />
            
            {/* Base Image */}
            {baseImage && bgImage && (
               <KonvaImage
                  key={baseImage.src}
                  image={bgImage}
                  x={0}
                  y={0}
                  width={canvasSettings.width}
                  height={canvasSettings.height}
                  opacity={1}
               />
            )}

            {/* Asset Layers */}
            {layers.map((layer) => (
              <CanvasItem
                key={layer.id}
                layer={layer}
                isSelected={layer.id === selectedLayerId}
                onSelect={() => selectLayer(layer.id)}
                onChange={(newAttrs, save) => updateLayer(layer.id, newAttrs, save)}
              />
            ))}
          </Group>
        </KonvaLayer>
      </Stage>
      
      {/* Canvas Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg text-xs text-gray-500 pointer-events-none z-10 flex items-center gap-2">
         <span>Canvas: {canvasSettings.width} x {canvasSettings.height}px</span>
         <span className="w-px h-3 bg-gray-300"></span>
         <span>{Math.round(zoom * 100)}%</span>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col bg-white rounded-lg shadow-md border border-holy-200 overflow-hidden z-20">
         <button 
           onClick={() => setZoom(zoom + 0.1)}
           className="p-2 hover:bg-holy-50 text-gray-600 hover:text-holy-700 transition-colors"
           title="Zoom In"
         >
           <ZoomIn size={18} />
         </button>
         <div className="h-px bg-gray-100"></div>
         <button 
           onClick={handleFitToScreen}
           className="p-2 hover:bg-holy-50 text-gray-600 hover:text-holy-700 transition-colors"
           title="Fit to Screen"
         >
           <Scan size={18} />
         </button>
         <div className="h-px bg-gray-100"></div>
         <button 
           onClick={() => setZoom(1)}
           className="p-2 hover:bg-holy-50 text-gray-600 hover:text-holy-700 transition-colors font-mono text-xs"
           title="Reset to 100%"
         >
           100%
         </button>
         <div className="h-px bg-gray-100"></div>
         <button 
           onClick={() => setZoom(zoom - 0.1)}
           className="p-2 hover:bg-holy-50 text-gray-600 hover:text-holy-700 transition-colors"
           title="Zoom Out"
         >
           <ZoomOut size={18} />
         </button>
      </div>
    </div>
  );
};