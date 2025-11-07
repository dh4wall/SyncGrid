'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface ResizableImageProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  selected: boolean;
}

function ResizableImageComponent({ 
  node, 
  updateAttributes, 
  deleteNode, 
  selected 
}: ResizableImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  
  // Get dimensions from node attributes
  const getWidth = () => {
    if (node.attrs.width && node.attrs.width !== 'auto') {
      const parsed = parseInt(node.attrs.width);
      return isNaN(parsed) ? 400 : parsed;
    }
    return 400;
  };

  const getHeight = () => {
    if (node.attrs.height && node.attrs.height !== 'auto') {
      const parsed = parseInt(node.attrs.height);
      return isNaN(parsed) ? 300 : parsed;
    }
    if (imageRef.current && imageRef.current.naturalWidth > 0) {
      const aspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      return Math.round(getWidth() / aspectRatio);
    }
    return 300;
  };

  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());

  // Sync with node attributes
  useEffect(() => {
    if (!isResizing) {
      setWidth(getWidth());
      setHeight(getHeight());
    }
  }, [node.attrs.width, node.attrs.height, isResizing]);

  // Calculate height on image load
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleLoad = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const calculatedHeight = Math.round(width / aspectRatio);
        setHeight(calculatedHeight);
        updateAttributes({
          width: `${width}px`,
          height: `${calculatedHeight}px`,
        });
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, []);

  const handleResize = useCallback((e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startWidth = width;
    const startHeight = height;
    const aspectRatio = startWidth / startHeight;

    setIsResizing(true);

    let finalWidth = startWidth;
    let finalHeight = startHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let deltaX = moveEvent.clientX - startX;
      if (corner.includes('w')) deltaX = -deltaX;

      finalWidth = Math.max(50, Math.min(2000, startWidth + deltaX));
      finalHeight = Math.round(finalWidth / aspectRatio);

      setWidth(finalWidth);
      setHeight(finalHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Use the captured finalWidth and finalHeight instead of state
      console.log('🖼️ Saving image size:', { width: finalWidth, height: finalHeight });
      updateAttributes({
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, height, updateAttributes]);

  return (
    <NodeViewWrapper 
      className="inline-block my-4 mx-0"
      style={{ display: 'inline-block', verticalAlign: 'top' }}
    >
      <div
        ref={containerRef}
        className="relative inline-block group"
        data-drag-handle
        style={{
          width: `${width}px`,
          height: `${height}px`,
          outline: selected ? '2px solid #3b82f6' : 'none',
          outlineOffset: '4px',
          borderRadius: '8px',
          transition: 'outline 0.2s ease',
          cursor: 'move',
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className="rounded-lg select-none transition-shadow"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            boxShadow: selected ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
          }}
        />

        {selected && (
          <>
            {/* Resize Handles - Positioned outside the image */}
            <div
              className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 cursor-se-resize rounded-full border-2 border-white shadow-md z-10 transition-all hover:scale-110"
              onMouseDown={(e) => handleResize(e, 'se')}
              title="Resize"
            />
            <div
              className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 cursor-sw-resize rounded-full border-2 border-white shadow-md z-10 transition-all hover:scale-110"
              onMouseDown={(e) => handleResize(e, 'sw')}
              title="Resize"
            />
            <div
              className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 cursor-ne-resize rounded-full border-2 border-white shadow-md z-10 transition-all hover:scale-110"
              onMouseDown={(e) => handleResize(e, 'ne')}
              title="Resize"
            />
            <div
              className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 cursor-nw-resize rounded-full border-2 border-white shadow-md z-10 transition-all hover:scale-110"
              onMouseDown={(e) => handleResize(e, 'nw')}
              title="Resize"
            />
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteNode();
              }}
              className="absolute -top-2 -right-12 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-md z-10 transition-all hover:scale-105 flex items-center gap-1"
              title="Delete image"
            >
              <span>✕</span>
            </button>
            
            {/* Drag Hint - Floating overlay */}
            <div className="absolute top-2 left-2 bg-blue-500/95 text-white px-2.5 py-1.5 rounded-md text-xs font-medium shadow-md z-10 backdrop-blur-sm flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Drag to move</span>
            </div>
            
            {/* Size Indicator - Only during resize */}
            {isResizing && (
              <div className="absolute bottom-2 right-2 bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm font-mono shadow-lg z-10">
                {width} × {height}
              </div>
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: '400px' },
      height: { default: 'auto' },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
