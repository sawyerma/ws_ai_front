import React, { useState, useEffect } from 'react';

const SystemStatus: React.FC = () => {
  const [wsLatency, setWsLatency] = useState<number>(30);
  const [apiLatency, setApiLatency] = useState<number>(20);
  const [connectionStatus, setConnectionStatus] = useState<'stable' | 'unstable'>('stable');

  // Simulate latency updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWsLatency(Math.floor(Math.random() * 50) + 10);
      setApiLatency(Math.floor(Math.random() * 40) + 10);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'stable' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-green-500 font-medium">System connection stable</span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">FastAPI =</span>
        <span className="text-green-500 font-medium">{apiLatency}ms</span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="text-text-secondary">WS =</span>
        <span className="text-green-500 font-medium">{wsLatency}ms</span>
      </div>
    </div>
  );
};

export default SystemStatus;
