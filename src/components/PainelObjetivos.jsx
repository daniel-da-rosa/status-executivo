import React from 'react';

// Objetivos fixos do projeto — podem vir do banco futuramente
const OBJETIVOS = [
  { icon: '📦', nome: 'ACURÁCIA DE ESTOQUE',     sub: '> 90% de precisão'     },
  { icon: '🖩',  nome: 'APURAÇÃO CUSTO REAL',     sub: 'Automação de custos'   },
  { icon: '🏦', nome: 'MODERNIZAÇÃO FINANCEIRA', sub: 'Integração Bancária VAN' },
];

const PainelObjetivos = ({ objetivos }) => {
  const lista = objetivos && objetivos.length > 0 ? objetivos : OBJETIVOS;

  return (
    <div className="panel">
      <div className="panel-title">🎯 OBJETIVOS E METAS DO PROJETO</div>
      <div className="obj-grid">
        {lista.map((obj, i) => (
          <div className="obj-card" key={i}>
            <div className="obj-icon">{obj.icon || '📌'}</div>
            <div className="obj-name">{obj.nome || obj.objetivo}</div>
            <div className="obj-sub">{obj.sub || obj.meta}</div>
            <div className="check">✓</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PainelObjetivos;
