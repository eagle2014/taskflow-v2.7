import { MetadataFieldProps } from '../types';

export function MetadataField({ icon, label, value }: MetadataFieldProps) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="flex items-center gap-2 min-w-[130px]">
        {icon}
        <span className="text-sm text-[#838a9c] font-medium">{label}</span>
      </div>
      <div className="text-sm text-white flex-1">{value}</div>
    </div>
  );
}
