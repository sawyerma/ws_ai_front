import { createContext, useContext, useState, ReactNode } from 'react';

interface TradingContextType {
  selectedExchange: string;
  selectedMarket: string;
  setSelectedExchange: (exchange: string) => void;
  setSelectedMarket: (market: string) => void;
}

const TradingContext = createContext<TradingContextType>({
  selectedExchange: "bitget",
  selectedMarket: "spot",
  setSelectedExchange: () => {},
  setSelectedMarket: () => {},
});

interface TradingProviderProps {
  children: ReactNode;
}

export const TradingProvider = ({ children }: TradingProviderProps) => {
  const [selectedExchange, setSelectedExchange] = useState("bitget");
  const [selectedMarket, setSelectedMarket] = useState("spot");

  return (
    <TradingContext.Provider
      value={{
        selectedExchange,
        selectedMarket,
        setSelectedExchange,
        setSelectedMarket,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  return context;
};

export { TradingContext };
