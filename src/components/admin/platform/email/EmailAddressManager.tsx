import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CreateEmailAddressInput } from '@/hooks/usePlatformEmailAddresses';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { usePlatformEmailAddresses } from '@/hooks/usePlatformEmailAddresses';
import { toast } from 'sonner';

type CategoryType = 'support' | 'billing' | 'sales' | 'general';
const CATEGORIES: CategoryType[] = ['support', 'billing', 'sales', 'general'];

const EmailAddressManager = () => {
  const { addresses, isLoading, createAddress, updateAddress, toggleActive, deleteAddress } = usePlatformEmailAddresses();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState<CreateEmailAddressInput>({
    email_address: '',
    display_name: '',
    category: 'support',
  });

  const resetForm = () => {
    setFormData({
      email_address: '',
      display_name: '',
      category: 'support',
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        email_address: address.email_address,
        display_name: address.display_name,
        category: address.category,
        auto_assign_to: address.auto_assign_to,
        auto_create_ticket: address.auto_create_ticket,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.email_address) {
      toast.error('Email address is required');
      return;
    }

    if (editingAddress) {
      updateAddress.mutate(
        { id: editingAddress.id, ...formData },
        {
          onSuccess: () => {
            toast.success('Email address updated');
            handleCloseDialog();
          },
        }
      );
    } else {
      createAddress.mutate(formData, {
        onSuccess: () => {
          toast.success('Email address created');
          handleCloseDialog();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this email address?')) {
      deleteAddress.mutate(id);
    }
  };

  const handleToggleActive = (id: string, currentState: boolean) => {
    toggleActive.mutate({ id, isActive: !currentState });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Platform Email Addresses</CardTitle>
          <CardDescription>
            Configure email addresses for receiving platform communications
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Email Address' : 'Add Email Address'}
              </DialogTitle>
              <DialogDescription>
                Configure a platform email address for receiving messages
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={formData.email_address}
                  onChange={(e) => setFormData({ ...formData, email_address: e.target.value })}
                  placeholder="support@yourdomain.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Support Team"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: CategoryType) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto-create support ticket</Label>
                <Switch
                  checked={formData.auto_create_ticket || false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, auto_create_ticket: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createAddress.isPending || updateAddress.isPending}
              >
                {(createAddress.isPending || updateAddress.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {editingAddress ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {addresses && addresses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Auto-Ticket</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map(addr => (
                <TableRow key={addr.id}>
                  <TableCell className="font-medium">{addr.email_address}</TableCell>
                  <TableCell>{addr.display_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {addr.category.charAt(0).toUpperCase() + addr.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {addr.auto_create_ticket ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={addr.is_active}
                      onCheckedChange={() => handleToggleActive(addr.id, addr.is_active)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(addr)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(addr.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No email addresses configured. Add one to start receiving emails.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailAddressManager;
