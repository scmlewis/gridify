import { useState, useEffect } from 'react';

export function OnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-400">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          online ? 'bg-emerald-400' : 'bg-red-400'
        }`}
      />
      {online ? 'Online' : 'Offline'}
    </div>
  );
}
