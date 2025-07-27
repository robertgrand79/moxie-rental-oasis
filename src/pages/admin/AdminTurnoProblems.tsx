import React, { useState, useMemo } from 'react';
import { useTurnoProblems } from '@/hooks/useTurnoProblems';
import { useTurnoProperties } from '@/hooks/useTurnoProperties';
import type { TurnoProblemsFilters } from '@/types/turnoProblems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Search, Filter, Plus, Link, ExternalLink } from 'lucide-react';
import TurnoProblemsTable from '@/components/admin/turno/TurnoProblemsTable';
import TurnoProblemsSync from '@/components/admin/turno/TurnoProblemsSync';
import TurnoProblemsStats from '@/components/admin/turno/TurnoProblemsStats';

const AdminTurnoProblems = () => {
  const [filters, setFilters] = useState<TurnoProblemsFilters>({});
  const [activeTab, setActiveTab] = useState('problems');
  const [searchTerm, setSearchTerm] = useState('');

  const { problems, stats, loading, refreshProblems } = useTurnoProblems(filters);
  const { turnoProperties } = useTurnoProperties();

  const updateFilters = (newFilters: Partial<TurnoProblemsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    updateFilters({ search: value || undefined });
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const filteredProblems = useMemo(() => {
    return problems;
  }, [problems]);

  if (loading && !problems.length) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Turno Problems</h1>
          <p className="text-muted-foreground mt-1">
            Manage and sync problems from Turno field service management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshProblems}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TurnoProblemsStats stats={stats} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="sync">Sync Management</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search problems..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters({ status: value === 'all' ? undefined : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilters({ priority: value === 'all' ? undefined : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Order</label>
                  <Select 
                    value={filters.has_work_order === undefined ? 'all' : filters.has_work_order.toString()} 
                    onValueChange={(value) => updateFilters({ has_work_order: value === 'all' ? undefined : value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All problems" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All problems</SelectItem>
                      <SelectItem value="true">With work order</SelectItem>
                      <SelectItem value="false">Without work order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {filteredProblems.length} problem{filteredProblems.length !== 1 ? 's' : ''}
                  </Badge>
                  {Object.values(filters).some(v => v !== undefined) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Problems Table */}
          <TurnoProblemsTable problems={filteredProblems} loading={loading} />
        </TabsContent>

        <TabsContent value="sync">
          <TurnoProblemsSync onSyncComplete={refreshProblems} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTurnoProblems;