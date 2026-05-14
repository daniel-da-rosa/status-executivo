require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL });
p.query('SELECT projeto FROM projetos')
  .then(r => console.log('Projetos:', r.rows))
  .catch(e => console.error('❌ Erro:', e.message));