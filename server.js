// API REST Node.js que consome Yahoo Finance API
// Estrutura de arquivos:
// - server.js (este arquivo)
// - routes/finance.js
// - controllers/financeController.js
// - services/yahooFinanceService.js

// server.js - Arquivo principal da aplicação
const express = require('express');
const cors = require('cors');
const financeRoutes = require('./routes/finance');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/finance', financeRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo à API de dados financeiros',
    endpoints: {
      quotes: '/api/finance/quotes/:symbols',
      historical: '/api/finance/historical/:symbol',
      details: '/api/finance/details/:symbol',
      trends: '/api/finance/trends',
    }
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});