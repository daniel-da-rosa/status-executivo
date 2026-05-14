import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Login from './Login';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a192f', color: '#64ffda' }}>
        Sincronizando...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a192f' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#112240',
            color: '#fff',
            border: '1px solid #233554',
          },
          success: { iconTheme: { primary: '#64ffda', secondary: '#112240' } },
        }}
      />

      {!session ? (
        <Login />
      ) : (
        <Dashboard session={session} />
      )}
    </div>
  );
}