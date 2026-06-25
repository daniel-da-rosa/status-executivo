import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import './AdminPanel.css';

// ─── Configuração com campos reais do banco ───────────────────────────────────
const TABLES = [
  {
    key: 'projetos', label: 'Projetos', icon: 'ti-briefcase', pk: 'id',
    fields: [
      { name: 'cliente',        label: 'Cliente',          type: 'text' },
      { name: 'projeto',        label: 'Projeto',          type: 'text' },
      { name: 'lider',          label: 'Líder',            type: 'text' },
      { name: 'portifolio',     label: 'Portfólio',        type: 'number' },
      { name: 'periodo_inicio', label: 'Período Início',   type: 'date' },
      { name: 'periodo_fim',    label: 'Período Fim',      type: 'date' },
      { name: 'horas_contrato', label: 'Horas Contrato',   type: 'number' },
      { name: 'horas_utilizada',label: 'Horas Utilizadas', type: 'number' },
    ],
  },
  {
    key: 'fases', label: 'Fases', icon: 'ti-list-check', pk: 'id',
    fields: [
      { name: 'atividades', label: 'Atividade',   type: 'text',          wide: true },
      { name: 'fase',       label: 'Fase',        type: 'text' },
      { name: 'area',       label: 'Área',        type: 'select_dynamic', dynamicKey: 'areas' },
      { name: 'escopo',     label: 'Escopo',      type: 'select',        options: ['SIM', 'NÃO'] },
      { name: 'concluido',  label: 'Concluído',   type: 'select',        options: ['Sim', 'Não', 'Iniciado'] },
      { name: 'situacao',   label: 'Situação',    type: 'text' },
      { name: 'recurso',    label: 'Recurso',     type: 'text' },
      { name: 'data',       label: 'Data Início', type: 'date' },
      { name: 'datafim',    label: 'Data Fim',    type: 'date' },
      { name: 'comentario', label: 'Comentário',  type: 'number' },
    ],
  },
  {
    key: 'areas', label: 'Áreas', icon: 'ti-layout-grid', pk: 'id',
    fields: [
      { name: 'area',            label: 'Área',            type: 'text' },
      { name: 'fase',            label: 'Fase',            type: 'text' },
      { name: 'status',          label: 'Status',          type: 'text' },
      { name: 'prazo',           label: 'Prazo',           type: 'text' },
      { name: 'escopo',          label: 'Escopo',          type: 'select', options: ['SIM', 'NÃO'] },
      { name: 'acao_requerida',  label: 'Ação Requerida',  type: 'number' },
    ],
  },
  {
    key: 'riscos', label: 'Riscos', icon: 'ti-alert-triangle', pk: 'id',
    fields: [
      { name: 'indicado_por_area', label: 'Área',          type: 'text' },
      { name: 'fase',              label: 'Fase',          type: 'text' },
      { name: 'detalhes',          label: 'Detalhes',      type: 'textarea', wide: true },
      { name: 'probabilidade',     label: 'Probabilidade', type: 'number' },
      { name: 'impacto',           label: 'Impacto',       type: 'number' },
    ],
  },
  {
    key: 'pontos_atencao', label: 'Pontos de Atenção', icon: 'ti-eye', pk: 'id',
    fields: [
      { name: 'indicado_por_area', label: 'Área',          type: 'text' },
      { name: 'descricao',         label: 'Descrição',     type: 'textarea', wide: true },
      { name: 'situacao',          label: 'Situação',      type: 'text' },
      { name: 'probabilidade',     label: 'Probabilidade', type: 'number' },
      { name: 'impacto',           label: 'Impacto',       type: 'number' },
    ],
  },
  {
    key: 'objetivos', label: 'Objetivos', icon: 'ti-target', pk: 'id',
    fields: [
      { name: 'objetivo',       label: 'Objetivo',       type: 'text',     wide: true },
      { name: 'descricao_curta',label: 'Descrição Curta',type: 'text',     wide: true },
      { name: 'descricao',      label: 'Descrição',      type: 'textarea', wide: true },
      { name: 'status',         label: 'Status',         type: 'text' },
      { name: 'icone',          label: 'Ícone',          type: 'text' },
      { name: 'ordem',          label: 'Ordem',          type: 'number' },
    ],
  },
  {
    key: 'cronograma', label: 'Cronograma', icon: 'ti-calendar', pk: 'id',
    fields: [
      { name: 'etapa',       label: 'Etapa',      type: 'text', wide: true },
      { name: 'data_inicio', label: 'Data Início', type: 'date' },
      { name: 'data_fim',    label: 'Data Fim',    type: 'date' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatarCelula = (valor, type) => {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (type === 'date') {
    const d = new Date(valor);
    if (isNaN(d.getTime())) return valor;
    return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
  }
  return String(valor);
};

// Converte timestamp para valor aceito pelo input type="date" (YYYY-MM-DD)
const toInputDate = (valor) => {
  if (!valor) return '';
  const d = new Date(valor);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

// ─── Componente principal ─────────────────────────────────────────────────────
const AdminPanel = ({ onBack, projetoAtivo }) => {
  const [currentTable, setCurrentTable]   = useState(TABLES[0].key);
  const [tableData,    setTableData]      = useState([]);
  const [loading,      setLoading]        = useState(false);
  const [search,       setSearch]         = useState('');
  const [modalOpen,    setModalOpen]      = useState(false);
  const [modalMode,    setModalMode]      = useState('new'); // 'new' | 'edit'
  const [formData,     setFormData]       = useState({});
  const [saving,       setSaving]         = useState(false);
  const [areasOpcoes,  setAreasOpcoes]    = useState([]); // ← áreas dinâmicas do banco

  const config = TABLES.find(t => t.key === currentTable);

  useEffect(() => {
    if (projetoAtivo) { setSearch(''); fetchData(currentTable); }
  }, [currentTable, projetoAtivo]);

  // ── Busca áreas do banco ao carregar ────────────────────────────────────────
  useEffect(() => {
    if (!projetoAtivo) return;
    supabase
      .from('areas')
      .select('area')
      .eq('projeto_vinculo', projetoAtivo)
      .then(({ data }) => {
        const nomes = (data || []).map(a => a.area).filter(Boolean).sort();
        setAreasOpcoes(nomes);
      });
  }, [projetoAtivo]);

  // ── Busca ────────────────────────────────────────────────────────────────────
  const fetchData = async (tableName) => {
    setLoading(true);
    let query = supabase.from(tableName).select('*');
    query = tableName === 'projetos'
      ? query.eq('projeto', projetoAtivo)
      : query.eq('projeto_vinculo', projetoAtivo);
    const { data, error } = await query.order('id', { ascending: true });
    if (error) toast.error('Erro ao carregar: ' + error.message);
    else setTableData(data || []);
    setLoading(false);
  };

  // ── Salvar ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Monta payload sem id, owner_id e projeto_vinculo (gerados automaticamente)
    const skip = ['id', 'owner_id'];
    const payload = {};
    config.fields.forEach(f => {
      if (skip.includes(f.name)) return;
      const val = formData[f.name];
      payload[f.name] = (val === '' || val === undefined) ? null : val;
    });

    // Garante vínculo ao projeto
    if (currentTable !== 'projetos') payload.projeto_vinculo = projetoAtivo;

    const { error } =
      modalMode === 'new'
        ? await supabase.from(currentTable).insert([payload])
        : await supabase.from(currentTable).update(payload).eq(config.pk, formData.id);

    if (error) {
      toast.error('Erro: ' + error.message);
    } else {
      toast.success(modalMode === 'new' ? 'Registro criado!' : 'Registro atualizado!');
      setModalOpen(false);
      fetchData(currentTable);
    }
    setSaving(false);
  };

  // ── Deletar ──────────────────────────────────────────────────────────────────
  const handleDelete = async (row) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;
    const { error } = await supabase.from(currentTable).delete().eq(config.pk, row.id);
    if (error) toast.error('Erro: ' + error.message);
    else { toast.success('Registro excluído!'); fetchData(currentTable); }
  };

  // ── Abrir modal ──────────────────────────────────────────────────────────────
  const openNew = () => {
    setFormData({});
    setModalMode('new');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    // Normaliza datas para o formato do input date
    const normalized = { ...row };
    config.fields.filter(f => f.type === 'date').forEach(f => {
      normalized[f.name] = toInputDate(row[f.name]);
    });
    setFormData(normalized);
    setModalMode('edit');
    setModalOpen(true);
  };

  // ── Filtro de busca ──────────────────────────────────────────────────────────
  const dadosFiltrados = tableData.filter(row =>
    !search || config.fields.some(f =>
      String(row[f.name] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  // ── Colunas visíveis na tabela (máx 5 para não poluir) ───────────────────────
  const colsVisiveis = config.fields.slice(0, 5);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="admin-layout">

      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">Admin Panel</div>
          <div className="admin-sidebar-sub">Gerenciador de dados</div>
        </div>
        {TABLES.map(t => (
          <button
            key={t.key}
            className={`admin-nav-item ${currentTable === t.key ? 'active' : ''}`}
            onClick={() => setCurrentTable(t.key)}
          >
            <i className={`ti ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="admin-main">

        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-btn admin-btn-sm" onClick={onBack}>⬅ Voltar</button>
            <span className="admin-topbar-title">{config.label}</span>
            {!loading && (
              <span className="admin-badge">{dadosFiltrados.length} registros</span>
            )}
          </div>
          <button className="admin-btn admin-btn-primary" onClick={openNew}>
            <i className="ti ti-plus" /> Novo registro
          </button>
        </div>

        <div className="admin-content">

          {/* Toolbar de busca */}
          <div className="admin-toolbar">
            <div className="admin-search-wrap">
              <input
                type="text"
                placeholder={`Buscar em ${config.label}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="admin-table-wrap">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#5a7da0', fontSize: '13px' }}>
                Carregando...
              </div>
            ) : dadosFiltrados.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#5a7da0', fontSize: '13px' }}>
                {search ? `Nenhum resultado para "${search}"` : 'Nenhum registro encontrado.'}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    {colsVisiveis.map(f => <th key={f.name}>{f.label}</th>)}
                    <th className="th-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((row, idx) => (
                    <tr key={idx}>
                      {colsVisiveis.map(f => (
                        <td key={f.name} title={String(row[f.name] ?? '')}>
                          {formatarCelula(row[f.name], f.type)}
                        </td>
                      ))}
                      <td className="td-actions">
                        <div className="admin-actions-cell">
                          <button
                            className="admin-btn admin-btn-sm"
                            onClick={() => openEdit(row)}
                          >
                            <i className="ti ti-edit" /> Editar
                          </button>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            onClick={() => handleDelete(row)}
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal de criação/edição */}
      {modalOpen && (
        <div className="admin-modal-bg" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="admin-modal">

            <div className="admin-modal-header">
              <span className="admin-modal-title">
                {modalMode === 'new' ? `Novo registro — ${config.label}` : `Editar — ${config.label}`}
              </span>
              <button className="admin-btn-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="admin-modal-body">
              <form id="admin-modal-form" onSubmit={handleSave}>
                {config.fields.map(f => (
                  <div key={f.name} className={`admin-field${f.wide ? ' full-width' : ''}`}>
                    <label>{f.label}</label>

                    {f.type === 'select_dynamic' ? (
                      <select
                        value={formData[f.name] ?? ''}
                        onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      >
                        <option value="">— selecione —</option>
                        {areasOpcoes.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>

                    ) : f.type === 'select' ? (
                      <select
                        value={formData[f.name] ?? ''}
                        onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      >
                        <option value="">— selecione —</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>

                    ) : f.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formData[f.name] ?? ''}
                        onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      />

                    ) : (
                      <input
                        type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                        value={formData[f.name] ?? ''}
                        onChange={e => setFormData(p => ({ ...p, [f.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="admin-modal-form"
                className="admin-btn admin-btn-primary"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;