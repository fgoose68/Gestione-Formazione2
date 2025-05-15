import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Utente autenticato, reindirizza alla dashboard
        navigate('/');
      }
    });

    // Controlla la sessione iniziale
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md animate-in">
        <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">Accedi o Registrati</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]} // Nessun provider di terze parti per ora
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(210 40% 96.1%)', // secondary
                  brandAccent: 'hsl(222.2 47.4% 11.2%)', // primary
                  // Puoi personalizzare ulteriormente i colori qui
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/'} // Reindirizza alla dashboard dopo il login
        />
      </div>
    </div>
  );
}

export default Login;