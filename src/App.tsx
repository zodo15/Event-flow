import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Plus, Download, Upload, X, Search, Moon, Sun, Users } from 'lucide-react';
import { List, Column, GuestData } from './types';
import { ListPanel } from './components/ListPanel';
import { CreateListModal } from './components/CreateListModal';
import { AddColumnModal } from './components/AddColumnModal';
import { GuestTable } from './components/GuestTable';
import { EmptyState } from './components/EmptyState';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
const pdfjsWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

function App() {
  const [lists, setLists] = useState<List[]>([]);
  const [currentList, setCurrentList] = useState<List | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const savedLists = localStorage.getItem('guestLists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guestLists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const createList = (name: string) => {
    const newList: List = {
      id: Date.now().toString(),
      name,
      columns: [
        { id: 'name', name: 'Name', type: 'text', order: 0 },
        { id: 'email', name: 'Email', type: 'text', order: 1 },
        { id: 'phone', name: 'Phone', type: 'text', order: 2 },
        { id: 'status', name: 'Status', type: 'status', order: 3 },
        { id: 'arrival', name: 'Arrived', type: 'checkbox', order: 4 },
        { id: 'luggage', name: 'Luggage', type: 'checkbox', order: 5 }
      ],
      guests: [],
      tasks: [],
      categories: ['General'],
      statusTags: ['Pending', 'Confirmed', 'Cancelled']
    };
    setLists([...lists, newList]);
    setCurrentList(newList);
    setIsCreateModalOpen(false);
  };

  const exportToExcel = () => {
    if (!currentList) return;

    const visibleColumns = currentList.columns
      .filter(col => col.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const data = currentList.guests.map(guest => {
      const row: any = {};
      visibleColumns.forEach(col => {
        if (col.type === 'checkbox') {
          row[col.name] = guest[col.id] ? 'Yes' : 'No';
        } else {
          row[col.name] = guest[col.id] || '';
        }
      });
      return row;
    });

    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, currentList.name);
      XLSX.writeFile(wb, `${currentList.name}.xlsx`);
      toast.success('File exported successfully!');
    } catch (error) {
      toast.error('Failed to export file. Please try again.');
    }
  };

  const findHeaderRow = (worksheet: XLSX.WorkSheet): { headers: string[], rowIndex: number } => {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // First, try to find a row containing "Name" (case-insensitive)
    for (let R = range.s.r; R <= Math.min(range.e.r, 10); ++R) { // Check first 10 rows
      const rowHeaders: string[] = [];
      let nameColumnIndex = -1;
      
      // First pass: check if this row contains "Name"
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v !== undefined && cell.v !== null) {
          const value = String(cell.v).trim();
          if (value.toLowerCase() === 'name') {
            nameColumnIndex = C;
            break;
          }
        }
      }
      
      // If we found "Name", collect all headers from this row
      if (nameColumnIndex !== -1) {
        // Collect all cells in this row as headers
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          
          if (cell && cell.v !== undefined && cell.v !== null) {
            rowHeaders.push(String(cell.v).trim());
          } else {
            // Add empty placeholder for missing cells to maintain column alignment
            rowHeaders.push(`Column ${C - range.s.c + 1}`);
          }
        }
        
        return { headers: rowHeaders, rowIndex: R };
      }
    }
    
    // Fallback: If no row with "Name" found, use the first row with multiple cells
    for (let R = range.s.r; R <= Math.min(range.e.r, 3); ++R) {
      const rowHeaders: string[] = [];
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        
        if (cell && cell.v !== undefined && cell.v !== null) {
          rowHeaders.push(String(cell.v).trim());
        } else {
          // Add empty placeholder for missing cells
          rowHeaders.push(`Column ${C - range.s.c + 1}`);
        }
      }
      
      // If we have multiple non-empty headers, use this row
      const nonEmptyHeaders = rowHeaders.filter(h => !h.startsWith('Column '));
      if (nonEmptyHeaders.length > 1) {
        return { headers: rowHeaders, rowIndex: R };
      }
    }
    
    // Last resort: just use the first row
    const firstRowHeaders: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      const cell = worksheet[cellAddress];
      
      if (cell && cell.v !== undefined && cell.v !== null) {
        firstRowHeaders.push(String(cell.v).trim());
      } else {
        firstRowHeaders.push(`Column ${C - range.s.c + 1}`);
      }
    }
    
    return { headers: firstRowHeaders, rowIndex: range.s.r };
  };

  const getDataType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return 'integer';
      return 'float';
    }
    if (typeof value === 'string') {
      if (!isNaN(Date.parse(value)) && value.includes('-')) return 'date';
      return 'string';
    }
    return typeof value;
  };

  const determineColumnType = (header: string, values: any[]): Column['type'] => {
    const headerLower = header.toLowerCase();
    
    if (headerLower.includes('status')) {
      return 'status';
    }
    
    if (
      headerLower.includes('check') ||
      headerLower.includes('arrived') ||
      headerLower === 'present' ||
      headerLower === 'attending' ||
      headerLower === 'confirmed'
    ) {
      return 'checkbox';
    }
    
    let booleanCount = 0;
    let nonBooleanCount = 0;
    
    for (const value of values) {
      if (value === undefined || value === null) continue;
      
      if (typeof value === 'boolean') {
        booleanCount++;
      } else if (typeof value === 'string') {
        const strValue = value.toLowerCase().trim();
        if (
          strValue === 'yes' ||
          strValue === 'no' ||
          strValue === 'true' ||
          strValue === 'false' ||
          strValue === 'y' ||
          strValue === 'n'
        ) {
          booleanCount++;
        } else {
          nonBooleanCount++;
        }
      } else {
        nonBooleanCount++;
      }
    }
    
    if (booleanCount > 0 && booleanCount > nonBooleanCount * 2) {
      return 'checkbox';
    }
    
    return 'text';
  };

  const copyColumnData = (sourceColumnId: string, targetColumnId: string) => {
    if (!currentList) return;
    
    const updatedGuests = currentList.guests.map(guest => {
      const sourceValue = guest[sourceColumnId];
      
      if (sourceValue === undefined || sourceValue === null) {
        return guest;
      }
      
      let copiedValue;
      
      const dataType = getDataType(sourceValue);
      
      switch (dataType) {
        case 'integer':
        case 'float':
          copiedValue = Number(sourceValue);
          break;
        case 'boolean':
          copiedValue = Boolean(sourceValue);
          break;
        case 'date':
          copiedValue = new Date(sourceValue).toISOString();
          break;
        default:
          copiedValue = sourceValue;
      }
      
      return {
        ...guest,
        [targetColumnId]: copiedValue
      };
    });
    
    const updatedList = {
      ...currentList,
      guests: updatedGuests
    };
    
    setCurrentList(updatedList);
    setLists(prev => prev.map(l => l.id === currentList.id ? updatedList : l));
    toast.success('Column data copied successfully');
  };

  const processImportedData = useCallback((worksheet: XLSX.WorkSheet) => {
    if (!currentList) {
      toast.error('Please select a list first');
      return;
    }

    try {
      const { headers, rowIndex } = findHeaderRow(worksheet);
      
      if (headers.length === 0) {
        toast.error('Could not find header row in the file');
        return;
      }

      const newColumns: Column[] = [];
      const columnMap = new Map<string, string>();
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      const columnSamples: { [key: string]: any[] } = {};
      const columnTypes: { [key: string]: string } = {};
      
      for (let R = rowIndex + 1; R <= Math.min(range.e.r, rowIndex + 10); ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          if (C - range.s.c >= headers.length) continue;
          
          const header = headers[C - range.s.c];
          if (!header) continue;
          
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          
          if (!columnSamples[header]) {
            columnSamples[header] = [];
            columnTypes[header] = '';
          }
          
          if (cell && cell.v !== undefined && cell.v !== null) {
            columnSamples[header].push(cell.v);
            
            const dataType = getDataType(cell.v);
            if (!columnTypes[header]) {
              columnTypes[header] = dataType;
            } else if (columnTypes[header] !== dataType) {
              columnTypes[header] = 'mixed';
            }
          }
        }
      }
      
      headers.forEach((header, index) => {
        const normalizedHeader = header.trim();
        if (!normalizedHeader || normalizedHeader.startsWith('Column ')) return;
        
        const columnId = `col_${Date.now()}_${index}`;
        columnMap.set(normalizedHeader.toLowerCase(), columnId);
        
        const type = determineColumnType(normalizedHeader, columnSamples[normalizedHeader] || []);
        
        newColumns.push({
          id: columnId,
          name: normalizedHeader,
          type,
          order: index,
          visible: true,
          dataType: columnTypes[normalizedHeader] || 'string'
        });
      });
      
      const statusColumn = newColumns.find(col => col.type === 'status');
      if (!statusColumn) {
        newColumns.push({
          id: 'status',
          name: 'Status',
          type: 'status',
          order: newColumns.length,
          visible: true
        });
      }
      
      const guests: GuestData[] = [];
      
      for (let R = rowIndex + 1; R <= range.e.r; ++R) {
        const guest: GuestData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: 'Pending'
        };
        
        let hasData = false;
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          if (C - range.s.c >= headers.length) continue;
          
          const header = headers[C - range.s.c];
          if (!header || header.startsWith('Column ')) continue;
          
          const columnId = columnMap.get(header.toLowerCase().trim());
          if (!columnId) continue;
          
          const column = newColumns.find(col => col.id === columnId);
          if (!column) continue;
          
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          
          if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
            if (column.type === 'checkbox') {
              const strValue = String(cell.v).toLowerCase();
              guest[columnId] = strValue === 'yes' || 
                              strValue === 'true' || 
                              strValue === '1' || 
                              strValue === 'y' ||
                              cell.v === true;
              hasData = true;
            } else if (column.type === 'status') {
              guest.status = String(cell.v);
              hasData = true;
            } else {
              guest[columnId] = cell.v;
              hasData = true;
            }
          }
        }
        
        if (hasData) {
          guests.push(guest);
        }
      }
      
      if (guests.length === 0) {
        toast.error('No valid guest data found in the file');
        return;
      }
      
      const updatedList: List = {
        ...currentList,
        columns: newColumns,
        guests: guests,
        statusTags: Array.from(new Set([
          ...currentList.statusTags,
          ...guests.map(g => g.status).filter(Boolean)
        ]))
      };
      
      setCurrentList(updatedList);
      setLists(prev => prev.map(l => l.id === currentList.id ? updatedList : l));
      toast.success(`Successfully imported ${guests.length} guests with ${newColumns.length} columns`);
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Failed to process the imported data. Please check the file format.');
    }
  }, [currentList, setLists]);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentList) return;

    if (isImporting) {
      toast.error('Please wait for the current import to finish');
      return;
    }

    setIsImporting(true);
    try {
      if (file.type === 'application/pdf') {
        toast.error('PDF import is temporarily disabled. Please use Excel files.');
      } else {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        processImportedData(worksheet);
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Failed to import file. Please check the file format and try again.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <Toaster position="top-center" />

      <header className={`fixed top-0 left-0 right-0 h-16 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center px-4 z-10`}>
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
          >
            <Menu className={`w-6 h-6 ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`} />
          </button>
          {currentList && (
            <div className="flex items-center gap-2 min-w-0">
              <input
                type="text"
                value={currentList.name}
                onChange={(e) => {
                  setCurrentList({ ...currentList, name: e.target.value });
                  setLists(lists.map(l => l.id === currentList.id ? { ...l, name: e.target.value } : l));
                }}
                className={`text-xl font-semibold bg-transparent border-none focus:outline-none truncate ${isDarkMode ? 'text-white' : ''}`}
              />
              <span className={`text-sm hidden sm:inline ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ({currentList.guests.length} guests)
              </span>
            </div>
          )}
        </div>

        {currentList && (
          <div className="flex items-center gap-2">
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search guests..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                    : 'border-gray-300'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={exportToExcel}
              className={`btn-secondary hidden sm:flex ${isDarkMode ? 'dark' : ''}`}
              disabled={isImporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <label className={`btn-secondary hidden sm:flex cursor-pointer ${isDarkMode ? 'dark' : ''} ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileImport}
                disabled={isImporting}
              />
            </label>
          </div>
        )}
      </header>

      <main className="pt-16 h-screen">
        {!currentList ? (
          <EmptyState onCreateList={() => setIsCreateModalOpen(true)} isDarkMode={isDarkMode} />
        ) : (
          <GuestTable
            list={currentList}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddColumn={() => setIsAddColumnOpen(true)}
            onUpdateList={(updatedList) => {
              setCurrentList(updatedList);
              setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </main>

      <ListPanel
        isOpen={isPanelOpen}
        lists={lists}
        currentList={currentList}
        onClose={() => setIsPanelOpen(false)}
        onSelectList={setCurrentList}
        onCreateList={() => setIsCreateModalOpen(true)}
        onDeleteList={(id) => {
          setLists(lists.filter(l => l.id !== id));
          if (currentList?.id === id) {
            setCurrentList(null);
          }
        }}
        onUpdateList={(updatedList) => {
          setCurrentList(updatedList);
          setLists(lists.map(l => l.id === updatedList.id ? updatedList : l));
        }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createList}
        isDarkMode={isDarkMode}
      />
      
      <AddColumnModal
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onSubmit={(column) => {
          if (currentList) {
            const updatedList = {
              ...currentList,
              columns: [...currentList.columns, { ...column, order: currentList.columns.length }]
            };
            setCurrentList(updatedList);
            setLists(lists.map(l => l.id === currentList.id ? updatedList : l));
          }
          setIsAddColumnOpen(false);
        }}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;