import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Loader2, Building2, User, Briefcase } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { useDebounce } from '../hooks/useDebounce';

// Generic entity picker component with search and inline creation
interface EntityPickerProps<T> {
  label: string;
  placeholder?: string;
  value?: T | null;
  onChange: (value: T | null) => void;
  onSearch: (searchTerm: string) => Promise<T[]>;
  onCreate?: () => void;
  getDisplayValue: (item: T) => string;
  getSecondaryValue?: (item: T) => string;
  renderIcon?: (item: T) => React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  allowCreate?: boolean;
}

export function EntityPicker<T extends { [key: string]: any }>({
  label,
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  onCreate,
  getDisplayValue,
  getSecondaryValue,
  renderIcon,
  className,
  disabled,
  required,
  allowCreate = true,
}: EntityPickerProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!isOpen || !debouncedSearch) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const data = await onSearch(debouncedSearch);
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearch, isOpen, onSearch]);

  const handleSelect = (item: T) => {
    onChange(item);
    setIsOpen(false);
    setSearchTerm('');
    setResults([]);
  };

  const handleClear = () => {
    onChange(null);
    setSearchTerm('');
    setResults([]);
  };

  const handleCreate = () => {
    if (onCreate) {
      onCreate();
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={cn('relative', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Selected Value Display */}
      {value ? (
        <div className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
          {renderIcon && <div className="flex-shrink-0">{renderIcon(value)}</div>}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {getDisplayValue(value)}
            </div>
            {getSecondaryValue && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {getSecondaryValue(value)}
              </div>
            )}
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              className="pl-10"
            />
          </div>

          {/* Dropdown Results */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Results Panel */}
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Searching...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="py-1">
                    {results.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {renderIcon && <div className="flex-shrink-0">{renderIcon(item)}</div>}
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {getDisplayValue(item)}
                          </div>
                          {getSecondaryValue && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {getSecondaryValue(item)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Type to search...
                  </div>
                )}

                {/* Create New Button */}
                {allowCreate && onCreate && searchTerm && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                    <button
                      type="button"
                      onClick={handleCreate}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create new "{searchTerm}"</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized Entity Pickers
interface CustomerPickerProps {
  value?: any;
  onChange: (value: any) => void;
  onSearch: (term: string) => Promise<any[]>;
  onCreate?: () => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function CustomerPicker({ value, onChange, onSearch, onCreate, className, disabled, required }: CustomerPickerProps) {
  return (
    <EntityPicker
      label="Customer"
      placeholder="Search customers..."
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      onCreate={onCreate}
      getDisplayValue={(item) => item.customerName}
      getSecondaryValue={(item) => item.customerCode}
      renderIcon={(item) => (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      className={className}
      disabled={disabled}
      required={required}
    />
  );
}

export function ContactPicker({ value, onChange, onSearch, onCreate, className, disabled, required }: CustomerPickerProps) {
  return (
    <EntityPicker
      label="Contact"
      placeholder="Search contacts..."
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      onCreate={onCreate}
      getDisplayValue={(item) => item.fullName}
      getSecondaryValue={(item) => item.email || item.phone}
      renderIcon={(item) => (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <User className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
      )}
      className={className}
      disabled={disabled}
      required={required}
    />
  );
}

export function DealPicker({ value, onChange, onSearch, onCreate, className, disabled, required }: CustomerPickerProps) {
  return (
    <EntityPicker
      label="Deal"
      placeholder="Search deals..."
      value={value}
      onChange={onChange}
      onSearch={onSearch}
      onCreate={onCreate}
      getDisplayValue={(item) => item.dealName}
      getSecondaryValue={(item) => `${item.stage} - ${item.dealValue?.toLocaleString()} ${item.currency}`}
      renderIcon={(item) => (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
          <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
      )}
      className={className}
      disabled={disabled}
      required={required}
    />
  );
}