import { useState } from 'react';
import { Search, QrCode, Download, Eye, CheckCircle, Clock, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Explorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const retiredCredits = [
    {
      id: 1,
      tokenId: 'TKN-001234',
      project: 'Amazon Rainforest Conservation',
      tons: 50,
      buyer: '0x1234...5678',
      retiredDate: '2024-01-25',
      retiredBy: 'EcoTech Corp',
      transactionHash: '0xabcd...ef12',
      certificate: 'CERT-2024-001234',
      verifier: 'Verra',
      ipfsHash: 'QmX5Y...Z789',
    },
    {
      id: 2,
      tokenId: 'TKN-001235',
      project: 'Solar Farm Development',
      tons: 75,
      buyer: '0x5678...9012',
      retiredDate: '2024-01-28',
      retiredBy: 'GreenEnergy Solutions',
      transactionHash: '0xef12...34cd',
      certificate: 'CERT-2024-001235',
      verifier: 'Gold Standard',
      ipfsHash: 'QmA1B...C456',
    },
    {
      id: 3,
      tokenId: 'TKN-001236',
      project: 'Wind Power Initiative',
      tons: 100,
      buyer: '0x9012...3456',
      retiredDate: '2024-02-02',
      retiredBy: 'Sustainable Industries',
      transactionHash: '0x3456...78ab',
      certificate: 'CERT-2024-001236',
      verifier: 'CDM',
      ipfsHash: 'QmD7E...F890',
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'mint',
      tokenId: 'TKN-001240',
      project: 'Mangrove Restoration',
      amount: 500,
      from: 'Verifier',
      to: 'Marketplace',
      timestamp: '2024-02-15 14:30:22',
      hash: '0xabc123...def456',
    },
    {
      id: 2,
      type: 'transfer',
      tokenId: 'TKN-001239',
      project: 'Reforestation Program',
      amount: 25,
      from: '0x1234...5678',
      to: '0x9876...5432',
      timestamp: '2024-02-15 12:15:10',
      hash: '0x789abc...123def',
    },
    {
      id: 3,
      type: 'retire',
      tokenId: 'TKN-001238',
      project: 'Hydroelectric Development',
      amount: 60,
      from: '0x5432...9876',
      to: 'Retired',
      timestamp: '2024-02-15 09:45:33',
      hash: '0x456def...789abc',
    },
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'mint':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'transfer':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'retire':
        return <Flame className="h-4 w-4 text-orange-500" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'mint':
        return 'bg-green-100 text-green-800';
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      case 'retire':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCredits = retiredCredits.filter(credit =>
    credit.tokenId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    credit.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    credit.retiredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    credit.transactionHash.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-section-title mb-4">Retirement Explorer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Search and verify retired carbon credits on the public ledger. 
            Every retirement is transparent and permanently recorded.
          </p>
        </div>

        {/* Search Section */}
        <Card className="card-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Retired Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Token ID, Transaction Hash, Project Name, or Company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Scan QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="retired" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="retired">Retired Credits</TabsTrigger>
            <TabsTrigger value="transactions">Live Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="retired">
            {/* Results */}
            <div className="space-y-4">
              {filteredCredits.length > 0 ? (
                <>
                  <div className="text-sm text-muted-foreground mb-4">
                    Found {filteredCredits.length} retired credit{filteredCredits.length !== 1 ? 's' : ''}
                  </div>
                  
                  {filteredCredits.map((credit) => (
                    <Card key={credit.id} className="card-elegant">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Main Info */}
                          <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">{credit.project}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Token: <code className="bg-muted px-2 py-1 rounded text-xs">{credit.tokenId}</code></span>
                                  <Badge variant="secondary">{credit.verifier}</Badge>
                                </div>
                              </div>
                              <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                                <Flame className="h-3 w-3" />
                                Retired
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Tons Retired:</span>
                                <span className="ml-2 font-semibold">{credit.tons} CO₂</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Retired By:</span>
                                <span className="ml-2 font-semibold">{credit.retiredBy}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Retirement Date:</span>
                                <span className="ml-2">{new Date(credit.retiredDate).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Certificate ID:</span>
                                <span className="ml-2 font-mono text-xs">{credit.certificate}</span>
                              </div>
                            </div>

                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">Transaction Hash:</div>
                              <code className="text-xs break-all">{credit.transactionHash}</code>
                            </div>

                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                              <div className="text-xs text-muted-foreground mb-1">IPFS Metadata:</div>
                              <code className="text-xs break-all">{credit.ipfsHash}</code>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-3">
                            <Button className="w-full btn-accent" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download Certificate
                            </Button>
                            <Button variant="outline" className="w-full" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View on Explorer
                            </Button>
                            <Button variant="outline" className="w-full" size="sm">
                              <QrCode className="h-4 w-4 mr-2" />
                              Generate QR Code
                            </Button>
                            
                            <div className="mt-4 p-3 border rounded-lg">
                              <div className="text-xs font-semibold mb-2">Verification Details</div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div>✓ Project verified by {credit.verifier}</div>
                                <div>✓ Token minted on blockchain</div>
                                <div>✓ Retirement permanently recorded</div>
                                <div>✓ Certificate generated</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="card-elegant">
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 
                        `No retired credits found matching "${searchQuery}"` :
                        'Enter a Token ID, Transaction Hash, or Project Name to search'
                      }
                    </p>
                    {searchQuery && (
                      <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Recent Blockchain Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <Badge className={getTransactionColor(tx.type)}>
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </Badge>
                        </div>
                        
                        <div>
                          <div className="font-medium">{tx.project}</div>
                          <div className="text-sm text-muted-foreground">
                            Token: {tx.tokenId} • {tx.amount} tons
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.from} → {tx.to}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-mono text-muted-foreground">
                          {tx.timestamp}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <Button variant="outline">Load More Transactions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explorer;
