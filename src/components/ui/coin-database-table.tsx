import React, { useState } from 'react';
import { useCoinStatus } from '../../context/CoinStatusContext';
import { Calendar, AlertCircle } from 'lucide-react';

const CoinDatabaseTable = () => {
  const { coins, updateUntilDate, error } = useCoinStatus();
  const [editingUntilDate, setEditingUntilDate] = useState<string | null>(null);
  const [tempUntilDate, setTempUntilDate] = useState('');

  // Nur Coins anzeigen, die live ODER historic aktiviert sind
  const activeCoins = Object.entries(coins).filter(([_, data]) => 
    data.live || data.historic
  ).map(([key, data]) => {
    const parts = key.split('_');
    const market = parts.pop() || '';
    const symbol = parts.join('_');
    return { symbol, market, data, key };
  }).sort((a, b) => a.symbol.localeCompare(b.symbol));

  const handleUntilDateChange = (key: string, currentUntilDate?: string) => {
    setEditingUntilDate(key);
    setTempUntilDate(currentUntilDate || '');
  };

  const saveUntilDate = async (symbol: string, market: string) => {
    if (tempUntilDate) {
      await updateUntilDate(symbol, market, tempUntilDate);
    }
    setEditingUntilDate(null);
  };

  const cancelEdit = () => {
    setEditingUntilDate(null);
    setTempUntilDate('');
  };

  const getStatusIndicator = (status: boolean | 'loading', type: 'live' | 'historic') => {
    if (type === 'live') {
      return (
        <span className={`status-indicator ${status ? 'green' : 'red'}`}>
          {status ? 'Active' : 'Inactive'}
        </span>
      );
    }
    
    if (type === 'historic') {
      const color = status === 'loading' ? 'orange' : status ? 'green' : 'red';
      const text = status === 'loading' ? 'Loading...' : status ? 'Complete' : 'Inactive';
      return (
        <span className={`status-indicator ${color}`}>
          {text}
        </span>
      );
    }
  };

  if (activeCoins.length === 0) {
    return (
      <div className="database-table">
        <h3>Live Coin Database</h3>
        <div className="empty-state">
          <p>No coins with live or historic data collection enabled.</p>
          <p>Use the coin selector dropdown to activate coins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="database-table">
      <h3>Live Coin Database</h3>
      
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Market</th>
            <th>Live Status</th>
            <th>Historic Status</th>
            <th>Until Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeCoins.map(({ symbol, market, data, key }) => (
            <tr key={key}>
              <td>
                <span className="coin-symbol">{symbol}</span>
              </td>
              <td>
                <span className="market-badge">{market}</span>
              </td>
              <td>
                {getStatusIndicator(data.live, 'live')}
              </td>
              <td>
                {getStatusIndicator(data.historic, 'historic')}
              </td>
              <td>
                {editingUntilDate === key ? (
                  <input
                    type="date"
                    value={tempUntilDate}
                    onChange={(e) => setTempUntilDate(e.target.value)}
                    max="2017-01-01"
                    className="date-input"
                  />
                ) : (
                  <span className="until-date">
                    {data.until_date || 'Not set'}
                  </span>
                )}
              </td>
              <td>
                {editingUntilDate === key ? (
                  <div className="action-buttons">
                    <button 
                      onClick={() => saveUntilDate(symbol, market)}
                      className="save-btn"
                    >
                      Save
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleUntilDateChange(key, data.until_date)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoinDatabaseTable;
