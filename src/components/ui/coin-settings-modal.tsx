import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, AlertCircle } from 'lucide-react';
import { CoinSetting, getSettings, saveSettings } from '../../api/symbols';

interface CoinSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol?: string;
  selectedMarket?: string;
}

const CoinSettingsModal: React.FC<CoinSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedSymbol,
  selectedMarket
}) => {
  const [settings, setSettings] = useState<CoinSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setError('Fehler beim Laden der Einstellungen');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (symbol: string, market: string, updates: Partial<CoinSetting>) => {
    setSettings(prev => prev.map(setting => 
      setting.symbol === symbol && setting.market === market
        ? { ...setting, ...updates }
        : setting
    ));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await saveSettings(settings);
      setHasChanges(false);
      onClose();
    } catch (err) {
      setError('Fehler beim Speichern der Einstellungen');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSettings = settings.filter(setting => {
    if (selectedSymbol && setting.symbol !== selectedSymbol) return false;
    if (selectedMarket && setting.market !== selectedMarket) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Coin Einstellungen
            {selectedSymbol && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({selectedSymbol}{selectedMarket ? ` - ${selectedMarket}` : ''})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Lade Einstellungen...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Markt
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Historie laden
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Historie bis
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Intervall (Min)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSettings.map((setting) => {
                    const { symbol, market } = setting;
                    return (
                      <tr key={`${symbol}-${market}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {market}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={setting.load_history}
                            onChange={(e) => updateSetting(symbol, market, { load_history: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="dd.mm.yyyy"
                              value={setting.history_until ? 
                                new Date(setting.history_until).toLocaleDateString('de-DE', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                }) : 
                                ''
                              }
                              onChange={(e) => {
                                // Set today's date when user types anything
                                if (e.target.value && setting.load_history) {
                                  const today = new Date();
                                  updateSetting(symbol, market, { 
                                    history_until: today.toISOString().split('T')[0]
                                  });
                                } else {
                                  updateSetting(symbol, market, { history_until: '' });
                                }
                              }}
                              onClick={() => {
                                // Toggle between today and empty
                                if (setting.load_history) {
                                  if (setting.history_until) {
                                    updateSetting(symbol, market, { history_until: '' });
                                  } else {
                                    const today = new Date();
                                    updateSetting(symbol, market, { 
                                      history_until: today.toISOString().split('T')[0]
                                    });
                                  }
                                }
                              }}
                              disabled={!setting.load_history}
                              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={setting.interval_minutes}
                              onChange={(e) => updateSetting(symbol, market, { 
                                interval_minutes: parseInt(e.target.value) || 1 
                              })}
                              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-24 text-center"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredSettings.length} Einstellungen
            {hasChanges && (
              <span className="ml-2 text-orange-600 dark:text-orange-400">
                • Ungespeicherte Änderungen
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinSettingsModal;