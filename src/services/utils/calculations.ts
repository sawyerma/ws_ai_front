// Chart Calculations
// Mathematical calculations for chart analysis

import { ChartData, CandleData } from '../../types';

export class ChartCalculations {
  static parseTimeframe(tf: string): number {
    const unit = tf.slice(-1);
    const value = parseInt(tf.slice(0, -1), 10);
    const validUnits = ['s', 'm', 'h', 'd'];
    
    if (isNaN(value) || !validUnits.includes(unit)) {
      console.warn(`Invalid timeframe: ${tf}, using default 1h`);
      return 3600000;
    }
    
    switch(unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 3600000;
    }
  }
  
  static calculateSMA(data: number[], period: number): number[] {
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
    
    // First EMA is SMA
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else if (i === period - 1) {
        result.push(ema);
      } else {
        ema = (data[i] - ema) * multiplier + ema;
        result.push(ema);
      }
    }
    
    return result;
  }
  
  static calculateRSI(closes: number[], period: number = 14): number[] {
    const result: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate gains and losses
    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    // Calculate initial averages
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    result.push(NaN); // First value is always NaN
    
    for (let i = 0; i < gains.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else if (i === period - 1) {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      } else {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
    
    return result;
  }
  
  static calculateBollingerBands(
    closes: number[], 
    period: number = 20, 
    stdDev: number = 2
  ): { upper: number[]; middle: number[]; lower: number[] } {
    const middle = this.calculateSMA(closes, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = 0; i < closes.length; i++) {
      if (i < period - 1) {
        upper.push(NaN);
        lower.push(NaN);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const mean = middle[i];
        const variance = slice.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / period;
        const std = Math.sqrt(variance);
        
        upper.push(mean + (stdDev * std));
        lower.push(mean - (stdDev * std));
      }
    }
    
    return { upper, middle, lower };
  }
  
  static findHighLow(candles: CandleData[]): { high: number; low: number } {
    if (candles.length === 0) return { high: 0, low: 0 };
    
    let high = candles[0].high;
    let low = candles[0].low;
    
    for (const candle of candles) {
      high = Math.max(high, candle.high);
      low = Math.min(low, candle.low);
    }
    
    return { high, low };
  }
  
  static calculateVWAP(candles: CandleData[]): number[] {
    const result: number[] = [];
    let cumulativeVolume = 0;
    let cumulativeVolumePrice = 0;
    
    for (const candle of candles) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumulativeVolumePrice += typicalPrice * candle.volume;
      cumulativeVolume += candle.volume;
      
      result.push(cumulativeVolume > 0 ? cumulativeVolumePrice / cumulativeVolume : typicalPrice);
    }
    
    return result;
  }
}