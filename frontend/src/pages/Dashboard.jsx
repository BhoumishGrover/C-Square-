import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Upload, Trash2, FileText, TrendingUp, Leaf, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { apiRequest, fetchSession } from '../lib/api';

const DEFAULT_COMPANY_SLUG = 'ecotech-corp';

const Dashboard = () => {
  const [companySlug, setCompanySlug] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('csquare_company_slug') || DEFAULT_COMPANY_SLUG;
    }
    return DEFAULT_COMPANY_SLUG;
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requiresAuth, setRequiresAuth] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const ensureCompanySlug = async () => {
      if (typeof window === 'undefined') return;
      const storedSlug = localStorage.getItem('csquare_company_slug');
      if (storedSlug) {
        setCompanySlug(storedSlug);
        setRequiresAuth(false);
        return;
      }

      try {
        const session = await fetchSession();
        if (!session?.company || cancelled) {
          setRequiresAuth(true);
          return;
        }
        const { company } = session;
        if (company.slug) {
          localStorage.setItem('csquare_company_slug', company.slug);
          setCompanySlug(company.slug);
        }
        if (company.companyId) {
          localStorage.setItem('csquare_company_id', company.companyId);
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
        setRequiresAuth(false);
      } catch (err) {
        if (!cancelled) {
          setRequiresAuth(true);
        }
      }
    };

    ensureCompanySlug();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!companySlug || requiresAuth) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiRequest(`/dashboard/${companySlug}`);
        setData(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unable to load dashboard data right now.';
        if (
          message.toLowerCase().includes('missing authentication') ||
          message.toLowerCase().includes('not authenticated')
        ) {
          setRequiresAuth(true);
          setData(null);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [companySlug, requiresAuth]);

  const company = data?.company;
  const metrics = company?.metrics;
  const verifierMetrics = company?.verifierMetrics;
  const purchasedCredits = data?.purchasedCredits ?? [];
  const retirementRecords = data?.retirementRecords ?? [];
  const transactions = data?.transactions ?? [];
  const monthlyOffsets = data?.monthlyOffsets ?? [];
  const offsetsByType = data?.offsetsByType ?? [];
  const projects = company?.projects ?? [];
  const userType = company?.type ?? 'buyer';

  const offsetsPieWithColors = useMemo(() => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9'];
    return offsetsByType.map((item, index) => ({
      ...item,
      color: colors[index % colors.length],
    }));
  }, [offsetsByType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (requiresAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full card-elegant text-center space-y-4 p-8">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Sign in required</CardTitle>
            <p className="text-sm text-muted-foreground">
              Log in to access your company dashboard, track offsets, and manage credits.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild size="lg" className="w-full btn-hero">
              <Link to="/login">Go to Login</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Need an account? Use your organization email to create one, or continue with Google.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Dashboard data is unavailable.'}</p>
      </div>
    );
  }

  const formatCurrency = (value) =>
    value !== undefined ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-';

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';

  const BuyerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total CO₂ Offset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics?.totalCo2OffsetTons?.toLocaleString() ?? '—'} tons
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Annual progress tracking
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeCredits ?? '—'}</div>
            <div className="text-sm text-muted-foreground mt-1">Available for retirement</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retired Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.retiredCredits ?? '—'}</div>
            <div className="text-sm text-muted-foreground mt-1">Permanently offset</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.totalInvestedUsd)}</div>
            <div className="text-sm text-muted-foreground mt-1">Across all projects</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Monthly Offset Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyOffsets.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyOffsets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Line
                    type="monotone"
                    dataKey="tons"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No retirement activity recorded yet.</p>
            )}
          </CardContent>
        </Card>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Offsets by Project Type</CardTitle>
        </CardHeader>
        <CardContent>
          {offsetsPieWithColors.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={offsetsPieWithColors}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {offsetsPieWithColors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {offsetsPieWithColors.map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">
                      {item.name} ({item.value.toLocaleString()} tons)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Purchase credits to see your distribution by project type.
            </p>
          )}
        </CardContent>
      </Card>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Your Carbon Credits</CardTitle>
        </CardHeader>
        <CardContent>
          {purchasedCredits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No carbon credits purchased yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2">Project</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Tons</th>
                    <th className="py-2">Price/Ton</th>
                    <th className="py-2">Purchase Date</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Token ID</th>
                    <th className="py-2">Verifier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {purchasedCredits.map((credit) => (
                    <tr key={credit.tokenId} className="align-top">
                      <td className="py-3 font-medium">{credit.projectName}</td>
                      <td className="py-3 text-muted-foreground">{credit.projectType}</td>
                      <td className="py-3">{credit.tons}</td>
                      <td className="py-3">${credit.pricePerTonUsd}</td>
                      <td className="py-3">{formatDate(credit.purchaseDate)}</td>
                      <td className="py-3 capitalize">{credit.status}</td>
                      <td className="py-3">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{credit.tokenId}</code>
                      </td>
                      <td className="py-3">{credit.verifier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const SellerDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {verifierMetrics?.totalProjects ?? projects.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Across your registry</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifierMetrics?.creditsIssued?.toLocaleString() ?? '—'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Verified and available</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifierMetrics?.creditsSold?.toLocaleString() ?? '—'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Issued to buyers</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(verifierMetrics?.revenueUsd)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Across verified projects</div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Project Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active projects yet.</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <Card key={`${project.name}-${index}`} className="card-feature">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge variant="secondary">{project.projectType}</Badge>
                          {project.vintage && (
                            <Badge variant="outline">Vintage {project.vintage}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Location:</span>{' '}
                            {project.location || `${project.region}, ${project.country}`}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Credits Available:</span>{' '}
                            {project.tonsAvailable?.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price/Ton:</span>{' '}
                            ${project.pricePerTonUsd}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-section-title mb-2">
              {company.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl">{company.description}</p>
            {company.companyId && (
              <p className="text-xs text-muted-foreground mt-2">Company ID: {company.companyId}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline" className="capitalize">
                {company.type}
              </Badge>
              {company.badges?.map((badge) => (
                <Badge key={badge} variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="btn-accent flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Add Credits
            </Button>
          </div>
        </header>

        <Tabs defaultValue={userType} className="space-y-6">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="buyer">Buyer View</TabsTrigger>
          <TabsTrigger value="seller">Seller View</TabsTrigger>
        </TabsList>

        <TabsContent value="buyer">
          <BuyerDashboard />
        </TabsContent>
        <TabsContent value="seller">
          <SellerDashboard />
        </TabsContent>
        </Tabs>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent transactions recorded.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {transactions.map((tx, index) => (
                  <Card key={`${tx.transactionHash}-${index}`} className="border-muted">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="capitalize">
                          {tx.transactionType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(tx.occurredAt)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{tx.projectName}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {tx.amountTons} tons
                        </p>
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <div>Token: <code className="bg-muted px-1 rounded">{tx.tokenId}</code></div>
                        <div>From: {tx.from || '—'}</div>
                        <div>To: {tx.to || '—'}</div>
                        <div>Tx Hash: <code className="bg-muted px-1 rounded">{tx.transactionHash}</code></div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" className="flex-1 gap-1">
                          <FileText className="h-4 w-4" />
                          Receipt
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Trash2 className="h-4 w-4" />
                          Retire
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
