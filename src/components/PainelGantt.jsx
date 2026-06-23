import React from 'react';

const formatarChave = (texto) => String(texto || '').replace(/\s+/g, '').toUpperCase();

// ── FUNÇÃO BLINDADA PARA FORMATAR DATA (DD/MM/YYYY) ──
const formatarDataBR = (dataInput) => {
  if (!dataInput) return '';

  if (dataInput instanceof Date) {
    const dia = String(dataInput.getUTCDate()).padStart(2, '0');
    const mes = String(dataInput.getUTCMonth() + 1).padStart(2, '0');
    const ano = dataInput.getUTCFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  const dataApenas = String(dataInput).split(' ')[0].split('T')[0]; 
  const partes = dataApenas.split('-');
  
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  return String(dataInput);
};

const PainelGantt = ({ fases, cronograma, faseSelecionada, onToggleFase }) => {
  const faseAgrupada = React.useMemo(() => {
    const listaFases = fases || [];
    const listaCrono = cronograma || [];

    if (listaCrono.length === 0) return [];

    // 1. DICIONÁRIO DE TAREFAS (Avanço real vindo da aba ATIVIDADE)
    const progressoMap = {};
    listaFases.forEach((f) => {
      const nomeOriginal = f.fase ? String(f.fase).trim().toUpperCase() : '';
      if (!nomeOriginal || nomeOriginal === 'NÃO PLANEJADO') return;

      const chaveBlindada = formatarChave(nomeOriginal);

      if (!progressoMap[chaveBlindada]) {
        progressoMap[chaveBlindada] = { total: 0, concluidas: 0 };
      }

      progressoMap[chaveBlindada].total += 1;
      if (String(f.concluido).toUpperCase() === 'SIM') {
        progressoMap[chaveBlindada].concluidas += 1;
      }
    });

    // 2. ORDENA O CRONOGRAMA EM ORDEM CRESCENTE (Pela data de início real)
    const cronogramaOrdenado = [...listaCrono]
      .filter(c => c && c.etapa)
      .sort((a, b) => {
        const dateA = a.data_inicio ? new Date(a.data_inicio) : new Date(0);
        const dateB = b.data_inicio ? new Date(b.data_inicio) : new Date(0);
        return dateA - dateB;
      });

    // 3. MONTA O RESULTADO BASEADO EXCLUSIVAMENTE NAS ETAPAS DO CRONOGRAMA DO BANCO
    return cronogramaOrdenado.map((c) => {
      const nomeExibicao = String(c.etapa).trim();
      const chave = formatarChave(nomeExibicao);

      // Cruza o progresso medido pelas tarefas
      const { total, concluidas } = progressoMap[chave] || { total: 0, concluidas: 0 };
      const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

      // Formata as datas exatas
      const inicioFormatado = formatarDataBR(c.data_inicio);
      const fimFormatado = formatarDataBR(c.data_fim);
      const periodo = inicioFormatado && fimFormatado ? `${inicioFormatado} - ${fimFormatado}` : '';

      const cor   = pct === 100 ? '#2ecc71' : pct > 0 ? '#3498db' : '#e67e22';
      const icone = pct === 100 ? '✓' : pct > 0 ? '◑' : '';

      return { nome: nomeExibicao, periodo, largura: Math.max(pct, 4), cor, icone, pct, chave };
    });
  }, [fases, cronograma]);

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
              marginBottom:    6,
            }}
          >
            <div className="gantt-label" style={{ marginBottom: '4px' }}>
              <span style={{ fontWeight: isAtivo ? 700 : 500, fontSize: '12px' }}>{fase.nome}</span>
            </div>
            
            <div className="gantt-bar-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                className="gantt-bar"
                style={{
                  width:      `${fase.largura}%`,
                  background: fase.cor,
                  color:      '#fff',
                  minWidth:   '45px',
                  minHeight:  '24px',
                  borderRadius: '4px',
                  boxShadow:  isAtivo ? `0 0 8px ${fase.cor}88` : 'none',
                  transition: 'box-shadow 0.25s ease, width 0.3s ease',
                  display:    'flex',
                  alignItems: 'center',
                  padding:    '0 8px',
                  position:   'relative',
                  overflow:   'visible',
                }}
              >
                
                {fase.pct >= 45 ? (
                  <>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>
                      {fase.periodo}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                      {fase.pct}% {fase.icone}
                    </span>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, fontSize: '12px', whiteSpace: 'nowrap', zIndex: 2 }}>
                      {fase.icone} {fase.pct}%
                    </span>
                    {fase.periodo && (
                      <span style={{ position: 'absolute', left: '100%', marginLeft: '8px', fontSize: '11px', fontWeight: 500, color: '#8b949e', whiteSpace: 'nowrap', zIndex: 1 }}>
                        {fase.periodo}
                      </span>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        );
      })}
      
      <div className="milestone-legend" style={{ marginTop: '12px' }}>
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