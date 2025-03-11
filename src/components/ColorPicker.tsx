import React from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  return (
    <div className="flex gap-2">
      {colors.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-full ${
            value === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}