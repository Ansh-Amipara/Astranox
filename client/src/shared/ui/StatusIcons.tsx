import { memo } from 'react';

interface Props {
  statusAilment?: string | null;
}

export const StatusIcons = memo(function StatusIcons({ statusAilment }: Props) {
  if (!statusAilment) return null;

  return (
    <div className="flex gap-1 mt-1">
      <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shadow-sm">
        {statusAilment}
      </span>
    </div>
  );
});
