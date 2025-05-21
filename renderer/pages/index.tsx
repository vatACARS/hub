import { useEffect } from 'react';

export default function ServiceIndex() {
  useEffect(() => {
    window.ipc.send('openApp', null);

    // Wait until main app signals readiness
    const unsubscribe = window.ipc.on('mainAppReady', () => {
      window.ipc.send('appReady', null); // Tell main process we're done with splash
    });

    return () => unsubscribe?.();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-zinc-950 text-white">
      <div className="flex flex-col items-center justify-center p-6">
        <img src="/img/vatacars-logo-dark.png" alt="vatACARS logo" className="h-10 mb-4" />
        <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="absolute bottom-2 right-4 text-xs text-zinc-600">
        Version {require('../../package.json').version}
      </p>
    </div>
  );
}
