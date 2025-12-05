import { Briefcase, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface InvoicesTabProps {
  projectId: string;
}

export function InvoicesTab({ projectId }: InvoicesTabProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Project Invoices
        </h3>
        <Button className="bg-[#0394ff] hover:bg-[#0570cd] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="bg-[#292d39] border border-[#3d4457] rounded-lg p-12 text-center">
        <Briefcase className="h-16 w-16 text-[#838a9c] mx-auto mb-4" />
        <p className="text-[#838a9c] text-lg">
          No invoices created
        </p>
        <p className="text-[#666] text-sm mt-2">
          Create your first project invoice
        </p>
      </div>
    </div>
  );
}
