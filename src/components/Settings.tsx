import { useState } from 'react';
import {
  Users, Settings as SettingsIcon, Grid3X3, HardDrive,
  ChevronLeft, Search, User as UserIcon
} from 'lucide-react';
import { User as UserType } from '../services/api';

interface SettingsProps {
  currentUser: UserType | null;
}

// Dark mode color palette
const colors = {
  bg: '#1f2330',
  bgSecondary: '#292d39',
  bgTertiary: '#323845',
  border: '#3d4457',
  text: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#838a9c',
  accent: '#0394ff',
  accentHover: '#0284e8',
  purple: '#7c3aed',
  yellow: '#eab308',
  green: '#22c55e',
};

// Settings menu structure based on VTiger
const settingsMenu = {
  userManagement: {
    title: 'User Management',
    items: ['Users', 'Authentication', 'Roles', 'Profiles', 'Sharing Rules', 'Groups', 'Login History', 'Support Access', 'Settings Log', 'Encrypted Field Access Logs', 'User Hierarchy', 'Webhook Logs']
  },
  moduleManagement: {
    title: 'Module Management',
    items: ['Modules', 'Module Layouts & Fields', 'Module Builder', 'Labels Editor', 'Module Numbering']
  },
  automation: {
    title: 'Automation',
    items: ['Webforms', 'DataMigration', 'Mailroom', 'Scheduler', 'Workflows', 'Assignment Rules', 'Approvals', 'CSAT Surveys']
  },
  configuration: {
    title: 'Configuration',
    items: ['Company Details', 'Maps', 'Storage Guard', 'Business Hours', 'Customer Portal', 'Currencies', 'Email Settings', 'Configuration Editor', 'Global Picklists', 'Picklist Field Values', 'Picklist Dependencies', 'Usage Details', 'Timelog Settings', 'Your Edition Limits', "Blocked IP's", 'Whitelisted IPs & Domains']
  },
  marketingSales: {
    title: 'Marketing & Sales',
    items: ['Profile Scoring', 'Lead Conversion Data Mapping', 'Deal to Project Mapping', 'Forecast and Quota Settings', 'Pipelines & Stages']
  },
  support: {
    title: 'Support',
    items: ['SLA Policies']
  },
  extensions: {
    title: 'Extensions',
    items: ['Add-ons', 'Google', 'Vtiger for Gmail', 'Vtiger Buzz', 'Office365', 'Phone Configuration', 'SMS Provider Configuration', 'Mail Chimp', 'Facebook']
  },
  mobileApp: {
    title: 'Mobile App',
    items: ['Configuration']
  },
  inventory: {
    title: 'Inventory',
    items: ['Tax Management', 'Terms and Conditions', 'Payment Gateway Configuration', 'Stock Management']
  },
  myPreferences: {
    title: 'My Preferences',
    items: ['My Preferences', 'Calendar Settings', 'My Tags']
  },
  websense: {
    title: 'Websense',
    items: ['Trackers', 'Widgets']
  }
};

// Stats cards data
const statsCards = [
  { icon: Users, count: 1, label: 'Users', color: '#0ea5e9' },
  { icon: SettingsIcon, count: 21, label: 'Workflows', color: '#7c3aed' },
  { icon: Grid3X3, count: 80, label: 'Modules', color: '#eab308' },
  { icon: HardDrive, count: '0.05', total: '15', unit: 'GB', label: 'Used', color: '#22c55e' },
];

export function Settings({ currentUser }: SettingsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter menu items based on search
  const filterItems = (items: string[]) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleItemClick = (item: string) => {
    console.log('Navigate to:', item);
    // TODO: Implement navigation to specific settings page
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      color: colors.text,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bg,
      }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: colors.accent,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <ChevronLeft style={{ width: 20, height: 20 }} />
          Back to CRM
        </button>
        <button
          style={{
            padding: 8,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '50%',
          }}
        >
          <UserIcon style={{ width: 24, height: 24, color: colors.textMuted }} />
        </button>
      </div>

      {/* Breadcrumb */}
      <div style={{
        padding: '12px 24px',
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.bgSecondary,
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: colors.textSecondary }}>HOME</span>
      </div>

      {/* Stats Cards */}
      <div style={{
        padding: '24px',
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 24px',
                backgroundColor: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                minWidth: 180,
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                backgroundColor: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon style={{ width: 24, height: 24, color: '#fff' }} />
              </div>
              <div>
                {card.total ? (
                  <div style={{ fontSize: '20px', fontWeight: 600, color: colors.text }}>
                    <span style={{ color: card.color }}>{card.count}</span>
                    <span style={{ color: colors.textMuted }}> / {card.total}</span>
                    <span style={{ fontSize: '12px', color: colors.textMuted }}>{card.unit}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '24px', fontWeight: 600, color: colors.text }}>
                    {card.count}
                  </div>
                )}
                <div style={{ fontSize: '14px', color: colors.textMuted }}>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Box */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '0 24px 24px',
      }}>
        <div style={{ position: 'relative', width: 280 }}>
          <Search style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            color: colors.textMuted,
          }} />
          <input
            type="text"
            placeholder="Type to search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              backgroundColor: colors.bgSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              color: colors.text,
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Settings Menu Grid */}
      <div style={{
        padding: '0 24px 48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '32px 48px',
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {/* Column 1: User Management & Module Management */}
        <div>
          <SettingsSection
            title={settingsMenu.userManagement.title}
            items={filterItems(settingsMenu.userManagement.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.moduleManagement.title}
            items={filterItems(settingsMenu.moduleManagement.items)}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Column 2: Automation & Configuration */}
        <div>
          <SettingsSection
            title={settingsMenu.automation.title}
            items={filterItems(settingsMenu.automation.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.configuration.title}
            items={filterItems(settingsMenu.configuration.items)}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Column 3: Marketing & Sales, Support, Extensions, Mobile App */}
        <div>
          <SettingsSection
            title={settingsMenu.marketingSales.title}
            items={filterItems(settingsMenu.marketingSales.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.support.title}
            items={filterItems(settingsMenu.support.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.extensions.title}
            items={filterItems(settingsMenu.extensions.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.mobileApp.title}
            items={filterItems(settingsMenu.mobileApp.items)}
            onItemClick={handleItemClick}
          />
        </div>

        {/* Column 4: Inventory, My Preferences, Websense */}
        <div>
          <SettingsSection
            title={settingsMenu.inventory.title}
            items={filterItems(settingsMenu.inventory.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.myPreferences.title}
            items={filterItems(settingsMenu.myPreferences.items)}
            onItemClick={handleItemClick}
          />
          <SettingsSection
            title={settingsMenu.websense.title}
            items={filterItems(settingsMenu.websense.items)}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
    </div>
  );
}

// Settings Section Component
interface SettingsSectionProps {
  title: string;
  items: string[];
  onItemClick: (item: string) => void;
}

function SettingsSection({ title, items, onItemClick }: SettingsSectionProps) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: 600,
        color: colors.text,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        {title}
      </h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => onItemClick(item)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '6px 0',
                backgroundColor: 'transparent',
                border: 'none',
                color: colors.accent,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.accentHover;
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.accent;
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}