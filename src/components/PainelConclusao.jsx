import React, { useEffect, useRef, useMemo, useState } from 'react';

// ── TRADUTOR DE ÍCONES ───────────────────────────────────────────
const ICONES = {
  financeiro:   '🏦', banco: '🏦', van: '🏦',
  custo:        '🖩', calculo: '🖩', apuracao: '🖩',
  estoque:      '📦', inventario: '📦', acuracia: '📦',
  meta:         '🎯', objetivo: '🎯', alvo: '🎯',
  crescimento:  '📈', resultado: '📈', performance: '📈',
  entrega:      '🚚', logistica: '🚚',
  integracao:   '🔗', sistema: '🔗', api: '🔗',
  automacao:    '⚙️', processo: '⚙️',
  qualidade:    '✅', conformidade: '✅',
  seguranca:    '🔒', acesso: '🔒',
  relatorio:    '📊', dashboard: '📊', analytics: '📊',
  fiscal:       '🧾', nota: '🧾', sped: '🧾',
  contabil:     '📒', contabilidade: '📒',
  pessoas:      '👥', usuario: '👥', equipe: '👥',
  prazo:        '📅', calendario: '📅', agenda: '📅',
  inovacao:     '💡', melhoria: '💡',
  suporte:      '🛠️', manutencao: '🛠️',
};

const ICONE_PADRAO = '📌';

const resolverIcone = (valor) => {
  if (!valor) return ICONE_PADRAO;
  const key = String(valor).toLowerCase().trim();
  if (ICONES[key]) return ICONES[key];
  const encontrado = Object.keys(ICONES).find(k => key.includes(k) || k.includes(key));
  if (encontrado) return ICONES[encontrado];
  if ([...valor].length <= 4) return valor;
  return ICONE_PADRAO;
};
// ─────────────────────────────────────────────────────────────────

function drawGauge(ctx, cx, cy, r, lw, pct, cor) {
  ctx.clearRect(cx - r - lw, 0, (r + lw) * 2, cy + lw + 2);
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.strokeStyle = '#1e4080';
  ctx.lineWidth = lw;
  ctx.lineCap = 'butt';
  ctx.stroke();

  const endAngle = Math.PI + (pct / 100) * Math.PI;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, endAngle);
  ctx.strokeStyle = cor;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.stroke();

  const nx = cx + r * Math.cos(endAngle);
  const ny = cy + r * Math.sin(endAngle);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(nx, ny);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
  ctx.fillStyle = cor;
  ctx.fill();
}

const Gauge = ({ pct, label, sublabel, cor }) => {
  const ref = useRef(null);
  const W = 150, H = 88;
  const cx = W / 2, cy = H - 4, r = 56, lw = 12;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    drawGauge(ctx, cx, cy, r, lw, pct, cor);
  }, [pct, cor]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <canvas ref={ref} width={W} height={H} style={{ display: 'block' }} />
      <div style={{ fontSize: 20, fontWeight: 'bold', color: cor, marginTop: -4 }}>
        {pct.toFixed(2)}%
      </div>
      <div style={{ fontSize: 11, color: '#e2eaf5', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: 10, color: '#5a7da0', textAlign: 'center' }}>{sublabel}</div>
      )}
    </div>
  );
};

const PainelConclusao = ({
  dadosGlobais = [],
  horasUtilizadas = 0,
  horasTotais = 0,
  objetivos = []
}) => {
  const [modalAberto, setModalAberto] = useState(null);

  const pctHoras = useMemo(() => {
    if (!horasTotais || horasTotais === 0) return 0;
    return Math.min(100, (horasUtilizadas / horasTotais) * 100);
  }, [horasUtilizadas, horasTotais]);

  const corHoras = pctHoras >= 90 ? '#ef4444' : pctHoras >= 70 ? '#f0c040' : '#33aaff';

  const { percentualEntrega, concluidas, iniciadas, naoIniciadas } = useMemo(() => {
    const total = dadosGlobais.length;
    if (total === 0) return { percentualEntrega: 0, concluidas: 0, iniciadas: 0, naoIniciadas: 0 };

    let c = 0, i = 0, n = 0;
    dadosGlobais.forEach(item => {
      const s = (item.concluido || '').toUpperCase().trim();
      if (s === 'SIM') c++;
      else if (s === 'INICIADO') i++;
      else n++;
    });

    const pontosTotais = total * 100;
    const pontosObtidos = (c * 100) + (i * 50);
    const percentual = pontosTotais > 0 ? Math.min(100, (pontosObtidos / pontosTotais) * 100) : 0;

    return { percentualEntrega: percentual, concluidas: c, iniciadas: i, naoIniciadas: n };
  }, [dadosGlobais]);

  const corEntrega = percentualEntrega >= 80 ? '#64ffda' : percentualEntrega >= 50 ? '#f0c040' : '#33aaff';

  const listaObjetivos = objetivos.slice(0, 3);

  return (
    <>
      <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="panel-title">📊 INDICADORES E OBJETIVOS</div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'flex-start', marginTop: 4 }}>
          <Gauge pct={pctHoras} cor={corHoras} label="Consumo de Horas" sublabel={`${horasUtilizadas} / ${horasTotais} h`} />
          <div style={{ width: 1, background: '#1e4080', alignSelf: 'stretch', margin: '8px 4px' }} />
          <Gauge pct={percentualEntrega} cor={corEntrega} label="Entrega por Status" sublabel={`Concl. ${concluidas} · Inic. ${iniciadas} · Pend. ${naoIniciadas}`} />
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #233554', margin: '16px 0', width: '100%' }} />

        {listaObjetivos.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#5a7da0', fontSize: '12px', padding: '10px 0' }}>
            Nenhum objetivo importado para este projeto.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {listaObjetivos.map((obj, idx) => {
              const iconeConvertido = resolverIcone(obj.icone || obj.icon);
              
              // Garante que mostre a curta. Se não existir, avisa.
              const descCurta = obj.descricao_curta || obj.resumo || '';

              return (
                <div 
                  key={idx} 
                  onClick={() => setModalAberto(idx)}
                  title="Clique para ver detalhes"
                  style={{ 
                    background: 'rgba(10, 25, 47, 0.4)', 
                    border: '1px solid #233554', 
                    borderRadius: '6px', 
                    padding: '10px 6px', 
                    height: '110px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(100,255,218,0.05)';
                    e.currentTarget.style.borderColor = '#64ffda';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(10, 25, 47, 0.4)';
                    e.currentTarget.style.borderColor = '#233554';
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '2px' }}>
                    {iconeConvertido}
                  </div>
                  <div style={{ fontSize: '10px', color: '#e2eaf5', fontWeight: 'bold', lineHeight: '1.2', textAlign: 'center' }}>
                    {obj.objetivo || obj.nome}
                  </div>
                  <div style={{ 
                    fontSize: '9px', color: '#5a7da0', textAlign: 'center', 
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' 
                  }}>
                    {descCurta}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE DETALHES DO OBJETIVO */}
      {modalAberto !== null && listaObjetivos[modalAberto] && (() => {
        const obj = listaObjetivos[modalAberto];
        const icone = resolverIcone(obj.icone || obj.icon);
        const nome = obj.objetivo || obj.nome || 'Objetivo';
        const descCurta = obj.descricao_curta || obj.resumo || '';
        const descCompleta = obj.descricao || obj.meta || 'Sem descrição detalhada.';

        return (
          <>
            <div
              onClick={() => setModalAberto(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, backdropFilter: 'blur(2px)' }}
            />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10000, background: '#112240',
              border: '1px solid #233554', borderRadius: '12px',
              padding: '28px 32px', minWidth: '320px', maxWidth: '440px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{icone}</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2eaf5', lineHeight: 1.3 }}>{nome}</span>
                </div>
                <button
                  onClick={() => setModalAberto(null)}
                  style={{ background: 'transparent', border: 'none', color: '#5a7da0', fontSize: '20px', cursor: 'pointer', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5a7da0'}
                >×</button>
              </div>

              {/* Descrição Curta Repetida em Destaque */}
              {descCurta && (
                <div style={{ fontSize: '13px', color: '#64ffda', marginBottom: '16px', fontWeight: '500', fontStyle: 'italic' }}>
                  "{descCurta}"
                </div>
              )}

              {/* Título da Descrição Completa */}
              <div style={{ fontSize: '10px', color: '#5a7da0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 'bold' }}>
                Descrição Detalhada
              </div>

              {/* Texto da Descrição Completa */}
              <p style={{ fontSize: '14px', color: '#a8b2c8', lineHeight: 1.6, margin: '0 0 20px 0', whiteSpace: 'pre-wrap' }}>
                {descCompleta}
              </p>

              {obj.status && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.07em',
                  color: String(obj.status).toLowerCase().includes('conclu') ? '#2ecc71' : '#f1c40f',
                  background: String(obj.status).toLowerCase().includes('conclu') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                  border: `1px solid ${String(obj.status).toLowerCase().includes('conclu') ? 'rgba(46, 204, 113, 0.3)' : 'rgba(241, 196, 15, 0.3)'}`,
                  borderRadius: '6px', padding: '6px 12px',
                }}>
                  Status: {String(obj.status).toUpperCase()}
                </div>
              )}
            </div>
          </>
        );
      })()}
    </>
  );
};

export default PainelConclusao;