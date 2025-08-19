import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Upload, Trash2, FileText, TrendingUp, Leaf, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const [userType] = useState<'buyer' | 'verifier'>('buyer'); // For demo, switch to 'verifier' to see verifier view

  // Sample data for charts
  const monthlyOffsets = [
    { month: 'Jan', tons: 120 },
    { month: 'Feb', tons: 150 },
    { month: 'Mar', tons: 180 },
    { month: 'Apr', tons: 220 },
    { month: 'May', tons: 190 },
    { month: 'Jun', tons: 280 },
  ];

  const offsetsByType = [
    { name: 'Forest Protection', value: 450, color: '#22c55e' },
    { name: 'Renewable Energy', value: 320, color: '#3b82f6' },
    { name: 'Carbon Capture', value: 180, color: '#f59e0b' },
    { name: 'Other', value: 90, color: '#8b5cf6' },
  ];

  const purchasedCredits = [
    {
      id: 1,
      project: 'Amazon Rainforest Conservation',
      type: 'Forest Protection',
      tons: 50,
      price: 25,
      purchaseDate: '2024-01-15',
      status: 'Active',
      tokenId: 'TKN-001234',
      verifier: 'Verra',
    },
    {
      id: 2,
      project: 'Solar Farm Development',
      type: 'Renewable Energy',
      tons: 75,
      price: 22,
      purchaseDate: '2024-01-20',
      status: 'Retired',
      tokenId: 'TKN-001235',
      verifier: 'Gold Standard',
    },
    {
      id: 3,
      project: 'Wind Power Initiative',
      type: 'Renewable Energy',
      tons: 100,
      price: 28,
      purchaseDate: '2024-02-10',
      status: 'Active',
      tokenId: 'TKN-001236',
      verifier: 'CDM',
    },
  ];

  const verifierProjects = [
    {
      id: 1,
      name: 'Coastal Mangrove Restoration',
      location: 'Philippines',
      type: 'Forest Protection',
      totalCredits: 1500,
      soldCredits: 850,
      status: 'Active',
      addedDate: '2024-01-05',
    },
    {
      id: 2,
      name: 'Community Solar Initiative',
      location: 'Mexico',
      type: 'Renewable Energy',
      totalCredits: 2000,
      soldCredits: 1200,
      status: 'Active',
      addedDate: '2024-01-12',
    },
  ];

  const BuyerDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total CO₂ Offset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,040 tons</div>
            <div className="text-sm text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <div className="text-sm text-muted-foreground mt-1">Available for retirement</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retired Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75</div>
            <div className="text-sm text-muted-foreground mt-1">Permanently offset</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,625</div>
            <div className="text-sm text-muted-foreground mt-1">Across all projects</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Monthly Offset Trends</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Offsets by Project Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={offsetsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {offsetsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {offsetsByType.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credits Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Your Carbon Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Project</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Tons</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchasedCredits.map((credit) => (
                  <tr key={credit.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{credit.project}</div>
                        <div className="text-sm text-muted-foreground">
                          Token: {credit.tokenId}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{credit.type}</Badge>
                    </td>
                    <td className="p-3 font-medium">{credit.tons}</td>
                    <td className="p-3">${credit.price}/ton</td>
                    <td className="p-3">
                      <Badge 
                        variant={credit.status === 'Active' ? 'default' : 'secondary'}
                        className={credit.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {credit.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {credit.status === 'Active' ? (
                          <Button size="sm" variant="outline" className="btn-gold">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Retire
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const VerifierDashboard = () => (
    <div className="space-y-6">
      {/* Verifier Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground mt-1">Active projects</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25,400</div>
            <div className="text-sm text-muted-foreground mt-1">Total tons minted</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credits Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18,950</div>
            <div className="text-sm text-muted-foreground mt-1">74.6% sold rate</div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$487,250</div>
            <div className="text-sm text-muted-foreground mt-1">Total earnings</div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Project */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Project Name" 
              className="px-3 py-2 border border-border rounded-lg"
            />
            <input 
              type="text" 
              placeholder="Location" 
              className="px-3 py-2 border border-border rounded-lg"
            />
            <select className="px-3 py-2 border border-border rounded-lg">
              <option>Select Project Type</option>
              <option>Forest Protection</option>
              <option>Renewable Energy</option>
              <option>Carbon Capture</option>
            </select>
            <input 
              type="number" 
              placeholder="Total Credits" 
              className="px-3 py-2 border border-border rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <Button className="btn-accent">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Mint Tokens
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Project</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Credits</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifierProjects.map((project) => (
                  <tr key={project.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{project.name}</td>
                    <td className="p-3">{project.location}</td>
                    <td className="p-3">
                      <Badge variant="outline">{project.type}</Badge>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">
                          {project.soldCredits.toLocaleString()} / {project.totalCredits.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((project.soldCredits / project.totalCredits) * 100)}% sold
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {project.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-section-title mb-4">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            {userType === 'buyer' 
              ? 'Manage your carbon credits and track your environmental impact.'
              : 'Manage your verified projects and carbon credit tokens.'
            }
          </p>
        </div>

        <Tabs defaultValue={userType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="buyer" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Buyer View
            </TabsTrigger>
            <TabsTrigger value="verifier" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Verifier View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buyer">
            <BuyerDashboard />
          </TabsContent>

          <TabsContent value="verifier">
            <VerifierDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;