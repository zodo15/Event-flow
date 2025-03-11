import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare, Moon, Sun } from 'lucide-react';
import { List, Task } from '../types';

interface ListPanelProps {
  isOpen: boolean;
  lists: List[];
  currentList: List | null;
  onClose: () => void;
  onSelectList: (list: List) => void;
  onCreateList: () => void;
  onDeleteList: (id: string) => void;
  onUpdateList: (list: List) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function ListPanel({
  isOpen,
  lists,
  currentList,
  onClose,
  onSelectList,
  onCreateList,
  onDeleteList,
  onUpdateList,
  isDarkMode,
  onToggleTheme
}: ListPanelProps) {
  const [newTask, setNewTask] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentList || !newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      name: newTask.trim(),
      completed: false,
      category: selectedCategory === 'All Categories' ? 'General' : selectedCategory
    };

    onUpdateList({
      ...currentList,
      tasks: [...currentList.tasks, task]
    });
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    if (!currentList) return;
    onUpdateList({
      ...currentList,
      tasks: currentList.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    });
  };

  const deleteTask = (taskId: string) => {
    if (!currentList) return;
    onUpdateList({
      ...currentList,
      tasks: currentList.tasks.filter(task => task.id !== taskId)
    });
  };

  const addCategory = () => {
    const category = prompt('Enter new category name:');
    if (!category || !currentList) return;
    
    onUpdateList({
      ...currentList,
      categories: [...(currentList.categories || []), category]
    });
    setSelectedCategory(category);
  };

  const filteredTasks = currentList?.tasks.filter(task => 
    selectedCategory === 'All Categories' || task.category === selectedCategory
  ) || [];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } z-10 md:hidden`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-[300px] ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-20`}
      >
        <div className={`h-16 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b flex items-center justify-between px-4`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : ''}`}>Your Lists</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-200" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={onClose}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-600'} rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col h-[calc(100%-4rem)]">
          {/* Lists Section */}
          <div className={`p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <button
              onClick={onCreateList}
              className={`w-full btn-secondary ${isDarkMode ? 'dark' : ''} mb-4`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New List
            </button>
            
            <div className="space-y-2">
              {lists.map(list => (
                <div
                  key={list.id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                    currentList?.id === list.id 
                      ? isDarkMode 
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectList(list)}
                >
                  <span className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : ''}`}>
                    {list.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteList(list.id);
                    }}
                    className={`p-1 ${
                      isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                    } rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Section */}
          {currentList && (
            <div className="flex-1 overflow-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold flex items-center ${isDarkMode ? 'text-white' : ''}`}>
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Tasks
                </h3>
              </div>

              <div className="mb-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'border-gray-300'
                  }`}
                >
                  <option>All Categories</option>
                  {currentList.categories?.map(category => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <button
                  onClick={addCategory}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Add Category
                </button>
              </div>

              <form onSubmit={addTask} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add new task..."
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!newTask.trim()}
                    className={`btn-primary ${isDarkMode ? 'dark' : ''}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-2 p-2 rounded-lg group ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`flex-1 ${
                      task.completed
                        ? 'line-through text-gray-500'
                        : isDarkMode
                          ? 'text-gray-200'
                          : ''
                    }`}>
                      {task.name}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {task.category}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className={`p-1 ${
                        isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                      } rounded-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <Trash2 className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}