require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: 'Muitas requisições. Tente novamente mais tarde.'
});

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors({ origin: '*' }));
app.use(limiter);


const fetch = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await import('node-fetch').then(({ default: fetch }) =>
            fetch(url, { ...options, signal: controller.signal })
        );
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

app.get('/api/consulta-cpf/:cpf', async (req, res) => {
    const { cpf } = req.params;
    const apiKey = process.env.API_KEY;

  
    const cpfRegex = /^\d{11}$/;
    if (!cpfRegex.test(cpf)) {
        return res.status(400).json({ error: 'CPF inválido' });
    }

    
    if (!apiKey) {
        return res.status(500).json({ error: 'Chave da API não configurada' });
    }

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
        console.error('Erro no proxy:', { message: error.message, stack: error.stack });
        res.status(500).json({ error: 'Erro ao consultar o CPF' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor proxy rodando na porta ${PORT}`);
});
