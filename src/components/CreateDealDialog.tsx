import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Loader2, ExternalLink, Plus, GripHorizontal, Book } from 'lucide-react';
import { Button } from './ui/button';
import { dealsApi, customersApi } from '../services/api';
import type { CreateDealDTO, Deal, Customer } from '../types/crm';
import { toast } from 'sonner';

interface CreateDealDialogProps {
  onClose: () => void;
  onCreated: (deal: Deal) => void;
  defaultName?: string;
  customerId?: string;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export function CreateDealDialog({ onClose, onCreated, defaultName, customerId }: CreateDealDialogProps) {
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Drag & Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState<Size>({ width: 580, height: 0 });
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [resizeDirection, setResizeDirection] = useState<string>('');

  const dialogRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Initialize position to center
  useEffect(() => {
    if (!initialized.current && dialogRef.current) {
      const rect = dialogRef.current.getBoundingClientRect();
      setPosition({
        x: (window.innerWidth - rect.width) / 2,
        y: (window.innerHeight - rect.height) / 2
      });
      setSize({ width: rect.width, height: rect.height });
      initialized.current = true;
    }
  }, []);

  const [formData, setFormData] = useState<CreateDealDTO>({
    customerId: customerId || '',
    contactId: '',
    dealCode: '',
    dealName: defaultName || '',
    description: '',
    dealValue: undefined,
    currency: 'VND',
    stage: 'New',
    probability: 0,
    status: 'Open',
  });

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = Math.max(0, Math.min(window.innerWidth - (size.width || 580), e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y));
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, size.width]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width || 580,
      height: size.height || 600
    });
  }, [size]);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;
    let newX = position.x;
    let newY = position.y;

    if (resizeDirection.includes('e')) {
      newWidth = Math.max(500, Math.min(900, resizeStart.width + deltaX));
    }
    if (resizeDirection.includes('w')) {
      newWidth = Math.max(500, Math.min(900, resizeStart.width - deltaX));
      newX = position.x + (resizeStart.width - newWidth);
    }
    if (resizeDirection.includes('s')) {
      newHeight = Math.max(400, Math.min(800, resizeStart.height + deltaY));
    }
    if (resizeDirection.includes('n')) {
      newHeight = Math.max(400, Math.min(800, resizeStart.height - deltaY));
      newY = position.y + (resizeStart.height - newHeight);
    }

    setSize({ width: newWidth, height: newHeight });
    if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
      setPosition({ x: newX, y: newY });
    }
  }, [isResizing, resizeStart, resizeDirection, position]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection('');
  }, []);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const finalCustomerId = selectedCustomer?.customerId || formData.customerId;
    if (!formData.dealName) {
      toast.error('Deal Name is required');
      return;
    }

    setSaving(true);
    try {
      const deal = await dealsApi.create({
        ...formData,
        customerId: finalCustomerId,
      });
      toast.success('Deal created successfully');
      onCreated(deal);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create deal');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CreateDealDTO, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerSearch = async (searchTerm: string) => {
    setCustomerSearch(searchTerm);
    if (searchTerm.length < 2) {
      setCustomerResults([]);
      return;
    }
    try {
      const results = await customersApi.search({ searchTerm, pageSize: 10 });
      setCustomerResults(results);
      setShowCustomerDropdown(true);
    } catch (error) {
      console.error('Customer search error:', error);
      setCustomerResults([]);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.customerName);
    setShowCustomerDropdown(false);
  };

  // Input style - Dark Mode only (matching VTiger dark theme)
  const inputClass = "h-9 px-3 bg-[#292d39] border border-[#3d4457] rounded text-sm text-white placeholder:text-[#838a9c] focus:border-[#0394ff] focus:outline-none focus:ring-0";
  const selectClass = "h-9 px-3 bg-[#292d39] border border-[#3d4457] rounded text-sm text-white focus:border-[#0394ff] focus:outline-none appearance-none cursor-pointer";
  const buttonClass = "h-9 w-9 flex items-center justify-center bg-[#292d39] border border-[#3d4457] rounded text-[#838a9c] hover:text-white hover:bg-[#3d4457]";

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div
        ref={dialogRef}
        className={`absolute bg-[#1f2330] rounded-lg shadow-xl overflow-hidden flex flex-col ${
          isDragging ? 'cursor-grabbing' : ''
        } ${isResizing ? 'select-none' : ''}`}
        style={{
          left: initialized.current ? position.x : '50%',
          top: initialized.current ? position.y : '50%',
          transform: initialized.current ? 'none' : 'translate(-50%, -50%)',
          width: size.width || 580,
          minHeight: 400,
          maxHeight: size.height || 'auto',
        }}
      >
        {/* Resize handles */}
        <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
        <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
        <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-10" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        <div className="absolute top-0 left-3 right-3 h-1 cursor-n-resize" onMouseDown={(e) => handleResizeStart(e, 'n')} />
        <div className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize" onMouseDown={(e) => handleResizeStart(e, 's')} />
        <div className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize" onMouseDown={(e) => handleResizeStart(e, 'w')} />
        <div className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize" onMouseDown={(e) => handleResizeStart(e, 'e')} />

        {/* Header - VTiger Dark style */}
        <div
          className={`flex items-center justify-between px-4 py-3 border-b border-[#3d4457] bg-[#1f2330] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="h-4 w-4 text-[#838a9c]" />
            <div className="flex h-7 w-7 items-center justify-center rounded bg-pink-500">
              <span className="text-white text-xs font-medium">D</span>
            </div>
            <h2 className="text-base font-semibold text-white">Add Deal</h2>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded">
              <ExternalLink className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-[#838a9c] hover:text-white hover:bg-[#3d4457] rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form - VTiger Dark style with fixed width inputs */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 bg-[#1f2330]">
          <div className="space-y-4">
            {/* Deal Name */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                <span className="text-red-500">*</span> Deal Name
              </label>
              <input
                type="text"
                value={formData.dealName}
                onChange={(e) => handleChange('dealName', e.target.value)}
                className={`${inputClass} w-64`}
                required
              />
            </div>

            {/* Amount */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.dealValue || ''}
                  onChange={(e) => handleChange('dealValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`${inputClass} w-36`}
                />
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className={`${selectClass} w-24`}
                >
                  <option value="VND">VND-₫</option>
                  <option value="USD">USD-$</option>
                  <option value="EUR">EUR-€</option>
                </select>
              </div>
            </div>

            {/* Organization Name */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                Organization Name
              </label>
              <div className="flex gap-1">
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    onFocus={() => customerResults.length > 0 && setShowCustomerDropdown(true)}
                    placeholder="Type to search"
                    className={`${inputClass} w-48`}
                  />
                  {showCustomerDropdown && customerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#292d39] border border-[#3d4457] rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                      {customerResults.map((customer) => (
                        <button
                          key={customer.customerId}
                          type="button"
                          onClick={() => selectCustomer(customer)}
                          className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#3d4457]"
                        >
                          {customer.customerName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className={buttonClass}>
                  <Book className="h-4 w-4" />
                </button>
                <button type="button" className={buttonClass}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expected Close Date */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                <span className="text-red-500">*</span> Expected Close Date
              </label>
              <input
                type="date"
                value={formData.expectedCloseDate || ''}
                onChange={(e) => handleChange('expectedCloseDate', e.target.value)}
                className={`${inputClass} w-48`}
              />
            </div>

            {/* Pipeline */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                <span className="text-red-500">*</span> Pipeline
              </label>
              <div className="relative">
                <select className={`${selectClass} w-48 pr-8`}>
                  <option value="Standard">Standard</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-[#838a9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sales Stage */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                <span className="text-red-500">*</span> Sales Stage
              </label>
              <div className="relative">
                <select
                  value={formData.stage}
                  onChange={(e) => handleChange('stage', e.target.value)}
                  className={`${selectClass} w-48 pr-8`}
                >
                  <option value="New">New</option>
                  <option value="Qualifying">Qualifying</option>
                  <option value="Requirements Gathering">Requirements Gathering</option>
                  <option value="Value Proposition">Value Proposition</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-[#838a9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Assigned To */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                <span className="text-red-500">*</span> Assigned To
              </label>
              <div className="relative">
                <select className={`${selectClass} w-48 pr-8`}>
                  <option value="current">Current User</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-[#838a9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Lead Source */}
            <div className="flex items-center">
              <label className="w-40 text-sm text-[#838a9c] text-right pr-4 flex-shrink-0">
                Lead Source
              </label>
              <div className="relative">
                <select
                  value={formData.source || ''}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className={`${selectClass} w-48 pr-8`}
                >
                  <option value="">Select an Option</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Email Campaign">Email Campaign</option>
                  <option value="Trade Show">Trade Show</option>
                  <option value="Social Media">Social Media</option>
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-[#838a9c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer - VTiger Dark style */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#3d4457] bg-[#1f2330] flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="h-9 px-4 bg-transparent border-[#3d4457] text-white hover:bg-[#3d4457]"
          >
            View full form
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit()}
            disabled={saving}
            className="h-9 px-6 bg-[#0394ff] hover:bg-[#0284e8] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}