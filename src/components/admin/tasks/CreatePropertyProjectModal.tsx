
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyProject } from '@/hooks/usePropertyManagement';
import { Property } from '@/types/property';

interface CreatePropertyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Omit<PropertyProject, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property'>) => Promise<void>;
  onUpdateProject?: (projectId: string, projectData: Omit<PropertyProject, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'property'>) => Promise<void>;
  properties: Property[];
  editingProject?: PropertyProject | null;
}

const CreatePropertyProjectModal = ({
  isOpen,
  onClose,
  onCreateProject,
  onUpdateProject,
  properties,
  editingProject,
}: CreatePropertyProjectModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_id: '',
    type: 'maintenance' as PropertyProject['type'],
    status: 'planning' as PropertyProject['status'],
    priority: 'medium' as PropertyProject['priority'],
    start_date: '',
    target_completion_date: '',
    budget: 0,
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        title: editingProject.title,
        description: editingProject.description || '',
        property_id: editingProject.property_id,
        type: editingProject.type,
        status: editingProject.status,
        priority: editingProject.priority,
        start_date: editingProject.start_date || '',
        target_completion_date: editingProject.target_completion_date || '',
        budget: editingProject.budget || 0,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        property_id: '',
        type: 'maintenance' as PropertyProject['type'],
        status: 'planning' as PropertyProject['status'],
        priority: 'medium' as PropertyProject['priority'],
        start_date: '',
        target_completion_date: '',
        budget: 0,
      });
    }
  }, [editingProject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const projectData = {
        ...formData,
        start_date: formData.start_date || undefined,
        target_completion_date: formData.target_completion_date || undefined,
        budget: formData.budget || undefined,
        actual_completion_date: undefined,
        actual_cost: undefined,
      };

      if (editingProject && onUpdateProject) {
        await onUpdateProject(editingProject.id, projectData);
      } else {
        await onCreateProject(projectData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const projectTypes = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'turnover', label: 'Turnover' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'repair', label: 'Repair' },
    { value: 'improvement', label: 'Improvement' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const statuses = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="property">Property</Label>
              <Select value={formData.property_id} onValueChange={(value) => setFormData({ ...formData, property_id: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Project Type</Label>
              <Select value={formData.type} onValueChange={(value: PropertyProject['type']) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: PropertyProject['priority']) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: PropertyProject['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="target_completion_date">Target Completion</Label>
              <Input
                id="target_completion_date"
                type="date"
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProject ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePropertyProjectModal;
