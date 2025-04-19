// services/yahooFinanceService.js - Serviço que consome a biblioteca Yahoo Finance
const yahooFinance = require('yahoo-finance2').default;

// Cache simples para reduzir chamadas à API
const cache = {
  data: {},
  timestamps: {},
  // Cache válido por 5 minutos (300000 ms)
  TTL: 300000
};

// Função auxiliar para verificar cache
function getCachedData(key) {
  const now = Date.now();
  if (cache.data[key] && (now - cache.timestamps[key] < cache.TTL)) {
    return cache.data[key];
  }
  return null;
}

// Função auxiliar para atualizar cache
function setCachedData(key, data) {
  cache.data[key] = data;
  cache.timestamps[key] = Date.now();
  return data;
}

// Obter cotações atuais
exports.getQuotes = async (symbols) => {
  const cacheKey = `quotes_${symbols.join('_')}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) return cachedData;
  
  try {
    const quotes = await yahooFinance.quote(symbols);
    // Formatar resposta para array consistente
    const formattedQuotes = Array.isArray(quotes) ? quotes : [quotes];
    
    // Selecionar campos relevantes para retornar
    const result = formattedQuotes.map(quote => ({
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      previousClose: quote.regularMarketPreviousClose,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      currency: quote.currency,
      timestamp: quote.regularMarketTime,
    }));
    
    return setCachedData(cacheKey, result);
  } catch (error) {
    console.error('Erro ao obter cotações:', error);
    throw new Error(`Falha ao buscar cotações: ${error.message}`);
  }
};

// Obter dados históricos
exports.getHistorical = async (symbol, startDate = null, endDate = null, interval = '1d') => {
  if (!startDate) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }
  
  if (!endDate) {
    endDate = new Date();
  }
  
  const cacheKey = `historical_${symbol}_${startDate.toISOString()}_${endDate.toISOString()}_${interval}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) return cachedData;
  
  try {
    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval
    });
    
    // Formatar dados históricos
    const result = historical.map(day => ({
      date: day.date.toISOString().split('T')[0],
      open: day.open,
      high: day.high,
      low: day.low,
      close: day.close,
      volume: day.volume,
      adjClose: day.adjClose
    }));
    
    return setCachedData(cacheKey, result);
  } catch (error) {
    console.error('Erro ao obter dados históricos:', error);
    throw new Error(`Falha ao buscar dados históricos: ${error.message}`);
  }
};

// Obter detalhes de um ativo
exports.getDetails = async (symbol) => {
  const cacheKey = `details_${symbol}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) return cachedData;
  
  try {
    const modules = [
      'assetProfile',
      'summaryDetail',
      'financialData',
      'recommendationTrend',
      'earnings'
    ];
    
    const details = await yahooFinance.quoteSummary(symbol, { modules });
    return setCachedData(cacheKey, details);
  } catch (error) {
    console.error('Erro ao obter detalhes do ativo:', error);
    throw new Error(`Falha ao buscar detalhes do ativo: ${error.message}`);
  }
};

// Obter tendências de mercado
exports.getMarketTrends = async () => {
  const cacheKey = 'market_trends';
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) return cachedData;
  
  try {
    // Índices relevantes para comparação
    const marketIndices = ['^BVSP', '^GSPC', '^IXIC', '^VIX', 'CL=F', 'GC=F'];
    const quotes = await yahooFinance.quote(marketIndices);
    
    // Formatar resposta para array consistente
    const formattedQuotes = Array.isArray(quotes) ? quotes : [quotes];
    
    const result = formattedQuotes.map(quote => ({
      symbol: quote.symbol,
      name: quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      type: quote.quoteType
    }));
    
    return setCachedData(cacheKey, result);
  } catch (error) {
    console.error('Erro ao obter tendências de mercado:', error);
    throw new Error(`Falha ao buscar tendências de mercado: ${error.message}`);
  }
};

// Obter informações completas de um símbolo
exports.getFullInfo = async (symbol) => {
  try {
    const [quote, historical, details] = await Promise.all([
      this.getQuotes([symbol]),
      this.getHistorical(symbol),
      this.getDetails(symbol)
    ]);
    
    return {
      symbol,
      quote: quote[0],
      historical,
      details
    };
  } catch (error) {
    console.error('Erro ao obter informações completas:', error);
    throw new Error(`Falha ao buscar informações completas: ${error.message}`);
  }
};