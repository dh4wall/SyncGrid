'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex min-h-full items-center justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 cursor-default bg-slate-950/55 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-[101] mx-auto flex w-full max-w-[calc(100vw-2rem)] items-center justify-center sm:max-w-[calc(100vw-3rem)]">
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-6',
        className
      )}
    >
      {children}
    </div>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('mb-6', className)}>{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn('text-2xl font-bold', className)}>{children}</h2>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn('text-gray-600 mt-2', className)}>{children}</p>
  );
}