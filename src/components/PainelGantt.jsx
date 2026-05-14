import React from 'react';

// Ordem fixa das fases para exibição
const ORDEM_FASES = [
  '1-LEVANTAMENTO',
  '2-CADASTROS',
  '3-ETAPA I',
  '4-ETAPA II',
  '5-ETAPA III',
  '6-ETAPA IV',
  'ENCERRAMENTO',
];

const PainelGantt = ({ fases }) => {
  const faseAgrupada = React.useMemo(() => {
    if (!fases || fases.length === 0) return [];

    const mapa = {};

    fases.forEach((f) => {
      // CORRIGIDO: era f.fase_nome, coluna real é f.fase
      const nomeFase = f.fase ?? 'SEM FASE';
      if (nomeFase === 'NÃO PLANEJADO') return;

      if (!mapa[nomeFase]) {
        mapa[nomeFase] = { total: 0, concluidas: 0, datas: [] };
      }

      mapa[nomeFase].total += 1;
      if (String(f.concluido).toUpperCase() === 'SIM') {
        mapa[nomeFase].concluidas += 1;
      }

      // CORRIGIDO: era f.data_entrega / f.data_fim, colunas reais são f.data e f.datafim
      if (f.data)    mapa[nomeFase].datas.push(new Date(f.data));
      if (f.datafim) mapa[nomeFase].datas.push(new Date(f.datafim));
    });

    const ordenadas = ORDEM_FASES.filter((nome) => mapa[nome]);
    const extras = Object.keys(mapa).filter((nome) => !ORDEM_FASES.includes(nome));

    return [...ordenadas, ...extras].map((nome) => {
      const { total, concluidas, datas } = mapa[nome];
      const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

      const datesValidas = datas.filter((d) => !isNaN(d));
      const dataInicio = datesValidas.length > 0 ? new Date(Math.min(...datesValidas)) : null;
      const dataFim    = datesValidas.length > 0 ? new Date(Math.max(...datesValidas)) : null;

      const periodo = dataInicio && dataFim
        ? `${dataInicio.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })} – ${dataFim.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}`
        : '';

      const cor = pct === 100 ? '#2ecc71'
                : pct > 0    ? '#3498db'
                :              '#e67e22';

      const icone = pct === 100 ? '✓'
                  : pct > 0    ? '◑'
                  :              '';

      return { nome, periodo, largura: Math.max(pct, 4), cor, icone, pct };
    });
  }, [fases]);

  return (
    <div className="panel">
      <div className="panel-title">📅 CRONOGRAMA E DATAS CHAVE</div>

      {faseAgrupada.map((fase, i) => (
        <div className="gantt-row" key={i}>
          <div className="gantt-label">
            <span>{fase.nome}</span>
            <span style={{ color: fase.cor, fontSize: '11px' }}>{fase.periodo}</span>
          </div>
          <div className="gantt-bar-wrap">
            <div
              className="gantt-bar"
              style={{
                width:      `${fase.largura}%`,
                background: fase.cor,
                color:      '#fff',
                minWidth:   '20px',
              }}
            >
              {fase.icone} {fase.pct > 0 ? `${fase.pct}%` : ''}
            </div>
          </div>
        </div>
      ))}

      <div className="milestone-legend">
        <div className="ml-item"><span style={{ color: '#2ecc71' }}>✓</span> Concluído</div>
        <div className="ml-item"><span style={{ color: '#3498db' }}>◑</span> Em andamento</div>
        <div className="ml-item"><span style={{ color: '#e67e22' }}>⚠</span> Pendente</div>
      </div>
    </div>
  );
};

export default PainelGantt;