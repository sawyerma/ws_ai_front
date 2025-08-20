import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getSettings, saveSettings, CoinSetting } from '../api/symbols';

interface CoinStatus {
  live: boolean;
  historic: boolean | 'loading';
  until_date?: string;
}

interface CoinStatusState {
  coins: Record<string, CoinStatus>;
  loading: boolean;
  error: string | null;
}

type CoinStatusAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_COIN_STATUS'; payload: { coin: string; status: Partial<CoinStatus> } }
  | { type: 'SET_COINS'; payload: Record<string, CoinStatus> }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: CoinStatusState = {
  coins: {},
  loading: false,
  error: null
};

function coinStatusReducer(state: CoinStatusState, action: CoinStatusAction): CoinStatusState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_COIN_STATUS':
      return {
        ...state,
        coins: {
          ...state.coins,
          [action.payload.coin]: {
            live: state.coins[action.payload.coin]?.live || false,
            historic: state.coins[action.payload.coin]?.historic || false,
            until_date: state.coins[action.payload.coin]?.until_date,
            ...action.payload.status
          }
        }
      };
    case 'SET_COINS':
      return { ...state, coins: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface CoinStatusContextType {
  coins: Record<string, CoinStatus>;
  loading: boolean;
  error: string | null;
  enableLive: (symbol: string, market: string) => Promise<void>;
  enableHistoric: (symbol: string, market: string) => Promise<void>;
  updateUntilDate: (symbol: string, market: string, untilDate: string) => Promise<void>;
}

const CoinStatusContext = createContext<CoinStatusContextType | null>(null);

export function CoinStatusProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(coinStatusReducer, initialState);

  const fetchCoinStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const settings = await getSettings();
      const coinStatus: Record<string, CoinStatus> = {};
      
      settings.forEach((setting: CoinSetting) => {
        const key = `${setting.symbol}_${setting.market}`;
        coinStatus[key] = {
          live: setting.store_live,
          historic: setting.load_history,
          until_date: setting.history_until
        };
      });
      
      dispatch({ type: 'SET_COINS', payload: coinStatus });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error fetching coin status:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch coin status' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Polling alle 5 Sekunden für Status-Updates
  useEffect(() => {
    // Initial load
    fetchCoinStatus();

    // Polling alle 5 Sekunden
    const interval = setInterval(fetchCoinStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const enableLive = async (symbol: string, market: string) => {
    const key = `${symbol}_${market}`;
    
    console.log(`[CoinStatus] enableLive called for ${symbol}/${market}`);
    
    // Optimistic Update
    dispatch({
      type: 'UPDATE_COIN_STATUS',
      payload: { coin: key, status: { live: true } }
    });

    try {
      // Hole bestehende Settings für diesen Coin
      console.log(`[CoinStatus] Fetching existing settings for ${symbol}/${market}`);
      const existingSettings = await getSettings(undefined, symbol, market);
      const currentSetting: Partial<CoinSetting> = existingSettings[0] || {};
      
      const settingsToSave = {
        exchange: 'bitget', // Default exchange
        symbol,
        market,
        store_live: true,
        load_history: currentSetting.load_history || false,
        history_until: currentSetting.history_until,
        favorite: currentSetting.favorite || false,
        chart_resolution: currentSetting.chart_resolution || '1m',
        db_resolutions: currentSetting.db_resolutions || []
      };
      
      console.log(`[CoinStatus] Saving settings:`, settingsToSave);
      const success = await saveSettings(settingsToSave);

      if (!success) {
        console.error(`[CoinStatus] Failed to save settings for ${symbol}/${market}`);
        // Revert bei Fehler
        dispatch({
          type: 'UPDATE_COIN_STATUS',
          payload: { coin: key, status: { live: false } }
        });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to enable live data' });
      } else {
        console.log(`[CoinStatus] Successfully enabled live for ${symbol}/${market}`);
      }
    } catch (error) {
      console.error(`[CoinStatus] Error enabling live for ${symbol}/${market}:`, error);
      // Revert bei Fehler
      dispatch({
        type: 'UPDATE_COIN_STATUS',
        payload: { coin: key, status: { live: false } }
      });
      dispatch({ type: 'SET_ERROR', payload: 'Error enabling live data' });
    }
  };

  const enableHistoric = async (symbol: string, market: string) => {
    const key = `${symbol}_${market}`;
    
    console.log(`[CoinStatus] enableHistoric called for ${symbol}/${market}`);
    
    // Optimistic Update
    dispatch({
      type: 'UPDATE_COIN_STATUS',
      payload: { coin: key, status: { historic: 'loading' } }
    });

    try {
      // Hole bestehende Settings für diesen Coin
      console.log(`[CoinStatus] Fetching existing settings for ${symbol}/${market}`);
      const existingSettings = await getSettings(undefined, symbol, market);
      const currentSetting: Partial<CoinSetting> = existingSettings[0] || {};
      
      const defaultUntilDate = '2017-01-01';
      const settingsToSave = {
        exchange: 'bitget', // Default exchange
        symbol,
        market,
        store_live: true, // Historic braucht auch Live
        load_history: true,
        history_until: defaultUntilDate, // Immer 2017-01-01 als Default
        favorite: currentSetting.favorite || false,
        chart_resolution: currentSetting.chart_resolution || '1m',
        db_resolutions: currentSetting.db_resolutions || []
      };
      
      console.log(`[CoinStatus] Saving historic settings:`, settingsToSave);
      const success = await saveSettings(settingsToSave);

      if (!success) {
        console.error(`[CoinStatus] Failed to save historic settings for ${symbol}/${market}`);
        // Revert bei Fehler
        dispatch({
          type: 'UPDATE_COIN_STATUS',
          payload: { coin: key, status: { historic: false } }
        });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to enable historic data' });
      } else {
        console.log(`[CoinStatus] Successfully enabled historic for ${symbol}/${market}`);
        // Success Update: historic: true, live: true, until_date setzen
        dispatch({
          type: 'UPDATE_COIN_STATUS',
          payload: { 
            coin: key, 
            status: { 
              historic: true,
              live: true, // Historic aktiviert auch Live
              until_date: defaultUntilDate
            } 
          }
        });
      }
    } catch (error) {
      console.error(`[CoinStatus] Error enabling historic for ${symbol}/${market}:`, error);
      // Revert bei Fehler
      dispatch({
        type: 'UPDATE_COIN_STATUS',
        payload: { coin: key, status: { historic: false } }
      });
      dispatch({ type: 'SET_ERROR', payload: 'Error enabling historic data' });
    }
  };

  const updateUntilDate = async (symbol: string, market: string, untilDate: string) => {
    try {
      // Hole bestehende Settings für diesen Coin
      const existingSettings = await getSettings(undefined, symbol, market);
      const currentSetting = existingSettings[0];
      
      if (!currentSetting) {
        dispatch({ type: 'SET_ERROR', payload: 'Settings not found for this coin' });
        return;
      }

      const success = await saveSettings({
        ...currentSetting,
        history_until: untilDate
      });

      if (!success) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update until date' });
      } else {
        // Update local state
        const key = `${symbol}_${market}`;
        dispatch({
          type: 'UPDATE_COIN_STATUS',
          payload: { coin: key, status: { until_date: untilDate } }
        });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error updating until date' });
      console.error('Error updating until date:', error);
    }
  };

  return (
    <CoinStatusContext.Provider value={{
      coins: state.coins,
      loading: state.loading,
      error: state.error,
      enableLive,
      enableHistoric,
      updateUntilDate
    }}>
      {children}
    </CoinStatusContext.Provider>
  );
}

export const useCoinStatus = () => {
  const context = useContext(CoinStatusContext);
  if (!context) {
    throw new Error('useCoinStatus must be used within a CoinStatusProvider');
  }
  return context;
};
