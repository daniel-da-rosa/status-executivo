import React, { useState, useCallback } from 'react';

const getPillClass = (status) => {
  if (!status) return 'pill-blue';
  const s = status.toUpperCase();
  if (s.includes('NÃO') || s.includes('PENDENTE') || s.includes('INFRA')) return 'pill-red';
  if (s.includes('AGUARD') || s.includes('ALERTA') || s.includes('ANDAMENTO')) return 'pill-orange';
  if (s.includes('OK') || s.includes('CONCLUÍ') || s.includes('100')) return 'pill-green';
  return 'pill-blue';
};

// 1. Recebemos areaSelecionada e onToggleArea nas props
const TabelaAreas = ({ areas, areaSelecionada, onToggleArea }) => {
  const [ordem, setOrdem] = useState({ campo: null, direcao: 'asc' });
  const [larguras, setLarguras] = useState({ area: 160, progresso: 160, status: 110 });

  // ── Ordenação ────────────────────────────────────────────────────
  const alternarOrdem = (campo) => {
    setOrdem((prev) =>
      prev.campo === campo
        ? { campo, direcao: prev.direcao === 'asc' ? 'desc' : 'asc' }
        : { campo, direcao: 'asc' }
    );
  };

  const dadosOrdenados = [...(areas || [])].sort((a, b) => {
    if (!ordem.campo) return 0;
    let va, vb;
    if (ordem.campo === 'progresso') {
      va = parseFloat(a.progresso ?? 0);
      vb = parseFloat(b.progresso ?? 0);
    } else {
      va = (a[ordem.campo] ?? '').toString().toLowerCase();
      vb = (b[ordem.campo] ?? '').toString().toLowerCase();
    }
    if (va < vb) return ordem.direcao === 'asc' ? -1 : 1;
    if (va > vb) return ordem.direcao === 'asc' ? 1 : -1;
    return 0;
  });

  const iconeOrdem = (campo) => {
    if (ordem.campo !== campo) return <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>;
    return <span style={{ marginLeft: 4 }}>{ordem.direcao === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Resize ───────────────────────────────────────────────────────
  const iniciarResize = useCallback((campo, e) => {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const w0 = larguras[campo];

    const onMove = (ev) => {
      const nova = Math.max(60, w0 + ev.clientX - x0);
      setLarguras((prev) => ({ ...prev, [campo]: nova }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [larguras]);

  if (!areas || areas.length === 0) {
    return (
      <div className="panel">
        <div className="panel-title">📋 STATUS POR ÁREA (MODULAR)</div>
        <p style={{ fontSize: '11px', color: '#5a7da0', textAlign: 'center', padding: '20px 0' }}>
          Nenhuma área encontrada.
        </p>
      </div>
    );
  }

  const colunas = [
    { campo: 'area',      label: 'ÁREA' },
    { campo: 'progresso', label: 'PROGRESSO' },
    { campo: 'status',    label: 'STATUS' },
  ];

  return (
    <div className="panel">
      <div className="panel-title">📋 STATUS POR ÁREA (MODULAR)</div>
      <div style={{ overflowX: 'auto' }}>
        <table
          className="area-table"
          style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}
        >
          <thead>
            <tr>
              {colunas.map(({ campo, label }) => (
                <th
                  key={campo}
                  onClick={() => alternarOrdem(campo)}
                  style={{
                    width: larguras[campo],
                    minWidth: larguras[campo],
                    position: 'relative',
                    userSelect: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {label}{iconeOrdem(campo)}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => iniciarResize(campo, e)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: 6,
                      cursor: 'col-resize',
                      zIndex: 1,
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dadosOrdenados.map((item, index) => {
              const progresso = parseFloat(item.progresso ?? item.porcentagem ?? 0);
              const progressoPct = Math.min(100, Math.max(0, progresso));
              
              // 2. Identificamos o nome da área desta linha
              const nomeDaArea = item.area || item.modulo || 'Área';
              
              // 3. Lógica visual para o cross-filtering
              const isAtivo = areaSelecionada === nomeDaArea;
              const isApagado = areaSelecionada && !isAtivo;

              return (
                <tr 
                  key={index}
                  // 4. Transformamos a linha inteira em um botão de filtro
                  onClick={() => onToggleArea && onToggleArea(nomeDaArea)}
                  style={{
                    cursor: onToggleArea ? 'pointer' : 'default',
                    opacity: isApagado ? 0.3 : 1,
                    backgroundColor: isAtivo ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    transition: 'opacity 0.3s ease, background-color 0.3s ease'
                  }}
                  title={`Filtrar dashboard pela área: ${nomeDaArea}`}
                >
                  <td style={{
                    width: larguras.area,
                    color: '#e2eaf5',
                    fontWeight: isAtivo ? 'bold' : '500', // Dá um destaque extra no texto se estiver ativo
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {nomeDaArea}
                  </td>
                  <td style={{ width: larguras.progresso }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="prog-bar" style={{ flex: 1 }}>
                        <div className="prog-fill" style={{ width: `${progressoPct}%` }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#5a7da0', minWidth: 28, textAlign: 'right' }}>
                        {progressoPct.toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ width: larguras.status }}>
                    <span className={`status-pill ${getPillClass(item.status)}`}>
                      {item.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaAreas;