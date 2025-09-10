/**
 * Latency Monitor Container
 * Kombiniert Mini-Indikator mit Modal-Toggle
 */

import React, { useState } from 'react';
import LatencyIndicatorMini from './LatencyIndicatorMini';
import LatencyMonitorModal from './LatencyMonitorModal';

export const LatencyMonitorContainer: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Mini-Indikator (immer sichtbar) */}
      <LatencyIndicatorMini onClick={handleToggleModal} />
      
      {/* Modal (nur bei Klick) */}
      {showModal && (
        <LatencyMonitorModal onClose={handleCloseModal} />
      )}
    </>
  );
};

export default LatencyMonitorContainer;
