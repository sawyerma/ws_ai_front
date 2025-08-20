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
            ...state.coins[action.payload.coin],
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
}

const CoinStatusContext = createContext<CoinStatusContextType | null>(null);

export function CoinStatusProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(coinStatusReducer, initialState);

  // Polling alle 5 Sekunden für Status-Updates
  useEffect(() => {
    const fetchCoinStatus = async () => {
      try {
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
      } catch (error) {
        console.error('Error fetching coin status:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch coin status' });
      }
    };

    // Initial load
    fetchCoinStatus();

    // Polling alle 5 Sekunden
    const interval = setInterval(fetchCoinStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const enableLive = async (symbol: string, market: string) => {
    const key = `${symbol}_${market}`;
    
    // Optimistic Update
    dispatch({
      type: 'UPDATE_COIN_STATUS',
      payload: { coin: key, status: { live: true } }
    });

    try {
      const success = await saveSettings({
        symbol,
        market,
        store_live: true,
        load_history: false,
        favorite: false,
        chart_resolution: '1m',
        db_resolutions: []
      });

      if (!success) {
        // Revert bei Fehler
        dispatch({
          type: 'UPDATE_COIN_STATUS',
          payload: { coin: key, status: { live: false } }
        });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to enable live data' });
      }
    } catch (error) {
      // Revert bei Fehler
      dispatch({
        type: 'UPDATE_COIN_STATUS',
        payload: { coin: key, status: { live: false } }
      });
      console.error('Error enabling live:', error);
    }
  };

  const enableHistoric = async (symbol: string, market: string) => {
    const key = `${symbol}_${market}`;
    
    // Optimistic Update
    dispatch({
      type: 'UPDATE_COIN_STATUS',
      payload: { coin: key, status: { historic: 'loading' } }
    });

    try {
      const success = await saveSettings({
        symbol,
        market,
        store_live: true, // Historic braucht auch Live
        load_history: true,
        history_until: '2017-01-01',
        favorite: false,
        chart_resolution: '1m',
        db_resolutions: []
      });

      if (!success) {
        // Revert bei Fehler
        dispatch({
          type: 'UPDATE_COIN_STATUS',
          payload: { coin: key, status: { historic: false } }
        });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to enable historic data' });
      }
    } catch (error) {
      // Revert bei Fehler
      dispatch({
        type: 'UPDATE_COIN_STATUS',
        payload: { coin: key, status: { historic: false } }
      });
      console.error('Error enabling historic:', error);
    }
  };

  return (
    <CoinStatusContext.Provider value={{
      coins: state.coins,
      loading: state.loading,
      error: state.error,
      enableLive,
      enableHistoric
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