require('dotenv').config();
const express = require('express');
const cors = require('cors');
cors({ origin: '*' });

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/api/consulta-cpf/:cpf', async (req, res) => {
    const { cpf } = req.params;
    const apiKey = process.env.API_KEY || "sk_01jez1gk2zk8dyr0bsja4mrc6201jez1gk30e7e50b862pppsq9c";

    try {
        const apiUrl = `https://api.wiseapi.io/v1/cpf/${cpf}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-wise-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Erro no proxy:', error);
        res.status(500).json({ error: 'Erro ao consultar o CPF' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor proxy rodando na porta ${PORT}`);
});
