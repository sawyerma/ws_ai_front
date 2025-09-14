import React from 'react';
import { useAPIKeys, useAPISettings } from '../hooks';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Label } from '@/shared/ui/label';

type Provider = 'binance' | 'bitget' | 'etherscan' | 'bscscan' | 'polygonscan' | 'coingecko' | 'telegram';

export const APIMain: React.FC = () => {
  const apiState = useAPIKeys();
  const apiSettings = useAPISettings();
  const [activeCategory, setActiveCategory] = React.useState<string>('market');
  const [selectedProvider, setSelectedProvider] = React.useState<Provider>('binance');
  
  // Local state for editing individual values before saving
  const [editingUrl, setEditingUrl] = React.useState<Record<string, string>>({});
  const [editingWebSocket, setEditingWebSocket] = React.useState<Record<string, string>>({});
  const [editingRateLimit, setEditingRateLimit] = React.useState<Record<string, number | string>>({});

  React.useEffect(() => {
    apiState.loadAPIKeys();
    apiSettings.loadSettings();
  }, []);

  const categories = [
    {
      id: 'market',
      name: 'Market APIs',
      icon: '📈',
      providers: ['binance', 'bitget'] as Provider[]
    },
    {
      id: 'whales', 
      name: 'Whale APIs',
      icon: '🐋',
      providers: ['etherscan', 'bscscan', 'polygonscan'] as Provider[]
    },
    {
      id: 'data',
      name: 'Data APIs', 
      icon: '📊',
      providers: ['coingecko'] as Provider[]
    },
    {
      id: 'notifications',
      name: 'Notifications', 
      icon: '📱',
      providers: ['telegram'] as Provider[]
    }
  ];

  const activeProviders = categories.find(c => c.id === activeCategory)?.providers || [];
  const activeCategory_obj = categories.find(c => c.id === activeCategory);

  // Default URLs from gui_api.md specification
  const getDefaultUrl = (provider: Provider, urlType: string): string => {
    const defaults: Record<Provider, Record<string, string>> = {
      binance: {
        spot: 'https://api.binance.com',
        usdtm: 'https://fapi.binance.com',
        coinm: 'https://dapi.binance.com',
        options: 'https://eapi.binance.com',
        portfolio: 'https://papi.binance.com'
      },
      bitget: {
        spot: 'https://api.bitget.com',
        usdtm: 'https://api.bitget.com',
        coinm: 'https://api.bitget.com',
        usdcm: 'https://api.bitget.com',
        susdt: 'https://api.bitget.com',
        scoin: 'https://api.bitget.com',
        public: 'https://api.bitget.com/api/v2/public/time'
      },
      etherscan: {
        api: 'https://api.etherscan.io/api'
      },
      bscscan: {
        api: 'https://api.bscscan.com/api'
      },
      polygonscan: {
        api: 'https://api.polygonscan.com/api'
      },
      coingecko: {
        free: 'https://api.coingecko.com/api/v3',
        pro: 'https://pro-api.coingecko.com/api/v3',
        ping: 'https://api.coingecko.com/api/v3/ping',
        price: 'https://api.coingecko.com/api/v3/simple/price'
      },
      telegram: {
        bot: 'https://api.telegram.org/bot{TOKEN}',
        sendMessage: 'https://api.telegram.org/bot{TOKEN}/sendMessage',
        sendPhoto: 'https://api.telegram.org/bot{TOKEN}/sendPhoto',
        sendDocument: 'https://api.telegram.org/bot{TOKEN}/sendDocument'
      }
    };
    return defaults[provider]?.[urlType] || '';
  };

  // Default WebSocket URLs from gui_api.md specification
  const getDefaultWebSocket = (provider: Provider, wsType: string): string => {
    const defaults: Partial<Record<Provider, Record<string, string>>> = {
      binance: {
        spot: 'wss://stream.binance.com:9443/ws',
        usdtm: 'wss://fstream.binance.com/ws',
        coinm: 'wss://dstream.binance.com/ws',
        options: 'wss://nbstream.binance.com/eoptions/ws',
        portfolio: 'wss://fstream-auth.binance.com/ws'
      },
      bitget: {
        spot: 'wss://ws.bitget.com/spot/v1/stream',
        usdtm: 'wss://ws.bitget.com/mix/v1/stream',
        coinm: 'wss://ws.bitget.com/mix/v1/stream',
        usdcm: 'wss://ws.bitget.com/mix/v1/stream',
        susdt: 'wss://ws.bitget.com/mix/v1/stream',
        scoin: 'wss://ws.bitget.com/mix/v1/stream'
      }
    };
    return defaults[provider]?.[wsType] || '';
  };

  // Default Rate Limits from gui_api.md specification
  const getDefaultRateLimit = (provider: Provider, limitType: string): number => {
    const defaults: Record<Provider, Record<string, number>> = {
      binance: {
        maxRps: 10,
        historicalRps: 5.0
      },
      bitget: {
        maxRps: 8,
        historicalRps: 3.0
      },
      etherscan: {
        dailyLimit: 100000
      },
      bscscan: {
        dailyLimit: 100000
      },
      polygonscan: {
        dailyLimit: 100000
      },
      coingecko: {
        monthlyLimit: 10000
      },
      telegram: {
        messagesPerMin: 30
      }
    };
    return defaults[provider]?.[limitType] || 0;
  };

  // Get current URL value (backend override or default fallback)
  const getCurrentUrl = (provider: Provider, urlType: string): string => {
    const editKey = `${provider}_${urlType}`;
    if (editingUrl[editKey] !== undefined) {
      return editingUrl[editKey];
    }
    // Try backend first, fallback to default
    return apiSettings.urls[provider]?.urls?.[urlType] || getDefaultUrl(provider, urlType);
  };

  // Get current WebSocket value (backend override or default fallback)
  const getCurrentWebSocket = (provider: Provider, wsType: string): string => {
    const editKey = `${provider}_${wsType}`;
    if (editingWebSocket[editKey] !== undefined) {
      return editingWebSocket[editKey];
    }
    // Try backend first, fallback to default
    return apiSettings.websockets[provider]?.websockets?.[wsType] || getDefaultWebSocket(provider, wsType);
  };

  // Get current rate limit value (backend override or default fallback)
  const getCurrentRateLimit = (provider: Provider, limitType: string): number | string => {
    const editKey = `${provider}_${limitType}`;
    if (editingRateLimit[editKey] !== undefined) {
      return editingRateLimit[editKey];
    }
    // Try backend first, fallback to default
    return apiSettings.rateLimits[provider]?.rateLimits?.[limitType] || getDefaultRateLimit(provider, limitType);
  };

  // Save URL function using the new hook
  const saveUrl = async (provider: Provider, urlType: string, url: string) => {
    const success = await apiSettings.saveUrl(provider, urlType, url);
    if (success) {
      // Clear editing state
      const editKey = `${provider}_${urlType}`;
      setEditingUrl(prev => {
        const newState = { ...prev };
        delete newState[editKey];
        return newState;
      });
      alert(`✅ URL updated successfully for ${provider} ${urlType}`);
    } else {
      alert(`❌ Failed to update URL for ${provider} ${urlType}`);
    }
  };

  // Save WebSocket URL function
  const saveWebSocket = async (provider: Provider, wsType: string, wsUrl: string) => {
    const success = await apiSettings.saveWebSocket(provider, wsType, wsUrl);
    if (success) {
      const editKey = `${provider}_${wsType}`;
      setEditingWebSocket(prev => {
        const newState = { ...prev };
        delete newState[editKey];
        return newState;
      });
      alert(`✅ WebSocket URL updated successfully for ${provider} ${wsType}`);
    } else {
      alert(`❌ Failed to update WebSocket URL for ${provider} ${wsType}`);
    }
  };

  // Save Rate Limit function
  const saveRateLimit = async (provider: Provider, limitType: string, value: number | string) => {
    const success = await apiSettings.saveRateLimit(provider, limitType, value);
    if (success) {
      const editKey = `${provider}_${limitType}`;
      setEditingRateLimit(prev => {
        const newState = { ...prev };
        delete newState[editKey];
        return newState;
      });
      alert(`✅ Rate limit updated successfully for ${provider} ${limitType}`);
    } else {
      alert(`❌ Failed to update rate limit for ${provider} ${limitType}`);
    }
  };

  // Get usage color based on percentage
  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Provider configurations based on gui_api.md
  const providerConfigs: Record<Provider, any> = {
    binance: {
      name: 'Binance',
      icon: '🔶',
      urls: ['spot', 'usdtm', 'coinm', 'options', 'portfolio'],
      websockets: ['spot', 'usdtm', 'coinm', 'options', 'portfolio'],
      rateLimits: ['maxRps', 'historicalRps']
    },
    bitget: {
      name: 'Bitget',
      icon: '🔷',
      urls: ['spot', 'usdtm', 'coinm', 'usdcm', 'susdt', 'scoin', 'public'],
      websockets: ['spot', 'usdtm', 'coinm', 'usdcm', 'susdt', 'scoin'],
      rateLimits: ['maxRps', 'historicalRps']
    },
    etherscan: {
      name: 'Etherscan',
      icon: '⚡',
      urls: ['api'],
      rateLimits: ['dailyLimit']
    },
    bscscan: {
      name: 'BSCScan', 
      icon: '🟡',
      urls: ['api'],
      rateLimits: ['dailyLimit']
    },
    polygonscan: {
      name: 'PolygonScan',
      icon: '🟣',
      urls: ['api'],
      rateLimits: ['dailyLimit']
    },
    coingecko: {
      name: 'CoinGecko',
      icon: '🦎',
      urls: ['free', 'pro', 'ping', 'price'],
      rateLimits: ['monthlyLimit']
    },
    telegram: {
      name: 'Telegram',
      icon: '📱',
      urls: ['bot', 'sendMessage', 'sendPhoto', 'sendDocument'],
      rateLimits: ['messagesPerMin']
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">API Configuration</h1>
              <p className="text-muted-foreground">Configure all API endpoints, WebSockets, and rate limits per provider</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Providers: {apiSettings.providers?.length || 0}
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ✅ New Backend Integration
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => apiSettings.loadSettings()}
                disabled={apiSettings.isLoading}
              >
                🔄 Reload
              </Button>
              <div className={`w-2 h-2 rounded-full ${
                apiSettings.isLoading ? 'bg-yellow-500 animate-pulse' : 
                apiSettings.error ? 'bg-red-500' : 'bg-green-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/30">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              {categories.map((category) => {
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-between"
                    onClick={() => {
                      setActiveCategory(category.id);
                      const firstProvider = category.providers[0];
                      if (firstProvider) {
                        setSelectedProvider(firstProvider);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.providers.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Provider List */}
            {activeProviders.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {activeCategory_obj?.name}
                </h3>
                <div className="space-y-1">
                  {activeProviders.map((providerId) => {
                    const config = providerConfigs[providerId];
                    if (!config) return null;

                    return (
                      <Button
                        key={providerId}
                        variant={selectedProvider === providerId ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedProvider(providerId)}
                      >
                        <span className="text-lg mr-3">{config.icon}</span>
                        <span>{config.name}</span>
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {selectedProvider && providerConfigs[selectedProvider] && (
              <div className="space-y-6">
                {/* Provider Header */}
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{providerConfigs[selectedProvider].icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{providerConfigs[selectedProvider].name} Configuration</h2>
                      <p className="text-muted-foreground">Configure REST URLs, WebSockets, and rate limits</p>
                    </div>
                  </div>
                </Card>

                <Tabs defaultValue="urls" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="urls">REST URLs</TabsTrigger>
                    {providerConfigs[selectedProvider].websockets && (
                      <TabsTrigger value="websockets">WebSockets</TabsTrigger>
                    )}
                    <TabsTrigger value="ratelimits">Rate Limits</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>

                  {/* REST URLs Tab */}
                  <TabsContent value="urls" className="space-y-4">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">REST URLs (Editable)</h3>
                        <Badge className="bg-blue-100 text-blue-800">Per Provider</Badge>
                      </div>
                      <div className="space-y-4">
                        {providerConfigs[selectedProvider].urls?.map((urlType: string) => {
                          const currentValue = getCurrentUrl(selectedProvider, urlType);
                          const editKey = `${selectedProvider}_${urlType}`;
                          const isEditing = editingUrl[editKey] !== undefined;
                          
                          return (
                            <div key={urlType} className="grid grid-cols-4 gap-4 items-center">
                              <Label className="text-sm font-medium uppercase">
                                {urlType}:
                              </Label>
                              <Input
                                type="url"
                                className="col-span-2"
                                value={currentValue}
                                onChange={(e) => setEditingUrl(prev => ({
                                  ...prev,
                                  [editKey]: e.target.value
                                }))}
                                placeholder={`Enter ${urlType} URL`}
                              />
                              <Button
                                size="sm"
                                onClick={() => saveUrl(selectedProvider, urlType, currentValue)}
                                disabled={!currentValue || apiSettings.isLoading}
                                className={isEditing ? 'bg-orange-600 hover:bg-orange-700' : ''}
                              >
                                {isEditing ? '💾 Save' : '✅ Save'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </TabsContent>

                  {/* WebSocket URLs Tab */}
                  {providerConfigs[selectedProvider].websockets && (
                    <TabsContent value="websockets" className="space-y-4">
                      <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-green-600">WebSocket URLs (Editable)</h3>
                          <Badge className="bg-green-100 text-green-800">Real-time Streams</Badge>
                        </div>
                        <div className="space-y-4">
                          {providerConfigs[selectedProvider].websockets?.map((wsType: string) => {
                            const currentValue = getCurrentWebSocket(selectedProvider, wsType);
                            const editKey = `${selectedProvider}_${wsType}`;
                            const isEditing = editingWebSocket[editKey] !== undefined;
                            
                            return (
                              <div key={wsType} className="grid grid-cols-4 gap-4 items-center">
                                <Label className="text-sm font-medium uppercase text-green-600">
                                  {wsType} WS:
                                </Label>
                                <Input
                                  type="url"
                                  className="col-span-2"
                                  value={currentValue}
                                  onChange={(e) => setEditingWebSocket(prev => ({
                                    ...prev,
                                    [editKey]: e.target.value
                                  }))}
                                  placeholder={`Enter ${wsType} WebSocket URL`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => saveWebSocket(selectedProvider, wsType, currentValue)}
                                  disabled={!currentValue || apiSettings.isLoading}
                                  className={`${isEditing ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                                >
                                  {isEditing ? '💾 Save' : '✅ Save'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    </TabsContent>
                  )}

                  {/* Rate Limits Tab */}
                  <TabsContent value="ratelimits" className="space-y-4">
                    <Card className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-blue-600">Rate Limits (Editable)</h3>
                        <Badge className="bg-blue-100 text-blue-800">Per Provider</Badge>
                      </div>
                      <div className="space-y-4">
                        {providerConfigs[selectedProvider].rateLimits?.map((limitType: string) => {
                          const currentValue = getCurrentRateLimit(selectedProvider, limitType);
                          const editKey = `${selectedProvider}_${limitType}`;
                          const isEditing = editingRateLimit[editKey] !== undefined;
                          
                          return (
                            <div key={limitType} className="grid grid-cols-4 gap-4 items-center">
                              <Label className="text-blue-600 text-sm font-medium">
                                {limitType.replace(/([A-Z])/g, ' $1').trim()}:
                              </Label>
                              <Input
                                type="number"
                                step={limitType.includes('Rps') ? '0.1' : '1'}
                                className="col-span-1"
                                value={currentValue}
                                onChange={(e) => setEditingRateLimit(prev => ({
                                  ...prev,
                                  [editKey]: limitType.includes('Rps') ? parseFloat(e.target.value) : parseInt(e.target.value)
                                }))}
                                placeholder="Enter limit"
                              />
                              <div></div>
                              <Button
                                size="sm"
                                onClick={() => saveRateLimit(selectedProvider, limitType, currentValue)}
                                disabled={!currentValue || apiSettings.isLoading}
                                className={`${isEditing ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                              >
                                {isEditing ? '💾 Save' : '✅ Save'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </TabsContent>

                  {/* Usage Tab */}
                  <TabsContent value="usage" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Daily Usage Display</h3>
                      {apiSettings.usage[selectedProvider] && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Today:</span>
                            <span className={`font-medium ${getUsageColor(apiSettings.usage[selectedProvider].percentage)}`}>
                              {Object.entries(apiSettings.usage[selectedProvider].usage).map(([key, value]) => 
                                `${value}`
                              ).join(', ')} / {Object.entries(apiSettings.usage[selectedProvider].limits).map(([key, value]) => 
                                `${value}`
                              ).join(', ')} requests ({apiSettings.usage[selectedProvider].percentage}%)
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(apiSettings.usage[selectedProvider].percentage, 100)}
                            className="h-3"
                          />
                        </div>
                      )}
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {apiSettings.error && (
        <div className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm max-w-md">
          ❌ Error: {apiSettings.error}
        </div>
      )}
      
      {apiSettings.isLoading && (
        <div className="fixed bottom-4 left-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-600 text-sm">
          🔄 Loading settings...
        </div>
      )}
    </div>
  );
};
