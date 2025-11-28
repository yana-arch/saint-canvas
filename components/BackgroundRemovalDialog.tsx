import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Wand2, Paintbrush, Undo2, RotateCw, Palette } from 'lucide-react';

interface BackgroundRemovalDialogProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApply: (resultImage: string) => void;
}

interface Point {
  x: number;
  y: number;
}

export const BackgroundRemovalDialog: React.FC<BackgroundRemovalDialogProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onApply
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [threshold, setThreshold] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tool, setTool] = useState<'wand' | 'brush'>('wand');
  const [brushSize, setBrushSize] = useState(20);
  const [clickedColor, setClickedColor] = useState<string>('#000000');

  // Initialize canvas with image
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const image = new Image();
    image.onload = () => {
      imageRef.current = image;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = image.width;
      canvas.height = image.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(image, 0, 0);

      // Initialize preview canvas
      const previewCanvas = previewCanvasRef.current;
      if (previewCanvas) {
        previewCanvas.width = image.width;
        previewCanvas.height = image.height;
        const previewCtx = previewCanvas.getContext('2d');
        previewCtx?.drawImage(image, 0, 0);
      }

      // Initialize color detection canvas with fully opaque pixels (alpha = 255)
      const colorCanvas = colorCanvasRef.current;
      if (colorCanvas) {
        colorCanvas.width = image.width;
        colorCanvas.height = image.height;
        const colorCtx = colorCanvas.getContext('2d');
        if (colorCtx) {
          // Fill with white and alpha 255 (fully opaque mask)
          colorCtx.fillStyle = 'rgba(255, 255, 255, 1)';
          colorCtx.fillRect(0, 0, image.width, image.height);
        }
      }
    };
    image.src = imageSrc;
  }, [isOpen, imageSrc]);

  const getColorAtPoint = (x: number, y: number): [number, number, number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(x, y, 1, 1);
    return Array.from(imageData.data) as [number, number, number, number];
  };

  const calculateColorDistance = (color1: [number, number, number, number], color2: [number, number, number, number]): number => {
    const [r1, g1, b1, a1] = color1;
    const [r2, g2, b2, a2] = color2;

    // For alpha, consider fully transparent pixels as "not similar"
    if (a1 === 0 && a2 === 0) return 0;
    if (a1 === 0 || a2 === 0) return 255;

    // Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(r1 - r2, 2) +
      Math.pow(g1 - g2, 2) +
      Math.pow(b1 - b2, 2)
    );
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const color = getColorAtPoint(x, y);
    if (!color) return;

    setClickedColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);

    if (tool === 'wand') {
      // Add point to selection for magic wand and process
      setSelectedPoints(prev => {
        const newPoints = [...prev, { x, y }];
        // Process magic wand with updated points
        setTimeout(() => processMagicWand(color), 0);
        return newPoints;
      });
    } else if (tool === 'brush') {
      // Apply brush stroke
      applyBrushStroke(x, y);
    }
  }, [tool]);

  const processMagicWand = useCallback((targetColor: [number, number, number, number]) => {
    const canvas = canvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    if (!canvas || !colorCanvas) return;

    const ctx = canvas.getContext('2d');
    const colorCtx = colorCanvas.getContext('2d');
    if (!ctx || !colorCtx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const colorImageData = colorCtx.getImageData(0, 0, canvas.width, canvas.height);

    const data = imageData.data;
    const colorData = colorImageData.data;

    let queue: Point[] = [];
    const visited = new Set<string>();

    // Add all selected points to queue
    selectedPoints.forEach(point => {
      const key = `${point.x},${point.y}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(point);
      }
    });

    // Add the last point in case it wasn't processed
    const lastPoint = selectedPoints[selectedPoints.length - 1];
    if (lastPoint && !visited.has(`${lastPoint.x},${lastPoint.y}`)) {
      visited.add(`${lastPoint.x},${lastPoint.y}`);
      queue.push(lastPoint);
    }

    // Flood fill based on color similarity
    while (queue.length > 0) {
      const point = queue.shift()!;
      const idx = (point.y * canvas.width + point.x) * 4;

      if (idx < 0 || idx >= data.length) continue;

      const pixelColor: [number, number, number, number] = [
        data[idx], data[idx + 1], data[idx + 2], data[idx + 3]
      ];

      const distance = calculateColorDistance(targetColor, pixelColor);

      if (distance <= threshold && colorData[idx + 3] > 0) { // Only process if not already marked transparent
        // Mark pixel as transparent
        colorData[idx + 3] = 0; // Set alpha to 0

        // Check 4-connected neighbors
        const neighbors: Point[] = [
          { x: point.x - 1, y: point.y },
          { x: point.x + 1, y: point.y },
          { x: point.x, y: point.y - 1 },
          { x: point.x, y: point.y + 1 }
        ];

        for (const neighbor of neighbors) {
          if (
            neighbor.x >= 0 && neighbor.x < canvas.width &&
            neighbor.y >= 0 && neighbor.y < canvas.height
          ) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (!visited.has(neighborKey)) {
              visited.add(neighborKey);
              queue.push(neighbor);
            }
          }
        }
      }
    }

    colorCtx.putImageData(colorImageData, 0, 0);
    updatePreview();
  }, [selectedPoints, threshold]);



  const applyBrushStroke = (x: number, y: number) => {
    const colorCanvas = colorCanvasRef.current;
    if (!colorCanvas) return;

    const ctx = colorCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out'; // Makes pixels transparent
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    updatePreview();
  };

  const updatePreview = () => {
    const previewCanvas = previewCanvasRef.current;
    const colorCanvas = colorCanvasRef.current;
    const originalCanvas = canvasRef.current;

    if (!previewCanvas || !colorCanvas || !originalCanvas) return;

    const previewCtx = previewCanvas.getContext('2d');
    const colorCtx = colorCanvas.getContext('2d');
    const originalCtx = originalCanvas.getContext('2d');

    if (!previewCtx || !colorCtx || !originalCtx) return;

    // Copy original image
    previewCtx.drawImage(originalCanvas, 0, 0);

    // Apply transparency mask
    const colorImageData = colorCtx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
    const previewImageData = previewCtx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);

    for (let i = 0; i < colorImageData.data.length; i += 4) {
      const alpha = colorImageData.data[i + 3];
      if (alpha === 0) {
        previewImageData.data[i + 3] = 0; // Make transparent
      }
    }

    previewCtx.putImageData(previewImageData, 0, 0);
  };

  const resetSelection = () => {
    setSelectedPoints([]);

    // Reset color canvas to fully opaque (alpha 255)
    const colorCanvas = colorCanvasRef.current;
    if (colorCanvas) {
      const ctx = colorCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
      }
    }

    // Reset preview
    const previewCanvas = previewCanvasRef.current;
    const originalCanvas = canvasRef.current;
    if (previewCanvas && originalCanvas) {
      const ctx = previewCanvas.getContext('2d');
      ctx?.drawImage(originalCanvas, 0, 0);
    }
  };

  const handleApply = () => {
    const previewCanvas = previewCanvasRef.current;
    if (!previewCanvas) return;

    setIsProcessing(true);

    try {
      const resultImage = previewCanvas.toDataURL('image/png');
      onApply(resultImage);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Remove Background</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Tool Selection */}
            <div className="flex gap-2">
              <button
                onClick={() => setTool('wand')}
                className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                  tool === 'wand' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Wand2 size={16} />
                Magic Wand
              </button>
              <button
                onClick={() => setTool('brush')}
                className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
                  tool === 'brush' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Paintbrush size={16} />
                Brush
              </button>
            </div>

            {/* Tool Settings */}
            {tool === 'wand' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tolerance:</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 w-8">{threshold}</span>
              </div>
            )}

            {tool === 'brush' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm text-gray-600 w-8">{brushSize}</span>
              </div>
            )}

            {/* Selected Color Info */}
            {tool === 'wand' && (
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-gray-500" />
                <div className="text-sm text-gray-700">
                  Selected: <span className="inline-block w-4 h-4 rounded border" style={{ backgroundColor: clickedColor }}></span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={resetSelection}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              >
                <Undo2 size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Original Image</h3>
              <div className="border border-gray-200 rounded overflow-hidden max-h-96">
                <canvas
                  ref={canvasRef}
                  className="cursor-crosshair max-w-full h-auto"
                  onClick={handleCanvasClick}
                />
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Preview</h3>
              <div className="border border-gray-200 rounded overflow-hidden max-h-96">
                <canvas
                  ref={previewCanvasRef}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Hidden canvases */}
          <canvas ref={colorCanvasRef} className="hidden" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Applying...' : 'Apply Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemovalDialog;
