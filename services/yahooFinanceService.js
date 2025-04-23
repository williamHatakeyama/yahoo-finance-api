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

// Lista expandida de ADRs brasileiras com informações adicionais
const BRAZILIAN_ADRS = [
  { symbol: 'PBR', name: 'Petrobras', sector: 'Petróleo e Gás' },
  { symbol: 'VALE', name: 'Vale', sector: 'Mineração' },
  { symbol: 'ITUB', name: 'Itaú Unibanco', sector: 'Financeiro' },
  { symbol: 'BBD', name: 'Banco Bradesco', sector: 'Financeiro' },
  { symbol: 'ABEV', name: 'Ambev', sector: 'Bebidas' },
  { symbol: 'GGB', name: 'Gerdau', sector: 'Siderurgia' },
  { symbol: 'SID', name: 'CSN', sector: 'Siderurgia' },
  { symbol: 'CIG', name: 'Cemig', sector: 'Energia' },
  { symbol: 'EBR', name: 'Eletrobras', sector: 'Energia' },
  { symbol: 'CBD', name: 'Grupo Pão de Açúcar', sector: 'Varejo' },
  { symbol: 'TSU', name: 'TIM', sector: 'Telecomunicações' },
  { symbol: 'TIMB', name: 'TIM Brasil', sector: 'Telecomunicações' },
  { symbol: 'SBS', name: 'Sabesp', sector: 'Saneamento' },
  { symbol: 'VIVO', name: 'Telefônica Brasil', sector: 'Telecomunicações' },
  { symbol: 'LND', name: 'Braskem', sector: 'Petroquímico' },
  { symbol: 'ERJ', name: 'Embraer', sector: 'Aeroespacial' },
  { symbol: 'GOL', name: 'Gol Linhas Aéreas', sector: 'Aviação' },
  { symbol: 'AZUL', name: 'Azul Linhas Aéreas', sector: 'Aviação' },
  { symbol: 'BSBR', name: 'Banco Santander Brasil', sector: 'Financeiro' },
  { symbol: 'SUZ', name: 'Suzano', sector: 'Papel e Celulose' }
];

// Controlador atualizado para ADRs brasileiras
exports.getBrazilianADRs = async (req, res, next) => {
  try {
    // Extrair apenas os símbolos para a consulta
    const symbols = BRAZILIAN_ADRS.map(adr => adr.symbol);
    
    // Obter cotações atuais
    const quotes = await yahooFinanceService.getQuotes(symbols);
    
    // Combinar dados estáticos com cotações
    const results = BRAZILIAN_ADRS.map(adr => {
      const quote = quotes.find(q => q.symbol === adr.symbol) || {};
      return {
        ...adr,
        ...quote
      };
    });
    
    // Agrupar por setor
    const bySector = results.reduce((acc, adr) => {
      if (!acc[adr.sector]) {
        acc[adr.sector] = [];
      }
      acc[adr.sector].push(adr);
      return acc;
    }, {});
    
    res.json({
      total: results.length,
      adrs: results,
      bySector
    });
  } catch (error) {
    next(error);
  }
};