const PRESET_COLORS = [
  { name: 'Ruby', value: '#E74C3C' },
  { name: 'Coral', value: '#EF6C4A' },
  { name: 'Gold', value: '#FFD23F' },
  { name: 'Lime', value: '#A8E635' },
  { name: 'Green', value: '#27AE60' },
  { name: 'Teal', value: '#2BA8A2' },
  { name: 'Sky', value: '#5DADE2' },
  { name: 'Ocean', value: '#2980B9' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#9B59B6' },
  { name: 'Pink', value: '#E84393' },
  { name: 'Rose', value: '#FD79A8' },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`h-8 w-8 rounded-full transition-all active:scale-90 ${
            value === color.value
              ? 'ring-2 ring-offset-2 ring-offset-surface-card'
              : 'hover:scale-110'
          }`}
          style={{
            backgroundColor: color.value,
            boxShadow: value === color.value ? `0 0 0 2px ${color.value}` : undefined,
          }}
          title={color.name}
          aria-label={`Select ${color.name}`}
        />
      ))}
    </div>
  );
}