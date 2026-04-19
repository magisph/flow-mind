import { useEffect, useState, useCallback } from 'react';
import { syncEngine } from '../lib/syncEngine';
import { getPreferences } from '../lib/db';
import { UserPreferences } from '../types';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize sync status
  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Load initial sync time
    getPreferences().then(prefs => {
      setLastSyncTime(prefs.lastSyncAt);
    });

    // Subscribe to sync engine events
    const handleOnline = () => {
      setIsOnline(true);
      syncEngine.resumeSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      syncEngine.pauseSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update syncing state
  useEffect(() => {
    const checkSyncStatus = async () => {
      // We'll implement a more sophisticated way to detect syncing
      // For now, we'll just check if there are pending changes
      const pending = await syncEngine.getPendingChanges();
      setPendingCount(pending.length);
    };

    const interval = setInterval(checkSyncStatus, 5000);
    checkSyncStatus();
    return () => clearInterval(interval);
  }, []);

  // Sync functions
  const syncNow = useCallback(async () => {
    setSyncError(null);
    try {
      await syncEngine.forceSync();
    } catch (err) {
      setSyncError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, []);

  const pauseSync = useCallback(() => {
    syncEngine.pauseSync();
  }, []);

  const resumeSync = useCallback(() => {
    syncEngine.resumeSync();
  }, []);

  // Refresh last sync time
  const refreshLastSyncTime = useCallback(async () => {
    const prefs = await getPreferences();
    setLastSyncTime(prefs.lastSyncAt);
  }, []);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    pendingCount,
    isOnline,
    syncNow,
    pauseSync,
    resumeSync,
    refreshLastSyncTime
  };
}