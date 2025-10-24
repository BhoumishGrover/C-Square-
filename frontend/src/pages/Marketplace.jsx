import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, MapPin, Leaf, Sun, Wind } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { apiRequest } from '../lib/api';

const iconByType = {
  'Forest Protection': Leaf,
  'Renewable Energy': Sun,
  'Carbon Capture': Wind,
};

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [listings, setListings] = useState([]);
  const [filters, setFilters] = useState({ projectTypes: [], countries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMarketplace = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiRequest('/marketplace');
        setListings(response.listings || []);
        setFilters(response.filters || { projectTypes: [], countries: [] });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load marketplace data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplace();
  }, []);

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    return listings.filter((listing) => {
      const searchTarget = `${listing.projectName} ${listing.location || ''} ${listing.companyName}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || listing.projectType === selectedType;
      const matchesCountry = selectedCountry === 'all' || listing.country === selectedCountry;
      return matchesSearch && matchesType && matchesCountry;
    });
  }, [listings, searchTerm, selectedType, selectedCountry]);

  const projectTypeOptions = ['all', ...filters.projectTypes];
  const countryOptions = ['all', ...filters.countries];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading marketplace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-section-title mb-4">Carbon Credits Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse and purchase verified carbon credits from environmental projects worldwide.
          </p>
        </div>

        <div className="bg-card rounded-xl p-6 mb-8 shadow-[var(--shadow-soft)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredListings.length} of {listings.length} carbon credit projects
          </p>
        </div>

        {filteredListings.length === 0 ? (
          <Card className="card-elegant">
            <CardContent className="p-6 text-center text-muted-foreground">
              No projects match your filters yet. Adjust your criteria or check back soon.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const IconComponent = iconByType[listing.projectType] || Leaf;
              return (
                <Card key={listing.id} className="card-marketplace group">
                  <div className="aspect-video overflow-hidden relative">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.projectName}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      {listing.projectType}
                    </Badge>
                  </div>

                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">{listing.projectName}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{listing.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{listing.location || `${listing.region || ''}, ${listing.country}`}</span>
                      </div>
                      <div>
                        <span className="text-foreground font-medium">
                          ${listing.pricePerTonUsd}
                        </span>{' '}
                        per ton
                      </div>
                      <div>
                        <span className="text-foreground font-medium">
                          {listing.tonsAvailable?.toLocaleString()}
                        </span>{' '}
                        tons available
                      </div>
                      <div>Verifier: {listing.verifierRegistry || '—'}</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Offered by
                        </p>
                        <p className="font-medium text-sm">{listing.companyName}</p>
                        {listing.companyId && (
                          <p className="text-xs text-muted-foreground/80">ID: {listing.companyId}</p>
                        )}
                      </div>
                      <Button size="sm" className="btn-accent">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
