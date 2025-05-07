import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    // Controlla se c'è già una sessione all'avvio
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });
    
    return () => {
      authListener?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl">
        <div>
          <h1 className="text-3xl font-bold text-center text-blue-800">
            <span className="bg-blue-800 text-white px-2 py-1 rounded mr-1 shadow">GESTIO</span>
            <span className="tracking-wider">FORMAZIONE</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accedi per gestire i tuoi eventi formativi
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']} // Esempio, puoi rimuoverli o cambiarli
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Indirizzo Email',
                password_label: 'Password',
                button_label: 'Accedi',
                social_provider_text: 'Accedi con {{provider}}',
                link_text: 'Hai già un account? Accedi',
              },
              sign_up: {
                email_label: 'Indirizzo Email',
                password_label: 'Password',
                button_label: 'Registrati',
                social_provider_text: 'Registrati con {{provider}}',
                link_text: 'Non hai un account? Registrati',
              },
              forgotten_password: {
                email_label: 'Indirizzo Email',
                button_label: 'Invia istruzioni per il recupero',
                link_text: 'Password dimenticata?',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;