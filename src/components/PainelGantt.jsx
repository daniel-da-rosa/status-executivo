import React from 'react';

const ORDEM_FASES = [
  '1-LEVANTAMENTO',
  '2-CADASTROS',
  '3-ETAPA I',
  '4-ETAPA II',
  '5-ETAPA III',
  '6-ETAPA IV',
  'ENCERRAMENTO',
];

const PainelGantt = ({ fases, faseSelecionada, onToggleFase }) => {
  const faseAgrupada = React.useMemo(() => {
    if (!fases || fases.length === 0) return [];

    const mapa = {};

    fases.forEach((f) => {
      const nomeFase = f.fase ?? 'SEM FASE';
      if (nomeFase === 'NÃO PLANEJADO') return;

      if (!mapa[nomeFase]) {
        mapa[nomeFase] = { total: 0, concluidas: 0, datas: [] };
      }

      mapa[nomeFase].total += 1;
      if (String(f.concluido).toUpperCase() === 'SIM') {
        mapa[nomeFase].concluidas += 1;
      }

      if (f.data)    mapa[nomeFase].datas.push(new Date(f.data));
      if (f.datafim) mapa[nomeFase].datas.push(new Date(f.datafim));
    });

    const ordenadas = ORDEM_FASES.filter((nome) => mapa[nome]);
    const extras    = Object.keys(mapa).filter((nome) => !ORDEM_FASES.includes(nome));

    return [...ordenadas, ...extras].map((nome) => {
      const { total, concluidas, datas } = mapa[nome];
      const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

      const datesValidas = datas.filter((d) => !isNaN(d));
      const dataInicio   = datesValidas.length > 0 ? new Date(Math.min(...datesValidas)) : null;
      const dataFim      = datesValidas.length > 0 ? new Date(Math.max(...datesValidas)) : null;

      const periodo = dataInicio && dataFim
        ? `${dataInicio.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })} – ${dataFim.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}`
        : '';

      const cor   = pct === 100 ? '#2ecc71' : pct > 0 ? '#3498db' : '#e67e22';
      const icone = pct === 100 ? '✓' : pct > 0 ? '◑' : '';

      return { nome, periodo, largura: Math.max(pct, 4), cor, icone, pct };
    });
  }, [fases]);

  const temFiltro = !!onToggleFase;

  return (
    <div className="panel">
      <div className="panel-title">
        📅 CRONOGRAMA E DATAS CHAVE
        {faseSelecionada && (
          <span style={{
            marginLeft: 8,
            fontSize: 10,
            color: '#64ffda',
            fontWeight: 'normal',
            background: 'rgba(100,255,218,0.1)',
            border: '1px solid rgba(100,255,218,0.3)',
            borderRadius: 4,
            padding: '1px 6px',
          }}>
            {faseSelecionada} ✕
          </span>
        )}
      </div>

      {faseAgrupada.map((fase, i) => {
        const isAtivo   = faseSelecionada === fase.nome;
        const isApagado = faseSelecionada && !isAtivo;

        return (
          <div
            className="gantt-row"
            key={i}
            onClick={() => temFiltro && onToggleFase(fase.nome)}
            title={temFiltro ? `Filtrar por fase: ${fase.nome}` : undefined}
            style={{
              cursor:          temFiltro ? 'pointer' : 'default',
              opacity:         isApagado ? 0.3 : 1,
              borderRadius:    6,
              padding:         '2px 4px',
              background:      isAtivo ? 'rgba(100,255,218,0.06)' : 'transparent',
              outline:         isAtivo ? '1px solid rgba(100,255,218,0.25)' : 'none',
              transition:      'opacity 0.25s ease, background 0.25s ease, outline 0.25s ease',
              marginBottom:    2,
            }}
          >
            <div className="gantt-label">
              <span style={{ fontWeight: isAtivo ? 700 : 400 }}>{fase.nome}</span>
              <span style={{ color: fase.cor, fontSize: '11px' }}>{fase.periodo}</span>
            </div>
            <div className="gantt-bar-wrap">
              <div
                className="gantt-bar"
                style={{
                  width:      `${fase.largura}%`,
                  background: isAtivo ? fase.cor : fase.cor,
                  color:      '#fff',
                  minWidth:   '20px',
                  // pulso suave quando ativo
                  boxShadow:  isAtivo ? `0 0 8px ${fase.cor}88` : 'none',
                  transition: 'box-shadow 0.25s ease',
                }}
              >
                {fase.icone} {fase.pct > 0 ? `${fase.pct}%` : ''}
              </div>
            </div>
          </div>
        );
      })}

      <div className="milestone-legend">
        <div className="ml-item"><span style={{ color: '#2ecc71' }}>✓</span> Concluído</div>
        <div className="ml-item"><span style={{ color: '#3498db' }}>◑</span> Em andamento</div>
        <div className="ml-item"><span style={{ color: '#e67e22' }}>⚠</span> Pendente</div>
        {temFiltro && (
          <div className="ml-item" style={{ color: '#5a7da0', fontStyle: 'italic' }}>
            clique para filtrar
          </div>
        )}
      </div>
    </div>
  );
};

export default PainelGantt;