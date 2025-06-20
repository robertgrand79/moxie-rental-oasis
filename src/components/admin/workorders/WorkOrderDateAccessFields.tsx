
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Key } from 'lucide-react';

interface FormData {
  access_code: string;
  estimated_completion_date: string;
}

interface WorkOrderDateAccessFieldsProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const WorkOrderDateAccessFields = ({ formData, setFormData }: WorkOrderDateAccessFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="access_code">Property Access Code</Label>
        <div className="relative">
          <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="access_code"
            value={formData.access_code}
            onChange={(e) => setFormData(prev => ({ ...prev, access_code: e.target.value }))}
            placeholder="e.g., 1234, #5678, Key under mat"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_completion_date">Due Date</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="estimated_completion_date"
            type="date"
            value={formData.estimated_completion_date}
            onChange={(e) => setFormData(prev => ({ ...prev, estimated_completion_date: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDateAccessFields;
