import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { getApiBaseUrl, loginWithEmail, registerWithEmail } from '../lib/api';
import { Eye, EyeOff } from 'lucide-react';

const initialRegisterState = {
  name: '',
  email: '',
  password: '',
  type: 'buyer',
};

const initialLoginState = {
  email: '',
  password: '',
};

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [registerData, setRegisterData] = useState(initialRegisterState);
  const [loginData, setLoginData] = useState(initialLoginState);
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const authUrl = useMemo(() => {
    const apiBase = getApiBaseUrl();
    const base = apiBase.replace(/\/api\/?$/, '');
    return `${base}/auth/google`;
  }, []);

  useEffect(() => {
    setStatus({ state: 'idle', message: '' });
  }, [mode]);

  const setAuthState = (company) => {
    if (company?.companyId) {
      localStorage.setItem('csquare_company_id', company.companyId);
    }
    if (company?.slug) {
      localStorage.setItem('csquare_company_slug', company.slug);
    }
    if (company?.name) {
      localStorage.setItem('csquare_company_name', company.name);
    }
    if (company?.authProvider) {
      localStorage.setItem('csquare_auth_provider', company.authProvider);
    }
    if (company?.role) {
      localStorage.setItem('csquare_role', company.role);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status.state === 'loading') return;

    setStatus({ state: 'loading', message: '' });

    try {
      const payload = mode === 'login' ? loginData : registerData;
      const request = mode === 'login' ? loginWithEmail : registerWithEmail;
      const response = await request(payload);

      setAuthState(response.company);
      setStatus({
        state: 'success',
        message:
          mode === 'login'
            ? 'Welcome back! Redirecting to your dashboard...'
            : 'Account created! Redirecting to your dashboard...',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setStatus({ state: 'error', message });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl card-elegant overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-muted/40 p-8 hidden lg:flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Secure access to C-Square</h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your organization email or continue with Google. All passwords are
                encrypted using industry-standard bcrypt hashing.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  1
                </span>
                <p className="text-sm text-muted-foreground">Create or access your company profile.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  2
                </span>
                <p className="text-sm text-muted-foreground">Manage purchases, retirements, and metrics.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  3
                </span>
                <p className="text-sm text-muted-foreground">Collaborate with sellers and buyers securely.</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-3xl font-semibold text-center mb-2">
                Access your account
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Use your work email or continue with Google to keep your data in sync.
              </p>
            </CardHeader>

            <CardContent className="px-0">
              <div className="my-6">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 border-2"
                  size="lg"
                  disabled={status.state === 'loading'}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  Continue with Google
                </Button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 h-px bg-border" />
                <span className="relative block w-max mx-auto px-3 bg-background text-xs uppercase tracking-widest text-muted-foreground">
                  or use email
                </span>
              </div>

              <Tabs value={mode} onValueChange={setMode} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Work email</label>
                      <Input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(event) =>
                          setLoginData((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="you@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Password</label>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={loginData.password}
                          onChange={(event) =>
                            setLoginData((prev) => ({ ...prev, password: event.target.value }))
                          }
                          placeholder="Enter your password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {status.state === 'error' && (
                      <p className="text-sm text-red-500 text-center">{status.message}</p>
                    )}
                    {status.state === 'success' && mode === 'login' && (
                      <p className="text-sm text-green-600 text-center">{status.message}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full btn-hero"
                      size="lg"
                      disabled={status.state === 'loading'}
                    >
                      {status.state === 'loading' && mode === 'login' ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company name</label>
                      <Input
                        required
                        value={registerData.name}
                        onChange={(event) =>
                          setRegisterData((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="C-Square Innovations"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Work email</label>
                      <Input
                        type="email"
                        required
                        value={registerData.email}
                        onChange={(event) =>
                          setRegisterData((prev) => ({ ...prev, email: event.target.value }))
                        }
                        placeholder="founder@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Password</label>
                      <div className="relative">
                        <Input
                          type={showRegisterPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={registerData.password}
                          onChange={(event) =>
                            setRegisterData((prev) => ({ ...prev, password: event.target.value }))
                          }
                          placeholder="At least 8 characters"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                          aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                        >
                          {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Company role</label>
                      <Select
                        value={registerData.type}
                        onValueChange={(value) =>
                          setRegisterData((prev) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">Buyer</SelectItem>
                          <SelectItem value="seller">Seller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {status.state === 'error' && (
                      <p className="text-sm text-red-500 text-center">{status.message}</p>
                    )}
                    {status.state === 'success' && mode === 'register' && (
                      <p className="text-sm text-green-600 text-center">{status.message}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full btn-hero"
                      size="lg"
                      disabled={status.state === 'loading'}
                    >
                      {status.state === 'loading' && mode === 'register'
                        ? 'Creating account...'
                        : 'Create account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="px-0 pt-4">
              <p className="text-xs text-muted-foreground text-center w-full">
                Passwords are stored using salted bcrypt hashing. Need help? Contact us at{' '}
                <span className="font-medium text-primary">info@csquare.co.in</span>.
              </p>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
