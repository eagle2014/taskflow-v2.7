import { useState } from 'react';
import { X, Save, Building2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { customersApi } from '../services/api';
import type { CreateCustomerDTO, Customer } from '../types/crm';
import { toast } from 'sonner';

interface CreateCustomerDialogProps {
  onClose: () => void;
  onCreated: (customer: Customer) => void;
  defaultName?: string;
}

export function CreateCustomerDialog({ onClose, onCreated, defaultName }: CreateCustomerDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateCustomerDTO>({
    customerCode: '',
    customerName: defaultName || '',
    customerType: 'Company',
    industry: '',
    website: '',
    taxCode: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    status: 'Active',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerCode || !formData.customerName) {
      toast.error('Customer Code and Name are required');
      return;
    }

    setSaving(true);
    try {
      const customer = await customersApi.create(formData);
      toast.success('Customer created successfully');
      onCreated(customer);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CreateCustomerDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Create New Customer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a new customer to the system
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Basic Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerCode">
                    Customer Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerCode"
                    value={formData.customerCode}
                    onChange={(e) => handleChange('customerCode', e.target.value)}
                    placeholder="CUST-001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerType">Customer Type</Label>
                  <select
                    id="customerType"
                    value={formData.customerType}
                    onChange={(e) => handleChange('customerType', e.target.value as 'Company' | 'Individual')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Company">Company</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="customerName">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                    placeholder="Technology"
                  />
                </div>

                <div>
                  <Label htmlFor="taxCode">Tax Code</Label>
                  <Input
                    id="taxCode"
                    value={formData.taxCode}
                    onChange={(e) => handleChange('taxCode', e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Contact Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@acme.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://acme.com"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Additional Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="annualRevenue">Annual Revenue</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    value={formData.annualRevenue || ''}
                    onChange={(e) => handleChange('annualRevenue', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="1000000"
                  />
                </div>

                <div>
                  <Label htmlFor="employeeCount">Employee Count</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    value={formData.employeeCount || ''}
                    onChange={(e) => handleChange('employeeCount', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Customer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}