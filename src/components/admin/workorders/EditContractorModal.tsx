
import React, { useState, useEffect } from 'react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';

interface ContractorUpdateData {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  is_active: boolean;
  rating: number | null;
  specialties: string[];
}

interface EditContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateContractor: (contractorId: string, contractorData: ContractorUpdateData) => Promise<void>;
  contractor: Contractor | null;
}

const defaultSpecialties = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Carpentry',
  'Painting',
  'Flooring',
  'Roofing',
  'Landscaping',
  'Appliance Repair',
  'General Maintenance',
];

const EditContractorModal = ({ 
  isOpen, 
  onClose, 
  onUpdateContractor, 
  contractor 
}: EditContractorModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    is_active: true,
    rating: '',
  });
  
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contractor) {
      setFormData({
        name: contractor.name || '',
        company_name: contractor.company_name || '',
        email: contractor.email || '',
        phone: contractor.phone || '',
        address: contractor.address || '',
        notes: contractor.notes || '',
        is_active: contractor.is_active,
        rating: contractor.rating?.toString() || '',
      });
      setSpecialties(contractor.specialties || []);
    }
  }, [contractor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractor) return;
    
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        specialties,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };
      
      await onUpdateContractor(contractor.id, updateData);
      onClose();
    } catch (error) {
      console.error('Error updating contractor:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !specialties.includes(specialty)) {
      setSpecialties([...specialties, specialty]);
    }
    setNewSpecialty('');
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  if (!contractor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contractor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Contractor Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter contractor name..."
              required
            />
          </div>

          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Enter company name..."
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contractor@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              placeholder="4.5"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active Contractor</Label>
          </div>

          <div>
            <Label>Specialties</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add specialty..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecialty(newSpecialty);
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => addSpecialty(newSpecialty)}
                  disabled={!newSpecialty}
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {defaultSpecialties.map((specialty) => (
                  <Button
                    key={specialty}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSpecialty(specialty)}
                    disabled={specialties.includes(specialty)}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
              
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeSpecialty(specialty)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter contractor address..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this contractor..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Contractor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractorModal;
