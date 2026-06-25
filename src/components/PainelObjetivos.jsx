import React, { useState } from 'react';

// Icones disponiveis para escolha na planilha (campo "icone")
const ICONES = {
  // Financeiro / Negocio
  financeiro:   '🏦', banco: '🏦', van: '🏦',
  custo:        '🖩',  calculo: '🖩', apuracao: '🖩',
  estoque:      '📦', inventario: '📦', acuracia: '📦',
  meta:         '🎯', objetivo: '🎯', alvo: '🎯',
  crescimento:  '📈', resultado: '📈', performance: '📈',
  entrega:      '🚚', logistica: '🚚',
  integracao:   '🔗', sistema: '🔗', api: '🔗',
  automacao:    '⚙️',  processo: '⚙️',
  qualidade:    '✅',  conformidade: '✅',
  seguranca:    '🔒', acesso: '🔒',
  relatorio:    '📊', dashboard: '📊', analytics: '📊',
  fiscal:       '🧾', nota: '🧾', sped: '🧾',
  contabil:     '📒', contabilidade: '📒',
  pessoas:      '👥', usuario: '👥', equipe: '👥',
  prazo:        '📅', calendario: '📅', agenda: '📅',
  inovacao:     '💡', melhoria: '💡',
  suporte:      '🛠️',  manutencao: '🛠️',
};

const ICONE_PADRAO = '📌';

// Resolve o icone: tenta a chave exata, depois tenta substring, senao usa o valor direto
const resolverIcone = (valor) => {
  if (!valor) return ICONE_PADRAO;
  const key = String(valor).toLowerCase().trim();
  if (ICONES[key]) return ICONES[key];
  const encontrado = Object.keys(ICONES).find(k => key.includes(k) || k.includes(key));
  if (encontrado) return ICONES[encontrado];
  // Se for um emoji direto (campo com emoji no Excel), usa diretamente
  if ([...valor].length <= 4) return valor;
  return ICONE_PADRAO;
};

const STATUS_STYLE = {
  concluido:     { cor: '#2ecc71', label: 'CONCLUIDO'     },
  'em andamento':{ cor: '#f1c40f', label: 'EM ANDAMENTO'  },
  pendente:      { cor: '#e74c3c', label: 'PENDENTE'      },
  pausado:       { cor: '#8892b0', label: 'PAUSADO'       },
};

const resolverStatus = (valor) => {
  if (!valor) return null;
  const key = String(valor).toLowerCase().trim();
  return STATUS_STYLE[key] ?? { cor: '#8892b0', label: String(valor).toUpperCase() };
};

// Fallback quando nao ha dados do banco
const OBJETIVOS_FALLBACK = [
  { icone: 'estoque',    objetivo: 'ACURACIA DE ESTOQUE',     descricao: 'Atingir mais de 70% de precisao no inventario.',  status: 'pendente' },
  { icone: 'custo',      objetivo: 'APURACAO CUSTO REAL',     descricao: 'Automacao completa do calculo de custos reais.',   status: 'Iniciado'     },
  { icone: 'banco',      objetivo: 'MODERNIZACAO FINANCEIRA', descricao: 'Integracao bancaria via VAN para pagamentos.',     status: 'Concluido'     },
];

const PainelObjetivos = ({ objetivos }) => {
  const [modalAberto, setModalAberto] = useState(null);

  // Limita a 3 objetivos conforme regra de negocio
  const lista = (objetivos && objetivos.length > 0 ? objetivos : OBJETIVOS_FALLBACK).slice(0, 3);

  return (
    <>
      <div className="panel">
        <div className="panel-title">OBJETIVOS E METAS DO PROJETO</div>
        <div className="obj-grid">
          {lista.map((obj, i) => {
            const icone  = resolverIcone(obj.icone ?? obj.icon);
            const nome   = obj.objetivo ?? obj.nome ?? 'Objetivo';
            const status = resolverStatus(obj.status);

            return (
              <div
                key={i}
                className="obj-card"
                onClick={() => setModalAberto(i)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Clique para ver detalhes"
              >
                <div className="obj-icon">{icone}</div>
                <div className="obj-name">{nome}</div>

                {status && (
                  <div style={{
                    marginTop: '6px',
                    fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.06em',
                    color: status.cor,
                    background: `${status.cor}18`,
                    border: `1px solid ${status.cor}44`,
                    borderRadius: '4px', padding: '2px 6px',
                    display: 'inline-block',
                  }}>
                    {status.label}
                  </div>
                )}

                {/* Indicador de que tem descricao */}
                {(obj.descricao ?? obj.sub ?? obj.meta) && (
                  <div style={{
                    position: 'absolute', bottom: '6px', right: '8px',
                    fontSize: '9px', color: '#5a7da0', opacity: 0.6,
                  }}>
                    ver mais
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalhe */}
      {modalAberto !== null && lista[modalAberto] && (() => {
        const obj    = lista[modalAberto];
        const icone  = resolverIcone(obj.icone ?? obj.icon);
        const nome   = obj.objetivo ?? obj.nome ?? 'Objetivo';
        const desc   = obj.descricao ?? obj.sub ?? obj.meta ?? 'Sem descricao.';
        const status = resolverStatus(obj.status);

        return (
          <>
            <div
              onClick={() => setModalAberto(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999 }}
            />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000, background: '#112240',
              border: '1px solid #233554', borderRadius: '12px',
              padding: '28px 32px', minWidth: '300px', maxWidth: '440px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}>
              {/* Cabecalho */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{icone}</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#e2eaf5', lineHeight: 1.3 }}>{nome}</span>
                </div>
                <button
                  onClick={() => setModalAberto(null)}
                  style={{ background: 'transparent', border: 'none', color: '#5a7da0', fontSize: '18px', cursor: 'pointer', flexShrink: 0 }}
                >x</button>
              </div>

              {/* Descricao */}
              <p style={{ fontSize: '13px', color: '#a8b2c8', lineHeight: 1.7, margin: '0 0 16px 0' }}>
                {desc}
              </p>

              {/* Status */}
              {status && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.07em',
                  color: status.cor,
                  background: `${status.cor}18`,
                  border: `1px solid ${status.cor}44`,
                  borderRadius: '6px', padding: '4px 10px',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: status.cor, display: 'inline-block' }} />
                  {status.label}
                </div>
              )}
            </div>
          </>
        );
      })()}
    </>
  );
};

export default PainelObjetivos;