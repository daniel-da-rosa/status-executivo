import React, { useState } from 'react';

const BG_COLORS = [
  'rgba(241,196,15,0.15)', 'rgba(231,76,60,0.2)',   'rgba(231,76,60,0.3)',
  'rgba(46,204,113,0.1)',  'rgba(241,196,15,0.2)',   'rgba(231,76,60,0.2)',
  'rgba(46,204,113,0.15)', 'rgba(46,204,113,0.1)',   'rgba(241,196,15,0.1)',
];

const DOT_COLORS = [
  '#f1c40f', '#e74c3c', '#e74c3c',
  '#2ecc71', '#f1c40f', '#e74c3c',
  '#2ecc71', '#2ecc71', '#f1c40f',
];

const TIPO_LABEL = {
  risco:         { texto: 'RISCO',            cor: '#e74c3c' },
  ponto_atencao: { texto: 'PONTO DE ATENCAO', cor: '#f1c40f' },
};

// Escala do banco: 1=BAIXO/A  2=MEDIO/A  3=ALTO/A
const PROB_LABEL = { 1: 'BAIXA', 2: 'MEDIA', 3: 'ALTA' };
const IMP_LABEL  = { 1: 'BAIXO', 2: 'MEDIO', 3: 'ALTO' };

const MatrizRiscos = ({ riscos, areaSelecionada, onToggleArea }) => {
  const [tooltip, setTooltip] = useState({ visible: false, text: '', area: '', x: 0, y: 0 });
  const [modal, setModal] = useState(null);

  const cells = Array.from({ length: 9 }, () => []);

  (riscos || []).forEach((r) => {
    const prob = parseInt(r.probabilidade ?? r.probabilidade ?? r.prob ?? 0, 10);
    const imp  = parseInt(r.impacto      ?? r.imp                  ?? 0, 10);

    // Banco usa escala 1-3. Normaliza para 0-2 para calcular o indice da celula.
    // Sem isso prob=3 gera idx negativo e o ponto desaparece silenciosamente.
    const probNorm = Math.min(Math.max(prob - 1, 0), 2);
    const impNorm  = Math.min(Math.max(imp  - 1, 0), 2);
    const idx      = (2 - probNorm) * 3 + impNorm;

    if (idx >= 0 && idx < 9) {
      const label = r.descricao ?? r.detalhes ?? r.risco ?? r.ponto ?? 'Risco mapeado';
      const area  = r.indicado_por_area ?? r.area ?? r.modulo ?? null;
      const fase  = r.fase ?? null;
      const tipo  = r._tipo ?? 'risco';
      cells[idx].push({ label, idx, area, fase, tipo, probabilidade: prob, impacto: imp });
    }
  });

  return (
    <div className="panel" style={{ position: 'relative' }}>
      <div className="panel-title">RISCOS E PONTOS DE ATENCAO</div>

      <div style={{ display: 'flex', gap: '6px', fontSize: '9px', color: '#5a7da0', marginBottom: '6px', justifyContent: 'space-between' }}>
        <span>PROBABILIDADE</span>
        <span>IMPACTO</span>
      </div>

      <div className="risk-container">
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
                  const isAtivo   = areaSelecionada === dot.area;
                  const isApagado = areaSelecionada && !isAtivo;
                  return (
                    <div
                      key={j}
                      className="risk-dot"
                      style={{
                        background: DOT_COLORS[dot.idx],
                        top:  `calc(50% + ${j * 6}px)`,
                        left: `calc(50% + ${j * 6}px)`,
                        opacity:   isApagado ? 0.2 : 1,
                        transform: isAtivo ? 'scale(1.4)' : 'scale(1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        zIndex: isAtivo ? 10 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal(dot);
                        if (onToggleArea && dot.area) onToggleArea(dot.area);
                      }}
                      onMouseEnter={(e) => {
                        const rect   = e.target.getBoundingClientRect();
                        const parent = e.target.closest('.panel').getBoundingClientRect();
                        setTooltip({ visible: true, text: dot.label, area: dot.area, x: rect.left - parent.left, y: rect.top - parent.top - 30 });
                      }}
                      onMouseLeave={() => setTooltip({ visible: false, text: '', area: '' })}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#5a7da0', marginTop: '4px' }}>
            <span>LOW</span><span>IMPACTO</span><span>ALTA</span>
          </div>
        </div>
      </div>

      {tooltip.visible && !modal && (
        <div style={{
          position: 'absolute', top: `${tooltip.y}px`, left: `${tooltip.x}px`,
          background: '#1a3a6b', border: '1px solid #33aaff', borderRadius: '6px',
          padding: '5px 10px', fontSize: '10px', color: '#e2eaf5',
          whiteSpace: 'normal', zIndex: 100, pointerEvents: 'none',
          maxWidth: '200px', boxShadow: '0px 4px 6px rgba(0,0,0,0.3)',
        }}>
          {tooltip.area && (
            <div style={{ color: '#7eb3ff', fontWeight: 'bold', marginBottom: '2px', fontSize: '9px' }}>
              [{tooltip.area}]
            </div>
          )}
          {tooltip.text}
        </div>
      )}

      {modal && (
        <>
          <div onClick={() => setModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', zIndex: 1000,
            background: '#112240', border: '1px solid #233554',
            borderRadius: '12px', padding: '24px 28px',
            minWidth: '320px', maxWidth: '480px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{
                fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.08em',
                color: TIPO_LABEL[modal.tipo]?.cor ?? '#e74c3c',
                background: `${TIPO_LABEL[modal.tipo]?.cor ?? '#e74c3c'}22`,
                border: `1px solid ${TIPO_LABEL[modal.tipo]?.cor ?? '#e74c3c'}55`,
                borderRadius: '4px', padding: '2px 8px',
              }}>
                {TIPO_LABEL[modal.tipo]?.texto ?? 'RISCO'}
              </span>
              <button onClick={() => setModal(null)} style={{ background: 'transparent', border: 'none', color: '#5a7da0', fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>
                x
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#e2eaf5', lineHeight: 1.6, margin: '0 0 18px 0' }}>
              {modal.label}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
              {modal.area && (
                <div style={{ background: 'rgba(100,255,218,0.05)', borderRadius: '6px', padding: '8px 12px' }}>
                  <div style={{ color: '#5a7da0', marginBottom: '2px' }}>AREA</div>
                  <div style={{ color: '#64ffda', fontWeight: 'bold' }}>{modal.area}</div>
                </div>
              )}
              {modal.fase && (
                <div style={{ background: 'rgba(100,255,218,0.05)', borderRadius: '6px', padding: '8px 12px' }}>
                  <div style={{ color: '#5a7da0', marginBottom: '2px' }}>FASE</div>
                  <div style={{ color: '#64ffda', fontWeight: 'bold' }}>{modal.fase}</div>
                </div>
              )}
              <div style={{ background: 'rgba(241,196,15,0.06)', borderRadius: '6px', padding: '8px 12px' }}>
                <div style={{ color: '#5a7da0', marginBottom: '2px' }}>PROBABILIDADE</div>
                <div style={{ color: '#f1c40f', fontWeight: 'bold' }}>{PROB_LABEL[modal.probabilidade] ?? modal.probabilidade}</div>
              </div>
              <div style={{ background: 'rgba(231,76,60,0.06)', borderRadius: '6px', padding: '8px 12px' }}>
                <div style={{ color: '#5a7da0', marginBottom: '2px' }}>IMPACTO</div>
                <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>{IMP_LABEL[modal.impacto] ?? modal.impacto}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MatrizRiscos;