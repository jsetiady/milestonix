import { getAssigneeColor, getAssigneeInitials } from '../utils/colors';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  showName?: boolean;
}

export function Avatar({ name, size = 'sm', showName = false }: AvatarProps) {
  const color = getAssigneeColor(name);
  const initials = getAssigneeInitials(name);
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`${dim} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </span>
      {showName && (
        <span className="text-text-primary text-xs truncate">{name}</span>
      )}
    </span>
  );
}
