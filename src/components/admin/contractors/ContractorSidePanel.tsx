
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
import { X, Mail, Phone, MapPin, Star, Edit, Building2, DollarSign } from 'lucide-react';
import { Contractor } from '@/hooks/useWorkOrderManagement';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  hourly_rate: z.number().min(0).optional(),
  default_billing_type: z.enum(['hourly', 'fixed']).optional(),
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
  isViewOnly?: boolean;
  onEdit?: () => void;
}

const ContractorSidePanel = ({
  isOpen,
  onClose,
  onSave,
  contractor,
  isViewOnly = false,
  onEdit,
}: ContractorSidePanelProps) => {
  const isEditing = !!contractor && !isViewOnly;
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
      hourly_rate: contractor?.hourly_rate || undefined,
      default_billing_type: (contractor?.default_billing_type as 'hourly' | 'fixed') || 'hourly',
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
        hourly_rate: contractor.hourly_rate || undefined,
        default_billing_type: (contractor.default_billing_type as 'hourly' | 'fixed') || 'hourly',
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
        hourly_rate: undefined,
        default_billing_type: 'hourly',
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  // View-only mode
  if (isViewOnly && contractor) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Contractor Details</SheetTitle>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <SheetDescription>
              View contractor information and details.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${
                  contractor.is_active 
                    ? 'border-green-200 bg-green-50 text-green-700' 
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {contractor.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {contractor.rating && (
                <div className="flex items-center gap-1">
                  {renderStars(contractor.rating)}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({contractor.rating.toFixed(1)})
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{contractor.name}</h3>
              
              {contractor.company_name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{contractor.company_name}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${contractor.email}`} className="text-primary hover:underline">
                    {contractor.email}
                  </a>
                </div>

                {contractor.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${contractor.phone}`} className="text-primary hover:underline">
                      {contractor.phone}
                    </a>
                  </div>
                )}

                {contractor.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{contractor.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            {contractor.specialties && contractor.specialties.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {contractor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="capitalize">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Information */}
            {(contractor.hourly_rate || contractor.default_billing_type) && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Billing Information
                </h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  {contractor.hourly_rate && (
                    <div>
                      <span className="text-muted-foreground">Hourly Rate:</span>{' '}
                      <span className="font-medium">${contractor.hourly_rate.toFixed(2)}/hr</span>
                    </div>
                  )}
                  {contractor.default_billing_type && (
                    <div>
                      <span className="text-muted-foreground">Default Billing:</span>{' '}
                      <Badge variant="outline" className="capitalize ml-1">
                        {contractor.default_billing_type}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {contractor.notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contractor.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t">
              {contractor.email && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${contractor.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
              {contractor.phone && (
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`tel:${contractor.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Edit/Create mode
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

            {/* Billing Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing Settings
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          placeholder="75.00" 
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
                  name="default_billing_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Billing Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'hourly'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                These defaults will be applied to new work orders assigned to this contractor.
              </p>
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
