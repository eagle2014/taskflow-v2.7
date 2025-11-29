import { MetadataFieldProps } from '../types';

export function MetadataField({ icon, label, value }: MetadataFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-1 min-w-[120px]">
        {icon}
        <span className="text-xs text-[#838a9c] font-medium">{label}</span>
      </div>
      <div className="text-sm text-white flex-1">{value}</div>
    </div>
  );
}
