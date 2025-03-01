import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../supabaseClient';

const AuthComponent = () => {
  return (
    <div className="auth-container">
      <h1>Coffee Shop Management</h1>
      <div className="auth-widget">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
        />
      </div>
    </div>
  );
};

export default AuthComponent; 