import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function CreateListModal({ isOpen, onClose, onSubmit }: CreateListModalProps) {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New List</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            onSubmit(name.trim());
            setName('');
          }
        }}>
          <div className="mb-4">
            <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              type="text"
              id="listName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter list name..."
              autoFocus
            />
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
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}