'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';

interface ResizableImageProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  selected: boolean;
}

function ResizableImageComponent({ node, updateAttributes, deleteNode, selected }: ResizableImageProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 'auto',
    height: node.attrs.height || 'auto',
  });
  const imageRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent, direction: 'se' | 'sw' | 'ne' | 'nw') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      if (direction.includes('e')) {
        newWidth = startPos.current.width + deltaX;
      } else if (direction.includes('w')) {
        newWidth = startPos.current.width - deltaX;
      }

      // Maintain aspect ratio
      const aspectRatio = startPos.current.width / startPos.current.height;
      newHeight = newWidth / aspectRatio;

      // Minimum size constraints
      if (newWidth < 100) newWidth = 100;
      if (newHeight < 100) newHeight = 100;

      setDimensions({
        width: `${Math.round(newWidth)}px`,
        height: `${Math.round(newHeight)}px`,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      updateAttributes({
        width: dimensions.width,
        height: dimensions.height,
      });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper className="relative inline-block my-4">
      <div
        className={`relative inline-block ${selected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
        style={{
          width: dimensions.width === 'auto' ? undefined : dimensions.width,
          height: dimensions.height === 'auto' ? undefined : dimensions.height,
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className="max-w-full h-auto rounded-lg"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {selected && (
          <>
            {/* Resize handles */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-full"
              style={{ transform: 'translate(50%, 50%)' }}
              onMouseDown={(e) => handleMouseDown(e, 'se')}
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 cursor-sw-resize rounded-full"
              style={{ transform: 'translate(-50%, 50%)' }}
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 bg-blue-500 cursor-ne-resize rounded-full"
              style={{ transform: 'translate(50%, -50%)' }}
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
            />
            <div
              className="absolute top-0 left-0 w-4 h-4 bg-blue-500 cursor-nw-resize rounded-full"
              style={{ transform: 'translate(-50%, -50%)' }}
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
            />

            {/* Delete button */}
            <button
              onClick={deleteNode}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
            >
              Delete
            </button>

            {/* Size indicator */}
            {isResizing && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                {dimensions.width} × {dimensions.height}
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
        default: 'auto',
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
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
