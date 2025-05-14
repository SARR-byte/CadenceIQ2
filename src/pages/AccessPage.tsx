import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Network } from 'lucide-react';

export default function AccessPage() {
  const { token } = useParams();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateToken() {
      try {
        const { data, error } = await supabase
          .from('access_tokens')
          .select('*')
          .eq('token', token)
          .single();

        if (error) throw error;
        
        setIsValid(!!data && !data.used);
        
        if (data && !data.used) {
          // Mark token as used
          await supabase
            .from('access_tokens')
            .update({ used: true, last_used: new Date().toISOString() })
            .eq('token', token);
            
          // Store token in localStorage for future access
          localStorage.setItem('access_token', token);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      validateToken();
    } else {
      setIsValid(false);
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-600"></div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/app" replace />;
}