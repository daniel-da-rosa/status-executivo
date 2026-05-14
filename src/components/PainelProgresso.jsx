import React, { useEffect, useRef } from 'react';

const PainelProgresso = ({ progresso = 0, horasUtilizadas = 0, horasTotais = 0 }) => {
  const canvasRef = useRef(null);

  // Calcula progresso real por horas, não pelo campo "progresso" do banco
  const hUsadas = parseFloat(horasUtilizadas) || 0;
  const hTotais = parseFloat(horasTotais) || 0;
  const pct = hTotais > 0 ? Math.min(100, Math.max(0, (hUsadas / hTotais) * 100)) : 0;

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

    // Progresso
    const endAngle = Math.PI + (pct / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, endAngle);
    ctx.strokeStyle = '#33aaff';
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
    ctx.fillStyle = '#33aaff';
    ctx.fill();
  }, [pct]);

  return (
    <div className="panel">
      <div className="panel-title">⚙️ PAINEL DE PROGRESSO GERAL</div>
      <div className="gauge-wrap">
        <div className="status-badge">
          <span className="dot-green" /> EM ANDAMENTO
        </div>
        <canvas ref={canvasRef} width={160} height={95} />
        <div className="gauge-pct">{pct.toFixed(2)}%</div>
        <div className="gauge-label">Horas entregues / Horas Totais</div>
        <div className="gauge-hours">
          Progresso:{' '}
          <strong style={{ color: '#33aaff' }}>
            {hUsadas.toFixed(2)}
          </strong>{' '}
          de{' '}
          <strong style={{ color: '#fff' }}>
            {hTotais.toFixed(2)}
          </strong>{' '}
          Horas
        </div>
      </div>
    </div>
  );
};

export default PainelProgresso;