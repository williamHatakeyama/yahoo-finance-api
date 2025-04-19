// controllers/financeController.js - Controlador para lidar com requisições financeiras
const yahooFinanceService = require('../services/yahooFinanceService');

// Mapeia símbolos específicos para facilitar acesso
const SYMBOLS = {
  PETROBRAS: 'PBR',
  VALE: 'VALE',
  VIX: '^VIX',
  IBOVESPA: '^BVSP',
};

// Lista de ADRs brasileiras principais
const BRAZILIAN_ADRS = ['PBR', 'VALE', 'ITUB', 'BBD', 'ABEV', 'GGB', 'SID', 'CIG', 'EBR', 'CBD'];

// Controlador para obter cotações
exports.getQuotes = async (req, res, next) => {
  try {
    const symbols = req.params.symbols.split(',');
    const quotes = await yahooFinanceService.getQuotes(symbols);
    res.json(quotes);
  } catch (error) {
    next(error);
  }
};

// Controlador para obter dados históricos
exports.getHistorical = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = '30d', interval = '1d' } = req.query;
    
    // Converter period para datas
    let days = 30;
    if (period.endsWith('d')) days = parseInt(period);
    else if (period.endsWith('m')) days = parseInt(period) * 30;
    else if (period.endsWith('y')) days = parseInt(period) * 365;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const historical = await yahooFinanceService.getHistorical(symbol, startDate, endDate, interval);
    res.json(historical);
  } catch (error) {
    next(error);
  }
};

// Controlador para obter detalhes de um ativo
exports.getDetails = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const details = await yahooFinanceService.getDetails(symbol);
    res.json(details);
  } catch (error) {
    next(error);
  }
};

// Controlador para obter tendências de mercado
exports.getTrends = async (req, res, next) => {
  try {
    const trends = await yahooFinanceService.getMarketTrends();
    res.json(trends);
  } catch (error) {
    next(error);
  }
};

// Controlador para obter todas as informações de um símbolo
exports.getFullInfo = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    // Obter dados em paralelo para melhor performance
    const [quote, historical, details] = await Promise.all([
      yahooFinanceService.getQuotes([symbol]),
      yahooFinanceService.getHistorical(symbol),
      yahooFinanceService.getDetails(symbol)
    ]);
    
    res.json({
      quote: quote[0],
      historical,
      details
    });
  } catch (error) {
    next(error);
  }
};

// Controlador específico para Petrobras
exports.getPetrobras = async (req, res, next) => {
  try {
    const fullInfo = await yahooFinanceService.getFullInfo(SYMBOLS.PETROBRAS);
    res.json(fullInfo);
  } catch (error) {
    next(error);
  }
};

// Controlador específico para Vale (minério)
exports.getMinerio = async (req, res, next) => {
  try {
    const fullInfo = await yahooFinanceService.getFullInfo(SYMBOLS.VALE);
    res.json(fullInfo);
  } catch (error) {
    next(error);
  }
};

// Controlador para VIX
exports.getVIX = async (req, res, next) => {
  try {
    const vixData = await yahooFinanceService.getFullInfo(SYMBOLS.VIX);
    res.json(vixData);
  } catch (error) {
    next(error);
  }
};

// Controlador para obter todas as ADRs brasileiras
exports.getBrazilianADRs = async (req, res, next) => {
  try {
    const adrs = await yahooFinanceService.getQuotes(BRAZILIAN_ADRS);
    res.json(adrs);
  } catch (error) {
    next(error);
  }
};