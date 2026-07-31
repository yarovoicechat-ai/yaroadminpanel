'use client';

import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X } from 'lucide-react';
import { Button } from './Button';

interface ImageZoomModalProps {
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export function ImageZoomModal({ imageUrl, title, onClose }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setScale(1);
  }, [imageUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setScale(1);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full mx-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-6"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        {/* Header Bar */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{title || 'Avatar Preview'}</h3>
            <p className="text-xs text-slate-400">Use zoom controls or mouse wheel to inspect</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg"
                onClick={handleZoomOut}
                title="Zoom Out (-)"
              >
                <ZoomOut size={16} />
              </Button>
              
              <span className="text-xs font-mono font-bold text-purple-400 px-2 min-w-[50px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg"
                onClick={handleZoomIn}
                title="Zoom In (+)"
              >
                <ZoomIn size={16} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg ml-1"
                onClick={handleReset}
                title="Reset Zoom (100%)"
              >
                <RotateCcw size={15} />
              </Button>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 rounded-xl transition-all"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Image Container with Smooth Zoom */}
        <div className="relative flex-1 w-full min-h-[350px] max-h-[65vh] flex items-center justify-center overflow-auto rounded-xl bg-slate-950/80 border border-slate-800/60 p-4">
          <img
            src={imageUrl}
            alt={title || 'Avatar Preview'}
            className="max-h-[60vh] max-w-full object-contain transition-transform duration-150 ease-out select-none shadow-2xl rounded-lg"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
