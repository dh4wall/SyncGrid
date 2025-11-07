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
  const [isResizing, setIsResizing] = useState(false);
  
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

  useEffect(() => {
    if (!isResizing) {
      setWidth(getWidth());
      setHeight(getHeight());
    }
  }, [node.attrs.width, node.attrs.height, isResizing]);

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
      as="span"
      className="inline-block align-top my-2"
      contentEditable={false}
      draggable
      data-drag-handle
    >
      <span
        className="relative inline-block"
        style={{
          display: 'inline-block',
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            borderRadius: '0.5rem',
            boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
          }}
        />

        {selected && (
          <>
            {/* Resize Handles */}
            {['se', 'sw', 'ne', 'nw'].map((corner) => (
              <div
                key={corner}
                className={`absolute w-3 h-3 bg-blue-500 hover:bg-blue-600 rounded-full border border-white cursor-${corner}-resize`}
                style={{
                  [corner.includes('s') ? 'bottom' : 'top']: '-6px',
                  [corner.includes('e') ? 'right' : 'left']: '-6px',
                  zIndex: 10,
                }}
                onMouseDown={(e) => handleResize(e, corner)}
              />
            ))}

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteNode();
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
              style={{ zIndex: 10 }}
            >
              ✕
            </button>

            {/* Size Indicator */}
            {isResizing && (
              <div 
                className="absolute bottom-1 left-1 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-mono"
                style={{ zIndex: 10 }}
              >
                {width} × {height}
              </div>
            )}
          </>
        )}
      </span>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'inline',
  inline: true,
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
