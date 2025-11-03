import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { apiRequest, fetchSession, fetchSellerCompanies, fetchCompanyProjects } from '../lib/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const [companyName, setCompanyName] = useState('');
  const [companyInfo, setCompanyInfo] = useState(null);
  const [sellerOptions, setSellerOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);

  const makeInitialProjectForm = (companyId = '') => ({
    companyId,
    projectId: '',
    name: '',
    description: '',
    projectType: 'Forest Protection',
    country: '',
    region: '',
    location: '',
    totalCredits: '',
    soldCredits: '',
    tonsAvailable: '',
    pricePerTonUsd: '',
    vintage: '',
    status: 'active',
    verifierRegistry: '',
    listingImageUrl: '',
  });

  const [projectForm, setProjectForm] = useState(makeInitialProjectForm());

  const resetStatus = () => setStatus({ type: 'idle', message: '' });

  const fetchCompanyProfile = useCallback(
    async (identifier) => {
      try {
        const response = await apiRequest(`/companies/${identifier}`);
        if (response.company?.type !== 'seller') {
          setStatus({ type: 'error', message: 'Selected company is not a seller. Only seller companies can host projects.' });
          setCompanyInfo(null);
          setProjectOptions([]);
          return null;
        }
        setCompanyInfo(response.company);
        if (response.company?.name) {
          setCompanyName(response.company.name);
        }
        if (response.company?.companyId) {
          setProjectForm((prev) => ({ ...prev, companyId: response.company.companyId }));
          const projectResponse = await fetchCompanyProjects(response.company.companyId);
          setProjectOptions(Array.isArray(projectResponse.projects) ? projectResponse.projects : []);
        }
        return response.company;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load company information';
        setStatus({ type: 'error', message });
        setCompanyInfo(null);
        setProjectOptions([]);
        return null;
      }
    },
    [setCompanyInfo],
  );

  useEffect(() => {
    const ensureAdmin = async () => {
      try {
        const session = await fetchSession();
        if (session?.company?.role !== 'admin') {
          setAuthorized(false);
          setLoading(false);
          return;
        }
        if (session.company.name) {
          setCompanyName(session.company.name);
        }
        const sellers = await fetchSellerCompanies();
        setSellerOptions(Array.isArray(sellers.companies) ? sellers.companies : []);
        setAuthorized(true);
      } catch (err) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    ensureAdmin();
  }, []);

  useEffect(() => {
    if (sellerOptions.length && !projectForm.companyId) {
      handleCompanySelect(sellerOptions[0].companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerOptions]);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    resetStatus();
    try {
      await apiRequest('/company/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: companyName }),
      });
      setStatus({ type: 'success', message: 'Company name updated.' });
      if (projectForm.companyId || companyInfo?.companyId) {
        fetchCompanyProfile(projectForm.companyId || companyInfo?.companyId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update company name';
      setStatus({ type: 'error', message });
    }
  };

  const handleCompanySelect = async (companyId) => {
    resetStatus();
    setProjectForm(makeInitialProjectForm(companyId));
    if (!companyId) {
      setCompanyInfo(null);
      setProjectOptions([]);
      return;
    }
    await fetchCompanyProfile(companyId);
  };

  const getProjectKey = (project) =>
    project?.projectId || (typeof project?._id === 'string' ? project._id : project?._id?.toString?.() || '');

  const handleProjectSelect = (projectId) => {
    resetStatus();
    if (!projectId) {
      setProjectForm((prev) => makeInitialProjectForm(prev.companyId));
      return;
    }
    const project = projectOptions.find((item) => getProjectKey(item) === projectId);
    if (project) {
      setProjectForm((prev) => ({
        ...makeInitialProjectForm(prev.companyId),
        projectId,
        name: project.name || '',
        description: project.description || '',
        projectType: project.projectType || 'Forest Protection',
        country: project.country || '',
        region: project.region || '',
        location: project.location || '',
        totalCredits:
          project.totalCredits === undefined || project.totalCredits === null
            ? ''
            : String(project.totalCredits),
        soldCredits:
          project.soldCredits === undefined || project.soldCredits === null
            ? ''
            : String(project.soldCredits),
        tonsAvailable:
          project.tonsAvailable === undefined || project.tonsAvailable === null
            ? ''
            : String(project.tonsAvailable),
        pricePerTonUsd:
          project.pricePerTonUsd === undefined || project.pricePerTonUsd === null
            ? ''
            : String(project.pricePerTonUsd),
        vintage: project.vintage || '',
        status: project.status || 'active',
        verifierRegistry: project.verifierRegistry || '',
        listingImageUrl: project.listingImageUrl || '',
      }));
      setStatus({ type: 'info', message: 'Project loaded. Edit fields and save to update.' });
    }
  };

  const projectTypes = useMemo(
    () => ['Forest Protection', 'Renewable Energy', 'Carbon Capture', 'Other'],
    [],
  );

  const projectStatuses = useMemo(
    () => ['active', 'inactive', 'retired', 'draft'],
    [],
  );

  const setProjectValue = (key, value) => {
    setProjectForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitProject = async (event) => {
    event.preventDefault();
    resetStatus();

    const targetCompanyId = projectForm.companyId || companyInfo?.companyId;
    if (!targetCompanyId) {
      setStatus({ type: 'error', message: 'Select or load a company before managing projects.' });
      return;
    }

    const payload = {
      name: projectForm.name,
      description: projectForm.description,
      projectType: projectForm.projectType,
      country: projectForm.country,
      region: projectForm.region,
      location: projectForm.location,
      totalCredits: Number(projectForm.totalCredits) || 0,
      soldCredits: Number(projectForm.soldCredits) || 0,
      tonsAvailable: Number(projectForm.tonsAvailable) || 0,
      pricePerTonUsd: Number(projectForm.pricePerTonUsd) || 0,
      vintage: projectForm.vintage,
      status: projectForm.status,
      verifierRegistry: projectForm.verifierRegistry,
      listingImageUrl: projectForm.listingImageUrl,
    };

    try {
      if (projectForm.projectId) {
        await apiRequest(`/admin/companies/${targetCompanyId}/projects/${projectForm.projectId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setStatus({ type: 'success', message: 'Project updated.' });
      } else {
        await apiRequest(`/admin/companies/${targetCompanyId}/projects`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setStatus({ type: 'success', message: 'Project added.' });
      }
      setProjectForm((prev) => makeInitialProjectForm(prev.companyId));
      if (projectForm.companyId || companyInfo?.companyId) {
        fetchCompanyProfile(projectForm.companyId || companyInfo?.companyId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save project';
      setStatus({ type: 'error', message });
    }
  };

  const handleProjectDelete = async () => {
    resetStatus();
    const targetCompanyId = projectForm.companyId || companyInfo?.companyId;
    if (!targetCompanyId || !projectForm.projectId) {
      setStatus({ type: 'error', message: 'Provide a company ID and project ID to delete.' });
      return;
    }

    try {
      await apiRequest(`/admin/companies/${targetCompanyId}/projects/${projectForm.projectId}`, {
        method: 'DELETE',
      });
      setStatus({ type: 'success', message: 'Project deleted.' });
      setProjectForm((prev) => makeInitialProjectForm(prev.companyId));
      if (projectForm.companyId || companyInfo?.companyId) {
        fetchCompanyProfile(projectForm.companyId || companyInfo?.companyId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete project';
      setStatus({ type: 'error', message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin console...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 px-4">
        <Card className="max-w-md w-full card-elegant text-center p-8 space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Admin access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You need an administrator account to manage marketplace projects and company settings.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="btn-hero">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const safeProjectOptions = Array.isArray(projectOptions) ? projectOptions : [];
  const safeCompanyProjects = Array.isArray(companyInfo?.projects) ? companyInfo.projects : [];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-section-title">Admin Console</h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage company profiles and marketplace projects. All changes are applied immediately to the live data.
          </p>
          {status.message && (
            <div
              className={`text-sm ${
                status.type === 'error' ? 'text-red-500' : status.type === 'success' ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              {status.message}
            </div>
          )}
        </header>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="company">Company Profile</TabsTrigger>
            <TabsTrigger value="projects">Marketplace Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select company</label>
                    <select
                      className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={projectForm.companyId}
                      onChange={(event) => handleCompanySelect(event.target.value)}
                    >
                      <option value="">Choose a seller company</option>
                      {sellerOptions.map((company) => (
                        <option key={company.companyId} value={company.companyId}>
                          {company.name} ({company.companyId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {companyInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Company ID</span>
                        <p className="font-mono text-sm">{companyInfo.companyId}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Slug</span>
                        <p className="font-mono text-sm">{companyInfo.slug}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Type</span>
                        <p className="capitalize">{companyInfo.type}</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">Company name</label>
                        <Input
                          value={companyName}
                          onChange={(event) => setCompanyName(event.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="btn-hero">
                        Save name
                      </Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Manage Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Only seller companies can host projects. Provide a company ID and project details to add or update entries.
                </p>
                <form onSubmit={submitProject} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Company</label>
                      <select
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={projectForm.companyId}
                        onChange={(event) => handleCompanySelect(event.target.value)}
                      >
                        <option value="">Select a seller company</option>
                        {sellerOptions.map((company) => (
                          <option key={company.companyId} value={company.companyId}>
                            {company.name} ({company.companyId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Existing Project</label>
                      <select
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={projectForm.projectId}
                        onChange={(event) => handleProjectSelect(event.target.value)}
                        disabled={!safeProjectOptions.length}
                      >
                        <option value="">Create new project</option>
                        {safeProjectOptions.map((project) => {
                          const id = getProjectKey(project);
                          return (
                            <option key={id} value={id}>
                              {project.name} ({project.projectId || project._id})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Project name</label>
                      <Input
                        required={!projectForm.projectId}
                        value={projectForm.name}
                        onChange={(event) => setProjectValue('name', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Project type</label>
                      <select
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={projectForm.projectType}
                        onChange={(event) => setProjectValue('projectType', event.target.value)}
                      >
                        {projectTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      rows={4}
                      value={projectForm.description}
                      onChange={(event) => setProjectValue('description', event.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Country</label>
                      <Input
                        value={projectForm.country}
                        onChange={(event) => setProjectValue('country', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Region</label>
                      <Input
                        value={projectForm.region}
                        onChange={(event) => setProjectValue('region', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Input
                        value={projectForm.location}
                        onChange={(event) => setProjectValue('location', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Total credits</label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={projectForm.totalCredits}
                        onChange={(event) => setProjectValue('totalCredits', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sold credits</label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={projectForm.soldCredits}
                        onChange={(event) => setProjectValue('soldCredits', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tons available</label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={projectForm.tonsAvailable}
                        onChange={(event) => setProjectValue('tonsAvailable', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Price per ton (USD)</label>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={projectForm.pricePerTonUsd}
                        onChange={(event) => setProjectValue('pricePerTonUsd', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vintage</label>
                      <Input
                        value={projectForm.vintage}
                        onChange={(event) => setProjectValue('vintage', event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <select
                        className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={projectForm.status}
                        onChange={(event) => setProjectValue('status', event.target.value)}
                      >
                        {projectStatuses.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {statusOption}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Verifier registry</label>
                      <Input
                        value={projectForm.verifierRegistry}
                        onChange={(event) => setProjectValue('verifierRegistry', event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Listing image URL</label>
                    <Input
                      value={projectForm.listingImageUrl}
                      onChange={(event) => setProjectValue('listingImageUrl', event.target.value)}
                    />
                  </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <Button type="submit" className="btn-hero flex-1">
                    {projectForm.projectId ? 'Update Project' : 'Add Project'}
                  </Button>
                  {projectForm.projectId && (
                    <Button type="button" variant="destructive" className="flex-1" onClick={handleProjectDelete}>
                      Delete Project
                    </Button>
                  )}
                </div>
              </form>

              {safeCompanyProjects.length ? (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold">Existing Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {safeCompanyProjects.map((project) => {
                      const id = project.projectId || project._id?.toString?.() || project._id;
                      return (
                        <Card key={id} className="border-muted">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{project.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  ID: {project.projectId || project._id}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setProjectForm({
                                    companyId: project.sellerCompanyId || companyInfo.companyId || '',
                                    projectId: getProjectKey(project),
                                    name: project.name || '',
                                    description: project.description || '',
                                    projectType: project.projectType || 'Forest Protection',
                                  country: project.country || '',
                                  region: project.region || '',
                                  location: project.location || '',
                                  totalCredits:
                                    project.totalCredits === undefined || project.totalCredits === null
                                      ? ''
                                      : `${project.totalCredits}`,
                                  soldCredits:
                                    project.soldCredits === undefined || project.soldCredits === null
                                      ? ''
                                      : `${project.soldCredits}`,
                                  tonsAvailable:
                                    project.tonsAvailable === undefined || project.tonsAvailable === null
                                      ? ''
                                      : `${project.tonsAvailable}`,
                                  pricePerTonUsd:
                                    project.pricePerTonUsd === undefined || project.pricePerTonUsd === null
                                      ? ''
                                      : `${project.pricePerTonUsd}`,
                                  vintage: project.vintage || '',
                                  status: project.status || 'active',
                                  verifierRegistry: project.verifierRegistry || '',
                                  listingImageUrl: project.listingImageUrl || '',
                                });
                                setStatus({ type: 'info', message: 'Editing project. Update fields and save.' });
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                          <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div>
                              <dt>Type</dt>
                              <dd>{project.projectType}</dd>
                            </div>
                            <div>
                              <dt>Available</dt>
                              <dd>{project.tonsAvailable}</dd>
                            </div>
                            <div>
                              <dt>Price/Ton</dt>
                              <dd>${project.pricePerTonUsd}</dd>
                            </div>
                            <div>
                              <dt>Status</dt>
                              <dd className="capitalize">{project.status}</dd>
                            </div>
                          </dl>
                        </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
