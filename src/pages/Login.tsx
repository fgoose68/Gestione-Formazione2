import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        setAuthError(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md relative">
        {/* Banda Tricolore (Verde, Bianca, Rossa) */}
        <div className="flex w-full h-4 mb-2 rounded-sm overflow-hidden">
          <div className="bg-green-600 w-1/3"></div>
          <div className="bg-white w-1/3"></div>
          <div className="bg-red-600 w-1/3"></div>
        </div>

        <div className="text-center mb-8">
          <img src="/images/login-logo.png" alt="" className="max-w-sm mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-blue-800">Gestione Formazione Sezione Corsi</h1>
        </div>

        {/* Banda Gialla e Verde */}
        <div className="flex w-full h-3 mb-4 rounded-sm overflow-hidden">
          <div className="bg-yellow-400 w-1/2"></div>
          <div className="bg-green-600 w-1/2"></div>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {authError}
          </div>
        )}
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
          localization={{
            variables: {
              sign_in: {
                email_label: 'Indirizzo Email',
                password_label: 'La tua Password',
              },
              sign_up: {
                email_label: 'Indirizzo Email',
                password_label: 'Crea Password',
              },
              forgotten_password: {
                email_label: 'Indirizzo Email',
              },
            },
          }}
        />

        {/* Versione aggiornata */}
        <div className="absolute bottom-2 right-4 text-xs text-gray-500">
          Ver.9Lug25
        </div>
      </div>
    </div>
  );
}

export default Login;