import { useState, useEffect } from "react";
import ThemeProvider from "../shared/ui/theme-provider";
import ThemeToggle from "../shared/ui/theme-toggle";
import { getSettings, saveSettings, CoinSetting } from "../shared/api/trading";
import { RefreshCw, Save, Calendar, Clock, AlertCircle } from "lucide-react";

interface DatabaseProps {
  onBackToTrading?: () => void;
}

const DatabasePage = ({ onBackToTrading }: DatabaseProps = {}) => {
  const [activeTable, setActiveTable] = useState("database");
  const [settings, setSettings] = useState<CoinSetting[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load settings from backend
  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Get current setting for symbol/market
  const getCurrentSetting = (symbol: string, market: string): CoinSetting => {
    const existing = settings.find(s => s.symbol === symbol && s.market === market);
    return existing || {
      symbol,
      market,
      store_live: false,
      load_history: false,
      history_until: '',
      favorite: false,
      chart_resolution: '1m',
      db_resolutions: []
    };
  };

  // Update setting
  const updateSetting = (symbol: string, market: string, updates: Partial<CoinSetting>) => {
    setSettings(prev => {
      const existingIndex = prev.findIndex(s => s.symbol === symbol && s.market === market);
      const newSetting = { ...getCurrentSetting(symbol, market), ...updates };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newSetting;
        return updated;
      } else {
        return [...prev, newSetting];
      }
    });
  };

  // Save settings to backend
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const success = await saveSettings(settings);
      if (success) {
        setSuccessMessage('Settings saved successfully!');
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Get all unique symbols/markets from settings
  const allSymbols = Array.from(new Set(settings.map(s => `${s.symbol}_${s.market}`)))
    .map(key => {
      const parts = key.split('_');
      const market = parts.pop() || '';
      const symbol = parts.join('_');
      return { symbol, market };
    })
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  const sidebarItems = [
    { id: "database", name: "Database", icon: "🗄️" },
    { id: "analytics", name: "Analytics", icon: "📊" },
    { id: "wallets", name: "Wallets", icon: "💰" },
    { id: "transactions", name: "Transactions", icon: "🔄" },
  ];

  const renderDatabaseSection = () => (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Save size={16} />
            {successMessage}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Settings Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      COIN
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      EXCHANGE
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Market
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      LIVE
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      HISTORIC
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      UNTIL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allSymbols.map(({ symbol, market }) => {
                    const setting = getCurrentSetting(symbol, market);
                    const exchange = setting.exchange || 'bitget';
                    return (
                      <tr key={`${symbol}_${market}_${exchange}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {symbol}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exchange === 'binance' 
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' 
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                          }`}>
                            {exchange.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                            {market}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.store_live}
                              onChange={(e) => updateSetting(symbol, market, { store_live: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={setting.load_history}
                              onChange={(e) => updateSetting(symbol, market, { load_history: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="date"
                              value={setting.history_until || ''}
                              onChange={(e) => {
                                updateSetting(symbol, market, { 
                                  history_until: e.target.value 
                                });
                              }}
                              disabled={!setting.load_history}
                              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTable) {
      case "database":
        return renderDatabaseSection();
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {sidebarItems.find((item) => item.id === activeTable)?.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This section is under development
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen font-['Inter']">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBackToTrading && (
                <button
                  onClick={onBackToTrading}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  ← Back to Trading
                </button>
              )}
              <h1 className="text-2xl font-bold">Database Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => loadSettings()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Data Tables
              </h3>
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTable(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTable === item.id
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </div>
    </ThemeProvider>
  );
};

export default DatabasePage;
