import React, { useState } from 'react';
import { Search, Filter, MapPin, Leaf, Sun, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const carbonCredits = [
    {
      id: 1,
      project: 'Amazon Rainforest Conservation',
      type: 'Forest Protection',
      country: 'Brazil',
      location: 'Acre State',
      tonsAvailable: 1200,
      pricePerTon: 25,
      verifier: 'Verra',
      vintage: '2024',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
      description: 'Protecting 50,000 hectares of pristine Amazon rainforest',
      icon: Leaf,
    },
    {
      id: 2,
      project: 'Solar Farm Development',
      type: 'Renewable Energy',
      country: 'India',
      location: 'Rajasthan',
      tonsAvailable: 800,
      pricePerTon: 22,
      verifier: 'Gold Standard',
      vintage: '2024',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
      description: '100MW solar installation providing clean energy',
      icon: Sun,
    },
    {
      id: 3,
      project: 'Wind Power Initiative',
      type: 'Renewable Energy',
      country: 'Denmark',
      location: 'Jutland Peninsula',
      tonsAvailable: 950,
      pricePerTon: 28,
      verifier: 'CDM',
      vintage: '2024',
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
      description: 'Offshore wind farm generating sustainable electricity',
      icon: Wind,
    },
    {
      id: 4,
      project: 'Mangrove Restoration',
      type: 'Forest Protection',
      country: 'Indonesia',
      location: 'Sumatra',
      tonsAvailable: 600,
      pricePerTon: 30,
      verifier: 'Verra',
      vintage: '2024',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      description: 'Restoring coastal mangrove ecosystems for biodiversity',
      icon: Leaf,
    },
    {
      id: 5,
      project: 'Hydroelectric Development',
      type: 'Renewable Energy',
      country: 'Costa Rica',
      location: 'Guanacaste Province',
      tonsAvailable: 750,
      pricePerTon: 26,
      verifier: 'Gold Standard',
      vintage: '2024',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      description: 'Small-scale hydroelectric project in rural communities',
      icon: Sun,
    },
    {
      id: 6,
      project: 'Reforestation Program',
      type: 'Forest Protection',
      country: 'Kenya',
      location: 'Mount Kenya Region',
      tonsAvailable: 900,
      pricePerTon: 24,
      verifier: 'CDM',
      vintage: '2024',
      image: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&h=300&fit=crop',
      description: 'Large-scale tree planting and forest restoration',
      icon: Leaf,
    },
  ];

  const projectTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'Forest Protection', label: 'Forest Protection' },
    { value: 'Renewable Energy', label: 'Renewable Energy' },
  ];

  const countries = [
    { value: 'all', label: 'All Countries' },
    { value: 'Brazil', label: 'Brazil' },
    { value: 'India', label: 'India' },
    { value: 'Denmark', label: 'Denmark' },
    { value: 'Indonesia', label: 'Indonesia' },
    { value: 'Costa Rica', label: 'Costa Rica' },
    { value: 'Kenya', label: 'Kenya' },
  ];

  const filteredCredits = carbonCredits.filter(credit => {
    const matchesSearch = credit.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         credit.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || credit.type === selectedType;
    const matchesCountry = selectedCountry === 'all' || credit.country === selectedCountry;
    
    return matchesSearch && matchesType && matchesCountry;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-section-title mb-4">Carbon Credits Marketplace</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse and purchase verified carbon credits from environmental projects worldwide.
          </p>
        </div>

        {/* Filters */}
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
                {projectTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCredits.length} of {carbonCredits.length} carbon credit projects
          </p>
        </div>

        {/* Credits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredits.map((credit) => {
            const IconComponent = credit.icon;
            return (
              <Card key={credit.id} className="card-marketplace group">
                <div className="aspect-video overflow-hidden relative">
                  <img 
                    src={credit.image} 
                    alt={credit.project}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90">
                      {credit.vintage}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {credit.project}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {credit.description}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline">{credit.type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {credit.location}, {credit.country}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-medium">{credit.tonsAvailable.toLocaleString()} tons</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verifier:</span>
                      <span className="font-medium">{credit.verifier}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          ${credit.pricePerTon}
                        </div>
                        <div className="text-sm text-muted-foreground">per ton CO₂</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Value</div>
                        <div className="font-semibold">
                          ${(credit.pricePerTon * credit.tonsAvailable).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                      <Button size="sm" className="w-full btn-accent">
                        Purchase
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        {filteredCredits.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Projects
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredCredits.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCountry('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;