import React, { useState } from 'react';
import { Plus, Search, LayoutGrid, List, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePlatformRoadmap, RoadmapItem, RoadmapFilters } from '@/hooks/usePlatformRoadmap';
import { RoadmapStatsBar } from '@/components/admin/platform/roadmap/RoadmapStatsBar';
import { RoadmapKanbanView } from '@/components/admin/platform/roadmap/RoadmapKanbanView';
import { RoadmapListView } from '@/components/admin/platform/roadmap/RoadmapListView';
import { RoadmapItemForm } from '@/components/admin/platform/roadmap/RoadmapItemForm';

const PlatformRoadmapPage: React.FC = () => {
  const [filters, setFilters] = useState<RoadmapFilters>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<RoadmapItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { items, stats, phases, isLoading, createItem, updateItem, deleteItem } = usePlatformRoadmap(filters);

  const handleEdit = (item: RoadmapItem) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteItem.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleStatusChange = (id: string, status: RoadmapItem['status']) => {
    updateItem.mutate({ id, status });
  };

  const handleFormSubmit = (data: Parameters<typeof createItem.mutate>[0]) => {
    if (editItem) {
      updateItem.mutate({ id: editItem.id, ...data }, {
        onSuccess: () => {
          setFormOpen(false);
          setEditItem(null);
        }
      });
    } else {
      createItem.mutate(data, {
        onSuccess: () => {
          setFormOpen(false);
        }
      });
    }
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Roadmap</h1>
          <p className="text-sm text-muted-foreground">
            Plan and track future improvements to the platform
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <RoadmapStatsBar stats={stats} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(f => ({ ...f, status: value as RoadmapFilters['status'] }))}
          >
            <SelectTrigger className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="idea">Idea</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters(f => ({ ...f, priority: value as RoadmapFilters['priority'] }))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category}
            onValueChange={(value) => setFilters(f => ({ ...f, category: value as RoadmapFilters['category'] }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
              <SelectItem value="bug-fix">Bug Fix</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'kanban' | 'list')}>
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <RoadmapKanbanView
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <RoadmapListView
              items={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <RoadmapItemForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        editItem={editItem}
        existingPhases={phases}
        isSubmitting={createItem.isPending || updateItem.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Roadmap Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this roadmap item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlatformRoadmapPage;
