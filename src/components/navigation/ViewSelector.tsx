// components/navigation/ViewSelector.tsx - NUR View-Navigation (max 80 Zeilen)
import React, { useState } from 'react';
import { ViewMode } from '../../types';

interface ViewSelectorProps {
  onViewChange?: (view: ViewMode) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({ onViewChange }) => {
  const [activeView, setActiveView] = useState<string>("Market");

  const viewItems = [
    { name: "Trading Bot", view: "bot" as ViewMode },
    { name: "AI", view: "ai" as ViewMode },
    { name: "Database", view: "database" as ViewMode },
    { name: "Whales", view: "whales" as ViewMode },
    { name: "News", view: "news" as ViewMode },
    { name: "API", view: "api" as ViewMode },
  ];

  const handleViewClick = (itemName: string, view?: ViewMode) => {
    setActiveView(itemName);
    
    if (view && onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex gap-2">
      {viewItems.map((item) => (
        <button
          key={item.name}
          className={`px-5 py-1.5 rounded font-medium transition-colors ${
            activeView === item.name
              ? "bg-[#e4261c] text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-[#222] dark:text-white"
          }`}
          onClick={() => handleViewClick(item.name, item.view)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};