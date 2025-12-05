import { useState, useEffect } from 'react';
import { Save, Loader2, Building2, User, Handshake, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { CustomerPicker, ContactPicker, DealPicker } from '../EntityPicker';
import { customersApi, contactsApi, dealsApi } from '../../services/api';
import type { Project } from '../../services/api';
import type { Customer, Contact, Deal } from '../../types/crm';

interface DetailsTabProps {
  project: Project;
  onSave: (data: Partial<Project>) => Promise<void>;
  saving: boolean;
}

export function DetailsTab({ project, onSave, saving }: DetailsTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [actualEndDate, setActualEndDate] = useState(
    project.actualEndDate ? new Date(project.actualEndDate).toISOString().split('T')[0] : ''
  );
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCRMData();
  }, [project]);

  const loadCRMData = async () => {
    try {
      if (project.customerID) {
        const customer = await customersApi.getById(project.customerID);
        setSelectedCustomer(customer);
      }
      if (project.contactID) {
        const contact = await contactsApi.getById(project.contactID);
        setSelectedContact(contact);
      }
      if (project.dealID) {
        const deal = await dealsApi.getById(project.dealID);
        setSelectedDeal(deal);
      }
    } catch (error) {
      console.error('Failed to load CRM data:', error);
    }
  };

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    setHasChanges(true);
  };

  const handleContactChange = (contact: Contact | null) => {
    setSelectedContact(contact);
    setHasChanges(true);
  };

  const handleDealChange = (deal: Deal | null) => {
    setSelectedDeal(deal);
    setHasChanges(true);
  };

  const handleActualEndDateChange = (date: string) => {
    setActualEndDate(date);
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      customerID: selectedCustomer?.customerId,
      contactID: selectedContact?.contactId,
      dealID: selectedDeal?.dealId,
      actualEndDate: actualEndDate || undefined,
    });
    setHasChanges(false);
  };

  const handleCustomerSearch = async (searchTerm: string) => {
    try {
      return await customersApi.search({ searchTerm, pageSize: 10 });
    } catch (error) {
      return [];
    }
  };

  const handleContactSearch = async (searchTerm: string) => {
    try {
      return await contactsApi.search({
        searchTerm,
        customerId: selectedCustomer?.customerId,
        pageSize: 10
      });
    } catch (error) {
      return [];
    }
  };

  const handleDealSearch = async (searchTerm: string) => {
    try {
      return await dealsApi.search({
        searchTerm,
        customerId: selectedCustomer?.customerId,
        pageSize: 10
      });
    } catch (error) {
      return [];
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CRM Information Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            CRM Information
          </h3>

          <div className="space-y-4">
            <CustomerPicker
              value={selectedCustomer}
              onChange={handleCustomerChange}
              onSearch={handleCustomerSearch}
              onCreate={() => {/* TODO: Implement */}}
            />

            <ContactPicker
              value={selectedContact}
              onChange={handleContactChange}
              onSearch={handleContactSearch}
              onCreate={() => {/* TODO: Implement */}}
              disabled={!selectedCustomer}
            />

            <DealPicker
              value={selectedDeal}
              onChange={handleDealChange}
              onSearch={handleDealSearch}
              onCreate={() => {/* TODO: Implement */}}
              disabled={!selectedCustomer}
            />
          </div>
        </div>

        {/* Project Dates Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Dates
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-[#838a9c]">Planned Start</Label>
              <div className="px-3 py-2 bg-[#1f2330] rounded-lg text-sm text-white">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString()
                  : 'Not set'
                }
              </div>
            </div>

            <div>
              <Label className="text-[#838a9c]">Planned End</Label>
              <div className="px-3 py-2 bg-[#1f2330] rounded-lg text-sm text-white">
                {project.endDate
                  ? new Date(project.endDate).toLocaleDateString()
                  : 'Not set'
                }
              </div>
            </div>

            <div>
              <Label htmlFor="actualEndDate" className="text-[#838a9c]">Actual End Date</Label>
              <Input
                id="actualEndDate"
                type="date"
                value={actualEndDate}
                onChange={(e) => handleActualEndDateChange(e.target.value)}
                className="bg-[#1f2330] border-[#3d4457] text-white"
              />
            </div>
          </div>
        </div>

        {/* Metadata Card */}
        <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Metadata
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-[#838a9c]">Created By</Label>
              <div className="text-white mt-1">
                {project.createdBy || 'Unknown'}
              </div>
            </div>

            <div>
              <Label className="text-[#838a9c]">Created At</Label>
              <div className="text-white mt-1">
                {new Date(project.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <Label className="text-[#838a9c]">Last Updated</Label>
              <div className="text-white mt-1">
                {new Date(project.updatedAt).toLocaleString()}
              </div>
            </div>

            <div>
              <Label className="text-[#838a9c]">Project ID</Label>
              <div className="text-white mt-1 font-mono text-xs">
                {project.projectID}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
