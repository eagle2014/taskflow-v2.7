import { useState, useCallback, useEffect } from 'react';
import {
  X,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronDown,
  Plus,
  Trash2,
  Maximize2,
  Save,
  GripVertical,
} from 'lucide-react';

interface QuoteItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  netPrice: number;
  description?: string;
  hasStockWarning?: boolean;
}

interface QuoteSection {
  id: string;
  name: string;
  items: QuoteItem[];
  subtotalQuantity: number;
  subtotalAmount: number;
  subtotalNetPrice: number;
}

interface CreateQuoteDialogProps {
  onClose: () => void;
  onCreated?: (quote: any) => void;
  dealId?: string;
  dealName?: string;
}

type SectionType = 'quote_details' | 'address_details' | 'terms_conditions' | 'item_details' | 'description_details';

const sectionList: { id: SectionType; label: string }[] = [
  { id: 'quote_details', label: 'Quote Details' },
  { id: 'address_details', label: 'Address Details' },
  { id: 'terms_conditions', label: 'Terms & Conditions' },
  { id: 'item_details', label: 'Item Details' },
  { id: 'description_details', label: 'Description Details' },
];

export function CreateQuoteDialog({ onClose, onCreated, dealId, dealName }: CreateQuoteDialogProps) {
  // Dialog position and size for drag/resize
  const [position, setPosition] = useState({ x: 100, y: 50 });
  const [size, setSize] = useState({ width: 1100, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Active section
  const [activeSection, setActiveSection] = useState<SectionType>('item_details');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Quote form state
  const [quoteName, setQuoteName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [syncWithDeal, setSyncWithDeal] = useState(false);

  // Item Details state
  const [taxRegion, setTaxRegion] = useState('');
  const [currency, setCurrency] = useState('Vietnam, Dong');
  const [taxMode, setTaxMode] = useState('Group');
  const [priceBooks, setPriceBooks] = useState('');

  // Sections with items
  const [sections, setSections] = useState<QuoteSection[]>([
    {
      id: '1',
      name: '',
      items: [
        {
          id: '1',
          itemName: '',
          quantity: 1,
          unitPrice: 0,
          total: 0,
          netPrice: 0,
          hasStockWarning: false,
        },
      ],
      subtotalQuantity: 1,
      subtotalAmount: 0,
      subtotalNetPrice: 0,
    },
  ]);

  // Summary
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'%' | 'fixed'>('%');

  // Calculate totals
  const itemsTotal = sections.reduce((sum, section) => sum + section.subtotalAmount, 0);
  const discountAmount = discountType === '%' ? (itemsTotal * overallDiscount) / 100 : overallDiscount;
  const preTaxTotal = itemsTotal - discountAmount;

  // Update section subtotals when items change
  const updateSectionSubtotals = (sectionId: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const subtotalQuantity = section.items.reduce((sum, item) => sum + item.quantity, 0);
          const subtotalAmount = section.items.reduce((sum, item) => sum + item.total, 0);
          const subtotalNetPrice = section.items.reduce((sum, item) => sum + item.netPrice, 0);
          return { ...section, subtotalQuantity, subtotalAmount, subtotalNetPrice };
        }
        return section;
      })
    );
  };

  // Handle item change
  const handleItemChange = (sectionId: string, itemId: string, field: keyof QuoteItem, value: any) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const updatedItems = section.items.map(item => {
            if (item.id === itemId) {
              const updatedItem = { ...item, [field]: value };
              // Recalculate total and netPrice
              if (field === 'quantity' || field === 'unitPrice') {
                updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
                updatedItem.netPrice = updatedItem.total;
              }
              return updatedItem;
            }
            return item;
          });
          return { ...section, items: updatedItems };
        }
        return section;
      })
    );
    // Update subtotals after a small delay
    setTimeout(() => updateSectionSubtotals(sectionId), 0);
  };

  // Add new item to section
  const addItemToSection = (sectionId: string, type: 'product' | 'service') => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [
              ...section.items,
              {
                id: String(Date.now()),
                itemName: '',
                quantity: 1,
                unitPrice: 0,
                total: 0,
                netPrice: 0,
              },
            ],
          };
        }
        return section;
      })
    );
  };

  // Remove item from section
  const removeItemFromSection = (sectionId: string, itemId: string) => {
    setSections(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          const updatedItems = section.items.filter(item => item.id !== itemId);
          if (updatedItems.length === 0) {
            // Keep at least one empty row
            updatedItems.push({
              id: String(Date.now()),
              itemName: '',
              quantity: 1,
              unitPrice: 0,
              total: 0,
              netPrice: 0,
            });
          }
          return { ...section, items: updatedItems };
        }
        return section;
      })
    );
    setTimeout(() => updateSectionSubtotals(sectionId), 0);
  };

  // Add new section
  const addSection = () => {
    setSections(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        items: [
          {
            id: String(Date.now() + 1),
            itemName: '',
            quantity: 1,
            unitPrice: 0,
            total: 0,
            netPrice: 0,
          },
        ],
        subtotalQuantity: 1,
        subtotalAmount: 0,
        subtotalNetPrice: 0,
      },
    ]);
  };

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y)),
      });
    }
  }, [isDragging, dragOffset, size]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Save handler
  const handleSave = () => {
    const quoteData = {
      quoteName,
      dealId,
      sections,
      taxRegion,
      currency,
      taxMode,
      priceBooks,
      itemsTotal,
      overallDiscount,
      discountType,
      preTaxTotal,
      syncWithDeal,
    };
    console.log('Saving quote:', quoteData);
    onCreated?.(quoteData);
    onClose();
  };

  const formatCurrency = (value: number) => value.toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        className="absolute bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white drag-handle cursor-move">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Creating Quote :</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Type to search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 w-48 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <ExternalLink className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Sections */}
          <div className={`bg-gray-50 border-r border-gray-200 flex-shrink-0 transition-all ${sidebarCollapsed ? 'w-0' : 'w-52'}`}>
            {!sidebarCollapsed && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Sections</h3>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {sectionList.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Collapsed sidebar toggle */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="flex-shrink-0 w-8 bg-gray-50 border-r border-gray-200 flex items-center justify-center hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4 text-gray-400 rotate-180" />
            </button>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeSection === 'item_details' && (
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Item Details</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sync with Deal</span>
                    <button
                      onClick={() => setSyncWithDeal(!syncWithDeal)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        syncWithDeal ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                          syncWithDeal ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Tax/Currency Options */}
                <div className="flex items-center gap-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tax regions</label>
                    <select
                      value={taxRegion}
                      onChange={(e) => setTaxRegion(e.target.value)}
                      className="h-9 px-3 pr-8 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select an Option</option>
                      <option value="vietnam">Vietnam</option>
                      <option value="us">United States</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-9 px-3 pr-8 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Vietnam, Dong">Vietnam, Dong</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tax Mode</label>
                    <select
                      value={taxMode}
                      onChange={(e) => setTaxMode(e.target.value)}
                      className="h-9 px-3 pr-8 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Group">Group</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Price Books</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Type to sear..."
                        value={priceBooks}
                        onChange={(e) => setPriceBooks(e.target.value)}
                        className="h-9 px-3 w-32 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                      <button className="h-9 w-9 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
                        <Save className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">More Options</label>
                    <select className="h-9 px-3 pr-8 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500">
                      <option>0 options enabled</option>
                    </select>
                  </div>
                </div>

                {/* Sections with Items */}
                {sections.map((section, sectionIndex) => (
                  <div key={section.id} className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                    {/* Section Name */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Section Name"
                        value={section.name}
                        onChange={(e) =>
                          setSections(prev =>
                            prev.map(s => (s.id === section.id ? { ...s, name: e.target.value } : s))
                          )
                        }
                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Items Table */}
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr className="text-left text-sm text-gray-600">
                          <th className="px-3 py-2 w-12">No</th>
                          <th className="px-3 py-2">Item Name <span className="text-red-500">*</span></th>
                          <th className="px-3 py-2 w-24">Quantity <span className="text-red-500">*</span></th>
                          <th className="px-3 py-2 w-32">Unit Selling Price</th>
                          <th className="px-3 py-2 w-24 text-right">Total</th>
                          <th className="px-3 py-2 w-24 text-right">Net Price</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.map((item, itemIndex) => (
                          <tr key={item.id} className="border-t border-gray-100">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{itemIndex + 1}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    placeholder="Search item..."
                                    value={item.itemName}
                                    onChange={(e) => handleItemChange(section.id, item.id, 'itemName', e.target.value)}
                                    className="flex-1 h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                  />
                                  <button className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
                                    <X className="h-3 w-3 text-gray-400" />
                                  </button>
                                  <button className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
                                    <Save className="h-3 w-3 text-gray-400" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1">
                                  <textarea
                                    placeholder="Description..."
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(section.id, item.id, 'description', e.target.value)}
                                    className="flex-1 h-12 px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:border-blue-500"
                                  />
                                  <button className="self-end h-6 w-6 flex items-center justify-center text-gray-400 hover:text-gray-600">
                                    <Maximize2 className="h-3 w-3" />
                                  </button>
                                </div>
                                {item.hasStockWarning && (
                                  <span className="text-xs text-red-500">Not enough stock</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(section.id, item.id, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full h-8 px-2 border border-gray-300 rounded text-sm text-center focus:outline-none focus:border-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemChange(section.id, item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  className="flex-1 h-8 px-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                                />
                                <button className="h-8 w-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50">
                                  <Save className="h-3 w-3 text-gray-400" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right text-sm text-gray-700">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="px-3 py-2 text-right text-sm text-gray-700">
                              {formatCurrency(item.netPrice)}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => removeItemFromSection(section.id, item.id)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Section Subtotal */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
                      <span className="font-medium text-sm text-gray-700">Section Subtotal</span>
                      <div className="flex items-center gap-8 text-sm text-gray-700">
                        <span>{section.subtotalQuantity}</span>
                        <span className="w-24 text-right">{formatCurrency(section.subtotalAmount)}</span>
                        <span className="w-24 text-right">{formatCurrency(section.subtotalNetPrice)}</span>
                        <span className="w-10"></span>
                      </div>
                    </div>

                    {/* Add Products/Services */}
                    <div className="px-3 py-2 border-t border-gray-200">
                      <button
                        onClick={() => addItemToSection(section.id, 'product')}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="inline h-3 w-3 mr-1" />
                        Add <span className="text-blue-600 hover:underline">Products</span> or{' '}
                        <span className="text-blue-600 hover:underline">Services</span> Rows
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Section Button */}
                <button
                  onClick={addSection}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                  Add Section
                </button>

                {/* Summary Footer */}
                <div className="mt-6 flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Items Total</span>
                      <input
                        type="text"
                        value={formatCurrency(itemsTotal)}
                        readOnly
                        className="w-32 h-8 px-2 border border-gray-300 rounded text-sm text-right bg-gray-50"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Discount</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={overallDiscount}
                          onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                          className="w-16 h-8 px-2 border border-gray-300 rounded text-sm text-right focus:outline-none focus:border-blue-500"
                        />
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value as '%' | 'fixed')}
                          className="h-8 px-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="%">%</option>
                          <option value="fixed">$</option>
                        </select>
                        <input
                          type="text"
                          value={formatCurrency(discountAmount)}
                          readOnly
                          className="w-24 h-8 px-2 border border-gray-300 rounded text-sm text-right bg-gray-50"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pre Tax Total</span>
                      <input
                        type="text"
                        value={formatCurrency(preTaxTotal)}
                        readOnly
                        className="w-32 h-8 px-2 border border-gray-300 rounded text-sm text-right bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'quote_details' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Quote Details</h3>
                <div className="grid grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Quote Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={quoteName}
                      onChange={(e) => setQuoteName(e.target.value)}
                      className="w-full h-9 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Deal Name</label>
                    <input
                      type="text"
                      value={dealName || ''}
                      readOnly
                      className="w-full h-9 px-3 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'address_details' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Address Details</h3>
                <p className="text-sm text-gray-500">Address details form will be here...</p>
              </div>
            )}

            {activeSection === 'terms_conditions' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Terms & Conditions</h3>
                <p className="text-sm text-gray-500">Terms & Conditions form will be here...</p>
              </div>
            )}

            {activeSection === 'description_details' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Description Details</h3>
                <p className="text-sm text-gray-500">Description details form will be here...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}