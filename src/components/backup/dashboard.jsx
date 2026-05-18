import React, { useEffect, useState, useMemo, useRef } from 'react';
import './Dashboard.css';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

import PainelConclusao  from './PainelConclusao';
import PainelGantt      from './PainelGantt';
import PainelObjetivos  from './PainelObjetivos';
import Timeline         from './Timeline';
import MatrizRiscos     from './MatrizRiscos';
import TabelaAreas      from './TabelaAreas';

const getIniciais = (email = '') => {
  const partes = email.split('@')[0].split(/[._-]/);
  return partes.slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
};

const itemStyle = {
  display: 'flex', alignItems: 'center', gap: '8px',
  padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
  color: '#e2eaf5', fontSize: '13px', background: 'transparent',
  border: 'none', width: '100%', textAlign: 'left',
};

const btnStyle = {
  background: 'transparent', border: '1px solid #233554',
  color: '#8892b0', borderRadius: '6px', width: '34px', height: '34px',
  cursor: 'pointer', fontSize: '20px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

const Dashboard = ({ session }) => {
  const [listaProjetos,   setListaProjetos]   = useState([]);
  const [projetoAtivo,    setProjetoAtivo]    = useState('');
  const [dados,           setDados]           = useState(null);
  const [carregando,      setCarregando]      = useState(false);
  const [erro,            setErro]            = useState(null);

  // ── dois filtros independentes ──────────────────────────────────
  const [areaSelecionada, setAreaSelecionada] = useState(null);
  const [faseSelecionada, setFaseSelecionada] = useState(null);
  // ───────────────────────────────────────────────────────────────

  const [menuAberto,  setMenuAberto]  = useState(false);
  const [avatarAberto, setAvatarAberto] = useState(false);

  const menuRef   = useRef(null);
  const avatarRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current   && !menuRef.current.contains(e.target))   setMenuAberto(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarAberto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Lista de projetos ────────────────────────────────────────────
  const buscarListaProjetos = async () => {
    const { data, error } = await supabase.from('projetos').select('projeto, cliente');
    if (error) {
      toast.error("Erro ao carregar lista de projetos");
    } else if (data) {
      const projetosUnicos = Array.from(new Map(data.map(p => [p.projeto, p])).values());
      setListaProjetos(projetosUnicos);
      if (projetosUnicos.length > 0 && !projetoAtivo) {
        setProjetoAtivo(projetosUnicos[0].projeto);
      }
    }
  };

  useEffect(() => { buscarListaProjetos(); }, []);

  // ── Dados do projeto ─────────────────────────────────────────────
  const carregarDadosDashboard = async () => {
    setCarregando(true);
    setAreaSelecionada(null);
    setFaseSelecionada(null);
    try {
      const [projRes, fasesRes, riscosRes, pontosRes, areasRes, objRes, progressoRes] = await Promise.all([
        supabase.from('projetos').select('*').eq('projeto', projetoAtivo).single(),
        supabase.from('fases').select('*').eq('projeto_vinculo', projetoAtivo),
        supabase.from('riscos').select('*').eq('projeto_vinculo', projetoAtivo),
        // ✅ FIX: busca pontos_atencao separadamente e mescla com riscos
        supabase.from('pontos_atencao').select('*').eq('projeto_vinculo', projetoAtivo),
        supabase.from('areas').select('*').eq('projeto_vinculo', projetoAtivo),
        supabase.from('objetivos').select('*').eq('projeto_vinculo', projetoAtivo),
        supabase.from('vw_progresso_areas').select('*').eq('projeto_vinculo', projetoAtivo),
      ]);

      if (projRes.error) throw projRes.error;

      const progressoMap = {};
      (progressoRes.data || []).forEach(p => { progressoMap[p.area] = p; });

      const areasMescladas = (areasRes.data || []).map(a => ({
        ...a,
        progresso: progressoMap[a.area]?.progresso ?? 0,
        status:    progressoMap[a.area]?.status    ?? a.status,
      }));

      // ✅ FIX: marca a origem de cada item para o tooltip diferenciar
      const riscosComTipo    = (riscosRes.data  || []).map(r => ({ ...r, _tipo: 'risco' }));
      const pontosComTipo    = (pontosRes.data   || []).map(p => ({ ...p, _tipo: 'ponto_atencao' }));

      setDados({
        ...projRes.data,
        fases:     fasesRes.data  || [],
        // ✅ FIX: riscos agora inclui pontos_atencao
        riscos:    [...riscosComTipo, ...pontosComTipo],
        areas:     areasMescladas,
        objetivos: objRes.data    || [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Não encontramos dados para este projeto.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => { if (projetoAtivo) carregarDadosDashboard(); }, [projetoAtivo]);

  // ── Import ───────────────────────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMenuAberto(false);
    const tId = toast.loading("Processando planilha...");
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('owner_id', session.user.id);
    try {
      const response = await fetch('https://status-executivo-api.vercel.app/api/importar', { method: 'POST', body: formData });
      if (!response.ok) throw new Error("Erro na API");
      const result = await response.json();
      toast.success(result.mensagem || "Importado com sucesso!", { id: tId });
      await buscarListaProjetos();
      setProjetoAtivo(result.projeto);
    } catch {
      toast.error("Erro no servidor Python. Verifique o terminal.", { id: tId });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ── Handlers de filtro ───────────────────────────────────────────
  const toggleArea = (area) => {
    setAreaSelecionada(prev => prev === area ? null : area);
    setFaseSelecionada(null);
  };

  const toggleFase = (fase) => {
    setFaseSelecionada(prev => prev === fase ? null : fase);
    setAreaSelecionada(null);
  };

  // ── Dados filtrados ──────────────────────────────────────────────
  const dadosFiltrados = useMemo(() => {
    if (!dados) return null;

    if (faseSelecionada) {
      return {
        ...dados,
        fases:  dados.fases?.filter(i => i.fase === faseSelecionada),
        riscos: dados.riscos?.filter(i => i.fase === faseSelecionada),
        areas:  dados.areas?.filter(i =>
          dados.fases
            ?.filter(f => f.fase === faseSelecionada)
            .map(f => f.area)
            .includes(i.area)
        ),
      };
    }

    if (areaSelecionada) {
      return {
        ...dados,
        fases:  dados.fases?.filter(i => i.area === areaSelecionada),
        riscos: dados.riscos?.filter(i => i.area === areaSelecionada || i.indicado_por_area === areaSelecionada),
        areas:  dados.areas?.filter(i => i.area === areaSelecionada),
      };
    }

    return dados;
  }, [dados, areaSelecionada, faseSelecionada]);

  // ── Render ───────────────────────────────────────────────────────
  if (erro) return <div style={{ padding: 20, color: 'red' }}>⚠️ {erro}</div>;

  const iniciais    = getIniciais(session?.user?.email);
  const onHover     = e => e.currentTarget.style.background = 'rgba(100,255,218,0.08)';
  const offHover    = e => e.currentTarget.style.background = 'transparent';
  const onHoverRed  = e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
  const offHoverRed = e => e.currentTarget.style.background = 'transparent';

  const filtroAtivo = faseSelecionada
    ? { tipo: 'Fase', valor: faseSelecionada, limpar: () => setFaseSelecionada(null) }
    : areaSelecionada
    ? { tipo: 'Área', valor: areaSelecionada, limpar: () => setAreaSelecionada(null) }
    : null;

  return (
    <div className="db-root">

      {/* ══ HEADER ══════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 20px', background: '#112240',
        borderBottom: '1px solid #233554',
        height: '84px', gap: '16px',
      }}>

        {/* Esquerda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>

          {/* Avatar */}
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setAvatarAberto(p => !p); setMenuAberto(false); }}
              title={session?.user?.email}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #64ffda)',
                border: '2px solid #233554', color: '#fff',
                fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#64ffda'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#233554'}
            >{iniciais}</button>

            {avatarAberto && (
              <div style={{
                position: 'absolute', top: '42px', left: 0, zIndex: 300,
                background: '#112240', border: '1px solid #233554',
                borderRadius: '8px', padding: '14px',
                minWidth: '210px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontSize: '11px', color: '#5a7da0', marginBottom: '2px' }}>Logado como</div>
                <div style={{ fontSize: '13px', color: '#e2eaf5', fontWeight: 'bold', wordBreak: 'break-all', marginBottom: '12px' }}>
                  {session?.user?.email}
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  style={{ width: '100%', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  onMouseEnter={onHoverRed} onMouseLeave={offHoverRed}
                >Sair</button>
              </div>
            )}
          </div>

          {/* Select de projeto */}
          <select
            value={projetoAtivo}
            onChange={e => setProjetoAtivo(e.target.value)}
            style={{
              background: '#0a192f', color: '#fff',
              border: '1px solid #2a5298', borderRadius: '6px',
              padding: '7px 10px', fontSize: '13px', cursor: 'pointer',
              height: '34px', width: '180px',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden',
            }}
          >
            {listaProjetos.map((p, i) => (
              <option key={i} value={p.projeto}>{p.cliente || p.projeto}</option>
            ))}
          </select>

          {/* Menu ⋮ */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => { setMenuAberto(p => !p); setAvatarAberto(false); }}
              style={btnStyle}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#64ffda'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#233554'}
            >⋮</button>

            {menuAberto && (
              <div style={{
                position: 'absolute', top: '40px', left: 0, zIndex: 300,
                background: '#112240', border: '1px solid #233554',
                borderRadius: '8px', padding: '6px',
                minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}>
                <input ref={fileRef} type="file" id="file-up" style={{ display: 'none' }} onChange={handleImport} accept=".xlsx,.xls" />
                <label htmlFor="file-up" style={itemStyle} onMouseEnter={onHover} onMouseLeave={offHover}>
                  📥 Importar planilha
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Centro */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#64ffda', lineHeight: 1.2 }}>
            {dados?.projeto ? `PROJETO: ${dados.projeto}` : 'SELECIONE UM PROJETO'}
          </div>
          <div style={{ fontSize: '13px', color: '#8892b0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span>{dados?.cliente ?? '—'} · {new Date().toLocaleDateString('pt-BR')}</span>

            {filtroAtivo && (
              <span
                onClick={filtroAtivo.limpar}
                title="Clique para limpar o filtro"
                style={{
                  background: 'rgba(100,255,218,0.12)',
                  border: '1px solid rgba(100,255,218,0.35)',
                  borderRadius: 4, padding: '1px 8px',
                  fontSize: 11, color: '#64ffda', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                🔍 {filtroAtivo.tipo}: {filtroAtivo.valor}
                <span style={{ fontSize: 10, opacity: 0.7 }}>✕</span>
              </span>
            )}
          </div>
        </div>

        {/* Direita — usa sempre dados globais */}
        <div style={{
          flexShrink: 0,
          background: 'rgba(100,255,218,0.05)', padding: '8px 16px',
          borderRadius: '6px', border: '1px solid rgba(100,255,218,0.2)',
          fontSize: '12px', lineHeight: 1.7,
        }}>
          <div style={{ color: '#64ffda', fontWeight: 'bold' }}>RESUMO GERAL</div>
          <div style={{ color: '#8892b0' }}>Líder: <span style={{ color: '#e2eaf5' }}>{dados?.lider ?? '—'}</span></div>
          <div style={{ color: '#8892b0' }}>Horas: <span style={{ color: '#e2eaf5' }}>{dados?.horas_utilizada ?? 0} / {dados?.horas_contrato ?? 0}</span></div>
        </div>
      </div>
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* CONTEÚDO */}
      {carregando ? (
        <div style={{ padding: '100px', textAlign: 'center', color: '#64ffda' }}>Sincronizando dados...</div>
      ) : dadosFiltrados ? (
        <div style={{ padding: '20px' }}>
          <div className="grid-main">
            <PainelConclusao
              dadosGlobais={dados.fases}
              horasUtilizadas={dados.horas_utilizada ?? 0}
              horasTotais={dados.horas_contrato ?? 0}
            />
            <PainelGantt
              fases={dados.fases}
              faseSelecionada={faseSelecionada}
              onToggleFase={toggleFase}
            />
          </div>
          <div className="grid-bottom">
            <Timeline
              fases={dadosFiltrados.fases}
              areaSelecionada={areaSelecionada}
              onToggleArea={toggleArea}
            />
            <MatrizRiscos
              riscos={dadosFiltrados.riscos}
              areaSelecionada={areaSelecionada}
              onToggleArea={toggleArea}
            />
            <TabelaAreas
              areas={dadosFiltrados.areas}
              areaSelecionada={areaSelecionada}
              onToggleArea={toggleArea}
            />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#8892b0' }}>
          Nenhum projeto encontrado. Faça a importação de uma planilha.
        </div>
      )}
    </div>
  );
};

export default Dashboard;