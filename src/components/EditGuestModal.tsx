import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GuestData, Column } from '../types';

interface EditGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: GuestData | null;
  columns: Column[];
  statusTags: string[];
  onSubmit: (guest: GuestData) => void;
  isDarkMode: boolean;
}

export function EditGuestModal({
  isOpen,
  onClose,
  guest,
  columns,
  statusTags,
  onSubmit,
  isDarkMode
}: EditGuestModalProps) {
  const [formData, setFormData] = useState<GuestData>({
    id: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (guest) {
      setFormData(guest);
    } else {
      setFormData({ id: '', status: 'Pending' });
    }
  }, [guest]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-md mx-4 p-6 rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : ''}`}>
            {guest ? 'Edit Guest' : 'Add New Guest'}
          </h2>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-lg ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {columns.map(column => {
            if (column.type === 'checkbox') {
              return (
                <div key={column.id}>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData[column.id] || false}
                      onChange={(e) => setFormData({
                        ...formData,
                        [column.id]: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {column.name}
                    </span>
                  </label>
                </div>
              );
            }
            
            if (column.type === 'status') {
              return (
                <div key={column.id}>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {column.name}
                  </label>
                  <select
                    value={formData.status || 'Pending'}
                    onChange={(e) => setFormData({
                      ...formData,
                      status: e.target.value
                    })}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'border border-gray-300'
                    }`}
                  >
                    {statusTags.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (column.type === 'date') {
              return (
                <div key={column.id}>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {column.name}
                  </label>
                  <input
                    type="date"
                    value={formData[column.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      [column.id]: e.target.value
                    })}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'border border-gray-300'
                    }`}
                  />
                </div>
              );
            }
            
            return (
              <div key={column.id}>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {column.name}
                </label>
                <input
                  type={column.type === 'number' ? 'number' : 'text'}
                  value={formData[column.id] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    [column.id]: e.target.value
                  })}
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                      : 'border border-gray-300'
                  }`}
                  placeholder={`Enter ${column.name.toLowerCase()}...`}
                />
              </div>
            );
          })}
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`btn-secondary ${isDarkMode ? 'dark' : ''}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-primary ${isDarkMode ? 'dark' : ''}`}
            >
              {guest ? 'Save Changes' : 'Add Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}