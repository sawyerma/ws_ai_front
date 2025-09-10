/**
 * Enterprise Monitoring Modal
 * Vollständiges Modal mit allen 6 Monitoring-Tabs
 * Öffnet sich beim Klick auf die Status-Leiste
 */

import React from 'react';
import { MonitoringTabs } from './MonitoringTabs';
import { Button } from '../ui/button';

interface LatencyMonitorModalProps {
  onClose: () => void;
}

export const LatencyMonitorModal: React.FC<LatencyMonitorModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-lg max-w-7xl max-h-[95vh] overflow-hidden w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Monitoring System</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive performance monitoring and system analytics
            </p>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="hover:bg-muted"
          >
            ✕ Close
          </Button>
        </div>

        {/* Content - MonitoringTabs mit allen 6 Tabs */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <MonitoringTabs />
        </div>
      </div>
    </div>
  );
};

export default LatencyMonitorModal;
