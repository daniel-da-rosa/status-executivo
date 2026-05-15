import React, { useEffect, useRef, useMemo } from 'react';

const PainelConclusao = ({ areas = [] }) => {
  const canvasRef = useRef(null);

  const { percentual, concluidas, iniciadas, naoIniciadas } = useMemo(() => {
    const total = areas.length;
    if (total === 0) return { percentual: 0, concluidas: 0, iniciadas: 0, naoIniciadas: 0 };

    let concluidas = 0, iniciadas = 0, naoIniciadas = 0;

    areas.forEach(a => {
      const s = (a.status || '').toUpperCase().trim();
      if (s.includes('CONCLUÍ') || s.includes('CONCLU') || s.includes('OK') || s.includes('100')) {
        concluidas++;
      } else if (s.includes('ANDAMENTO') || s.includes('AGUARD') || s.includes('ALERTA') || s.includes('INICIADO')) {
        iniciadas++;
      } else {
        naoIniciadas++;
      }
    });

    const pontosTotais  = total * 100;
    const pontosObtidos = concluidas * 100 + iniciadas * 50;
    const percentual    = pontosTotais > 0 ? Math.min(100, Math.round((pontosObtidos / pontosTotais) * 100)) : 0;

    return { percentual, concluidas, iniciadas, naoIniciadas };
  }, [areas]);

  const pct = percentual;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 80, cy = 82, r = 62, lw = 13;

    ctx.clearRect(0, 0, 160, 95);

    // Trilha
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.strokeStyle = '#1e4080';
    ctx.lineWidth = lw;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Progresso — cor dinâmica por faixa
    const cor = pct >= 80 ? '#64ffda' : pct >= 50 ? '#f0c040' : '#33aaff';
    const endAngle = Math.PI + (pct / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, endAngle);
    ctx.strokeStyle = cor;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Ponteiro
    const nx = cx + r * Math.cos(endAngle);
    const ny = cy + r * Math.sin(endAngle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Centro
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = cor;
    ctx.fill();
  }, [pct]);

  return (
    <div className="panel">
      <div className="panel-title">✅ CONCLUSÃO DO PROJETO</div>
      <div className="gauge-wrap">

        <canvas ref={canvasRef} width={160} height={95} />
        <div className="gauge-pct">{pct.toFixed(0)}%</div>
        <div className="gauge-label">Áreas concluídas / Em andamento</div>

        <div className="gauge-hours">
          <span style={{ color: '#64ffda' }}>●</span> Concluídas: <strong style={{ color: '#64ffda' }}>{concluidas}</strong>
          {'  '}
          <span style={{ color: '#f0c040' }}>●</span> Iniciadas: <strong style={{ color: '#f0c040' }}>{iniciadas}</strong>
          {'  '}
          <span style={{ color: '#5a7da0' }}>●</span> Não inic.: <strong style={{ color: '#fff' }}>{naoIniciadas}</strong>
        </div>

      </div>
    </div>
  );
};

export default PainelConclusao;