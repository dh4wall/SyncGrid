'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { acceptInvitation } from '@/lib/actions/members';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Check, X, Loader2 } from 'lucide-react';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'accepting'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.token) {
      setStatus('loading');
    }
  }, [params.token]);

  const handleAccept = async () => {
    setStatus('accepting');
    try {
      await acceptInvitation(params.token as string);
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleDecline = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>

            {status === 'loading' && (
              <>
                <h1 className="text-xl font-semibold mb-2">Project Invitation</h1>
                <p className="text-gray-600 mb-6">
                  You've been invited to join a project workspace
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleDecline} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button onClick={handleAccept} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </div>
              </>
            )}

            {status === 'accepting' && (
              <>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <h1 className="text-xl font-semibold mb-2">Accepting Invitation...</h1>
                <p className="text-gray-600">Please wait while we add you to the project</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-xl font-semibold mb-2 text-green-600">Welcome to the team!</h1>
                <p className="text-gray-600 mb-4">
                  You've successfully joined the project. Redirecting to dashboard...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-xl font-semibold mb-2 text-red-600">Invitation Error</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
