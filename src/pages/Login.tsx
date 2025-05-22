import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate('/');
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/AULA-UNIVERSITE-Imagoeconomica_359058-k7RD--1020x533@IlSole24Ore-Web.jpg')"
      }}
    >
      <div className="w-full max-w-md bg-white/90 p-8 rounded-lg shadow-md backdrop-blur-sm">
        {/* Modificato il titolo qui */}
        <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">Gestione Formazione Sezione Corsi</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(210 40% 96.1%)',
                  brandAccent: 'hsl(222.2 47.4% 11.2%)',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'}
        />
      </div>
    </div>
  );
}

export default Login;