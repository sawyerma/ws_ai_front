const NewsPage = () => {
  return (
    <div className="px-6 py-5">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">News</h1>
        <p className="text-muted-foreground">Market news, sentiment analysis, and trading insights.</p>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-4">📰</div>
          <h2 className="text-xl font-semibold mb-2">News & Sentiment Analysis</h2>
          <p>Market news aggregation and sentiment tracking coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
