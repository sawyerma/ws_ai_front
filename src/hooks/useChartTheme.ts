// hooks/useChartTheme.ts - Theme management for charts
import { useState, useEffect } from 'react';
import { SettingsService } from '../services/storage';

interface ChartTheme {
  backgroundColor: string;
  gridColor: string;
  textColor: string;
  upCandleColor: string;
  downCandleColor: string;
  upWickColor: string;
  downWickColor: string;
}

const DEFAULT_LIGHT_THEME: ChartTheme = {
  backgroundColor: "#ffffff",
  gridColor: "#e5e7eb",
  textColor: "#111827",
  upCandleColor: "#22c55e",
  downCandleColor: "#ef4444",
  upWickColor: "#22c55e",
  downWickColor: "#ef4444",
};

const DEFAULT_DARK_THEME: ChartTheme = {
  backgroundColor: "#1f2937",
  gridColor: "#374151",
  textColor: "#f9fafb",
  upCandleColor: "#22c55e",
  downCandleColor: "#ef4444",
  upWickColor: "#22c55e",
  downWickColor: "#ef4444",
};

export const useChartTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState<ChartTheme>(DEFAULT_LIGHT_THEME);

  // Monitor dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
      setTheme(isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const updateTheme = (updates: Partial<ChartTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return {
    theme,
    isDarkMode,
    updateTheme,
  };
};