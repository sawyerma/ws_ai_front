// Chart Theme Hook
// Manages chart theme and settings

import { useState, useEffect, useCallback } from 'react';
import { SettingsService } from '../services/storage';

interface ChartTheme {
  layout: {
    background: { type: string; color: string };
    textColor: string;
  };
  grid: {
    vertLines: { color: string };
    horzLines: { color: string };
  };
  candleColors: {
    upColor: string;
    downColor: string;
    wickUpColor: string;
    wickDownColor: string;
    borderVisible: boolean;
  };
}

interface ChartSettings {
  backgroundColor: string;
  darkBackgroundColor: string;
  gridColor: string;
  darkGridColor: string;
  textColor: string;
  darkTextColor: string;
  upCandleColor: string;
  downCandleColor: string;
  upWickColor: string;
  downWickColor: string;
  borderVisible: boolean;
  timeScaleVisible: boolean;
  priceScaleVisible: boolean;
  crosshairVisible: boolean;
  volumeVisible: boolean;
}

const DEFAULT_SETTINGS: ChartSettings = {
  backgroundColor: "#ffffff",
  darkBackgroundColor: "#1f2937",
  gridColor: "#e5e7eb",
  darkGridColor: "#374151",
  textColor: "#111827",
  darkTextColor: "#f9fafb",
  upCandleColor: "#22c55e",
  downCandleColor: "#ef4444",
  upWickColor: "#22c55e",
  downWickColor: "#ef4444",
  borderVisible: false,
  timeScaleVisible: true,
  priceScaleVisible: true,
  crosshairVisible: true,
  volumeVisible: false,
};

export const useChartTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState<ChartSettings>(DEFAULT_SETTINGS);

  // Detect theme changes
  useEffect(() => {
    const detectTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedTheme = SettingsService.getSetting('theme');
      
      if (storedTheme === 'dark' || (storedTheme === 'system' && prefersDark)) {
        setIsDarkMode(true);
      } else {
        setIsDarkMode(false);
      }
    };

    detectTheme();

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', detectTheme);

    return () => mediaQuery.removeEventListener('change', detectTheme);
  }, []);

  // Load settings from storage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('chartSettings');
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }
      } catch (error) {
        console.error('Error loading chart settings:', error);
      }
    };

    loadSettings();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'chartSettings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(prev => ({ ...prev, ...newSettings }));
        } catch (error) {
          console.error('Error parsing chart settings:', error);
        }
      }
    };

    // Listen for custom events
    const handleCustomSettingsChange = (e: CustomEvent) => {
      setSettings(prev => ({ ...prev, ...e.detail }));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('chartSettingsChanged', handleCustomSettingsChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chartSettingsChanged', handleCustomSettingsChange as EventListener);
    };
  }, []);

  // Generate theme object
  const theme: ChartTheme = {
    layout: {
      background: { 
        type: "Solid", 
        color: isDarkMode ? settings.darkBackgroundColor : settings.backgroundColor 
      },
      textColor: isDarkMode ? settings.darkTextColor : settings.textColor,
    },
    grid: {
      vertLines: { color: isDarkMode ? settings.darkGridColor : settings.gridColor },
      horzLines: { color: isDarkMode ? settings.darkGridColor : settings.gridColor },
    },
    candleColors: {
      upColor: settings.upCandleColor,
      downColor: settings.downCandleColor,
      wickUpColor: settings.upWickColor,
      wickDownColor: settings.downWickColor,
      borderVisible: settings.borderVisible,
    }
  };

  // Update chart theme
  const updateChartTheme = useCallback((
    chartInstance: any,
    seriesRef: any,
    volumeSeriesRef: any
  ) => {
    if (!chartInstance || !seriesRef) return;

    try {
      // Update chart layout
      chartInstance.applyOptions({
        layout: theme.layout,
        grid: theme.grid,
        crosshair: { mode: settings.crosshairVisible ? 1 : 0 },
        timeScale: { 
          visible: settings.timeScaleVisible,
          borderColor: theme.layout.textColor,
        },
        rightPriceScale: { 
          visible: settings.priceScaleVisible,
          textColor: theme.layout.textColor,
        },
      });

      // Update series colors
      seriesRef.applyOptions({
        upColor: theme.candleColors.upColor,
        downColor: theme.candleColors.downColor,
        wickUpColor: theme.candleColors.wickUpColor,
        wickDownColor: theme.candleColors.wickDownColor,
        borderVisible: theme.candleColors.borderVisible,
      });

      // Update volume series if exists
      if (volumeSeriesRef && settings.volumeVisible) {
        volumeSeriesRef.applyOptions({
          color: theme.candleColors.upColor,
        });
      }

    } catch (error) {
      console.error('Error updating chart theme:', error);
    }
  }, [theme, settings]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ChartSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    try {
      localStorage.setItem('chartSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving chart settings:', error);
    }
  }, [settings]);

  return {
    theme,
    settings,
    isDarkMode,
    updateChartTheme,
    updateSettings,
  };
};