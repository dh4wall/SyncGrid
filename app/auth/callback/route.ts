import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Determine the true origin (handling production reverse proxies like Vercel/Node)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';

  let baseUrl: string;
  if (isLocalEnv) {
    baseUrl = new URL(request.url).origin;
  } else if (forwardedHost) {
    baseUrl = `${forwardedProto}://${forwardedHost}`;
  } else {
    baseUrl = new URL(request.url).origin;
  }

  // OAuth provider returned an error (e.g. user denied access)
  if (error) {
    const loginUrl = new URL('/login', baseUrl);
    loginUrl.searchParams.set('error', errorDescription ?? error);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fullName =
          typeof user.user_metadata?.full_name === 'string'
            ? user.user_metadata.full_name.trim()
            : '';
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email || '',
            full_name: fullName || null,
          },
          { onConflict: 'id' }
        );
        if (profileError) {
          console.error('OAuth profile ensure failed:', profileError);
        }
      }
      // Ensure redirect to a relative path on baseUrl
      const redirectPath = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
      return NextResponse.redirect(new URL(redirectPath, baseUrl));
    }
  }

  // Code missing or exchange failed — redirect to login with error
  const loginUrl = new URL('/login', baseUrl);
  loginUrl.searchParams.set('error', 'Authentication failed. Please try again.');
  return NextResponse.redirect(loginUrl);
}
