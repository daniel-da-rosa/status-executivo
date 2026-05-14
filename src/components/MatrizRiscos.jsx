import React, { useState } from 'react';

const BG_COLORS = [
  'rgba(241,196,15,0.15)', 'rgba(231,76,60,0.2)',   'rgba(231,76,60,0.3)',   // linha 0 — prob ALTA
  'rgba(46,204,113,0.1)',  'rgba(241,196,15,0.2)',   'rgba(231,76,60,0.2)',   // linha 1 — prob MED
  'rgba(46,204,113,0.15)', 'rgba(46,204,113,0.1)',   'rgba(241,196,15,0.1)',  // linha 2 — prob LOW
];

// Cor do ponto baseada na posição da célula (severidade)
const DOT_COLORS = [
  '#f1c40f', '#e74c3c', '#e74c3c',
  '#2ecc71', '#f1c40f', '#e74c3c',
  '#2ecc71', '#2ecc71', '#f1c40f',
];

// 1. Adicionando as props do filtro
const MatrizRiscos = ({ riscos, areaSelecionada, onToggleArea }) => {
  const [tooltip, setTooltip] = useState({ visible: false, text: '', area: '', x: 0, y: 0 });

  // Monta grade 3x3 (cada célula pode ter múltiplos pontos)
  const cells = Array.from({ length: 9 }, () => []);

  (riscos || []).forEach((r) => {
    // Aceita variações de nome de campo
    const probRaw = r.probabilidade ?? r.probalidade ?? r.prob ?? 0;
    const impRaw  = r.impacto ?? r.imp ?? 0;
    const prob    = parseInt(probRaw, 10);
    const imp     = parseInt(impRaw,  10);
    const idx     = (2 - prob) * 3 + imp;

    if (idx >= 0 && idx < 9) {
      const label = r.descrição ?? r.descricao ?? r.risco ?? r.ponto ?? 'Risco mapeado';
      // 2. Extrai a área do risco
      const areaDoRisco = r.area ?? r.modulo ?? null; 
      
      cells[idx].push({ label, idx, area: areaDoRisco });
    }
  });

  return (
    <div className="panel" style={{ position: 'relative' }}>
      <div className="panel-title">⚠️ RISCOS E PONTOS DE ATENÇÃO</div>

      <div style={{ display: 'flex', gap: '6px', fontSize: '9px', color: '#5a7da0', marginBottom: '6px', justifyContent: 'space-between' }}>
        <span>PROBABILIDADE ↑</span>
        <span>IMPACTO →</span>
      </div>

      <div className="risk-container">
        {/* Eixo Y */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '142px', fontSize: '9px', color: '#5a7da0', padding: '4px 4px 4px 0' }}>
          <span>ALTA</span>
          <span>MED</span>
          <span>BAIXA</span>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <div className="risk-grid">
            {cells.map((items, i) => (
              <div key={i} className="risk-cell" style={{ background: BG_COLORS[i] }}>
                {items.map((dot, j) => {
                  
                  // 3. Lógica visual: verifica se a bolinha pertence à área filtrada
                  const isAtivo = areaSelecionada === dot.area;
                  const isApagado = areaSelecionada && !isAtivo;

                  return (
                    <div
                      key={j}
                      className="risk-dot"
                      style={{
                        background: DOT_COLORS[dot.idx],
                        top:  `calc(50% + ${j * 6}px)`,
                        left: `calc(50% + ${j * 6}px)`,
                        // Adiciona transparência nas inativas e aumenta levemente as ativas
                        opacity: isApagado ? 0.2 : 1,
                        transform: isAtivo ? 'scale(1.4)' : 'scale(1)',
                        cursor: (onToggleArea && dot.area) ? 'pointer' : 'default',
                        transition: 'all 0.3s ease',
                        zIndex: isAtivo ? 10 : 1 // Garante que a ativa fique por cima
                      }}
                      // 4. Gatilho de clique para aplicar/remover o filtro
                      onClick={() => onToggleArea && dot.area && onToggleArea(dot.area)}
                      onMouseEnter={(e) => {
                        const rect = e.target.getBoundingClientRect();
                        const parent = e.target.closest('.panel').getBoundingClientRect();
                        setTooltip({ 
                          visible: true, 
                          text: dot.label, 
                          area: dot.area, // Passa a área para o tooltip
                          x: rect.left - parent.left, 
                          y: rect.top - parent.top - 30 
                        });
                      }}
                      onMouseLeave={() => setTooltip({ visible: false, text: '', area: '' })}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Eixo X */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#5a7da0', marginTop: '4px' }}>
            <span>LOW</span><span>IMPACTO</span><span>ALTA</span>
          </div>
        </div>
      </div>

      {/* Tooltip atualizado */}
      {tooltip.visible && (
        <div style={{
          position: 'absolute',
          top: `${tooltip.y}px`,
          left: `${tooltip.x}px`,
          background: '#1a3a6b',
          border: '1px solid #33aaff',
          borderRadius: '6px',
          padding: '5px 10px',
          fontSize: '10px',
          color: '#e2eaf5',
          whiteSpace: 'normal',
          zIndex: 100,
          pointerEvents: 'none',
          maxWidth: '200px',
          boxShadow: '0px 4px 6px rgba(0,0,0,0.3)',
        }}>
          {tooltip.area && (
            <div style={{ color: '#7eb3ff', fontWeight: 'bold', marginBottom: '2px', fontSize: '9px' }}>
              [{tooltip.area}]
            </div>
          )}
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default MatrizRiscos;