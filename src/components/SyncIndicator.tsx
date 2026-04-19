import { useSync } from '../hooks/useSync';
import { Clock, AlertTriangle, AlertCircle, Loader2, WifiOff, Wifi } from 'lucide-react';

export function SyncIndicator() {
  const {
    isSyncing,
    lastSyncTime,
    syncError,
    pendingCount,
    isOnline,
    syncNow,
    pauseSync,
    resumeSync
  } = useSync();

  // Format time ago
  const timeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
    return `${Math.round(diffMins / 1440)}d ago`;
  };

  // Determine status
  let status: 'syncing' | 'error' | 'offline' | 'idle' | 'pending' = 'idle';
  let tooltipContent: string = '';
  let iconName: keyof typeof import('lucide-react') = 'Wifi';

  if (!isOnline) {
    status = 'offline';
    tooltipContent = 'Offline - Changes will sync when back online';
    iconName = 'WifiOff';
  } else if (isSyncing) {
    status = 'syncing';
    tooltipContent = 'Syncing...';
    iconName = 'Loader2';
  } else if (syncError) {
    status = 'error';
    tooltipContent = `Sync error: ${syncError.message}`;
    iconName = 'AlertTriangle';
  } else if (pendingCount > 0) {
    status = 'pending';
    tooltipContent = `${pendingCount} change${pendingCount > 1 ? 's' : ''} pending sync`;
    iconName = 'AlertCircle';
  } else {
    status = 'idle';
    tooltipContent = `Last synced ${timeAgo(lastSyncTime)}`;
    iconName = 'Wifi';
  }

  return (
    <div className="relative inline-flex items-center space-x-1">
      <button
        title={tooltipContent}
        onClick={status === 'syncing' ? undefined : syncNow}
        disabled={status === 'syncing'}
        className={`w-8 h-8 flex items-center justify-center rounded-full 
        transition-colors 
        ${status === 'syncing' 
          ? 'bg-blue-500 hover:bg-blue-600' 
          : status === 'error' 
            ? 'bg-red-500 hover:bg-red-600' 
            : status === 'offline' 
              ? 'bg-gray-400 hover:bg-gray-500' 
              : status === 'pending' 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-green-500 hover:bg-green-600'}`}
        aria-label={tooltipContent}
      >
        {status === 'syncing' ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : (
          // @ts-ignore - lucide-react icon
          <import('lucide-react')[typeof iconName] className="h-4 w-4 text-white" />
        )}
      </button>
      
      {/* Pending badge */}
      {pendingCount > 0 && status !== 'syncing' && (
        <div className="-top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {pendingCount > 99 ? '99+' : pendingCount}
        </div>
      )}
    </div>
  );
}