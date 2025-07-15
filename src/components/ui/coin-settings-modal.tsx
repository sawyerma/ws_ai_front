// Ersetzen Sie die UNTIL-Spalte in Ihrer Tabelle mit diesem Code:

<td className="px-6 py-4 whitespace-nowrap text-center">
  <div className="relative">
    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
    <input
      type="date"
      value={setting.history_until || ''}
      onChange={(e) => {
        updateSetting(symbol, market, { 
          history_until: e.target.value 
        });
      }}
      disabled={!setting.load_history}
      className={`
        w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
        ${!setting.load_history ? 
          'opacity-50 cursor-not-allowed' : 
          'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }
      `}
      style={{
        colorScheme: 'dark' // Für bessere Dark-Mode-Unterstützung
      }}
    />
  </div>
</td>

// ODER falls Sie das deutsche Format (dd.mm.yyyy) bevorzugen, verwenden Sie diese Alternative:

<td className="px-6 py-4 whitespace-nowrap text-center">
  <div className="relative">
    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
    <input
      type="text"
      placeholder="dd.mm.yyyy"
      value={setting.history_until ? 
        new Date(setting.history_until).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : 
        ''
      }
      onChange={(e) => {
        const value = e.target.value;
        
        // Einfache Validierung für dd.mm.yyyy Format
        const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
        const match = value.match(dateRegex);
        
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
          const year = parseInt(match[3], 10);
          
          // Basis-Validierung
          if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
            const date = new Date(year, month, day);
            // Prüfen ob das Datum gültig ist
            if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
              updateSetting(symbol, market, { 
                history_until: date.toISOString().split('T')[0]
              });
            }
          }
        } else if (value === '') {
          // Leeres Feld - Datum löschen
          updateSetting(symbol, market, { history_until: '' });
        }
      }}
      disabled={!setting.load_history}
      className={`
        w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
        ${!setting.load_history ? 
          'opacity-50 cursor-not-allowed' : 
          'cursor-text hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        }
      `}
    />
  </div>
</td>