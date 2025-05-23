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
        {/* Tricolore */}
        <div className="flex justify-center mb-4"> {/* Centra il tricolore e aggiunge margine sotto */}
          {/* Rimosso w-8, aggiunto w-1/3 */}
          <div className="w-1/3 h-2 bg-green-600"></div> {/* Verde */}
          <div className="w-1/3 h-2 bg-white"></div> {/* Bianco */}
          <div className="w-1/3 h-2 bg-red-600"></div> {/* Rosso */}
        </div>

        {/* Nuova Bandiera Giallo/Verde */}
        <div className="flex justify-center mt-2 mb-6"> {/* Aggiunto margine superiore e inferiore */}
          <div className="w-1/2 h-2 bg-yellow-400"></div> {/* Giallo */}
          <div className="w-1/2 h-2 bg-green-600"></div> {/* Verde */}
        </div>

        {/* Titolo */}
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