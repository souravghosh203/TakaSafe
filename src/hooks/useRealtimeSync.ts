import { useCallback, useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'polling' | 'offline';

interface ServerSnapshot<TTransactions, TAuditLogs> {
  success: boolean;
  transactions: TTransactions;
  auditLogs: TAuditLogs;
  timestamp: string;
}

export const useRealtimeSync = <TTransactions, TAuditLogs>(
  onSnapshot: (snapshot: ServerSnapshot<TTransactions, TAuditLogs>) => void,
) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reconnectKey, setReconnectKey] = useState(0);
  const onSnapshotRef = useRef(onSnapshot);
  const statusRef = useRef(status);

  useEffect(() => { onSnapshotRef.current = onSnapshot; }, [onSnapshot]);
  useEffect(() => { statusRef.current = status; }, [status]);

  const refreshFromServer = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/snapshot', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Snapshot request failed (${response.status})`);
      const snapshot = await response.json() as ServerSnapshot<TTransactions, TAuditLogs>;
      if (!snapshot.success || !Array.isArray(snapshot.transactions) || !Array.isArray(snapshot.auditLogs)) {
        throw new Error('Server returned an invalid snapshot');
      }
      onSnapshotRef.current(snapshot);
      setLastSyncedAt(snapshot.timestamp || new Date().toISOString());
      if (statusRef.current !== 'connected') setStatus('polling');
      return true;
    } catch {
      setStatus('offline');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const reconnect = useCallback(() => {
    setStatus('connecting');
    setReconnectKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const stream = new EventSource('/api/events');
    let streamIsConnected = false;
    let pollInFlight = false;

    stream.addEventListener('connected', () => {
      streamIsConnected = true;
      setStatus('connected');
      void refreshFromServer();
    });
    stream.addEventListener('state-change', () => { void refreshFromServer(); });
    stream.onerror = () => {
      streamIsConnected = false;
      setStatus('reconnecting');
    };

    const fallback = window.setInterval(async () => {
      if (streamIsConnected || pollInFlight) return;
      pollInFlight = true;
      await refreshFromServer();
      pollInFlight = false;
    }, 5000);

    const handleOnline = () => {
      reconnect();
      void refreshFromServer();
    };
    const handleVisible = () => {
      if (document.visibilityState === 'visible') void refreshFromServer();
    };
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      stream.close();
      window.clearInterval(fallback);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [reconnectKey, reconnect, refreshFromServer]);

  return { status, lastSyncedAt, isRefreshing, refreshFromServer, reconnect };
};
