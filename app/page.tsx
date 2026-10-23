'use client';

import Link from 'next/link';
import { useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* ── colour constants matching the design tokens ── */
const C = {
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  primaryFixed: '#dbe1ff',
  onPrimary: '#ffffff',
  onPrimaryFixed: '#00174b',
  secondary: '#904d00',
  secondaryContainer: '#fe932c',
  secondaryFixed: '#ffdcc3',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#663500',
  onSecondaryFixed: '#2f1500',
  tertiary: '#6a1edb',
  tertiaryFixed: '#eaddff',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#f7edff',
  surface: '#faf8ff',
  surfaceBright: '#faf8ff',
  surfaceContainer: '#eaedff',
  surfaceContainerLow: '#f2f3ff',
  surfaceContainerHigh: '#e2e7ff',
  surfaceContainerHighest: '#dae2fd',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#131b2e',
  onSurfaceVariant: '#434655',
  outline: '#737686',
  outlineVariant: '#c3c6d7',
};

export default function LandingPage() {
  const [simMode, setSimMode] = useState<'kanban' | 'docs' | 'team'>('kanban');
  const [simLog, setSimLog] = useState('Ready for user event');
  const [taskInput, setTaskInput] = useState('Create interactive onboarding checklist');
  const [doneCount, setDoneCount] = useState(2);

  function switchMode(mode: 'kanban' | 'docs' | 'team') {
    setSimMode(mode);
    if (mode === 'kanban') setSimLog('Mode switched: Live Kanban board active');
    else if (mode === 'docs') setSimLog('Mode switched: Real-time Markdown co-authoring');
    else setSimLog('Mode switched: Peer mesh presence markers');
  }

  function handleMoveCard(target: string) {
    if (target === 'in-progress') setSimLog("Card #201 moved to 'In Progress' by Alex M. (Synced in 11.2ms)");
    else if (target === 'done') {
      setSimLog("Card #199 marked 'Done' by Sarah K. (Synced in 10.9ms)");
      setDoneCount(3);
    }
  }

  function injectTask() {
    if (taskInput.trim()) {
      setSimLog(`New Task "${taskInput.slice(0, 22)}..." dispatched to board in 11.4ms`);
      setTaskInput('');
    }
  }

  return (
    <div className="min-h-screen flex flex-col sg-bg-grid" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: C.surface }}>

      {/* ── HEADER ────────────────────────────────── */}
      <header style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.surfaceContainer}`, boxShadow: '0 1px 8px rgba(19,27,46,0.05)' }} className="fixed top-0 left-0 right-0 z-50">
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.primary}, #6a1edb)` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ color: C.onSurface }}>SyncGrid</span>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide" style={{ background: C.surfaceContainer, color: C.primary, fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"/>
              v2.4 Workspace
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-semibold transition-colors" style={{ color: C.primary }} href="#">Product</a>
            {['Boards', 'Docs', 'Templates'].map(item => (
              <a key={item} className="text-sm transition-colors hover:opacity-90" style={{ color: C.onSurfaceVariant }} href="#">{item}</a>
            ))}
          </nav>

          <Link href="/login" className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all" style={{ background: C.primaryContainer, color: C.onPrimary, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => (e.currentTarget.style.background = C.primary)}
            onMouseLeave={e => (e.currentTarget.style.background = C.primaryContainer)}>
            Log In
          </Link>
        </div>
      </header>

      <main className="w-full pt-16 flex-1">

        {/* ── LIVE NOTIFICATION BAR ─────────────────── */}
        <div className="w-full py-2 px-6 border-b" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm" style={{ color: C.onSurfaceVariant }}>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-widest uppercase" style={{ background: C.secondaryFixed, color: C.onSecondaryFixed, fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.secondary }}/>
                LIVE RECONCILIATION
              </span>
              <span className="text-sm">Multi-user spatial kanban &amp; real-time specs sync with sub-12ms response time.</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[13px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="font-medium" style={{ color: C.primary }}>Sprint Workspace: Q3 Core</span>
              <span style={{ color: C.outlineVariant }}>/</span>
              <span style={{ color: C.onSurface }}>Teammates Online: 14,892</span>
            </div>
          </div>
        </div>

        {/* ── HERO ──────────────────────────────────── */}
        <section className="relative w-full max-w-7xl mx-auto px-6 lg:px-12 pt-12 pb-20 overflow-hidden">
          {/* Ambient blobs */}
          <div className="absolute -top-12 left-1/4 w-96 h-96 rounded-full pointer-events-none -z-10" style={{ background: 'rgba(219,225,255,0.35)', filter: 'blur(72px)' }}/>
          <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full pointer-events-none -z-10" style={{ background: 'rgba(255,220,195,0.45)', filter: 'blur(72px)' }}/>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-6 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm border" style={{ background: C.surfaceContainer, borderColor: C.surfaceContainerHighest }}>
                <span className="text-sm">✨</span>
                <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: C.secondary, fontFamily: 'JetBrains Mono, monospace' }}>Real-time collaboration, redefined</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]" style={{ color: C.onSurface, letterSpacing: '-0.03em' }}>
                Your team.{' '}
                <span className="px-2 py-0.5 rounded-lg border" style={{ background: 'rgba(251,191,36,0.2)', color: '#92400e', borderColor: 'rgba(251,191,36,0.4)' }}>One grid.</span>{' '}
                <span className="px-2 py-0.5 rounded-lg border" style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>Zero chaos.</span>
              </h1>

              <p className="text-[15px] leading-relaxed max-w-xl" style={{ color: C.onSurfaceVariant }}>
                SyncGrid combines dynamic real-time kanban boards, shared documentation, and effortless team collaboration into one unified workspace.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
                  style={{ background: C.secondaryContainer, color: C.onSecondary }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.secondary)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.secondaryContainer)}>
                  <span>Get Started Free</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </Link>
                <a href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm shadow-sm border transition-all"
                  style={{ background: C.surfaceContainerLowest, color: C.onSurface, borderColor: C.surfaceContainer }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.primary }}>play_circle</span>
                  <span>Explore Live Demo</span>
                </a>
              </div>
              <div className="text-xs -mt-2" style={{ color: C.onSurfaceVariant }}>No credit card required • Instant team setup</div>

              {/* Social proof */}
              <div className="pt-2 flex items-center gap-4" style={{ color: C.onSurfaceVariant }}>
                <div className="flex -space-x-2">
                  {[
                    { label: 'AK', bg: C.primaryFixed, color: C.onPrimaryFixed },
                    { label: 'SK', bg: C.secondaryFixed, color: C.onSecondaryFixed },
                    { label: 'JT', bg: C.tertiaryFixed, color: C.onTertiary },
                    { label: '+4k', bg: C.surfaceContainerHighest, color: C.onSurfaceVariant },
                  ].map(({ label, bg, color }) => (
                    <div key={label} className="w-8 h-8 rounded-full ring-2 ring-white flex items-center justify-center text-[11px] font-bold" style={{ background: bg, color }}>
                      {label}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold" style={{ color: C.onSurface }}>4,800+ teams</span> shipping faster
                </div>
              </div>
            </div>

            {/* Right: kanban preview */}
            <div className="lg:col-span-6 relative">
              {/* Floating badge top-left */}
              <div className="absolute -top-5 -left-5 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xl border animate-float" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: C.surfaceContainerHighest }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.primaryFixed, color: C.primary }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>view_kanban</span>
                </div>
                <div>
                  <div className="font-semibold text-xs" style={{ color: C.onSurface }}>Sprint #14 Active</div>
                  <div className="text-[10px]" style={{ color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>12 tasks live syncing</div>
                </div>
              </div>
              {/* Floating badge bottom-right */}
              <div className="absolute -bottom-5 -right-4 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl shadow-xl border animate-float-delayed" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderColor: C.surfaceContainerHighest }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.secondaryFixed, color: C.secondary }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>description</span>
                </div>
                <div>
                  <div className="font-semibold text-xs" style={{ color: C.onSurface }}>Mobile Spec v3</div>
                  <div className="text-[10px] font-semibold" style={{ color: C.secondary, fontFamily: 'JetBrains Mono, monospace' }}>Sarah editing live...</div>
                </div>
              </div>

              {/* Workspace window */}
              <div className="relative rounded-2xl shadow-[0_20px_50px_rgba(19,27,46,0.10)] border overflow-hidden" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainerHighest }}>
                {/* Window chrome */}
                <div className="h-12 px-4 border-b flex items-center justify-between" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400"/>
                    <span className="w-3 h-3 rounded-full bg-amber-400"/>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"/>
                    <div className="ml-2 flex items-center gap-2">
                      <span className="font-semibold text-xs" style={{ color: C.onSurface }}>Product Roadmap &amp; Execution</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: C.primaryFixed, color: C.primary, fontFamily: 'JetBrains Mono, monospace' }}>Sprint #14</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-emerald-700 text-[11px] font-bold border" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"/>
                    🟢 Live Sync Active • 12ms P2P
                  </div>
                </div>

                {/* Canvas */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 relative select-none min-h-[380px]" style={{ background: C.surfaceBright }}>
                  {/* Live cursors */}
                  <div className="absolute top-10 left-36 z-30 flex flex-col items-start pointer-events-none animate-pulse">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md" style={{ background: C.primary, color: C.onPrimary, fontFamily: 'JetBrains Mono, monospace' }}>Alex M. moving card</div>
                    <svg className="w-4 h-4 -mt-1 -ml-1" fill={C.primary} viewBox="0 0 24 24"><polygon points="0 0, 0 16, 4.5 12, 10 20, 12 19, 6.5 11, 12 11"/></svg>
                  </div>
                  <div className="absolute top-28 right-28 z-30 flex flex-col items-start pointer-events-none">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md" style={{ background: C.secondary, color: C.onSecondary, fontFamily: 'JetBrains Mono, monospace' }}>Sarah K. editing spec</div>
                    <svg className="w-4 h-4 -mt-1 -ml-1" fill={C.secondary} viewBox="0 0 24 24"><polygon points="0 0, 0 16, 4.5 12, 10 20, 12 19, 6.5 11, 12 11"/></svg>
                  </div>

                  {/* Col 1: In Progress */}
                  <div className="md:col-span-4 rounded-xl p-2.5 border flex flex-col gap-2" style={{ background: 'rgba(234,237,255,0.7)', borderColor: C.surfaceContainer }}>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: C.onSurface }}>
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/><span>In Progress</span>
                      </div>
                      <span className="text-[10px] px-1.5 rounded font-medium" style={{ background: C.surfaceContainer, color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>3</span>
                    </div>
                    {/* Card 1 */}
                    <div className="p-3 rounded-lg border shadow-sm flex flex-col gap-2" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainerHighest }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Q3 Roadmap</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">P1 High</span>
                      </div>
                      <div className="text-xs font-semibold leading-snug" style={{ color: C.onSurface }}>Real-time multiplayer cursor synchronization</div>
                      <div className="flex items-center justify-between pt-1 border-t text-[11px]" style={{ borderColor: C.surfaceContainer, color: C.onSurfaceVariant }}>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '13px', color: C.primary }}>chat</span>4</span>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: C.primaryFixed, color: C.onPrimaryFixed }}>AK</div>
                      </div>
                    </div>
                    {/* Card 2 highlighted */}
                    <div className="p-3 rounded-lg border-2 shadow-md flex flex-col gap-2 ring-2" style={{ background: C.surfaceContainerLowest, borderColor: C.primary, boxShadow: `0 0 0 2px ${C.primary}20` }}>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Sprint #14</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Ready</span>
                      </div>
                      <div className="text-xs font-semibold leading-snug" style={{ color: C.onSurface }}>Bi-directional task &amp; docs link anchors</div>
                      <div className="flex items-center justify-between pt-1 border-t text-[11px]" style={{ borderColor: C.surfaceContainer, color: C.onSurfaceVariant }}>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined" style={{ fontSize: '13px', color: C.secondary }}>attachment</span>2</span>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: C.secondaryFixed, color: C.onSecondaryFixed }}>JT</div>
                      </div>
                    </div>
                  </div>

                  {/* Col 2: In Review */}
                  <div className="md:col-span-4 rounded-xl p-2.5 border flex flex-col gap-2" style={{ background: 'rgba(234,237,255,0.7)', borderColor: C.surfaceContainer }}>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5 font-semibold text-xs" style={{ color: C.onSurface }}>
                        <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"/><span>In Review</span>
                      </div>
                      <span className="text-[10px] px-1.5 rounded font-medium" style={{ background: C.surfaceContainer, color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>2</span>
                    </div>
                    {[
                      { label: 'Mobile Spec', color: 'bg-purple-100 text-purple-700', p: 'P2', title: 'Offline-first local cache reconciliation', meta: '✓ 3/3', author: 'SK', authorBg: C.tertiaryFixed },
                      { label: 'Design', color: 'bg-blue-100 text-blue-700', p: '', title: 'Fluid canvas zoom & spatial cards', meta: '💬 8', author: 'AK', authorBg: C.primaryFixed },
                    ].map(({ label, color, p, title, meta, author, authorBg }) => (
                      <div key={title} className="p-3 rounded-lg border shadow-sm flex flex-col gap-2" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${color}`}>{label}</span>
                          {p && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{p}</span>}
                        </div>
                        <div className="text-xs font-semibold leading-snug" style={{ color: C.onSurface }}>{title}</div>
                        <div className="flex items-center justify-between pt-1 border-t text-[11px]" style={{ borderColor: C.surfaceContainer, color: C.onSurfaceVariant }}>
                          <span className="text-emerald-600 font-medium">{meta}</span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: authorBg, color: C.onPrimaryFixed }}>{author}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Col 3: Doc preview */}
                  <div className="md:col-span-4 rounded-xl p-3 border shadow-sm flex flex-col justify-between" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                    <div>
                      <div className="flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: C.surfaceContainer }}>
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: C.secondary }}>edit_document</span>
                          <span className="text-xs font-bold" style={{ color: C.onSurface }}>Sprint Spec #14</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Live Editing</span>
                      </div>
                      <div className="space-y-2 text-[11px]" style={{ color: C.onSurfaceVariant }}>
                        <div className="font-bold text-xs" style={{ color: C.onSurface }}>Target Deliverables</div>
                        {[
                          { done: true, label: 'Multi-user drag-drop locks', highlight: true },
                          { done: true, label: 'Instant markdown mention triggers' },
                          { done: false, label: 'Live presence heartbeat @12ms' },
                        ].map(({ done, label, highlight }) => (
                          <div key={label} className={`flex items-center gap-1.5 ${highlight ? 'p-1 rounded border-l-2' : ''}`} style={highlight ? { background: 'rgba(255,220,195,0.3)', borderColor: C.secondary, color: C.onSurface } : {}}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: done ? '#059669' : C.outline }}>{done ? 'check_box' : 'check_box_outline_blank'}</span>
                            <span className={done ? 'font-medium' : ''}>{label}</span>
                          </div>
                        ))}
                        <div className="p-2 rounded text-[10px] mt-2" style={{ background: C.surfaceContainerLow }}>
                          <span className="font-semibold" style={{ color: C.secondary }}>Sarah K.:</span> Linked this card directly to the sprint roadmap board.
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: C.surfaceContainer, color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>
                      <span>Autosaved 1s ago</span>
                      <span className="font-bold" style={{ color: C.primary }}>3 co-authors online</span>
                    </div>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="h-10 px-4 border-t flex items-center justify-between text-[11px]" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer, color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>
                    Workspace State: Synchronized across 3 peers
                  </div>
                  <div className="flex items-center gap-3">
                    <span>CRDT Canvas: Active</span>
                    <span style={{ color: C.outlineVariant }}>|</span>
                    <span className="font-semibold" style={{ color: C.primary }}>Alex M., Sarah K., Jordan T.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── METRICS STRIP ─────────────────────────── */}
        <section className="w-full border-y py-8 px-6 lg:px-12" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '12ms', label: 'Real-time Sync Latency', color: C.primary },
              { value: '100%', label: 'Real-Time Alignment', color: C.secondary },
              { value: '10k+', label: 'Active Team Boards', color: C.onSurface },
              { value: '0', label: 'Sync Conflicts or Stale Data', color: C.tertiary },
            ].map(({ value, label, color }) => (
              <div key={label} className="flex flex-col items-center sm:items-start">
                <span className="text-3xl font-extrabold tracking-tight" style={{ color, letterSpacing: '-0.02em' }}>{value}</span>
                <span className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES GRID ─────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="flex flex-col items-center text-center gap-4 mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest" style={{ background: C.surfaceContainer, color: C.primary, fontFamily: 'JetBrains Mono, monospace' }}>
              Unified Squad Flow
            </div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: C.onSurface, letterSpacing: '-0.02em' }}>
              Everything your team needs to move in rhythm
            </h2>
            <p className="text-[15px] max-w-2xl" style={{ color: C.onSurfaceVariant }}>
              Every interaction is backed by peer-to-peer state synchronization, eliminating stale tabs, merge locks, and coordination drag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'dashboard_customize', iconBg: C.primaryFixed, iconColor: C.primary,
                title: 'Boards that move at your speed',
                desc: "Drag, drop, and reorganize with live multi-user updates. See team moves live as they happen.",
                demo: (
                  <div className="p-4 rounded-xl border flex flex-col gap-2.5" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold" style={{ color: C.onSurface }}>Design System Tokens</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Moved to Done</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t" style={{ borderColor: C.surfaceContainer, color: C.onSurfaceVariant }}>
                      <span className="flex items-center gap-1 font-bold" style={{ color: C.primary, fontFamily: 'JetBrains Mono, monospace' }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ background: C.primary }}/>Live drag by Alex
                      </span>
                      <div className="flex items-center gap-1 font-semibold" style={{ color: C.secondary }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>thumb_up</span> 12 votes
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                icon: 'sync', iconBg: C.secondaryFixed, iconColor: C.secondary,
                title: 'True real-time. No refresh required.',
                desc: "Changes broadcast instantly to your teammates' screens so you're always looking at the source of truth.",
                demo: (
                  <div className="p-4 rounded-xl border flex items-center justify-between" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.secondaryContainer }}/>
                        <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: C.secondary }}/>
                      </span>
                      <span className="text-xs font-semibold" style={{ color: C.onSurface }}>P2P Mesh Consensus</span>
                    </div>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1" style={{ background: C.secondaryFixed, color: C.onSecondaryFixed, fontFamily: 'JetBrains Mono, monospace' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>check</span>Verified
                    </span>
                  </div>
                ),
              },
              {
                icon: 'description', iconBg: C.tertiaryFixed, iconColor: C.tertiary,
                title: 'Docs that live right beside your tasks',
                desc: 'Write specs, capture meeting notes, and link documentation directly to your sprints and cards.',
                demo: (
                  <div className="p-4 rounded-xl border flex flex-col gap-2" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                    <div className="flex items-center justify-between text-xs font-semibold" style={{ color: C.onSurface }}>
                      <span>Launch_Checklist.doc</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: C.tertiaryFixed, color: C.tertiary, fontFamily: 'JetBrains Mono, monospace' }}>Linked to Sprint</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: C.onSurfaceVariant }}>
                      <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '14px' }}>check_box</span>
                      <span>Cross-team signoff completed</span>
                      <span className="ml-auto text-[10px] px-1 rounded font-bold" style={{ background: C.surfaceContainer }}>🎉 4</span>
                    </div>
                  </div>
                ),
              },
            ].map(({ icon, iconBg, iconColor, title, desc, demo }) => (
              <div key={title} className="flex flex-col rounded-2xl p-8 shadow-sm border transition-all duration-300 group cursor-default"
                style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px rgba(19,27,46,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: iconBg, color: iconColor }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{icon}</span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: C.onSurface }}>{title}</h3>
                <p className="text-[13px] mb-5 flex-1 leading-relaxed" style={{ color: C.onSurfaceVariant }}>{desc}</p>
                {demo}
              </div>
            ))}
          </div>
        </section>

        {/* ── INTERACTIVE PLAYGROUND ────────────────── */}
        <section id="demo" className="w-full py-20 px-6 lg:px-12 border-t" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.primary, fontFamily: 'JetBrains Mono, monospace' }}>Collaborative Playground</span>
                <h2 className="text-3xl font-bold tracking-tight mt-1" style={{ color: C.onSurface, letterSpacing: '-0.02em' }}>Simulate Live Team Collaboration</h2>
                <p className="text-[13px] max-w-xl mt-2 leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                  Experience how SyncGrid updates kanban cards, task assignments, and document notes across your entire squad in real time.
                </p>
              </div>
              {/* Mode switcher */}
              <div className="inline-flex p-1.5 rounded-xl shadow-sm border" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                {(['kanban', 'docs', 'team'] as const).map(mode => {
                  const labels: Record<string, string> = { kanban: 'Kanban Mover', docs: 'Docs Co-Authoring', team: 'Peer Presence' };
                  const activeBg: Record<string, string> = { kanban: C.primary, docs: C.secondary, team: C.tertiary };
                  const active = simMode === mode;
                  return (
                    <button key={mode} onClick={() => switchMode(mode)}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{ background: active ? activeBg[mode] : 'transparent', color: active ? '#fff' : C.onSurfaceVariant, fontWeight: active ? 600 : 400, boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                      {labels[mode]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[460px]" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainerHighest }}>
              {/* Stage */}
              <div className="lg:col-span-8 p-8 flex flex-col justify-between relative" style={{ background: C.surfaceBright }}>
                {/* Kanban mode */}
                {simMode === 'kanban' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: C.surfaceContainer }}>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block"/>
                        <span className="font-semibold text-sm" style={{ color: C.onSurface }}>Interactive Task Board: Q3 Release Sprints</span>
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: C.secondaryContainer, fontFamily: 'JetBrains Mono, monospace' }}>Auto-broadcasting updates</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {/* To Do */}
                      <div className="p-3 rounded-xl border flex flex-col gap-2" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                        <div className="flex items-center justify-between font-semibold text-xs" style={{ color: C.onSurface }}>
                          <span>To Do</span><span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surfaceContainerHighest }}>1</span>
                        </div>
                        <div className="p-2.5 rounded-lg border shadow-sm flex flex-col gap-1.5" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Card #201</span>
                            <span className="text-[9px] font-bold text-rose-600">Urgent</span>
                          </div>
                          <div className="text-xs font-semibold" style={{ color: C.onSurface }}>Setup Stripe Webhook Sockets</div>
                          <div className="flex items-center justify-between pt-1 text-[10px]" style={{ color: C.onSurfaceVariant }}>
                            <span>Assignee: Alex M.</span>
                            <button onClick={() => handleMoveCard('in-progress')} className="px-2 py-0.5 rounded text-[10px] font-semibold transition-all" style={{ background: C.primary, color: C.onPrimary }}>Move &rsaquo;</button>
                          </div>
                        </div>
                      </div>
                      {/* In Progress */}
                      <div className="p-3 rounded-xl border flex flex-col gap-2" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                        <div className="flex items-center justify-between font-semibold text-xs" style={{ color: C.onSurface }}>
                          <span>In Progress</span><span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surfaceContainerHighest }}>1</span>
                        </div>
                        <div className="p-2.5 rounded-lg border shadow-sm flex flex-col gap-1.5" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Card #199</span>
                            <span className="text-[9px] font-bold text-emerald-600">Normal</span>
                          </div>
                          <div className="text-xs font-semibold" style={{ color: C.onSurface }}>Unified User Preferences API</div>
                          <div className="flex items-center justify-between pt-1 text-[10px]" style={{ color: C.onSurfaceVariant }}>
                            <span>Assignee: Sarah K.</span>
                            <button onClick={() => handleMoveCard('done')} className="px-2 py-0.5 rounded text-[10px] font-semibold transition-all" style={{ background: C.secondary, color: C.onSecondary }}>Complete &rsaquo;</button>
                          </div>
                        </div>
                      </div>
                      {/* Done */}
                      <div className="p-3 rounded-xl border flex flex-col gap-2" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                        <div className="flex items-center justify-between font-semibold text-xs" style={{ color: C.onSurface }}>
                          <span>Done</span><span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surfaceContainerHighest }}>{doneCount}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border shadow-sm flex flex-col gap-1.5" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Card #184</span>
                            <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '14px' }}>verified</span>
                          </div>
                          <div className="text-xs font-semibold" style={{ color: C.onSurface }}>Multi-cursor WebRTC Signaling</div>
                          <div className="text-[10px]" style={{ color: C.onSurfaceVariant }}>Shipped by Jordan T.</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-3">
                      <input
                        value={taskInput}
                        onChange={e => setTaskInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && injectTask()}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm focus:outline-none transition-all"
                        placeholder="Type a new task name to dispatch to board..."
                        style={{ background: C.surfaceContainerLowest, border: `1px solid ${C.surfaceContainer}`, color: C.onSurface }}
                      />
                      <button onClick={injectTask} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm" style={{ background: C.primary, color: C.onPrimary }}>
                        Add Task Live
                      </button>
                    </div>
                  </div>
                )}

                {/* Docs mode */}
                {simMode === 'docs' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: C.surfaceContainer }}>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: C.secondary }}>article</span>
                        <span className="font-bold text-sm" style={{ color: C.onSurface }}>Q3 Architecture &amp; Team Charter.md</span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: C.primaryFixed, color: C.primary, fontFamily: 'JetBrains Mono, monospace' }}>Synced across 4 editors</span>
                    </div>
                    <div className="p-4 rounded-xl border space-y-2 text-xs" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer, color: C.onSurface }}>
                      <p className="font-semibold text-sm">## Objective: Zero Coordination Overhead</p>
                      <p className="leading-relaxed" style={{ color: C.onSurfaceVariant }}>
                        SyncGrid organizes daily team sprints by anchoring task cards to documentation notes. Teammates write collaboratively, tag card IDs like{' '}
                        <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace' }}>#Card-201</span>, and receive instantaneous updates without page refreshes.
                      </p>
                      <div className="p-2.5 rounded border flex items-center justify-between bg-amber-50 border-amber-200 text-amber-900">
                        <span className="font-medium">⚡ Jordan T. is typing inline at cursor index 142...</span>
                        <span className="text-[10px] font-bold text-amber-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>12ms sync</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team mode */}
                {simMode === 'team' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl border space-y-4" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm" style={{ color: C.onSurface }}>Active Peer Mesh Topology</span>
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>100% P2P Connected</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { init: 'AK', name: 'Alex M.', status: 'Hovering Board #1', bg: C.primaryFixed, color: C.onPrimaryFixed },
                          { init: 'SK', name: 'Sarah K.', status: 'Editing Doc #3', bg: C.secondaryFixed, color: C.onSecondaryFixed },
                          { init: 'JT', name: 'Jordan T.', status: 'Reviewing PR #44', bg: C.tertiaryFixed, color: C.tertiary },
                        ].map(({ init, name, status, bg, color }) => (
                          <div key={name} className="p-3 rounded-lg border text-center" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1" style={{ background: bg, color }}>{init}</div>
                            <div className="font-semibold text-xs" style={{ color: C.onSurface }}>{name}</div>
                            <div className="text-[10px]" style={{ color: C.onSurfaceVariant }}>{status}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status bar */}
                <div className="pt-6 flex items-center justify-between border-t text-[11px]" style={{ borderColor: C.surfaceContainer, color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>P2P Protocol: Connected to Team Cluster
                  </span>
                  <span>{simLog}</span>
                </div>
              </div>

              {/* Right: telemetry */}
              <div className="lg:col-span-4 p-8 border-t lg:border-t-0 lg:border-l flex flex-col justify-between" style={{ background: C.surfaceContainerLowest, borderColor: C.surfaceContainer }}>
                <div>
                  <h4 className="text-xl font-bold mb-1" style={{ color: C.onSurface }}>Live Team Stream</h4>
                  <p className="text-sm mb-6" style={{ color: C.onSurfaceVariant }}>Real-time collaboration state and latency vector.</p>
                  <div className="space-y-4 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {[
                      { label: 'Sync Roundtrip', value: '11.8 ms', color: C.primary },
                      { label: 'Board Updates / min', value: '428 actions', color: C.secondary },
                      { label: 'Conflict Resolution', value: 'Zero Locks (CRDT)', color: '#059669' },
                      { label: 'Active Co-authors', value: '3 Peers Online', color: C.onSurface },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: C.surfaceContainer }}>
                        <span style={{ color: C.onSurfaceVariant }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-6">
                  <div className="p-4 rounded-xl border" style={{ background: C.surfaceContainerLow, borderColor: C.surfaceContainer }}>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.secondary, fontFamily: 'JetBrains Mono, monospace' }}>Try In Your Squad</span>
                    <p className="text-sm font-semibold mt-1" style={{ color: C.onSurface }}>Want your team on this live grid?</p>
                    <Link href="/login" className="mt-3 inline-flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm" style={{ background: C.primary, color: C.onPrimary }}>
                      Launch Free Team Workspace
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────── */}
        <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
          <div className="relative rounded-3xl p-10 lg:p-16 overflow-hidden border shadow-sm" style={{ background: C.surfaceContainer, borderColor: C.surfaceContainerHighest }}>
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(254,147,44,0.15)', filter: 'blur(72px)' }}/>
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(37,99,235,0.15)', filter: 'blur(72px)' }}/>
            <div className="relative z-10 max-w-3xl flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: C.secondaryFixed, color: C.onSecondaryFixed, fontFamily: 'JetBrains Mono, monospace' }}>
                INSTANT SETUP • ZERO MERGE DELAYS
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: C.onSurface, letterSpacing: '-0.02em' }}>
                Stop chasing updates. Start shipping results.
              </h2>
              <p className="text-[15px]" style={{ color: C.onSurfaceVariant }}>
                Bring your tasks, ideas, and team members into a single grid that updates instantly across every screen.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base shadow-md transition-all active:scale-[0.98]"
                  style={{ background: C.secondaryContainer, color: C.onSecondary }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.secondary)}
                  onMouseLeave={e => (e.currentTarget.style.background = C.secondaryContainer)}>
                  <span>Start Collaborating Free</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </Link>
                <span className="text-sm" style={{ color: C.onSurfaceVariant }}>No credit card required. Instant login via SSO.</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────── */}
      <footer className="w-full py-4" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.surfaceContainer}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px]" style={{ color: C.onSurfaceVariant, fontFamily: 'JetBrains Mono, monospace' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/>
            </span>
            All systems operational • Concurrent Engine v2.4
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: C.onSurfaceVariant }}>
            <span>Multiplayer Consensus 12ms</span>
            <span style={{ color: C.outlineVariant }}>•</span>
            <span>© 2025 SyncGrid Labs Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
