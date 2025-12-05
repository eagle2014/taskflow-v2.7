import React, { useState, useRef, useEffect } from 'react';
import {
  X, Search, ExternalLink, ChevronRight, ChevronDown,
  Plus, Building2, User, Info,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Image, Table, Link, AlignLeft, AlignRight,
  Smile, Maximize2, Loader2
} from 'lucide-react';
import { dealsApi } from '../services/api';

// Stage ID type matching DealsView
type StageId = 'ready_to_close' | 'new' | 'qualifying' | 'requirements' | 'value_proposition' | 'negotiation' | 'closed_won';

interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: StageId;
  probability: number;
  expectedCloseDate?: string;
  contactName?: string;
  organizationName?: string;
  pipeline?: string;
  assignedTo?: string;
  leadSource?: string;
  nextStep?: string;
  type?: string;
  campaignSource?: string;
  lostReason?: string;
  description?: string;
  customerId?: string;
}

// Map display stage names to StageId
const stageDisplayToId: Record<string, StageId> = {
  'Ready To Close': 'ready_to_close',
  'New': 'new',
  'Qualifying': 'qualifying',
  'Needs Analysis': 'qualifying',
  'Requirements Gathering': 'requirements',
  'Value Proposition': 'value_proposition',
  'Proposal/Price Quote': 'value_proposition',
  'Negotiation': 'negotiation',
  'Negotiation/Review': 'negotiation',
  'Closed Won': 'closed_won',
  'Closed Lost': 'closed_won',
};

// Map StageId to display name
const stageIdToDisplay: Record<StageId, string> = {
  'ready_to_close': 'Ready To Close',
  'new': 'New',
  'qualifying': 'Qualifying',
  'requirements': 'Requirements Gathering',
  'value_proposition': 'Value Proposition',
  'negotiation': 'Negotiation',
  'closed_won': 'Closed Won',
};

interface EditDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  onSave: (deal: Deal) => void;
}

type SectionType = 'deal_details' | 'description_details' | 'item_details';

// Dark mode color palette
const colors = {
  bg: '#1f2330',
  bgSecondary: '#292d39',
  bgTertiary: '#323845',
  border: '#3d4457',
  borderLight: '#4a5168',
  text: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#838a9c',
  accent: '#0394ff',
  accentHover: '#0284e8',
  danger: '#ef4444',
  inputBg: '#292d39',
};

const EditDealDialog: React.FC<EditDealDialogProps> = ({ isOpen, onClose, deal, onSave }) => {
  const [expandedSections, setExpandedSections] = useState<SectionType[]>(['deal_details', 'description_details']);
  const [activeSection, setActiveSection] = useState<SectionType>('deal_details');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [dealName, setDealName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('VND-đ');
  const [organizationName, setOrganizationName] = useState('');
  const [contactName, setContactName] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [pipeline, setPipeline] = useState('Standard');
  const [salesStage, setSalesStage] = useState('Qualifying');
  const [assignedTo, setAssignedTo] = useState('');
  const [leadSource, setLeadSource] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [dealType, setDealType] = useState('');
  const [probability, setProbability] = useState('');
  const [campaignSource, setCampaignSource] = useState('');
  const [weightedRevenue, setWeightedRevenue] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [description, setDescription] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resize state
  const [size, setSize] = useState({ width: 1100, height: 750 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });

  const dialogRef = useRef<HTMLDivElement>(null);
  const minWidth = 900;
  const minHeight = 600;

  // Initialize form with deal data
  useEffect(() => {
    if (deal) {
      setDealName(deal.name || '');
      setAmount(deal.amount?.toString() || '');
      setOrganizationName(deal.organizationName || '');
      setContactName(deal.contactName || '');
      setExpectedCloseDate(deal.expectedCloseDate || '');
      setPipeline(deal.pipeline || 'Standard');
      // Convert StageId to display name for select
      setSalesStage(stageIdToDisplay[deal.stage] || 'Qualifying');
      setAssignedTo(deal.assignedTo || '');
      setLeadSource(deal.leadSource || '');
      setNextStep(deal.nextStep || '');
      setDealType(deal.type || '');
      setProbability(deal.probability?.toString() || '');
      setCampaignSource(deal.campaignSource || '');
      setLostReason(deal.lostReason || '');
      setDescription(deal.description || '');

      const amt = parseFloat(deal.amount?.toString() || '0');
      const prob = parseFloat(deal.probability?.toString() || '0');
      setWeightedRevenue(((amt * prob) / 100).toLocaleString());
    }
  }, [deal]);

  // Center dialog on open
  useEffect(() => {
    if (isOpen) {
      setPosition({
        x: Math.max(0, (window.innerWidth - size.width) / 2),
        y: Math.max(20, (window.innerHeight - size.height) / 2 - 30)
      });
    }
  }, [isOpen, size.width, size.height]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.dialog-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }

      if (isResizing && resizeDirection) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.posX;
        let newY = resizeStart.posY;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minWidth, resizeStart.width + deltaX);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(minWidth, resizeStart.width - deltaX);
          if (newWidth > minWidth) {
            newX = resizeStart.posX + deltaX;
          }
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minHeight, resizeStart.height + deltaY);
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(minHeight, resizeStart.height - deltaY);
          if (newHeight > minHeight) {
            newY = resizeStart.posY + deltaY;
          }
        }

        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isResizing, resizeDirection, resizeStart, minWidth, minHeight]);

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y
    });
  };

  const toggleSection = (section: SectionType) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
    setActiveSection(section);
  };

  const handleSave = async () => {
    if (!deal) return;

    // Convert display stage name to StageId
    const stageId = stageDisplayToId[salesStage] || deal.stage;
    const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Call API to update deal - customerId is required by backend
      await dealsApi.update(deal.id, {
        customerId: deal.customerId,
        dealName: dealName,
        dealValue: parsedAmount,
        stage: stageIdToDisplay[stageId], // API expects display name format
        probability: parseFloat(probability) || 0,
        expectedCloseDate: expectedCloseDate || undefined,
        description: description || undefined,
        lostReason: lostReason || undefined,
        source: leadSource || undefined,
      });

      // Update local state via callback
      onSave({
        ...deal,
        name: dealName,
        amount: parsedAmount,
        organizationName,
        contactName,
        expectedCloseDate,
        pipeline,
        stage: stageId,
        assignedTo,
        leadSource,
        nextStep,
        type: dealType,
        probability: parseFloat(probability) || 0,
        campaignSource,
        lostReason,
        description
      });
      onClose();
    } catch (err) {
      console.error('Failed to update deal:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save deal');
    } finally {
      setIsSaving(false);
    }
  };

  // Update weighted revenue
  useEffect(() => {
    const amt = parseFloat(amount.replace(/,/g, '')) || 0;
    const prob = parseFloat(probability) || 0;
    setWeightedRevenue(((amt * prob) / 100).toLocaleString());
  }, [amount, probability]);

  if (!isOpen || !deal) return null;

  const sections = [
    { id: 'deal_details' as SectionType, label: 'Deal Details' },
    { id: 'description_details' as SectionType, label: 'Description Details' },
    { id: 'item_details' as SectionType, label: 'Item Details' },
  ];

  // Input styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.text,
    fontSize: '14px',
    outline: 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const buttonIconStyle: React.CSSProperties = {
    padding: '8px',
    backgroundColor: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    color: colors.textMuted,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Form field component - label on left, input on right
  const FormRow = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <label style={{
        width: '160px',
        textAlign: 'right',
        fontSize: '14px',
        color: colors.textMuted,
        paddingTop: '8px',
        flexShrink: 0
      }}>
        {required && <span style={{ color: colors.danger }}>* </span>}
        {label}
      </label>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={onClose} />

      {/* Dialog - Dark Mode */}
      <div
        ref={dialogRef}
        style={{
          position: 'absolute',
          width: `${size.width}px`,
          height: `${size.height}px`,
          left: position.x,
          top: position.y,
          backgroundColor: colors.bg,
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          cursor: isDragging ? 'grabbing' : 'default',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Resize Handles */}
        <div style={{ position: 'absolute', top: -4, left: -4, width: 12, height: 12, cursor: 'nw-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'nw')} />
        <div style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, cursor: 'ne-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'ne')} />
        <div style={{ position: 'absolute', bottom: -4, left: -4, width: 12, height: 12, cursor: 'sw-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'sw')} />
        <div style={{ position: 'absolute', bottom: -4, right: -4, width: 12, height: 12, cursor: 'se-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'se')} />
        <div style={{ position: 'absolute', top: -4, left: 12, right: 12, height: 8, cursor: 'n-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'n')} />
        <div style={{ position: 'absolute', bottom: -4, left: 12, right: 12, height: 8, cursor: 's-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 's')} />
        <div style={{ position: 'absolute', left: -4, top: 12, bottom: 12, width: 8, cursor: 'w-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'w')} />
        <div style={{ position: 'absolute', right: -4, top: 12, bottom: 12, width: 8, cursor: 'e-resize', zIndex: 10 }} onMouseDown={(e) => handleResizeStart(e, 'e')} />

        {/* Header */}
        <div
          className="dialog-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.border}`,
            cursor: 'grab',
            flexShrink: 0,
            backgroundColor: colors.bg,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: colors.text, margin: 0 }}>
            Editing Deal : {deal.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Type to search"
                style={{
                  paddingLeft: 36,
                  paddingRight: 12,
                  paddingTop: 6,
                  paddingBottom: 6,
                  backgroundColor: colors.bgSecondary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: 192,
                  color: colors.text,
                  outline: 'none',
                }}
              />
            </div>
            <button style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
              <ExternalLink style={{ width: 16, height: 16, color: colors.textMuted }} />
            </button>
            <button onClick={onClose} style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
              <X style={{ width: 16, height: 16, color: colors.textMuted }} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          <div style={{
            width: sidebarCollapsed ? 48 : 192,
            backgroundColor: colors.bgSecondary,
            borderRight: `1px solid ${colors.border}`,
            paddingTop: 12,
            paddingBottom: 12,
            flexShrink: 0,
            transition: 'width 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: 8 }}>
              {!sidebarCollapsed && <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textSecondary }}>Sections</span>}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{ padding: 4, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
              >
                <ChevronRight style={{ width: 16, height: 16, color: colors.textMuted, transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>
            {!sidebarCollapsed && sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  if (!expandedSections.includes(section.id)) {
                    setExpandedSections([...expandedSections, section.id]);
                  }
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: '14px',
                  backgroundColor: activeSection === section.id ? colors.bgTertiary : 'transparent',
                  color: activeSection === section.id ? colors.accent : colors.textSecondary,
                  border: 'none',
                  borderLeft: activeSection === section.id ? `2px solid ${colors.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, backgroundColor: colors.bg }}>
            {/* Deal Details Section */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => toggleSection('deal_details')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: 16,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {expandedSections.includes('deal_details') ? (
                  <ChevronDown style={{ width: 16, height: 16 }} />
                ) : (
                  <ChevronRight style={{ width: 16, height: 16 }} />
                )}
                Deal Details
              </button>

              {expandedSections.includes('deal_details') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                  {/* Row 1 */}
                  <FormRow label="Deal Name" required>
                    <input
                      type="text"
                      value={dealName}
                      onChange={(e) => setDealName(e.target.value)}
                      style={inputStyle}
                    />
                  </FormRow>
                  <FormRow label="Amount">
                    <div style={{ display: 'flex' }}>
                      <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{ ...selectStyle, width: 'auto', borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      >
                        <option value="VND-đ">VND-đ</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </FormRow>

                  {/* Row 2 */}
                  <FormRow label="Organization Name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          style={{ ...inputStyle, paddingRight: 32 }}
                        />
                        <Search style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: colors.textMuted }} />
                      </div>
                      <button style={buttonIconStyle}>
                        <Building2 style={{ width: 16, height: 16 }} />
                      </button>
                      <button style={buttonIconStyle}>
                        <Plus style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </FormRow>
                  <FormRow label="Contact Name">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Type to search"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button style={buttonIconStyle}>
                        <User style={{ width: 16, height: 16 }} />
                      </button>
                      <button style={buttonIconStyle}>
                        <Plus style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </FormRow>

                  {/* Row 3 */}
                  <FormRow label="Expected Close Date" required>
                    <input
                      type="date"
                      value={expectedCloseDate}
                      onChange={(e) => setExpectedCloseDate(e.target.value)}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                    />
                  </FormRow>
                  <FormRow label="Pipeline" required>
                    <select
                      value={pipeline}
                      onChange={(e) => setPipeline(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="Standard">Standard</option>
                      <option value="Sales Pipeline">Sales Pipeline</option>
                      <option value="Partner Pipeline">Partner Pipeline</option>
                    </select>
                  </FormRow>

                  {/* Row 4 */}
                  <FormRow label="Sales Stage" required>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <select
                        value={salesStage}
                        onChange={(e) => setSalesStage(e.target.value)}
                        style={{ ...selectStyle, flex: 1 }}
                      >
                        <option value="Qualifying">Qualifying</option>
                        <option value="Needs Analysis">Needs Analysis</option>
                        <option value="Value Proposition">Value Proposition</option>
                        <option value="Proposal/Price Quote">Proposal/Price Quote</option>
                        <option value="Negotiation/Review">Negotiation/Review</option>
                        <option value="Closed Won">Closed Won</option>
                        <option value="Closed Lost">Closed Lost</option>
                      </select>
                      <Info style={{ width: 16, height: 16, color: colors.textMuted }} />
                    </div>
                  </FormRow>
                  <FormRow label="Assigned To" required>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select</option>
                      <option value="tr nguyen">tr nguyen</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </FormRow>

                  {/* Row 5 */}
                  <FormRow label="Lead Source">
                    <select
                      value={leadSource}
                      onChange={(e) => setLeadSource(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select an Option</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Existing Customer">Existing Customer</option>
                      <option value="Word of mouth">Word of mouth</option>
                      <option value="Website">Website</option>
                      <option value="Partner">Partner</option>
                    </select>
                  </FormRow>
                  <FormRow label="Next Step">
                    <input
                      type="text"
                      value={nextStep}
                      onChange={(e) => setNextStep(e.target.value)}
                      style={inputStyle}
                    />
                  </FormRow>

                  {/* Row 6 */}
                  <FormRow label="Type">
                    <select
                      value={dealType}
                      onChange={(e) => setDealType(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select an Option</option>
                      <option value="Existing Business">Existing Business</option>
                      <option value="New Business">New Business</option>
                    </select>
                  </FormRow>
                  <FormRow label="Probability">
                    <div style={{ display: 'flex' }}>
                      <input
                        type="text"
                        value={probability}
                        onChange={(e) => setProbability(e.target.value)}
                        style={{ ...inputStyle, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <span style={{
                        padding: '8px 12px',
                        backgroundColor: colors.bgTertiary,
                        border: `1px solid ${colors.border}`,
                        borderLeft: 'none',
                        borderTopRightRadius: '4px',
                        borderBottomRightRadius: '4px',
                        fontSize: '14px',
                        color: colors.textMuted
                      }}>
                        %
                      </span>
                    </div>
                  </FormRow>

                  {/* Row 7 */}
                  <FormRow label="Campaign Source">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="text"
                        value={campaignSource}
                        onChange={(e) => setCampaignSource(e.target.value)}
                        placeholder="Type to search"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button style={buttonIconStyle}>
                        <ExternalLink style={{ width: 16, height: 16 }} />
                      </button>
                      <button style={buttonIconStyle}>
                        <Plus style={{ width: 16, height: 16 }} />
                      </button>
                    </div>
                  </FormRow>
                  <FormRow label="Weighted Revenue">
                    <div style={{ display: 'flex' }}>
                      <input
                        type="text"
                        value={weightedRevenue}
                        readOnly
                        style={{ ...inputStyle, backgroundColor: colors.bgTertiary, color: colors.textMuted, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      />
                      <select
                        value={currency}
                        style={{ ...selectStyle, width: 'auto', borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, backgroundColor: colors.bgTertiary }}
                        disabled
                      >
                        <option value="VND-đ">VND-đ</option>
                      </select>
                    </div>
                  </FormRow>

                  {/* Row 8 */}
                  <FormRow label="Lost Reason">
                    <select
                      value={lostReason}
                      onChange={(e) => setLostReason(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Select an Option</option>
                      <option value="Competition">Competition</option>
                      <option value="Budget">Budget</option>
                      <option value="No Response">No Response</option>
                      <option value="Timing">Timing</option>
                    </select>
                  </FormRow>
                </div>
              )}
            </div>

            {/* Description Details Section */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => toggleSection('description_details')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: 16,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {expandedSections.includes('description_details') ? (
                  <ChevronDown style={{ width: 16, height: 16 }} />
                ) : (
                  <ChevronRight style={{ width: 16, height: 16 }} />
                )}
                Description Details
              </button>

              {expandedSections.includes('description_details') && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <label style={{ width: 160, textAlign: 'right', fontSize: '14px', color: colors.textMuted, paddingTop: 8, flexShrink: 0 }}>
                    Description
                  </label>
                  <div style={{ flex: 1 }}>
                    {/* Rich Text Editor Toolbar */}
                    <div style={{
                      backgroundColor: colors.bgSecondary,
                      border: `1px solid ${colors.border}`,
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      flexWrap: 'wrap'
                    }}>
                      {[Bold, Italic, Underline, Strikethrough].map((Icon, i) => (
                        <button key={i} style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                          <Icon style={{ width: 16, height: 16, color: colors.textMuted }} />
                        </button>
                      ))}
                      <div style={{ width: 1, height: 20, backgroundColor: colors.border, margin: '0 4px' }} />
                      <select style={{ fontSize: '12px', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '4px', padding: '4px 6px', color: colors.textMuted }}>
                        <option>Size</option>
                      </select>
                      <select style={{ fontSize: '12px', backgroundColor: colors.bgTertiary, border: `1px solid ${colors.border}`, borderRadius: '4px', padding: '4px 6px', marginLeft: 4, color: colors.textMuted }}>
                        <option>Font</option>
                      </select>
                      <div style={{ width: 1, height: 20, backgroundColor: colors.border, margin: '0 4px' }} />
                      {[List, ListOrdered, AlignLeft, AlignRight].map((Icon, i) => (
                        <button key={i} style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                          <Icon style={{ width: 16, height: 16, color: colors.textMuted }} />
                        </button>
                      ))}
                      <div style={{ width: 1, height: 20, backgroundColor: colors.border, margin: '0 4px' }} />
                      {[Image, Table, Link].map((Icon, i) => (
                        <button key={i} style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                          <Icon style={{ width: 16, height: 16, color: colors.textMuted }} />
                        </button>
                      ))}
                      <div style={{ width: 1, height: 20, backgroundColor: colors.border, margin: '0 4px' }} />
                      <button style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 500, color: colors.textMuted }}>T<sub>x</sub></span>
                      </button>
                      <button style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        <Smile style={{ width: 16, height: 16, color: colors.textMuted }} />
                      </button>
                      <div style={{ flex: 1 }} />
                      <button style={{ padding: 6, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        <Maximize2 style={{ width: 16, height: 16, color: colors.textMuted }} />
                      </button>
                    </div>

                    {/* Text Area */}
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: colors.inputBg,
                        border: `1px solid ${colors.border}`,
                        borderTop: 'none',
                        borderBottomLeftRadius: '4px',
                        borderBottomRightRadius: '4px',
                        fontSize: '14px',
                        color: colors.text,
                        outline: 'none',
                        minHeight: 120,
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Item Details Section */}
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={() => toggleSection('item_details')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.textSecondary,
                  marginBottom: 16,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {expandedSections.includes('item_details') ? (
                  <ChevronDown style={{ width: 16, height: 16 }} />
                ) : (
                  <ChevronRight style={{ width: 16, height: 16 }} />
                )}
                Item Details
              </button>

              {expandedSections.includes('item_details') && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 160 }} />
                  <div style={{
                    flex: 1,
                    border: `2px dashed ${colors.border}`,
                    borderRadius: '4px',
                    padding: 24,
                    textAlign: 'center',
                  }}>
                    <p style={{ color: colors.textMuted, fontSize: '14px', margin: 0 }}>No items added yet.</p>
                    <button style={{
                      marginTop: 8,
                      padding: '8px 16px',
                      backgroundColor: colors.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}>
                      + Add Products/Services
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.bgSecondary,
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          flexShrink: 0,
        }}>
          {/* Error message */}
          <div style={{ flex: 1 }}>
            {saveError && (
              <span style={{ color: colors.danger, fontSize: '14px' }}>{saveError}</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '8px 24px',
              backgroundColor: isSaving ? colors.bgTertiary : colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSaving && <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />}
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDealDialog;