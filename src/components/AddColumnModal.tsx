import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Column } from '../types';

interface AddColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (column: Column) => void;
}

export function AddColumnModal({ isOpen, onClose, onSubmit }: AddColumnModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Column['type']>('text');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add New Column</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            onSubmit({
              id: Date.now().toString(),
              name: name.trim(),
              type
            });
            setName('');
            setType('text');
          }
        }}>
          <div className="mb-4">
            <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-1">
              Column Name
            </label>
            <input
              type="text"
              id="columnName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter column name..."
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="columnType" className="block text-sm font-medium text-gray-700 mb-1">
              Column Type
            </label>
            <select
              id="columnType"
              value={type}
              onChange={(e) => setType(e.target.value as Column['type'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="checkbox">Checkbox</option>
              <option value="status">Status</option>
              <option value="task">Task</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary"
            >
              Add Column
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}