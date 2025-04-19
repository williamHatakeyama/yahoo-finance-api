// routes/finance.js - Arquivo de rotas para dados financeiros
const express = require('express');
const financeController = require('../controllers/financeController');

const router = express.Router();

// Rota para obter cotações atuais
// Ex: GET /api/finance/quotes/PBR,VALE,^VIX
router.get('/quotes/:symbols', financeController.getQuotes);

// Rota para obter dados históricos
// Ex: GET /api/finance/historical/PBR?period=30d
router.get('/historical/:symbol', financeController.getHistorical);

// Rota para obter detalhes de um ativo
// Ex: GET /api/finance/details/PBR
router.get('/details/:symbol', financeController.getDetails);

// Rota para obter tendências de mercado
// Ex: GET /api/finance/trends
router.get('/trends', financeController.getTrends);

// Rota para buscar todas as informações de um símbolo
// Ex: GET /api/finance/full/PBR
router.get('/full/:symbol', financeController.getFullInfo);

// Rota para pegar dados específicos da Petrobras
router.get('/petrobras', financeController.getPetrobras);

// Rota para pegar dados específicos de minério (VALE)
router.get('/minerio', financeController.getMinerio);

// Rota para obter o índice VIX
router.get('/vix', financeController.getVIX);

// Rota para obter todas as ADRs brasileiras
router.get('/adrs/brasil', financeController.getBrazilianADRs);

module.exports = router;