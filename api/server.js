const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const port = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// ================================
// LISTA DE PROJETOS
// ================================
app.get('/api/projetos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT projeto FROM projetos ORDER BY projeto
    `);
    const nomes = result.rows.map(r => r.projeto);
    res.json(nomes);
  } catch (err) {
    console.error('❌ Erro ao listar projetos:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ================================
// DASHBOARD COMPLETO POR PROJETO
// ================================
app.get('/api/dashboard/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const projetoRes = await pool.query(`
      SELECT
        cliente,
        portifolio,
        projeto,
        periodo_inicio,
        periodo_fim,
        lider,
        horas_contrato,
        horas_utilizada
      FROM projetos
      WHERE projeto = $1
    `, [id]);

    if (projetoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }

    const projeto = projetoRes.rows[0];
    const projetoVinculo = projeto.projeto;

    const fasesPromise = pool.query(`
      SELECT
        atividades   AS atividade,
        escopo       AS descricao,
        data         AS data_entrega,
        datafim      AS data_fim,
        recurso,
        concluido,
        situacao     AS status,
        comentario,
        area,
        fase         AS fase_nome
      FROM fases
      WHERE projeto_vinculo = $1
      ORDER BY data
    `, [projetoVinculo]);

    // Usa a view que calcula progresso por área direto das fases
    const areasPromise = pool.query(`
      SELECT
        area,
        progresso,
        status,
        total_atividades
      FROM vw_progresso_areas
      WHERE projeto_vinculo = $1
      ORDER BY area
    `, [projetoVinculo]);

    const pontosPromise = pool.query(`
      SELECT
        indicado_por_area,
        descricao,
        situacao,
        probabilidade,
        impacto
      FROM pontos_atencao
      WHERE projeto_vinculo = $1
    `, [projetoVinculo]);

    const riscosPromise = pool.query(`
      SELECT * FROM riscos WHERE projeto_vinculo = $1
    `, [projetoVinculo]).catch(() => ({ rows: [] }));

    const [fases, areas, pontosAtencao, riscos] = await Promise.all([
      fasesPromise,
      areasPromise,
      pontosPromise,
      riscosPromise,
    ]);

    // Calcula progresso geral com base no peso das fases
    const totalFases = fases.rows.length;
    const somaPesos = fases.rows.reduce((acc, f) => {
      const c = (f.concluido || '').toString().toUpperCase();
      if (c === 'SIM') return acc + 100;
      if (f.data_entrega) return acc + 50;
      return acc;
    }, 0);
    const progresso = totalFases > 0 ? Math.round(somaPesos / (totalFases * 100) * 100) : 0;

    res.json({
      projeto:          projeto.projeto,
      cliente:          projeto.cliente,
      portifolio:       projeto.portifolio,
      periodo_inicio:   projeto.periodo_inicio,
      periodo_fim:      projeto.periodo_fim,
      lider:            projeto.lider,
      horas_totais:     projeto.horas_contrato,
      horas_utilizadas: projeto.horas_utilizada,
      progresso,
      fases:            fases.rows,
      areas:            areas.rows,
      pontos_atencao:   pontosAtencao.rows,
      riscos:           riscos.rows,
    });

  } catch (err) {
    console.error('❌ Erro ao buscar dashboard:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ================================
// ROTA LEGADA (mantida por compatibilidade)
// ================================
app.get('/api/projetos/:id', async (req, res) => {
  res.redirect(`/api/dashboard/${req.params.id}`);
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});