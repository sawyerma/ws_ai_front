export default function Orderbook({
  symbol = "BTCUSDT",
  market = "spot",
  apiBase,
  limit = 15
}) {
  const [orderbook, setOrderbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderbook = async () => {
      setLoading(true);
      setError(null);
      try {
        const market_type = market === "spot" ? "spot" : market === "usdtm" ? "usdtm" : "coinm";
        const apiBaseUrl = apiBase || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100';
        const url = `${apiBaseUrl}/orderbook?symbol=${symbol}&market_type=${market_type}&limit=${limit}`;
        const resp = await fetch(url);
        
        if (!resp.ok) {
          throw new Error(`HTTP error! status: ${resp.status}`);
        }
        
        const data = await resp.json();
        setOrderbook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderbook();
  }, [symbol, market, apiBase, limit]);

  if (loading) return <div>Loading orderbook...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!orderbook) return <div>No data</div>;

  return (
    <div className="orderbook">
      <h3>Orderbook for {symbol}</h3>
      <div className="orderbook-content">
        <div className="asks">
          <h4>Asks</h4>
          {orderbook.asks?.map((ask, index) => (
            <div key={index} className="order-row ask">
              <span className="price">{ask[0]}</span>
              <span className="quantity">{ask[1]}</span>
            </div>
          ))}
        </div>
        <div className="bids">
          <h4>Bids</h4>
          {orderbook.bids?.map((bid, index) => (
            <div key={index} className="order-row bid">
              <span className="price">{bid[0]}</span>
              <span className="quantity">{bid[1]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}