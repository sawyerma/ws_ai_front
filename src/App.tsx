import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./shared/layout/AppLayout";
import ThemeProvider from "./shared/ui/theme-provider";
import { TradingProvider } from "./contexts/TradingContext";
import { 
  TradingPage, 
  QuantumPage, 
  BotPage, 
  MLPage, 
  DatabasePage, 
  WhalesPage, 
  NewsPage, 
  APIPage, 
  SettingsPage
} from "./pages";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TradingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/trading" replace />} />
              <Route path="trading" element={<TradingPage />} />
              <Route path="quantum" element={<QuantumPage />} />
              <Route path="bot" element={<BotPage />} />
              <Route path="ml" element={<MLPage />} />
              <Route path="database" element={<DatabasePage />} />
              <Route path="whales" element={<WhalesPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="api" element={<APIPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TradingProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
// Updated Sun Sep 14 18:57:08 CEST 2025
