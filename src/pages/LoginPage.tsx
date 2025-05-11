import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('LoginPage: useEffect mounted');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`LoginPage: onAuthStateChange event: ${event}, session:`, session);
      if (event === 'SIGNED_IN') {
        console.log('LoginPage: User SIGNED_IN, navigating to /');
        navigate('/');
      } else if (event === 'INITIAL_SESSION' && session) {
        console.log('LoginPage: INITIAL_SESSION with active session, navigating to /');
        navigate('/');
      }
      // Non è necessario gestire SIGNED_OUT qui per la navigazione,
      // perché se l'utente si disconnette, dovrebbe rimanere/tornare alla pagina di login.
    });

    // Controlla lo stato della sessione all'avvio, nel caso onAuthStateChange non catturi subito INITIAL_SESSION
    // (anche se di solito lo fa)
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('LoginPage (initial direct check): Session found, navigating to /');
        navigate('/');
      } else {
        console.log('LoginPage (initial direct check): No session.');
      }
    };
    checkInitialSession();

    return () => {
      subscription?.unsubscribe();
      console.log('LoginPage: Unsubscribed from auth state changes.');
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
          providers={[]} // Rimosso ['google', 'github'] per semplificare
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Indirizzo Email',
                password_label: 'Password',
                button_label: 'Accedi',
                social_provider_text: 'Accedi con {{provider}}', // Anche se rimosso, lo lascio per completezza
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