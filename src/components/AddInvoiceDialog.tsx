import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Resizable } from 're-resizable';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2,
  X,
  FileText,
  MapPin,
  FileCheck,
  Package,
  AlignLeft,
  ShoppingCart,
  Truck,
  Calendar as CalendarIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../utils/i18n/context';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface AddInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

interface InvoiceItem {
  id: string;
  itemName: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unitCost: number;
}

type SectionId = 'standard' | 'address' | 'terms' | 'items' | 'description' | 'product' | 'waybill';

const STORAGE_KEY = 'taskflow_invoice_dialog_size';

export function AddInvoiceDialog({ open, onOpenChange, projectId }: AddInvoiceDialogProps) {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<SectionId>('standard');
  
  const [standardOpen, setStandardOpen] = useState(true);
  const [addressOpen, setAddressOpen] = useState(true);
  const [termsOpen, setTermsOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [descriptionOpen, setDescriptionOpen] = useState(true);
  const [productOpen, setProductOpen] = useState(true);
  const [waybillOpen, setWaybillOpen] = useState(true);
  
  const sectionRefs = useRef<{ [key in SectionId]?: HTMLDivElement | null }>({});

  // Load saved size from localStorage or use defaults
  const getInitialSize = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          width: parsed.width || window.innerWidth * 0.95,
          height: parsed.height || window.innerHeight * 0.95
        };
      }
    } catch (error) {
      console.error('Error loading saved dialog size:', error);
    }
    return {
      width: window.innerWidth * 0.95,
      height: window.innerHeight * 0.95
    };
  };

  const [dialogSize, setDialogSize] = useState(getInitialSize());

  // Update dialog size when window resizes
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = window.innerWidth * 0.95;
      const maxHeight = window.innerHeight * 0.95;
      
      setDialogSize(prev => ({
        width: Math.min(prev.width, maxWidth),
        height: Math.min(prev.height, maxHeight)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save size to localStorage when it changes
  const handleResizeStop = (e: any, direction: any, ref: any, delta: any) => {
    const newSize = {
      width: ref.offsetWidth,
      height: ref.offsetHeight
    };
    
    setDialogSize(newSize);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSize));
    } catch (error) {
      console.error('Error saving dialog size:', error);
    }
  };

  const [invoiceNumber, setInvoiceNumber] = useState('#0328');
  const [invoiceDate, setInvoiceDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [status, setStatus] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedGst, setSelectedGst] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [showItemSummary, setShowItemSummary] = useState(false);
  const [recurringInvoice, setRecurringInvoice] = useState('');
  const [memberAssign, setMemberAssign] = useState('');
  
  const [clientBillingAddress, setClientBillingAddress] = useState('');
  const [billingDueNo, setBillingDueNo] = useState('');
  const [billingAddressName, setBillingAddressName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingState, setBillingState] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [billingCountry, setBillingCountry] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');
  const [billingPostCode, setBillingPostCode] = useState('');
  const [shippingPostCode, setShippingPostCode] = useState('');
  
  const [termsConditions, setTermsConditions] = useState('');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', itemName: '', description: '', hsnCode: '', quantity: 1, unitCost: 0 }
  ]);

  const [descriptionDetails, setDescriptionDetails] = useState('');
  
  const [artAndColors, setArtAndColors] = useState('');
  const [transportMode, setTransportMode] = useState('');

  const [consumptionId, setConsumptionId] = useState('');

  const scrollToSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);
  };

  const sections = [
    { id: 'standard' as SectionId, label: 'Standard Edition', icon: FileText, isOpen: standardOpen, setIsOpen: setStandardOpen },
    { id: 'address' as SectionId, label: 'Address Details', icon: MapPin, isOpen: addressOpen, setIsOpen: setAddressOpen },
    { id: 'terms' as SectionId, label: 'Terms & Conditions', icon: FileCheck, isOpen: termsOpen, setIsOpen: setTermsOpen },
    { id: 'items' as SectionId, label: 'Item Details', icon: Package, isOpen: itemsOpen, setIsOpen: setItemsOpen },
    { id: 'description' as SectionId, label: 'Description Details', icon: AlignLeft, isOpen: descriptionOpen, setIsOpen: setDescriptionOpen },
    { id: 'product' as SectionId, label: 'e-Product Details', icon: ShoppingCart, isOpen: productOpen, setIsOpen: setProductOpen },
    { id: 'waybill' as SectionId, label: 'e-Waybill Details', icon: Truck, isOpen: waybillOpen, setIsOpen: setWaybillOpen },
  ];

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      itemName: '',
      description: '',
      hsnCode: '',
      quantity: 1,
      unitCost: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST example
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = () => {
    if (!invoiceNumber || !selectedClient || !selectedProject) {
      toast.error('Please fill in all required fields');
      return;
    }

    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      client: selectedClient,
      project: selectedProject,
      status,
      items,
      total: calculateTotal()
    };

    console.log('Invoice data:', invoiceData);
    toast.success('Invoice created successfully!');
    onOpenChange(false);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Resizable Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <Resizable
          size={{ width: dialogSize.width, height: dialogSize.height }}
          onResizeStop={handleResizeStop}
          minWidth={800}
          minHeight={600}
          maxWidth={window.innerWidth * 0.98}
          maxHeight={window.innerHeight * 0.98}
          enable={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
          className="pointer-events-auto"
          handleStyles={{
            top: { cursor: 'ns-resize' },
            right: { cursor: 'ew-resize' },
            bottom: { cursor: 'ns-resize' },
            left: { cursor: 'ew-resize' },
            topRight: { cursor: 'nesw-resize' },
            bottomRight: { cursor: 'nwse-resize' },
            bottomLeft: { cursor: 'nesw-resize' },
            topLeft: { cursor: 'nwse-resize' },
          }}
          handleClasses={{
            top: 'hover:bg-[#0394ff]/30 transition-colors',
            right: 'hover:bg-[#0394ff]/30 transition-colors',
            bottom: 'hover:bg-[#0394ff]/30 transition-colors',
            left: 'hover:bg-[#0394ff]/30 transition-colors',
            topRight: 'hover:bg-[#0394ff]/30 transition-colors',
            bottomRight: 'hover:bg-[#0394ff]/30 transition-colors',
            bottomLeft: 'hover:bg-[#0394ff]/30 transition-colors',
            topLeft: 'hover:bg-[#0394ff]/30 transition-colors',
          }}
        >
          <div className="w-full h-full bg-[#292d39] border-2 border-[#3d4457] rounded-lg text-white flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#3d4457] flex-shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0394ff]" />
                <h2 className="text-white m-0">Creating Invoice</h2>
                <span className="text-xs text-[#838a9c] ml-2">(Resizable)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-[#3d4457]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div className="w-64 bg-[#1f2430] border-r border-[#3d4457] flex flex-col">
            <div className="p-4 flex-1 overflow-y-auto taskflow-scrollbar">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-[#0394ff] text-white'
                          : 'text-[#838a9c] hover:bg-[#292d39] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto taskflow-scrollbar">
            <div className="p-8 space-y-6">
              {/* Standard Edition Section */}
              <div ref={(el) => (sectionRefs.current.standard = el)}>
                <Collapsible open={standardOpen} onOpenChange={setStandardOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">Standard Edition</span>
                    </div>
                    {standardOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Invoice #</Label>
                        <Input
                          value={invoiceNumber}
                          onChange={(e) => setInvoiceNumber(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Organization Name</Label>
                        <Input
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                          placeholder="Select or Operation"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Invoice Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start text-left bg-[#292d39] border-[#3d4457] text-white hover:bg-[#3d4457]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {invoiceDate ? formatDate(invoiceDate) : '2020-12-25'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#292d39] border-[#3d4457]">
                            <Calendar
                              mode="single"
                              selected={invoiceDate}
                              onSelect={setInvoiceDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start text-left bg-[#292d39] border-[#3d4457] text-white hover:bg-[#3d4457]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDate ? formatDate(dueDate) : 'Select date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#292d39] border-[#3d4457]">
                            <Calendar
                              mode="single"
                              selected={dueDate}
                              onSelect={setDueDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Assigned By</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="English (en)" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="client1">Client A</SelectItem>
                            <SelectItem value="client2">Client B</SelectItem>
                            <SelectItem value="client3">Client C</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Member Order</Label>
                        <Input
                          value={memberAssign}
                          onChange={(e) => setMemberAssign(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Project ID</Label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="project1">Project Alpha</SelectItem>
                            <SelectItem value="project2">Project Beta</SelectItem>
                            <SelectItem value="project3">Project Gamma</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="Add Operation" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Currency</Label>
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="Add or Operation" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                            <SelectItem value="gbp">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Discount Percentage</Label>
                        <Input
                          type="number"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Select GST</Label>
                        <Select value={selectedGst} onValueChange={setSelectedGst}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="Add or Operation" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="gst5">5%</SelectItem>
                            <SelectItem value="gst12">12%</SelectItem>
                            <SelectItem value="gst18">18%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">GST Number</Label>
                        <Input
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Exchange Rate</Label>
                        <Input
                          type="number"
                          value={exchangeRate}
                          onChange={(e) => setExchangeRate(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Show Item Summary</Label>
                        <Select value={showItemSummary ? 'yes' : 'no'} onValueChange={(v) => setShowItemSummary(v === 'yes')}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="Select or Operation" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Recurring Invoice</Label>
                        <Select value={recurringInvoice} onValueChange={setRecurringInvoice}>
                          <SelectTrigger className="bg-[#292d39] border-[#3d4457] text-white">
                            <SelectValue placeholder="Add or Operation" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#292d39] border-[#3d4457]">
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Address Details Section */}
              <div ref={(el) => (sectionRefs.current.address = el)}>
                <Collapsible open={addressOpen} onOpenChange={setAddressOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">Address Details</span>
                    </div>
                    {addressOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Billing Address No</Label>
                        <Input
                          value={billingDueNo}
                          onChange={(e) => setBillingDueNo(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                          placeholder="Select or Operation"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Shipping Address No</Label>
                        <Input
                          value={shippingAddress}
                          onChange={(e) => setShippingAddress(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                          placeholder="Select or Operation"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Billing Address</Label>
                        <Textarea
                          value={clientBillingAddress}
                          onChange={(e) => setClientBillingAddress(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white min-h-[80px]"
                          placeholder="Remodel or Operation"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Shipping Address</Label>
                        <Textarea
                          value={billingAddressName}
                          onChange={(e) => setBillingAddressName(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white min-h-[80px]"
                          placeholder="Remodel"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Billing State</Label>
                        <Input
                          value={billingState}
                          onChange={(e) => setBillingState(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                          placeholder="Remodel"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Shipping State</Label>
                        <Input
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                          placeholder="Remodel or Operation"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Billing Country</Label>
                        <Input
                          value={billingCountry}
                          onChange={(e) => setBillingCountry(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Shipping Country</Label>
                        <Input
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Billing Post Code</Label>
                        <Input
                          value={billingPostCode}
                          onChange={(e) => setBillingPostCode(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Shipping Post Code</Label>
                        <Input
                          value={shippingPostCode}
                          onChange={(e) => setShippingPostCode(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Terms & Conditions Section */}
              <div ref={(el) => (sectionRefs.current.terms = el)}>
                <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">Terms & Conditions</span>
                    </div>
                    {termsOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-[#838a9c]">Terms & Conditions</Label>
                      <Textarea
                        value={termsConditions}
                        onChange={(e) => setTermsConditions(e.target.value)}
                        className="bg-[#292d39] border-[#3d4457] text-white min-h-[150px]"
                        placeholder="Looking forward to a continued successful working relationship, we are delighted to provide this offer for the provision of software and related IT Services to your organization"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Item Details Section */}
              <div ref={(el) => (sectionRefs.current.items = el)}>
                <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">Item Details</span>
                    </div>
                    {itemsOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="space-y-4">
                      {/* Items Table */}
                      <div className="border border-[#3d4457] rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-[#292d39] border-b border-[#3d4457]">
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">#</th>
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">Item Name</th>
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">Description</th>
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">HSN Code</th>
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">Qty</th>
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">Unit Cost</th>
                              <th className="px-4 py-3 text-left text-[#838a9c] text-xs">Amount</th>
                              <th className="px-4 py-3 text-center text-[#838a9c] text-xs">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={item.id} className="border-b border-[#3d4457] last:border-b-0">
                                <td className="px-4 py-3 text-[#838a9c] text-sm">{index + 1}</td>
                                <td className="px-4 py-3">
                                  <Input
                                    value={item.itemName}
                                    onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                                    className="bg-[#292d39] border-[#3d4457] text-white h-9"
                                    placeholder="Greeting"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    value={item.description}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    className="bg-[#292d39] border-[#3d4457] text-white h-9"
                                    placeholder="Remodel"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    value={item.hsnCode}
                                    onChange={(e) => handleItemChange(item.id, 'hsnCode', e.target.value)}
                                    className="bg-[#292d39] border-[#3d4457] text-white h-9"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                    className="bg-[#292d39] border-[#3d4457] text-white h-9 w-20"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <Input
                                    type="number"
                                    value={item.unitCost}
                                    onChange={(e) => handleItemChange(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                                    className="bg-[#292d39] border-[#3d4457] text-white h-9 w-24"
                                  />
                                </td>
                                <td className="px-4 py-3 text-white">
                                  ${(item.quantity * item.unitCost).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={items.length === 1}
                                    className="h-9 w-9 p-0 hover:bg-[#3d4457]"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <Button
                        variant="outline"
                        onClick={handleAddItem}
                        className="w-full border-[#3d4457] bg-[#292d39] hover:bg-[#3d4457] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>

                      {/* Summary Section */}
                      <div className="flex justify-end pt-4 border-t border-[#3d4457]">
                        <div className="w-80 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[#838a9c]">Sub Total:</span>
                            <span className="text-white">${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#838a9c]">Discount:</span>
                            <span className="text-white">$0.00</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#838a9c]">Tax Total:</span>
                            <span className="text-white">${calculateTax().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#3d4457]">
                            <span className="text-white">Net Total:</span>
                            <span className="text-[#0394ff]">${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section Subtotal */}
                      <div className="bg-[#292d39] p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Section Subtotal</span>
                          <span className="text-[#0394ff]">${calculateSubtotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Description Details Section */}
              <div ref={(el) => (sectionRefs.current.description = el)}>
                <Collapsible open={descriptionOpen} onOpenChange={setDescriptionOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <AlignLeft className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">Description Details</span>
                    </div>
                    {descriptionOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-[#838a9c]">Description</Label>
                      <div className="flex gap-2 mb-2 pb-2 border-b border-[#3d4457]">
                        <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-[#3d4457] text-white">
                          <span>B</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-[#3d4457] text-white">
                          <span className="italic">I</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-[#3d4457] text-white">
                          <span className="underline">U</span>
                        </Button>
                        <div className="border-l border-[#3d4457] mx-1"></div>
                        <Button variant="ghost" size="sm" className="h-8 px-3 hover:bg-[#3d4457] text-white">
                          <span>≡</span>
                        </Button>
                      </div>
                      <Textarea
                        value={descriptionDetails}
                        onChange={(e) => setDescriptionDetails(e.target.value)}
                        className="bg-[#292d39] border-[#3d4457] text-white min-h-[200px]"
                        placeholder="Enter description..."
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* e-Product Details Section */}
              <div ref={(el) => (sectionRefs.current.product = el)}>
                <Collapsible open={productOpen} onOpenChange={setProductOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">e-Product Details</span>
                    </div>
                    {productOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">e-Way Bill No</Label>
                        <Input
                          value={artAndColors}
                          onChange={(e) => setArtAndColors(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#838a9c]">Transport Mode</Label>
                        <Input
                          value={transportMode}
                          onChange={(e) => setTransportMode(e.target.value)}
                          className="bg-[#292d39] border-[#3d4457] text-white"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* e-Waybill Details Section */}
              <div ref={(el) => (sectionRefs.current.waybill = el)}>
                <Collapsible open={waybillOpen} onOpenChange={setWaybillOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-[#181c28] hover:bg-[#1f2430] rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#0394ff]" />
                      <span className="text-white">e-Waybill Details</span>
                    </div>
                    {waybillOpen ? (
                      <ChevronDown className="w-5 h-5 text-[#838a9c]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#838a9c]" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 p-6 bg-[#181c28] rounded-lg">
                    <div className="space-y-2">
                      <Label className="text-[#838a9c]">Consumption ID</Label>
                      <Input
                        value={consumptionId}
                        onChange={(e) => setConsumptionId(e.target.value)}
                        className="bg-[#292d39] border-[#3d4457] text-white"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#3d4457] flex-shrink-0">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="bg-[#292d39] border-[#3d4457] hover:bg-[#3d4457] text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-[#0394ff] hover:bg-[#0570cd] text-white"
              >
                Save Invoice
              </Button>
            </div>
          </div>
        </Resizable>
      </div>
    </>
  );
}
