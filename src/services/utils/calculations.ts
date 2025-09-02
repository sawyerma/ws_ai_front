// services/utils/calculations.ts - NUR Berechnungen
export class ChartCalculations {
  static calculateMA(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }
  
  static calculateEMA(data: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    result[0] = data[0];
    
    for (let i = 1; i < data.length; i++) {
      result[i] = (data[i] * multiplier) + (result[i - 1] * (1 - multiplier));
    }
    
    return result;
  }
  
  static calculateRSI(prices: number[], period: number = 14): number[] {
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = this.calculateMA(gains, period);
    const avgLoss = this.calculateMA(losses, period);
    
    const rsi: number[] = [NaN]; // First value is NaN
    
    for (let i = 0; i < avgGain.length; i++) {
      if (isNaN(avgGain[i]) || avgLoss[i] === 0) {
        rsi.push(NaN);
      } else {
        const rs = avgGain[i] / avgLoss[i];
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsi;
  }
  
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    const middle = this.calculateMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = prices.slice(i - period + 1, i + 1);
        const std = this.calculateStandardDeviation(slice);
        upper.push(middle[i] + (std * stdDev));
        lower.push(middle[i] - (std * stdDev));
      }
    }
    
    return { upper, middle, lower };
  }
  
  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }
  
  static calculateVWAP(prices: number[], volumes: number[]): number[] {
    const vwap: number[] = [];
    let cumulativeTPV = 0; // Typical Price * Volume
    let cumulativeVolume = 0;
    
    for (let i = 0; i < prices.length; i++) {
      const typicalPrice = prices[i]; // Simplified: using close price
      cumulativeTPV += typicalPrice * volumes[i];
      cumulativeVolume += volumes[i];
      
      vwap.push(cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : NaN);
    }
    
    return vwap;
  }
}