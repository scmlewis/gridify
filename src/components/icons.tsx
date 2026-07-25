import { ICON_MAP as _ICON_MAP } from "./icon-data";

export { ICON_CATEGORIES } from "./icon-data";
export type { IconEntry, IconCategory } from "./icon-data";

export const ICON_MAP = _ICON_MAP;

export interface HabitIconProps {
  name?: string;
  size?: number;
  className?: string;
}

export function HabitIcon({ name, size = 24, className }: HabitIconProps) {
  if (!name) return null;
  const Icon = _ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}
