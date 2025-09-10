import { useState, useEffect } from 'react';
import { SettingsService } from '../../../services/storage/settings';

export const useChartTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [chartSettings, setChartSettings] = useState(() => {
    return SettingsService.getSettings().chartSettings || {
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
  });

  // Theme detection
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Listen for chart settings changes from localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          if (newSettings.chartSettings) {
            setChartSettings(newSettings.chartSettings);
          }
        } catch (error) {
          console.error('Error parsing app settings from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCustomSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.chartSettings) {
        setChartSettings(customEvent.detail.chartSettings);
      }
    };
    window.addEventListener('chartSettingsChanged', handleCustomSettingsChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chartSettingsChanged', handleCustomSettingsChange);
    };
  }, []);

  const getChartTheme = () => {
    const currentSettings = chartSettings;
    
    if (isDarkMode) {
      return {
        layout: {
          background: { type: "Solid", color: currentSettings.darkBackgroundColor },
          textColor: currentSettings.darkTextColor,
        },
        grid: {
          vertLines: { color: currentSettings.darkGridColor },
          horzLines: { color: currentSettings.darkGridColor },
        },
        candleColors: {
          upColor: currentSettings.upCandleColor,
          downColor: currentSettings.downCandleColor,
          wickUpColor: currentSettings.upWickColor,
          wickDownColor: currentSettings.downWickColor,
          borderVisible: currentSettings.borderVisible,
        }
      };
    } else {
      return {
        layout: {
          background: { type: "Solid", color: currentSettings.backgroundColor },
          textColor: currentSettings.textColor,
        },
        grid: {
          vertLines: { color: currentSettings.gridColor },
          horzLines: { color: currentSettings.gridColor },
        },
        candleColors: {
          upColor: currentSettings.upCandleColor,
          downColor: currentSettings.downCandleColor,
          wickUpColor: currentSettings.upWickColor,
          wickDownColor: currentSettings.downWickColor,
          borderVisible: currentSettings.borderVisible,
        }
      };
    }
  };

  const updateChartSettings = (newSettings: any) => {
    setChartSettings(newSettings);
    SettingsService.updateChartSettings(newSettings);
  };

  return { chartSettings, isDarkMode, getChartTheme, updateChartSettings };
};
