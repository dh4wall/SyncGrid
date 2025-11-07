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
  
  // Get dimensions from node attributes or calculate from natural size
  const getWidth = () => {
    if (node.attrs.width && node.attrs.width !== 'auto') {
      return parseInt(node.attrs.width);
    }
    return 400; // Default width
  };

  const getHeight = () => {
    if (node.attrs.height && node.attrs.height !== 'auto') {
      return parseInt(node.attrs.height);
    }
    // Calculate from width and aspect ratio
    if (imageRef.current) {
      const aspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      return Math.round(getWidth() / aspectRatio);
    }
    return 300; // Default height
  };

  const [width, setWidth] = useState(getWidth());
  const [height, setHeight] = useState(getHeight());

  // Update local state when node attributes change (for real-time sync)
  useEffect(() => {
    if (!isResizing) {
      setWidth(getWidth());
      setHeight(getHeight());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.attrs.width, node.attrs.height, isResizing]);

  // Calculate aspect ratio when image loads
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleLoad = () => {
      if (!node.attrs.height || node.attrs.height === 'auto') {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const calculatedHeight = Math.round(width / aspectRatio);
        setHeight(calculatedHeight);
      }
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener('load', handleLoad);
      return () => img.removeEventListener('load', handleLoad);
    }
  }, [node.attrs.height, width]);

  const handleResize = useCallback((e: React.MouseEvent, corner: 'se' | 'sw' | 'ne' | 'nw') => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    const aspectRatio = startWidth / startHeight;

    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      let deltaX = moveEvent.clientX - startX;
      let deltaY = moveEvent.clientY - startY;

      // Adjust delta based on corner
      if (corner.includes('w')) {
        deltaX = -deltaX; // Reverse for west corners
      }
      if (corner.includes('n')) {
        deltaY = -deltaY; // Reverse for north corners
      }

      // Calculate new width, maintaining aspect ratio
      let newWidth = startWidth + deltaX;
      
      // Apply constraints
      const minSize = 50;
      const maxSize = 2000;
      newWidth = Math.max(minSize, Math.min(maxSize, newWidth));
      
      // Calculate height from aspect ratio
      const newHeight = Math.round(newWidth / aspectRatio);

      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Save to node attributes
      updateAttributes({
        width: `${width}px`,
        height: `${height}px`,
      });

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, height, updateAttributes]);

  return (
    <NodeViewWrapper 
      className="relative inline-block my-4"
      data-drag-handle
    >
      <div
        ref={containerRef}
        className={`relative inline-block ${selected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className="rounded-lg cursor-move"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            userSelect: 'none',
          }}
        />

        {selected && (
          <>
            {/* Resize Handles */}
            <div
              className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 hover:bg-blue-600 cursor-se-resize rounded-full border-2 border-white shadow-lg z-10"
              onMouseDown={(e) => handleResize(e, 'se')}
              title="Resize"
            />
            <div
              className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-500 hover:bg-blue-600 cursor-sw-resize rounded-full border-2 border-white shadow-lg z-10"
              onMouseDown={(e) => handleResize(e, 'sw')}
              title="Resize"
            />
            <div
              className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 hover:bg-blue-600 cursor-ne-resize rounded-full border-2 border-white shadow-lg z-10"
              onMouseDown={(e) => handleResize(e, 'ne')}
              title="Resize"
            />
            <div
              className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 hover:bg-blue-600 cursor-nw-resize rounded-full border-2 border-white shadow-lg z-10"
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
              className="absolute -top-2 right-8 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg z-10 transition-colors"
              title="Delete image"
            >
              ✕ Delete
            </button>

            {/* Size Indicator (during resize) */}
            {isResizing && (
              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm font-mono shadow-lg z-10">
                {width} × {height}
              </div>
            )}

            {/* Drag Hint */}
            <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              ↕ Drag to move
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImageV2 = Node.create({
  name: 'resizableImage',

  group: 'block',

  draggable: true, // Enable drag-and-drop

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '400px',
      },
      height: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent, {
      contentDOMElementTag: 'div',
    });
  },
});
