 
import { Code, Book, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Docs = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-section-title mb-6">Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Learn how to integrate with C² CarbonLedger APIs and smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Complete API documentation for carbon credit management.
              </p>
              <Button className="btn-accent">
                <Book className="h-4 w-4 mr-2" />
                View API Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Smart Contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                ERC-1155 contract specifications and deployment guides.
              </p>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub Repository
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Docs;
