import React from 'react';
import { Outlet } from 'react-router-dom';
import GlobalNav from './GlobalNav';
import LatencyMonitorContainer from './LatencyMonitorContainer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div style={{ fontFamily: "'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'" }}>
        <GlobalNav />
        <main>
          <Outlet />
        </main>
        
        {/* 🚀 ENTERPRISE: Latency Monitor auf ALLEN Seiten - RECHTS UNTEN */}
        <LatencyMonitorContainer />
      </div>
    </div>
  );
};
