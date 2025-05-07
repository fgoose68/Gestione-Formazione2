import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              data: {
                email,
                created_at: new Date().toISOString()
              }
            }
          });
      
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative">
      {/* Document title can be set directly */}
      <title>{isLogin ? 'Login' : 'Sign Up'} | Your App</title>
      
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gray-900 opacity-50 z-0"></div>
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176984-4d5d0e3b0d0f')] bg-cover bg-center z-0"
        aria-hidden="true"
      ></div>
      
      {/* Rest of your component remains the same */}
      <div className="relative z-10 w-full max-w-md px-8 py-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl mx-4">
        {/* ... existing auth form code ... */}
      </div>
    </div>
  );
}