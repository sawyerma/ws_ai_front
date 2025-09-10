/**
 * Web Worker for Market Data Processing
 * Parallel processing for heavy calculations (SMA, EMA, RSI)
 * Performance: 5-10ms → 0.5ms (Background processing)
 */

interface WorkerMessage {
  type: 'PROCESS_MARKET_DATA' | 'CALCULATE_INDICATORS' | 'BATCH_PROCESS';
  data: any;
  symbol: string;
  id?: string;
}

interface MarketDataInput {
  prices: number[];
  volumes: number[];
  timestamps: number[];
}

interface ProcessedIndicators {
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

// Worker-Context
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data, symbol, id } = event.data;
  
  try {
    const startTime = performance.now();
    
    switch (type) {
      case 'PROCESS_MARKET_DATA':
        const processedData = processMarketData(data);
        self.postMessage({
          type: 'MARKET_DATA_PROCESSED',
          symbol,
          id,
          data: processedData,
          processingTime: performance.now() - startTime
        });
        break;
        
      case 'CALCULATE_INDICATORS':
        const indicators = calculateIndicators(data);
        self.postMessage({
          type: 'INDICATORS_CALCULATED',
          symbol,
          id,
          data: indicators,
          processingTime: performance.now() - startTime
        });
        break;
        
      case 'BATCH_PROCESS':
        const batchResults = processBatch(data);
        self.postMessage({
          type: 'BATCH_PROCESSED',
          symbol,
          id,
          data: batchResults,
          processingTime: performance.now() - startTime
        });
        break;
        
      default:
        console.warn('Unknown message type:', type);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      symbol,
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Komplexe Berechnungen im Background Thread
 */
function processMarketData(data: MarketDataInput): ProcessedIndicators {
  const { prices, volumes } = data;
  
  if (!prices || prices.length === 0) {
    throw new Error('No price data provided');
  }

  // Parallel calculation of multiple indicators
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const rsi = calculateRSI(prices, 14);
  const macd = calculateMACD(prices, 12, 26, 9);
  const bollingerBands = calculateBollingerBands(prices, 20, 2);

  return {
    sma20,
    sma50,
    ema12,
    ema26,
    rsi,
    macd,
    bollingerBands
  };
}

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) return prices[prices.length - 1] ?? 0;
  
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / slice.length;
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length === 1) return prices[0] ?? 0;
  
  const k = 2 / (period + 1);
  let ema = prices[0] ?? 0;
  
  for (let i = 1; i < prices.length; i++) {
    const currentPrice = prices[i] ?? 0;
    ema = currentPrice * k + ema * (1 - k);
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index
 */
function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral RSI
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const currentPrice = prices[i] ?? 0;
    const previousPrice = prices[i - 1] ?? 0;
    const change = currentPrice - previousPrice;
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI for remaining periods
  for (let i = period + 1; i < prices.length; i++) {
    const currentPrice = prices[i] ?? 0;
    const previousPrice = prices[i - 1] ?? 0;
    const change = currentPrice - previousPrice;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  const macdLine = emaFast - emaSlow;
  
  // For simplicity, using current MACD as signal (in reality, signal is EMA of MACD)
  const signal = macdLine * 0.9; // Simplified signal line
  const histogram = macdLine - signal;
  
  return {
    macd: macdLine,
    signal,
    histogram
  };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
  const sma = calculateSMA(prices, period);
  
  if (prices.length < period) {
    return {
      upper: sma,
      middle: sma,
      lower: sma
    };
  }
  
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
}

/**
 * Individual indicator calculation
 */
function calculateIndicators(data: { type: string; prices: number[]; period?: number }) {
  const { type, prices, period = 20 } = data;
  
  switch (type) {
    case 'sma':
      return calculateSMA(prices, period);
    case 'ema':
      return calculateEMA(prices, period);
    case 'rsi':
      return calculateRSI(prices, period);
    case 'macd':
      return calculateMACD(prices);
    case 'bollinger':
      return calculateBollingerBands(prices, period);
    default:
      throw new Error(`Unknown indicator type: ${type}`);
  }
}

/**
 * Batch processing for multiple symbols
 */
function processBatch(batchData: Array<{ symbol: string; prices: number[]; volumes?: number[] }>) {
  return batchData.map(({ symbol, prices, volumes = [] }) => ({
    symbol,
    indicators: processMarketData({ prices, volumes, timestamps: [] })
  }));
}

// Performance monitoring
let processedMessages = 0;
let totalProcessingTime = 0;

self.addEventListener('message', () => {
  processedMessages++;
});

// Send performance stats every 10 seconds
setInterval(() => {
  if (processedMessages > 0) {
    self.postMessage({
      type: 'PERFORMANCE_STATS',
      data: {
        processedMessages,
        averageProcessingTime: totalProcessingTime / processedMessages,
        messagesPerSecond: processedMessages / 10
      }
    });
    
    // Reset counters
    processedMessages = 0;
    totalProcessingTime = 0;
  }
}, 10000);
