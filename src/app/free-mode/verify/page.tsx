'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailTokenAction } from '@/app/actions/free-signup';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function FreeModeVerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email…');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in this link.');
      return;
    }

    verifyEmailTokenAction(token).then((res) => {
      if (res.success) {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.message);
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-card rounded-2xl border border-border/60 p-10 text-center space-y-5 shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Verifying…</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-black text-foreground">Email Verified!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            <Link
              href="/login"
              className="inline-block mt-2 px-8 py-3 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors"
            >
              Log In Now
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-foreground">Verification Failed</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            <Link
              href="/signup"
              className="inline-block mt-2 px-8 py-3 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-colors"
            >
              Sign Up Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
