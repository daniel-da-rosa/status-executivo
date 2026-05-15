import React, { useEffect, useRef, useMemo } from 'react';

// Mock de fallback
const OBJETIVOS_MOCK = [
  { icon: '📦', nome: 'ACURÁCIA DE ESTOQUE',     sub: '> 90% de precisão'     },
  { icon: '🖩',  nome: 'APURAÇÃO CUSTO REAL',     sub: 'Automação de custos'   },
  { icon: '🏦', nome: 'MODERNIZAÇÃO FINANCEIRA', sub: 'Integração Bancária VAN' },
];

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

  const listaObjetivos = objetivos && objetivos.length > 0 ? objetivos : OBJETIVOS_MOCK;

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-title">📊 INDICADORES E OBJETIVOS</div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'flex-start', marginTop: 4 }}>
        <Gauge pct={pctHoras} cor={corHoras} label="Consumo de Horas" sublabel={`${horasUtilizadas} / ${horasTotais} h`} />
        <div style={{ width: 1, background: '#1e4080', alignSelf: 'stretch', margin: '8px 4px' }} />
        <Gauge pct={percentualEntrega} cor={corEntrega} label="Entrega por Status" sublabel={`Concl. ${concluidas} · Inic. ${iniciadas} · Pend. ${naoIniciadas}`} />
      </div>

    

      <hr style={{ border: 'none', borderTop: '1px solid #233554', margin: '16px 0', width: '100%' }} />

      {/* Grid forçado para 3 colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {listaObjetivos.map((obj, idx) => (
          <div key={idx} style={{ 
            background: 'rgba(10, 25, 47, 0.4)', 
            border: '1px solid #233554', 
            borderRadius: '6px', 
            padding: '8px 4px', // Padding reduzido
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centraliza o texto
            justifyContent: 'center',
            gap: '2px'
          }}>
            <div style={{ fontSize: '15px', marginBottom: '2px' }}>{obj.icon || '📌'}</div>
            <div style={{ fontSize: '9px', color: '#e2eaf5', fontWeight: 'bold', lineHeight: '1.2', textAlign: 'center' }}>
              {obj.nome || obj.objetivo}
            </div>
            <div style={{ fontSize: '8px', color: '#5a7da0', textAlign: 'center' }}>
              {obj.sub || obj.meta}
            </div>
            <div style={{ position: 'absolute', top: '4px', right: '6px', color: '#64ffda', fontSize: '10px' }}>✓</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PainelConclusao;