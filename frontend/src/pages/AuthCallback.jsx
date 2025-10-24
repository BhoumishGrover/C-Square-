import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Authenticating with Google...');

  useEffect(() => {
    const token = searchParams.get('token');
    const companyId = searchParams.get('companyId');
    const slug = searchParams.get('slug');

    if (!token) {
      setStatus('error');
      setMessage('Authentication failed. No token returned from server.');
      return;
    }

    localStorage.setItem('csquare_token', token);
    if (companyId) {
      localStorage.setItem('csquare_company_id', companyId);
    }
    if (slug) {
      localStorage.setItem('csquare_company_slug', slug);
    }

    setStatus('success');
    setMessage('You are signed in. Redirecting to your dashboard...');

    const timeout = setTimeout(() => {
      navigate('/dashboard');
    }, 1500);

    return () => clearTimeout(timeout);
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md card-elegant text-center space-y-4">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {status === 'processing' && 'Finishing sign in...'}
            {status === 'success' && 'Welcome back'}
            {status === 'error' && 'Sign in failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          {status === 'error' && (
            <Button onClick={() => navigate('/login')} className="w-full btn-hero">
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
