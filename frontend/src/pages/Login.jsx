import { useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getApiBaseUrl } from '../lib/api';

const Login = () => {
  const authUrl = useMemo(() => {
    const apiBase = getApiBaseUrl();
    const base = apiBase.replace(/\/api\/?$/, '');
    return `${base}/auth/google`;
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md card-elegant">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-semibold">Sign in to C-Square</CardTitle>
          <p className="text-sm text-muted-foreground">
            Continue with Google to access your company dashboard.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 btn-hero"
            size="lg"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Sign in with Google
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to share your Google profile information with C-Square so we
            can create or connect your company account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
