import React from 'react';

const getStyle = (concluido, temData) => {
  const raw = (concluido || '').toString().toUpperCase();
  if (['SIM', 'S', '1', 'TRUE'].includes(raw) || raw.includes('CONCLUÍ') || raw.includes('CONCLUIDO'))
    return { color: '#2ecc71', badge: 'CONCLUÍDO',    bg: 'rgba(46,204,113,0.15)' };
  if (temData)
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
  // CORRIGIDO: era f.data_entrega, coluna real é f.data
  const atividades = (fases || [])
    .filter((f) => f.data)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .slice(0, 6);

  if (atividades.length === 0) {
    return (
      <div className="panel">
        <div className="panel-title">🏁 PRÓXIMAS ENTREGAS / MILESTONES</div>
        <p style={{ fontSize: '11px', color: '#5a7da0', textAlign: 'center', padding: '20px 0' }}>
          Nenhuma atividade com data encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title">🏁 PRÓXIMAS ENTREGAS / MILESTONES</div>
      <div className="timeline">
        {atividades.map((fase, index) => {
          // CORRIGIDO: era fase.data_entrega, coluna real é fase.data
          const temData = !!fase.data;
          const { color, badge, bg } = getStyle(fase.concluido, temData);
          const data = formatarData(fase.data);

          // CORRIGIDO: era fase.atividade ?? fase.fase_nome ?? fase.nome, coluna real é fase.atividades
          const nome = fase.atividades ?? fase.escopo ?? 'Atividade';

          const areaDaAtividade = fase.area;
          const isAtivo = areaSelecionada === areaDaAtividade;
          const isApagado = areaSelecionada && !isAtivo;

          return (
            <div
              className="tl-item"
              key={index}
              onClick={() => onToggleArea && areaDaAtividade && onToggleArea(areaDaAtividade)}
              style={{
                cursor: (onToggleArea && areaDaAtividade) ? 'pointer' : 'default',
                opacity: isApagado ? 0.3 : 1,
                transition: 'opacity 0.3s ease'
              }}
              title={areaDaAtividade ? `Filtrar dashboard pela área: ${areaDaAtividade}` : ''}
            >
              <div className="tl-dot" style={{ background: color }} />
              <div className="tl-content" style={{
                borderLeft: `2px solid ${color}`,
                backgroundColor: isAtivo ? 'rgba(255,255,255,0.05)' : 'transparent',
                paddingRight: '8px'
              }}>
                <div className="tl-header">
                  <span className="tl-name">{nome}</span>
                  {data && <span className="tl-date">{data}</span>}
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
    </div>
  );
};

export default Timeline;