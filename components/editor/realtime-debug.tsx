'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function RealtimeDebug({ pageId }: { pageId: string }) {
  const [status, setStatus] = useState<string>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);
  const [updateCount, setUpdateCount] = useState(0);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    if (!pageId) return;

    const supabase = createClient();
    addLog('🔧 Initializing realtime connection...');
    addLog(`📄 Watching page ID: ${pageId}`);

    const channel = supabase
      .channel(`debug-page-${pageId}`, {
        config: {
          broadcast: { self: false },
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pages',
          filter: `id=eq.${pageId}`,
        },
        (payload) => {
          addLog(`✅ UPDATE RECEIVED: ${payload.eventType}`);
          const contentLength = (payload.new as any)?.content?.length || 0;
          addLog(`📊 New content length: ${contentLength}`);
          setUpdateCount(prev => prev + 1);
        }
      )
      .subscribe((newStatus, err) => {
        setStatus(newStatus);
        addLog(`📡 Status changed: ${newStatus}`);
        if (err) {
          addLog(`❌ Error: ${err.message}`);
        }
      });

    return () => {
      addLog('🔌 Disconnecting...');
      supabase.removeChannel(channel);
    };
  }, [pageId]);

  const testUpdate = async () => {
    addLog('🧪 Testing manual update...');
    const supabase = createClient();
    const { error } = await supabase
      .from('pages')
      .update({ content: `Test update at ${new Date().toISOString()}` })
      .eq('id', pageId);
    
    if (error) {
      addLog(`❌ Update failed: ${error.message}`);
    } else {
      addLog('✅ Update sent to database');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-bold text-sm">Realtime Debug Console</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'SUBSCRIBED' ? 'bg-green-500' : 
            status === 'CHANNEL_ERROR' ? 'bg-red-500' : 
            'bg-yellow-500'
          }`} />
          <span className="text-xs font-mono">{status}</span>
          <span className="text-xs text-gray-500 ml-auto">
            Updates: {updateCount}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-2">
        <Button size="sm" onClick={testUpdate} className="w-full">
          Test Manual Update
        </Button>
        
        <div className="bg-black text-green-400 p-2 rounded text-xs font-mono h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500">Waiting for events...</div>
          )}
        </div>
      </div>
    </div>
  );
}
