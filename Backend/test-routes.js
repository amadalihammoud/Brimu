const express = require('express');
const router = express.Router();

// Rota simples para testar
router.get('/', (req, res) => {
  res.json({ message: 'Teste OK' });
});

module.exports = router;
