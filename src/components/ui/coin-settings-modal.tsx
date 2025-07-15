// Fügen Sie diese Hilfsfunktionen zu Ihrer Komponente hinzu:

// Funktion zum Formatieren des Datums für die Anzeige
const formatDateForDisplay = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

// Funktion zum Parsen des eingegebenen Datums
const parseDateInput = (input: string): string | null => {
  if (!input) return null;
  
  // Verschiedene Formate unterstützen
  const formats = [
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // dd.mm.yyyy
    /^(\d{1,2})\.(\d{1,2})\.(\d{2})$/, // dd.mm.yy
  ];
  
  for (const format of formats) {
    const match = input.match(format);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
      let year = parseInt(match[3], 10);
      
      // 2-stellige Jahre zu 4-stelligen konvertieren
      if (year < 100) {
        year += year < 30 ? 2000 : 1900;
      }
      
      // Validierung
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 1900) {
        const date = new Date(year, month, day);
        // Überprüfen, ob das Datum gültig ist
        if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
          return date.toISOString().split('T')[0];
        }
      }
    }
  }
  
  return null;
};

// Zustand für temporäre Eingabe hinzufügen (in Ihrer Komponente):
const [tempDateInputs, setTempDateInputs] = useState<{[key: string]: string}>({});

// Ersetzung für das Datums-Input-Feld:
<td className="px-6 py-4 whitespace-nowrap text-center">
  <div className="relative">
    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      type="text" 
      placeholder="dd.mm.yyyy"
      value={tempDateInputs[`${symbol}_${market}`] ?? formatDateForDisplay(setting.history_until)}
      onChange={(e) => {
        const key = `${symbol}_${market}`;
        const value = e.target.value;
        
        // Temporären Wert speichern
        setTempDateInputs(prev => ({
          ...prev,
          [key]: value
        }));
      }}
      onBlur={(e) => {
        const key = `${symbol}_${market}`;
        const value = e.target.value;
        
        if (value) {
          const parsedDate = parseDateInput(value);
          if (parsedDate) {
            updateSetting(symbol, market, { history_until: parsedDate });
          } else {
            // Ungültiges Datum - zurück zum ursprünglichen Wert
            setTempDateInputs(prev => {
              const newInputs = { ...prev };
              delete newInputs[key];
              return newInputs;
            });
          }
        } else {
          // Leeres Feld - Datum löschen
          updateSetting(symbol, market, { history_until: '' });
        }
        
        // Temporären Wert löschen
        setTempDateInputs(prev => {
          const newInputs = { ...prev };
          delete newInputs[key];
          return newInputs;
        });
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur();
        }
      }}
      disabled={!setting.load_history}
      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
</td>