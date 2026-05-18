import React, { useState, useEffect } from 'react';

const getStyle = (concluido) => {
  const raw = String(concluido || '').toUpperCase().trim();
  if (raw === 'SIM')
    return { color: '#2ecc71', badge: 'CONCLUÍDO',    bg: 'rgba(46,204,113,0.15)' };
  if (raw === 'INICIADO')
    return { color: '#3498db', badge: 'EM ANDAMENTO', bg: 'rgba(52,152,219,0.2)'  };
  return   { color: '#e67e22', badge: 'PENDENTE',     bg: 'rgba(230,126,34,0.15)' };
};

const formatarData = (valor) => {
  if (!valor) return null;
  if (typeof valor === 'string' && valor.includes('/')) return valor;
  try {
    const d = new Date(valor);
    if (!isNaN(d)) return d.toLocaleDateString('pt-BR');
  } catch (_) {}
  return String(valor);
};

const Timeline = ({ fases, areaSelecionada, onToggleArea }) => {
  const [statusFiltro, setStatusFiltro] = useState('INICIADO');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 5;

  // ✅ CORREÇÃO: Reseta para a página 1 se o status interno OU a área global mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [statusFiltro, areaSelecionada]);

  // 1. Filtragem e Ordenação da massa completa de dados
  const todasAtividadesFiltradas = (fases || [])
    .filter((f) => {
      // ✅ CORREÇÃO: Se houver uma área selecionada no dashboard, remove as outras da lista imediatamente
      if (areaSelecionada && f.area !== areaSelecionada) return false;

      const rawStatus = String(f.concluido || '').toUpperCase().trim();
      const temData = !!(f.data || f.datafim);

      if (statusFiltro === 'INICIADO') return rawStatus === 'INICIADO' && temData;
      if (statusFiltro === 'CONCLUIDO') return rawStatus === 'SIM' && temData;
      if (statusFiltro === 'PENDENTE') return rawStatus !== 'SIM' && rawStatus !== 'INICIADO';
      return true;
    })
    .sort((a, b) => {
      const dateA = a.data || a.datafim;
      const dateB = b.data || b.datafim;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; 
      if (!dateB) return -1;
      return new Date(dateA) - new Date(dateB);
    });

  // 2. Cálculo dos índices da paginação dinamicamente sobre o subset filtrado
  const totalPaginas = Math.ceil(todasAtividadesFiltradas.length / ITENS_POR_PAGINA);
  const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const atividadesPaginadas = todasAtividadesFiltradas.slice(indiceInicio, indiceInicio + ITENS_POR_PAGINA);

  const renderFiltroBtn = (label, valor) => {
    const ativo = statusFiltro === valor;
    return (
      <span
        onClick={() => setStatusFiltro(valor)}
        style={{
          cursor: 'pointer',
          fontSize: '10px',
          fontWeight: ativo ? 'bold' : 'normal',
          color: ativo ? '#64ffda' : '#5a7da0',
          borderBottom: ativo ? '1px solid #64ffda' : '1px solid transparent',
          paddingBottom: '2px',
          transition: 'all 0.2s ease',
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      
      <div>
        <div className="panel-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            🏁 PRÓXIMAS ENTREGAS / MILESTONES
            {/* Tag discreta para indicar visualmente que a lista está filtrada por fora */}
            {areaSelecionada && (
              <span style={{ fontSize: '9px', color: '#64ffda', background: 'rgba(100,255,218,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(100,255,218,0.2)' }}>
                Filtro: {areaSelecionada}
              </span>
            )}
          </span>
          <div style={{ display: 'flex', gap: '10px', marginRight: '4px' }}>
            {renderFiltroBtn('Iniciadas', 'INICIADO')}
            {renderFiltroBtn('Pendentes', 'PENDENTE')}
            {renderFiltroBtn('Concluídas', 'CONCLUIDO')}
            {renderFiltroBtn('Todas', 'TODAS')}
          </div>
        </div>

        {/* CONTEÚDO: Lista de Tarefas Paginadas */}
        {atividadesPaginadas.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#5a7da0', textAlign: 'center', padding: '40px 0', margin: 0 }}>
            Nenhuma atividade encontrada para o filtro selecionado.
          </p>
        ) : (
          <div className="timeline" style={{ paddingLeft: '15px' }}>
            {atividadesPaginadas.map((fase, index) => {
              const dataExibicao = fase.data || fase.datafim;
              const data = dataExibicao ? formatarData(dataExibicao) : 'Sem data';
              const nome = fase.atividades ?? fase.escopo ?? 'Atividade';
              const areaDaAtividade = fase.area;

              const { color, badge, bg } = getStyle(fase.concluido);

              return (
                <div
                  className="tl-item"
                  key={index}
                  onClick={() => onToggleArea && areaDaAtividade && onToggleArea(areaDaAtividade)}
                  style={{
                    cursor: (onToggleArea && areaDaAtividade) ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }}
                  title={areaDaAtividade ? `Clique para remover o filtro da área: ${areaDaAtividade}` : ''}
                >
                  <div className="tl-dot" style={{ background: color }} />
                  <div className="tl-content" style={{
                    borderLeft: `2px solid ${color}`,
                    backgroundColor: areaSelecionada ? 'rgba(100,255,218,0.02)' : 'transparent',
                    paddingRight: '8px'
                  }}>
                    <div className="tl-header">
                      <span className="tl-name">{nome}</span>
                      <span className="tl-date" style={{ color: dataExibicao ? '#5a7da0' : '#ef4444', fontStyle: dataExibicao ? 'normal' : 'italic' }}>
                        {data}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span className="tl-badge" style={{ background: bg, color }}>
                        {badge}
                      </span>
                      {areaDaAtividade && (
                        <span style={{ fontSize: '10px', color: '#7eb3ff', fontWeight: 'bold' }}>
                          {areaDaAtividade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RODAPÉ: Controles de Paginação (somente se houver mais de 1 página do filtro ativo) */}
      {totalPaginas > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '12px', 
          marginTop: '16px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(30, 64, 128, 0.2)'
        }}>
          <button
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(prev => prev - 1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: paginaAtual === 1 ? '#233554' : '#5a7da0',
              cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            ◀ Voltar
          </button>
          
          <span style={{ fontSize: '10px', color: '#7eb3ff', letterSpacing: '0.05em' }}>
            PÁGINA <strong style={{ color: '#64ffda' }}>{paginaAtual}</strong> DE <strong>{totalPaginas}</strong>
          </span>

          <button
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual(prev => prev + 1)}
            style={{
              background: 'transparent',
              border: 'none',
              color: paginaAtual === totalPaginas ? '#233554' : '#5a7da0',
              cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              fontWeight: 'bold'
            }}
          >
            Avançar ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Timeline;