import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Rimosso l'import di Button perché non più necessario in questa pagina

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate('/');
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/');
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md animate-in"> {/* Rimosso 'relative' se non più necessario per posizionare il pulsante */}
        {/* Rimosso il pulsante "Torna alla Dashboard" */}

        <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">Accedi o Registrati</h1>
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