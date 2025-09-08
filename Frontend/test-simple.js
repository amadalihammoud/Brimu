import express from 'express';
import path from 'path';

const app = express();

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Sistema Brimu - Teste</h1>
        <p>Se você vê isto, o servidor funciona!</p>
        <a href="http://localhost:3002">Ir para o sistema real</a>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Teste rodando em http://localhost:3000');
});
