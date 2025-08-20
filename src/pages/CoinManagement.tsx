import React, { useState } from 'react';
import AdvancedCoinSelector from '../components/ui/advanced-coin-selector';
import CoinDatabaseTable from '../components/ui/coin-database-table';
import { useCoinStatus } from '../context/CoinStatusContext';

const CoinManagement = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [selectedMarket, setSelectedMarket] = useState('spot');
  const { error } = useCoinStatus();

  const handleSymbolSelect = (symbol: string, market: string) => {
    setSelectedSymbol(symbol);
    setSelectedMarket(market);
  };

  return (
    <div 
      className="coin-management"
      style={{
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: '#1e2433',
        color: 'white'
      }}
    >
      <style>{`
        .coin-selector {
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #374151;
          border-radius: 8px;
          max-width: 400px;
          background-color: #1e2433;
        }

        .database-table {
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #374151;
          border-radius: 8px;
          background-color: #1e2433;
          max-width: 1200px;
        }

        .database-table h3 {
          margin-bottom: 20px;
          color: white;
        }

        .database-table table {
          width: 100%;
          border-collapse: collapse;
          background-color: #111827;
        }

        .database-table th, 
        .database-table td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #374151;
          color: white;
        }

        .database-table th {
          background-color: #1f2937;
          font-weight: bold;
        }

        .status-indicator {
          padding: 5px 10px;
          border-radius: 4px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .status-indicator.red { 
          background-color: #ff4d4d; 
        }
        
        .status-indicator.orange { 
          background-color: #ffa64d; 
        }
        
        .status-indicator.green { 
          background-color: #4dff4d; 
          color: black;
        }

        .coin-symbol {
          font-weight: bold;
          color: white;
        }

        .market-badge {
          background-color: #374151;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          color: #9CA3AF;
        }

        .date-input {
          padding: 5px;
          border: 1px solid #374151;
          border-radius: 4px;
          background-color: #111827;
          color: white;
        }

        .until-date {
          color: #9CA3AF;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .edit-btn,
        .save-btn,
        .cancel-btn {
          padding: 5px 10px;
          margin: 0 2px;
          border: 1px solid #374151;
          border-radius: 4px;
          background-color: #1f2937;
          color: white;
          cursor: pointer;
          font-size: 12px;
        }

        .edit-btn:hover,
        .save-btn:hover,
        .cancel-btn:hover {
          background-color: #374151;
        }

        .save-btn {
          background-color: #059669;
          border-color: #059669;
        }

        .save-btn:hover {
          background-color: #047857;
        }

        .cancel-btn {
          background-color: #dc2626;
          border-color: #dc2626;
        }

        .cancel-btn:hover {
          background-color: #b91c1c;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #9CA3AF;
        }

        .error-message {
          background-color: #dc2626;
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .App-header h1 {
          color: white;
          margin-bottom: 30px;
        }
      `}</style>

      <header className="App-header">
        <h1>Interactive Coin Status Management</h1>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </header>

      <main>
        <div className="coin-selector">
          <h3>Coin Selector</h3>
          <AdvancedCoinSelector
            selectedSymbol={selectedSymbol}
            onSymbolSelect={handleSymbolSelect}
            selectedMarket={selectedMarket}
          />
        </div>

        <CoinDatabaseTable />
      </main>
    </div>
  );
};

export default CoinManagement;
