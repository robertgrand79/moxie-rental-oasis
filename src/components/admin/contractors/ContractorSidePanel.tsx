
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Contractor } from '@/hooks/useWorkOrderManagement';

const contractorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  address: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  rating: z.number().min(0).max(5).optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

type ContractorFormData = z.infer<typeof contractorSchema>;

const AVAILABLE_SPECIALTIES = [
  'plumbing',
  'electrical',
  'hvac',
  'painting',
  'flooring',
  'roofing',
  'landscaping',
  'cleaning',
  'maintenance',
];

interface ContractorSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContractorFormData) => Promise<void>;
  contractor?: Contractor | null;
}

const ContractorSidePanel = ({
  isOpen,
  onClose,
  onSave,
  contractor,
}: ContractorSidePanelProps) => {
  const isEditing = !!contractor;
  const [selectedSpecialties, setSelectedSpecialties] = React.useState<string[]>(
    contractor?.specialties || []
  );

  const form = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: contractor?.name || '',
      email: contractor?.email || '',
      phone: contractor?.phone || '',
      company_name: contractor?.company_name || '',
      address: contractor?.address || '',
      specialties: contractor?.specialties || [],
      rating: contractor?.rating || undefined,
      is_active: contractor?.is_active ?? true,
      notes: contractor?.notes || '',
    },
  });

  React.useEffect(() => {
    if (contractor) {
      form.reset({
        name: contractor.name,
        email: contractor.email,
        phone: contractor.phone || '',
        company_name: contractor.company_name || '',
        address: contractor.address || '',
        specialties: contractor.specialties || [],
        rating: contractor.rating || undefined,
        is_active: contractor.is_active,
        notes: contractor.notes || '',
      });
      setSelectedSpecialties(contractor.specialties || []);
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        address: '',
        specialties: [],
        rating: undefined,
        is_active: true,
        notes: '',
      });
      setSelectedSpecialties([]);
    }
  }, [contractor, form]);

  const handleSubmit = async (data: ContractorFormData) => {
    const formData = {
      ...data,
      specialties: selectedSpecialties,
    };
    await onSave(formData);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? 'Edit Contractor' : 'Add New Contractor'}
          </SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'Update contractor information and settings.' 
              : 'Add a new contractor to your network.'
            }
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC Contracting" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location & Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location & Contact</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="123 Main St, City, State 12345" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Specialties */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SPECIALTIES.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleSpecialty(specialty)}
                  >
                    {specialty}
                    {selectedSpecialties.includes(specialty) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rating & Status</h3>
              
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="5" 
                        step="0.1"
                        placeholder="4.5" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Active contractors can receive work orders
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notes</h3>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about this contractor..." 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Contractor' : 'Add Contractor'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default ContractorSidePanel;
