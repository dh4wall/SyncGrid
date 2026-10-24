'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* ── colour tokens ── */
const C = {
  primary: '#004ac6',
  primaryContainer: '#2563eb',
  primaryFixed: '#dbe1ff',
  onPrimary: '#ffffff',
  onPrimaryFixed: '#00174b',
  secondary: '#904d00',
  secondaryContainer: '#fe932c',
  secondaryFixed: '#ffdcc3',
  onSecondaryFixed: '#2f1500',
  onSecondaryContainer: '#663500',
  surfaceTint: '#0053db',
  surface: '#faf8ff',
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

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(urlError);
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      const next = searchParams.get('next');
      const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
      router.push(destination);
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(searchParams.get('next') || '/dashboard')}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 relative sg-bg-grid"
      style={{ background: C.surface }}
    >
      {/* Ambient glows */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[340px] rounded-full pointer-events-none -z-10"
        style={{ background: 'linear-gradient(135deg, rgba(0,83,219,0.06), rgba(254,147,44,0.08), transparent)', filter: 'blur(72px)' }}/>
      <div className="absolute bottom-4 right-1/4 w-[380px] h-[220px] rounded-full pointer-events-none -z-10"
        style={{ background: 'linear-gradient(225deg, rgba(106,30,219,0.05), rgba(37,99,235,0.05), transparent)', filter: 'blur(56px)' }}/>

      <div className="w-full max-w-[390px] flex flex-col items-stretch">
        {/* Top nav */}
        <div className="mb-3.5 flex items-center justify-between">
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium group py-1 px-2 -ml-2 rounded-lg transition-all"
            style={{ color: C.onSurfaceVariant }}
            onMouseEnter={e => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = 'rgba(226,231,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.onSurfaceVariant; e.currentTarget.style.background = 'transparent'; }}>
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-0.5" style={{ fontSize: '16px' }}>arrow_back</span>
            <span>Back to home</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(226,231,255,0.7)', color: C.onSurfaceVariant }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: C.secondaryContainer }}/>
            v2.4 Live
          </div>
        </div>

        {/* Glass card */}
        <div className="relative rounded-xl shadow-xl p-6 sm:p-7 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(24px)', border: `1px solid ${C.surfaceContainerHighest}`, boxShadow: '0 20px 60px rgba(19,27,46,0.07)' }}>

          {/* Top accent bar */}
          <div className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
            style={{ background: `linear-gradient(90deg, ${C.primaryContainer}, ${C.secondaryContainer}, ${C.surfaceTint})`, opacity: 0.9 }}/>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5 pt-1">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.surfaceTint})`, boxShadow: `0 4px 12px rgba(0,74,198,0.22)` }}>
              <svg className="w-4.5 h-4.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight" style={{ color: C.onSurface }}>SyncGrid</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ background: C.primaryFixed, color: C.onPrimaryFixed }}>Pro</span>
              </div>
              <p className="text-xs" style={{ color: C.onSurfaceVariant }}>Real-time collaborative workspace</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight" style={{ color: C.onSurface }}>Log in to workspace</h1>
            <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>Connect with your team in real-time concurrency</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-4 px-3.5 py-2.5 rounded-lg text-xs border" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {/* OAuth buttons */}
          <div className="flex flex-col gap-2.5 mb-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading || loading}
              className="w-full h-10 flex items-center justify-center gap-2.5 px-4 rounded-lg shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              style={{ background: C.surfaceContainerLow, border: `1px solid ${C.surfaceContainerHighest}` }}
              onMouseEnter={e => (e.currentTarget.style.background = C.surfaceContainer)}
              onMouseLeave={e => (e.currentTarget.style.background = C.surfaceContainerLow)}>
              {oauthLoading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="font-medium text-xs sm:text-sm transition-colors" style={{ color: C.onSurface }}>
                {oauthLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t" style={{ borderColor: C.surfaceContainerHigh }} />
            <span className="px-3 text-[11px] font-medium uppercase tracking-wider select-none" style={{ color: C.outline }}>
              or sign in with email
            </span>
            <div className="flex-1 border-t" style={{ borderColor: C.surfaceContainerHigh }} />
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="work-email" className="text-xs font-semibold" style={{ color: C.onSurface }}>
                Work Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 pointer-events-none" style={{ fontSize: '18px', color: `${C.onSurfaceVariant}b0` }}>mail</span>
                <input
                  id="work-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2 rounded-lg text-xs sm:text-sm outline-none transition-all placeholder:text-xs placeholder:text-slate-400"
                  style={{ background: C.surfaceContainerLow, border: `1px solid ${C.surfaceContainerHighest}`, color: C.onSurface }}
                  onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.primary}40`; }}
                  onBlur={e => { e.currentTarget.style.background = C.surfaceContainerLow; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="user-password" className="text-xs font-semibold" style={{ color: C.onSurface }}>Password</label>
                <a href="#" className="text-xs font-medium transition-colors hover:underline" style={{ color: C.primary }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.surfaceTint)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.primary)}>
                  Forgot password?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 pointer-events-none" style={{ fontSize: '18px', color: `${C.onSurfaceVariant}b0` }}>lock</span>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 rounded-lg text-xs sm:text-sm outline-none transition-all placeholder:text-xs placeholder:text-slate-400"
                  style={{ background: C.surfaceContainerLow, border: `1px solid ${C.surfaceContainerHighest}`, color: C.onSurface }}
                  onFocus={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = `0 0 0 2px ${C.primary}40`; }}
                  onBlur={e => { e.currentTarget.style.background = C.surfaceContainerLow; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2.5 p-1 rounded-md transition-colors focus:outline-none cursor-pointer"
                  style={{ color: C.onSurfaceVariant }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input type="checkbox" defaultChecked id="remember-me" className="w-3.5 h-3.5 rounded cursor-pointer accent-blue-600"/>
                <span className="text-xs transition-colors" style={{ color: C.onSurfaceVariant }}>Remember this device</span>
              </label>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase"
                style={{ background: 'rgba(255,220,195,0.6)', color: C.secondaryContainer }}>
                30 DAYS
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full mt-2 h-10 rounded-lg font-medium text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer"
              style={{ background: success ? C.secondaryContainer : C.primary, color: '#fff', boxShadow: `0 4px 14px rgba(0,74,198,0.25)` }}
              onMouseEnter={e => { if (!loading && !oauthLoading && !success) e.currentTarget.style.background = C.surfaceTint; }}
              onMouseLeave={e => { if (!success) e.currentTarget.style.background = C.primary; }}>
              {loading ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"/>
                </svg>
              ) : success ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>check</span>
                  <span>Workspace ready</span>
                </>
              ) : (
                <>
                  <span>Log In to Workspace</span>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-0.5" style={{ fontSize: '17px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Sign up */}
          <p className="text-xs text-center mt-5" style={{ color: C.onSurfaceVariant }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold transition-colors hover:underline" style={{ color: C.primary }}
              onMouseEnter={e => (e.currentTarget.style.color = C.surfaceTint)}
              onMouseLeave={e => (e.currentTarget.style.color = C.primary)}>
              Sign up for free
            </Link>
          </p>
        </div>

        {/* Ambient footer signals */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-sm"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.secondaryContainer }}/>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.secondaryContainer }}/>
            </span>
            <span className="text-[11px] font-normal" style={{ color: C.onSurface }}>4,820 devs active now</span>
          </div>
          <div className="flex items-center gap-1 text-[11px]" style={{ color: C.onSurfaceVariant }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: C.surfaceTint }}>verified_user</span>
            <span>CRDT End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
