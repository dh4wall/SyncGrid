'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestUserCreation() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestUser = async () => {
    if (!email || !password || !name) return;

    setLoading(true);
    setMessage('');

    try {
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      setMessage(`✅ Test user created: ${email}`);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-sm">🧪 Create Test User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button 
          onClick={createTestUser} 
          disabled={loading || !email || !password || !name}
          size="sm"
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Test User'}
        </Button>
        {message && (
          <div className="text-xs p-2 rounded bg-gray-50">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
