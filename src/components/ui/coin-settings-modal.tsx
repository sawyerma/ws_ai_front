import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, AlertCircle } from 'lucide-react';
import { CoinSetting, getSettings, saveSettings } from '../../api/symbols';

interface CoinSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol?: string;
  selectedMarket?: string;
}

// Date Picker Component
const DatePicker = ({ 
  value, 
  onChange, 
  disabled, 
  placeholder = "dd.mm.yyyy" 
}: {
  value: string;
  onChange: (date: string) => void;
  disabled: boolean;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);
  
  // Format date for display
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Generate calendar days
  const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Start from Monday
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const currentDate = selectedDate ? new Date(selectedDate) : new Date();
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  
  const calendarDays = generateCalendar(viewYear, viewMonth);
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  const handleDateSelect = (date: Date) => {
    const isoDate = date.toISOString().split('T')[0];
    setSelectedDate(isoDate);
    onChange(isoDate);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate('');
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full text-left pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {formatDateForDisplay(selectedDate) || placeholder}
        </button>
      </div>

      {isOpen && !disabled && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Calendar Popup */}
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 w-80">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear(viewYear - 1);
                  } else {
                    setViewMonth(viewMonth - 1);
                  }
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                ←
              </button>
              
              <div className="font-semibold text-gray-900 dark:text-white">
                {monthNames[viewMonth]} {viewYear}
              </div>
              
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear(viewYear + 1);
                  } else {
                    setViewMonth(viewMonth + 1);
                  }
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                →
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = date.getMonth() === viewMonth;
                const isSelected = selectedDate && new Date(selectedDate).toDateString() === date.toDateString();
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`
                      p-2 text-sm rounded hover:bg-blue-100 dark:hover:bg-blue-900
                      ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                      ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      ${isToday && !isSelected ? 'bg-blue-100 dark:bg-blue-900 font-bold' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Löschen
              </button>
              <button
                type="button"
                onClick={() => handleDateSelect(new Date())}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Heute
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

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
                          <DatePicker
                            value={setting.history_until || ''}
                            onChange={(date) => updateSetting(symbol, market, { history_until: date })}
                            disabled={!setting.load_history}
                            placeholder="dd.mm.yyyy"
                          />
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