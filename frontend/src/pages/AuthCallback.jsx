import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { fetchSession } from '../lib/api';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Authenticating with Google...');

  useEffect(() => {
    const companyId = searchParams.get('companyId');
    const slug = searchParams.get('slug');
    const provider = searchParams.get('provider');
    const role = searchParams.get('role');
    const name = searchParams.get('name');

    if (companyId) {
      localStorage.setItem('csquare_company_id', companyId);
    }
    if (slug) {
      localStorage.setItem('csquare_company_slug', slug);
    }
    if (provider) {
      localStorage.setItem('csquare_auth_provider', provider);
    }
    if (role) {
      localStorage.setItem('csquare_role', role);
    }
    if (name) {
      localStorage.setItem('csquare_company_name', name);
    }

    let timeoutId;

    const verifySession = async () => {
      try {
        const session = await fetchSession();
        if (session?.company) {
          const company = session.company;
          if (company.companyId) {
            localStorage.setItem('csquare_company_id', company.companyId);
          }
          if (company.slug) {
            localStorage.setItem('csquare_company_slug', company.slug);
          }
          if (company.name) {
            localStorage.setItem('csquare_company_name', company.name);
          }
          if (company.authProvider) {
            localStorage.setItem('csquare_auth_provider', company.authProvider);
          }
          if (company.role) {
            localStorage.setItem('csquare_role', company.role);
          }
          setStatus('success');
          setMessage('You are signed in. Redirecting to your dashboard...');
          timeoutId = setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          return;
        }
        throw new Error('Missing session data');
      } catch (err) {
        console.error('Auth callback session check failed', err);
        setStatus('error');
        setMessage('Authentication failed. Please try signing in again.');
      }
    };

    verifySession();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
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
