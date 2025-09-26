import { useState, useEffect, useCallback } from 'react';
import { EnterpriseAPI } from '../../../services/api/enterprise';

// 🏢 ENTERPRISE MARKET DATA HOOK
export const useEnterpriseMarketData = (exchange = 'binance', symbols?: string[]) => {
  const [marketData, setMarketData] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [institutionalFlow, setInstitutionalFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEnterpriseData = useCallback(async () => {
    try {
      setLoading(true);
      const [marketRes, analyticsRes, flowRes] = await Promise.all([
        EnterpriseAPI.getEnterpriseMarketData(exchange, symbols),
        EnterpriseAPI.getAdvancedAnalytics('24h'),
        EnterpriseAPI.getInstitutionalFlow(exchange)
      ]);

      setMarketData(marketRes);
      setAnalytics(analyticsRes);
      setInstitutionalFlow(flowRes);
    } catch (err) {
      console.error('Enterprise data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [exchange, symbols]);

  useEffect(() => {
    fetchEnterpriseData();
    const interval = setInterval(fetchEnterpriseData, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [fetchEnterpriseData]);

  return {
    marketData,
    analytics,
    institutionalFlow,
    loading,
    refresh: fetchEnterpriseData
  };
};

// 📊 ADVANCED CHART HOOK
export const useAdvancedCharts = (symbol: string, interval = '1h') => {
  const [chartData, setChartData] = useState<any>(null);
  const [volumeProfile, setVolumeProfile] = useState<any>(null);
  const [marketStructure, setMarketStructure] = useState<any>(null);
  const [multiTimeframe, setMultiTimeframe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchChartData = useCallback(async () => {
    if (!symbol) return;

    try {
      setLoading(true);
      const [chartRes, volumeRes, structureRes, multiRes] = await Promise.all([
        EnterpriseAPI.getAdvancedChartData(symbol, interval),
        EnterpriseAPI.getVolumeProfileData(symbol),
        EnterpriseAPI.getMarketStructureAnalysis(symbol),
        EnterpriseAPI.getMultiTimeframeAnalysis(symbol, ['1h', '4h', '1d'])
      ]);

      setChartData(chartRes);
      setVolumeProfile(volumeRes);
      setMarketStructure(structureRes);
      setMultiTimeframe(multiRes);
    } catch (err) {
      console.error('Advanced chart data fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchChartData();
    const interval_id = setInterval(fetchChartData, 30000); // 30 seconds
    return () => clearInterval(interval_id);
  }, [fetchChartData]);

  return {
    chartData,
    volumeProfile,
    marketStructure,
    multiTimeframe,
    loading,
    refresh: fetchChartData
  };
};

// 🔧 ENTERPRISE DIAGNOSTICS HOOK
export const useEnterpriseDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [openApiSchema, setOpenApiSchema] = useState<any>(null);
  const [enterpriseConfig, setEnterpriseConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDiagnostics = useCallback(async () => {
    try {
      const [diagRes, schemaRes, configRes] = await Promise.all([
        EnterpriseAPI.getSystemDiagnostics(),
        EnterpriseAPI.getOpenAPISchema(),
        EnterpriseAPI.getEnterpriseConfig()
      ]);
      
      setDiagnostics(diagRes);
      setOpenApiSchema(schemaRes);
      setEnterpriseConfig(configRes);
    } catch (err) {
      console.error('Enterprise diagnostics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchDiagnostics]);

  const updateEnterpriseConfig = useCallback(async (newConfig: any) => {
    try {
      await EnterpriseAPI.updateEnterpriseSettings(newConfig);
      await fetchDiagnostics(); // Refresh data
    } catch (err) {
      console.error('Failed to update enterprise config:', err);
    }
  }, [fetchDiagnostics]);

  return {
    diagnostics,
    openApiSchema,
    enterpriseConfig,
    loading,
    refresh: fetchDiagnostics,
    updateConfig: updateEnterpriseConfig
  };
};
