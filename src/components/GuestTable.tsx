import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronDown, Edit, Eye, EyeOff, Trash2, Settings, GripVertical, X, Calculator } from 'lucide-react';
import { List, GuestData, Column } from '../types';
import { ColorPicker } from './ColorPicker';
import { EditGuestModal } from './EditGuestModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface GuestTableProps {
  list: List;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddColumn: () => void;
  onUpdateList: (list: List) => void;
  isDarkMode: boolean;
}

interface ColumnFilter {
  column: string;
  value: string;
  type: 'text' | 'date' | 'number' | 'status';
}

export function GuestTable({
  list,
  searchTerm,
  onSearchChange,
  onAddColumn,
  onUpdateList,
  isDarkMode
}: GuestTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [editingGuest, setEditingGuest] = useState<GuestData | null>(null);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [showColumnSummary, setShowColumnSummary] = useState<boolean>(false);

  const addGuest = (guest: GuestData) => {
    onUpdateList({
      ...list,
      guests: [...list.guests, { ...guest, id: Date.now().toString() }]
    });
    setIsAddingGuest(false);
  };

  const updateGuest = (guest: GuestData) => {
    onUpdateList({
      ...list,
      guests: list.guests.map(g => g.id === guest.id ? guest : g)
    });
    setEditingGuest(null);
  };

  const deleteGuest = (id: string) => {
    onUpdateList({
      ...list,
      guests: list.guests.filter(g => g.id !== id)
    });
    setShowDeleteConfirm(null);
  };

  const toggleColumnVisibility = (columnId: string) => {
    onUpdateList({
      ...list,
      columns: list.columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    });
  };

  const removeColumn = (columnId: string) => {
    onUpdateList({
      ...list,
      columns: list.columns.filter(col => col.id !== columnId)
    });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(list.columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedColumns = items.map((col, index) => ({
      ...col,
      order: index
    }));

    onUpdateList({
      ...list,
      columns: updatedColumns
    });
  };

  const addFilter = (column: Column) => {
    setFilters([...filters, { column: column.id, value: '', type: column.type === 'date' ? 'date' : 'text' }]);
  };

  const updateFilter = (index: number, value: string) => {
    const newFilters = [...filters];
    newFilters[index].value = value;
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateColumnSummary = (column: Column) => {
    if (!column || !list.guests.length) return null;

    const values = list.guests.map(guest => guest[column.id]);
    
    if (column.type === 'number') {
      const sum = values.reduce((acc: number, val: number) => acc + (Number(val) || 0), 0);
      return { total: sum, count: values.length };
    }
    
    if (column.type === 'checkbox') {
      const checked = values.filter(Boolean).length;
      return { checked, total: values.length };
    }

    return { count: values.length };
  };

  const filteredGuests = useMemo(() => {
    return list.guests.filter(guest => {
      // Global search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = list.columns.some(column => {
          const value = guest[column.id];
          if (value === undefined || value === null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Column-specific filters
      return filters.every(filter => {
        const value = guest[filter.column];
        if (!value) return false;

        switch (filter.type) {
          case 'date':
            const filterDate = new Date(filter.value);
            const valueDate = new Date(value);
            return filterDate.getTime() === valueDate.getTime();
          
          case 'number':
            return Number(value) === Number(filter.value);
          
          case 'status':
            return value === filter.value;
          
          default:
            return String(value).toLowerCase().includes(filter.value.toLowerCase());
        }
      });
    });
  }, [list.guests, searchTerm, filters]);

  const visibleColumns = list.columns
    .filter(col => col.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="h-full flex flex-col">
      {/* Table Controls */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          <button
            onClick={() => setIsAddingGuest(true)}
            className={`btn-primary ${isDarkMode ? 'dark' : ''} col-span-2 sm:col-auto sm:order-last`}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Guest</span>
            <span className="sm:hidden">New</span>
          </button>

          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className={`btn-secondary ${isDarkMode ? 'dark' : ''}`}
          >
            <Settings className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Column Settings</span>
            <span className="sm:hidden">Columns</span>
          </button>

          <button
            onClick={onAddColumn}
            className={`btn-secondary ${isDarkMode ? 'dark' : ''}`}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Column</span>
            <span className="sm:hidden">Column</span>
          </button>

          <button
            onClick={() => setShowColumnSummary(!showColumnSummary)}
            className={`btn-secondary ${isDarkMode ? 'dark' : ''}`}
          >
            <Calculator className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Show Summary</span>
            <span className="sm:hidden">Summary</span>
          </button>
        </div>

        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <div
                key={`filter-${index}`}
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {list.columns.find(col => col.id === filter.column)?.name}: {filter.value}
                </span>
                <button
                  onClick={() => removeFilter(index)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
              <th className={`sticky left-0 px-4 py-3 text-left text-sm font-semibold ${
                isDarkMode ? 'text-gray-200 border-gray-700 bg-gray-800' : 'text-gray-600 border-gray-200 bg-gray-50'
              } border-b whitespace-nowrap z-10`}>
                Actions
              </th>
              {visibleColumns.map(column => (
                <th
                  key={column.id}
                  className={`px-4 py-3 text-left text-sm font-semibold ${
                    isDarkMode ? 'text-gray-200 border-gray-700' : 'text-gray-600 border-gray-200'
                  } border-b whitespace-nowrap`}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.name}</span>
                    <button
                      onClick={() => addFilter(column)}
                      className={`p-1 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest) => (
              <tr
                key={guest.id}
                className={`border-b ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <td className={`sticky left-0 px-4 py-3 ${
                  isDarkMode ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingGuest(guest)}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                      title="Edit guest"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(guest.id)}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                      title="Delete guest"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
                {visibleColumns.map(column => (
                  <td key={column.id} className="px-4 py-3">
                    {column.type === 'date' ? (
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>
                        {guest[column.id] ? formatDate(guest[column.id]) : ''}
                      </span>
                    ) : column.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={guest[column.id] || false}
                        onChange={(e) => {
                          const updatedGuest = {
                            ...guest,
                            [column.id]: e.target.checked
                          };
                          updateGuest(updatedGuest);
                        }}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    ) : column.type === 'status' ? (
                      <div className="relative inline-block">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            guest.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            guest.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            guest.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {guest.status}
                        </span>
                      </div>
                    ) : (
                      <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-900'} text-sm`}>
                        {guest[column.id] !== undefined ? guest[column.id] : ''}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {showColumnSummary && (
            <tfoot className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-t`}>
              <tr>
                <td className={`px-4 py-3 font-semibold ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Summary
                </td>
                {visibleColumns.map(column => {
                  const summary = calculateColumnSummary(column);
                  return (
                    <td key={`summary-${column.id}`} className={`px-4 py-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      {summary && (
                        column.type === 'number' ? (
                          `Total: ${summary.total}`
                        ) : column.type === 'checkbox' ? (
                          `${summary.checked}/${summary.total}`
                        ) : (
                          `Count: ${summary.count}`
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Column Settings Menu */}
      {showColumnMenu && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="column-settings-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowColumnMenu(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className={`relative w-full sm:w-96 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-full flex flex-col py-4 sm:py-6 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="px-4">
                  <div className="flex items-center justify-between">
                    <h2 
                      id="column-settings-title" 
                      className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      Column Settings
                    </h2>
                    <button
                      onClick={() => setShowColumnMenu(false)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'}`}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 relative flex-1 px-4 overflow-y-auto">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="columns">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-2"
                        >
                          {list.columns.map((column, index) => (
                            <Draggable
                              key={column.id}
                              draggableId={column.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-4 rounded-lg ${
                                    isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                                  } flex items-center justify-between gap-3`}
                                >
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                  </div>
                                  <div className="flex items-center gap-3 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={column.visible !== false}
                                      onChange={() => toggleColumnVisibility(column.id)}
                                      className="w-5 h-5 text-blue-600 rounded border-gray-300"
                                    />
                                    <span className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'} text-base`}>
                                      {column.name}
                                    </span>
                                  </div>
                                  {column.type !== 'status' && (
                                    <button
                                      onClick={() => removeColumn(column.id)}
                                      className={`p-2 rounded-lg ${
                                        isDarkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-200'
                                      }`}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-sm p-6 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : ''}`}>
              Confirm Delete
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this guest? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={`btn-secondary ${isDarkMode ? 'dark' : ''}`}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGuest(showDeleteConfirm)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      <EditGuestModal
        isOpen={editingGuest !== null || isAddingGuest}
        onClose={() => {
          setEditingGuest(null);
          setIsAddingGuest(false);
        }}
        guest={editingGuest}
        columns={list.columns}
        statusTags={list.statusTags}
        onSubmit={editingGuest ? updateGuest : addGuest}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}