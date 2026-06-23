import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import logo from './assets/logo.png';

const bgStyle = `
  @keyframes pulse-h {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.18; }
  }
  @keyframes pulse-v {
    0%, 100% { opacity: 0; }
    50% { opacity: 0.12; }
  }
  @keyframes dot-blink {
    0%, 100% { opacity: 0.08; }
    50% { opacity: 0.4; }
  }
  @keyframes travel-h {
    0% { stroke-dashoffset: 500; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes travel-v {
    0% { stroke-dashoffset: 400; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes fadeSlideUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes button-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;

function AnimatedBackground() {
  return (
    <>
      <style>{bgStyle}</style>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal grid lines */}
        {[120, 240, 360, 480, 600, 720, 840].map((y, i) => (
          <line
            key={`h${i}`}
            x1="0" y1={y} x2="1440" y2={y}
            stroke="#64ffda" strokeWidth="0.4"
            style={{ animation: `pulse-h 4s ease-in-out ${i * 0.5}s infinite` }}
          />
        ))}

        {/* Vertical grid lines */}
        {[144, 288, 432, 576, 720, 864, 1008, 1152, 1296].map((x, i) => (
          <line
            key={`v${i}`}
            x1={x} y1="0" x2={x} y2="900"
            stroke="#1e3a5f" strokeWidth="0.5"
            style={{ animation: `pulse-v 5s ease-in-out ${i * 0.4}s infinite` }}
          />
        ))}

        {/* Traveling data lines — horizontal */}
        <line
          x1="0" y1="240" x2="1440" y2="240"
          stroke="#64ffda" strokeWidth="1.5"
          strokeDasharray="80 500"
          style={{ animation: 'travel-h 3.5s linear 0s infinite' }}
          opacity="0.5"
        />
        <line
          x1="0" y1="600" x2="1440" y2="600"
          stroke="#1a56db" strokeWidth="1.5"
          strokeDasharray="50 600"
          style={{ animation: 'travel-h 5s linear 1.2s infinite' }}
          opacity="0.45"
        />
        <line
          x1="0" y1="480" x2="1440" y2="480"
          stroke="#64ffda" strokeWidth="1"
          strokeDasharray="30 700"
          style={{ animation: 'travel-h 6s linear 2.5s infinite' }}
          opacity="0.3"
        />

        {/* Traveling data lines — vertical */}
        <line
          x1="288" y1="0" x2="288" y2="900"
          stroke="#64ffda" strokeWidth="1"
          strokeDasharray="50 400"
          style={{ animation: 'travel-v 4s linear 0.8s infinite' }}
          opacity="0.4"
        />
        <line
          x1="864" y1="0" x2="864" y2="900"
          stroke="#1a56db" strokeWidth="1"
          strokeDasharray="40 450"
          style={{ animation: 'travel-v 5.5s linear 2s infinite' }}
          opacity="0.4"
        />

        {/* Intersection dots */}
        {[
          [144, 240, 0.3], [288, 480, 0.8], [432, 360, 1.4],
          [576, 240, 0.2], [720, 600, 1.8], [864, 120, 0.6],
          [1008, 480, 1.2], [1152, 360, 2.1], [1296, 720, 0.9],
          [144, 600, 1.6], [432, 720, 0.4], [1008, 240, 2.4],
        ].map(([x, y, delay], i) => (
          <circle
            key={`d${i}`}
            cx={x} cy={y} r="2.5"
            fill={i % 2 === 0 ? '#64ffda' : '#1a56db'}
            style={{ animation: `dot-blink 3s ease-in-out ${delay}s infinite` }}
          />
        ))}

        {/* Mini bar chart — bottom left */}
        <g opacity="0.2">
          {[
            [40, 55, 820], [58, 35, 840], [76, 45, 830],
            [94, 20, 855], [112, 30, 845], [130, 12, 863],
            [148, 25, 850],
          ].map(([x, h, y], i) => (
            <rect key={`b${i}`} x={x} y={y} width="13" height={h} rx="2"
              fill={i % 2 === 0 ? '#64ffda' : '#1a56db'} />
          ))}
        </g>

        {/* Mini line chart — top right */}
        <polyline
          points="1150,100 1190,78 1230,92 1270,55 1310,70 1350,38 1390,52 1430,28"
          fill="none" stroke="#64ffda" strokeWidth="2"
          opacity="0.18" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="1430" cy="28" r="4" fill="#64ffda" opacity="0.3" />

        {/* KPI tags */}
        <g opacity="0.18">
          <rect x="50" y="30" width="90" height="26" rx="4" fill="#1e3a5f" />
          <text x="95" y="48" textAnchor="middle" fontSize="11" fill="#64ffda" fontFamily="monospace">Sprint 7 ✓</text>
        </g>
        <g opacity="0.15">
          <rect x="1270" y="820" width="90" height="26" rx="4" fill="#1e3a5f" />
          <text x="1315" y="838" textAnchor="middle" fontSize="11" fill="#64ffda" fontFamily="monospace">+12.4% ↑</text>
        </g>
        <g opacity="0.15">
          <rect x="1270" y="50" width="90" height="26" rx="4" fill="#1e3a5f" />
          <text x="1315" y="68" textAnchor="middle" fontSize="11" fill="#1a56db" fontFamily="monospace">On Track</text>
        </g>
        <g opacity="0.13">
          <rect x="50" y="840" width="100" height="26" rx="4" fill="#1e3a5f" />
          <text x="100" y="858" textAnchor="middle" fontSize="11" fill="#1a56db" fontFamily="monospace">3 riscos ativos</text>
        </g>
      </svg>
    </>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ texto: '', tipo: '' });

  const handleLogin = async () => {
    setLoading(true);
    setMsg({ texto: '', tipo: '' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg({ texto: error.message, tipo: 'erro' });
    setLoading(false);
  };

  const handleCadastro = async () => {
    setLoading(true);
    setMsg({ texto: '', tipo: '' });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMsg({ texto: error.message, tipo: 'erro' });
    } else {
      setMsg({ texto: 'Conta criada! Agora é só entrar.', tipo: 'sucesso' });
    }
    setLoading(false);
  };

  // NOVA FUNÇÃO: Recuperação de Senha
  const handleRecuperarSenha = async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao clicar no link
    
    if (!email) {
      setMsg({ texto: 'Por favor, preencha o seu e-mail acima para recuperar a senha.', tipo: 'erro' });
      return;
    }

    setLoading(true);
    setMsg({ texto: '', tipo: '' });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      setMsg({ texto: error.message, tipo: 'erro' });
    } else {
      setMsg({ texto: 'Instruções de recuperação enviadas para o seu e-mail!', tipo: 'sucesso' });
    }
    
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: '#0a192f', border: '1px solid #1e3a5f',
    borderRadius: '6px', padding: '10px 12px',
    color: '#e2eaf5', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0a192f', overflow: 'hidden',
    }}>
      {/* Animated background */}
      <AnimatedBackground />

      {/* Login card com Animação de Entrada */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', borderRadius: '12px', overflow: 'hidden',
        width: '820px', maxWidth: '95vw', minHeight: '520px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        animation: 'fadeSlideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      }}>

        {/* LEFT — photo */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80&auto=format&fit=crop"
            alt="Escritório"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(10,25,47,0.85) 0%, rgba(10,25,47,0.55) 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '32px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', color: '#64ffda', textTransform: 'uppercase', margin: '0 0 10px' }}>Gestão de projetos</p>
            <h2 style={{ fontSize: '22px', fontWeight: 500, color: '#e2eaf5', lineHeight: 1.35, margin: '0 0 8px' }}>Visibilidade total<br />sobre seus projetos</h2>
            <p style={{ fontSize: '13px', color: '#5a7da0', margin: 0 }}>Acompanhe fases, riscos e progresso em tempo real.</p>
          </div>
        </div>

        {/* RIGHT — form */}
        <div style={{ width: '320px', flexShrink: 0, background: '#112240', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <img marginTop="20px"
              src={logo}
              alt="Iniflex Status"
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
              style={{ maxWidth: '280px', maxHeight: '120px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
            />
            {/* Fallback — shown only if image fails to load */}
            <div style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#64ffda', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64ffda', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Iniflex Status</span>
            </div>
            {/* Tagline */}
            <p style={{ fontSize: '12px', color: '#5a7da0', margin: '8px 0 0', fontWeight: 400 }}>Gestão inteligente de projetos</p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#3d6b9b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>E-mail</label>
            <input
              type="email" value={email} placeholder="seu@email.com"
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#64ffda'}
              onBlur={e => e.target.style.borderColor = '#1e3a5f'}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#3d6b9b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Senha</label>
            <input
              type="password" value={password} placeholder="••••••••"
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#64ffda'}
              onBlur={e => e.target.style.borderColor = '#1e3a5f'}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            
            {/* Link "Esqueci minha senha" ATUALIZADO */}
            <div style={{ textAlign: 'right', marginTop: '6px' }}>
              <a href="#" onClick={handleRecuperarSenha} style={{ fontSize: '11px', color: '#5a7da0', textDecoration: 'none', transition: 'color 0.2s', cursor: loading ? 'not-allowed' : 'pointer' }} 
                 onMouseOver={e => !loading && (e.target.style.color = '#64ffda')} 
                 onMouseOut={e => !loading && (e.target.style.color = '#5a7da0')}>
                Esqueci minha senha
              </a>
            </div>
          </div>

          {/* Botão principal */}
          <button onClick={handleLogin} disabled={loading} style={{
            width: '100%', background: '#1a56db', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '11px', fontSize: '14px', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
            animation: loading ? 'button-pulse 1.2s ease-in-out infinite' : 'none',
            transition: 'background-color 0.2s',
          }}>
            {loading ? 'Aguarde...' : 'Entrar'}
          </button>

          <hr style={{ border: 'none', borderTop: '1px solid #1a2f4e', margin: '20px 0' }} />

          <button onClick={handleCadastro} disabled={loading} style={{
            display: 'block', width: '100%', textAlign: 'center',
            background: 'transparent', border: 'none', color: '#3d6b9b',
            fontSize: '12px', cursor: loading ? 'not-allowed' : 'pointer', padding: '6px 0',
          }}>
            Não tem conta? Registar
          </button>

          {/* Mensagens de Erro / Sucesso */}
          {msg.texto && (
            <div style={{
              fontSize: '12px', textAlign: 'center', marginTop: '14px',
              padding: '8px 12px', borderRadius: '6px',
              background: msg.tipo === 'erro' ? 'rgba(239,68,68,0.1)' : 'rgba(100,255,218,0.07)',
              color: msg.tipo === 'erro' ? '#f87171' : '#64ffda',
              border: `1px solid ${msg.tipo === 'erro' ? 'rgba(239,68,68,0.2)' : 'rgba(100,255,218,0.2)'}`,
            }}>
              {msg.texto}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}