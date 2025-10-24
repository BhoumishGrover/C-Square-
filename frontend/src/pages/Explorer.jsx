import { useEffect, useMemo, useState } from 'react';
import { Search, QrCode, Download, Eye, CheckCircle, Clock, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiRequest } from '../lib/api';

const Explorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [retiredCredits, setRetiredCredits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExplorerData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiRequest('/explorer');
        setRetiredCredits(response.retiredCredits || []);
        setTransactions(response.transactions || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load explorer data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorerData();
  }, []);

  const filteredCredits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return retiredCredits;
    }
    return retiredCredits.filter((credit) => {
      const haystack = [
        credit.tokenId,
        credit.projectName,
        credit.retiredBy,
        credit.transactionHash,
        credit.verifier,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [retiredCredits, searchQuery]);

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

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium' }) : '—';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading explorer...</p>
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
          <h1 className="text-section-title mb-4">Retirement Explorer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Search and verify retired carbon credits on the public ledger. Every retirement is
            transparent and permanently recorded.
          </p>
        </div>

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
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Found {filteredCredits.length} retired credit{filteredCredits.length !== 1 ? 's' : ''}
              </div>

              {filteredCredits.length === 0 ? (
                <Card className="card-elegant">
                  <CardContent className="p-6 text-muted-foreground text-center">
                    No retired credits match your search yet.
                  </CardContent>
                </Card>
              ) : (
                filteredCredits.map((credit, index) => (
                  <Card key={`${credit.tokenId}-${index}`} className="card-elegant">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{credit.projectName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>
                                  Token:{' '}
                                  <code className="bg-muted px-2 py-1 rounded text-xs">
                                    {credit.tokenId}
                                  </code>
                                </span>
                                {credit.verifier && <Badge variant="secondary">{credit.verifier}</Badge>}
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
                                <span className="ml-2 font-semibold">{credit.tonsRetired} CO₂</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Retired By:</span>
                                <span className="ml-2 font-semibold">{credit.retiredBy}</span>
                                {credit.companyId && (
                                  <span className="ml-2 text-xs text-muted-foreground/80">
                                    ({credit.companyId})
                                  </span>
                                )}
                              </div>
                            <div>
                              <span className="text-muted-foreground">Retired On:</span>
                              <span className="ml-2 font-semibold">{formatDate(credit.retiredDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Certificate:</span>
                              <span className="ml-2 font-semibold">
                                {credit.certificateId || '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 text-sm text-muted-foreground">
                          <div>
                            <span className="block text-xs uppercase tracking-wide mb-1">
                              Transaction Hash
                            </span>
                            <code className="bg-muted px-2 py-1 rounded text-xs block">
                              {credit.transactionHash}
                            </code>
                          </div>
                          <div>
                            <span className="block text-xs uppercase tracking-wide mb-1">IPFS Hash</span>
                            <code className="bg-muted px-2 py-1 rounded text-xs block">
                              {credit.ipfsHash || 'Not provided'}
                            </code>
                          </div>
                          <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download Certificate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <Card className="card-elegant">
                  <CardContent className="p-6 text-muted-foreground text-center">
                    No transactions recorded yet.
                  </CardContent>
                </Card>
              ) : (
                transactions.map((tx, index) => (
                  <Card key={`${tx.transactionHash}-${index}`} className="card-elegant">
                    <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionColor(tx.transactionType)}`}>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.transactionType)}
                          <span className="capitalize">{tx.transactionType}</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-medium">{tx.projectName}</h3>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-4">
                          <span>{tx.amountTons} tons</span>
                          {tx.companyName && (
                            <span>
                              By {tx.companyName}
                              {tx.companyId && (
                                <span className="text-xs text-muted-foreground/80 ml-1">
                                  ({tx.companyId})
                                </span>
                              )}
                            </span>
                          )}
                          <span>{formatDate(tx.occurredAt)}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Tx Hash:{' '}
                        <code className="bg-muted px-2 py-1 rounded text-xs inline-block">
                          {tx.transactionHash}
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explorer;
