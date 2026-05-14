import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(`❌ Erro: ${error.message}`);
    setLoading(false);
  };

  const handleCadastro = async () => {
    setLoading(true);
    setMsg('');

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMsg(`❌ Erro ao registar: ${error.message}`);
    } else {
      setMsg('✅ Sucesso! Agora é só clicar em Entrar.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a192f', color: '#fff' }}>
      <div style={{ background: '#112240', padding: '40px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
        <h2 style={{ textAlign: 'center', color: '#64ffda', marginBottom: '20px' }}>Iniflex Status</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #233554', background: '#0a192f', color: '#fff' }}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #233554', background: '#0a192f', color: '#fff' }}
            required
          />
          
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'A carregar...' : 'Entrar'}
          </button>
        </form>

        <button onClick={handleCadastro} disabled={loading} style={{ background: 'transparent', color: '#8892b0', border: 'none', width: '100%', marginTop: '15px', cursor: 'pointer', fontSize: '12px' }}>
          Não tem conta? Registar
        </button>

        {msg && <p style={{ marginTop: '15px', fontSize: '13px', textAlign: 'center', color: msg.includes('❌') ? '#ef4444' : '#10b981' }}>{msg}</p>}
      </div>
    </div>
  );
}