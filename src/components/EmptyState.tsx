import React from 'react';
import { Plus, ListChecks } from 'lucide-react';

interface EmptyStateProps {
  onCreateList: () => void;
  isDarkMode: boolean;
}

export function EmptyState({ onCreateList, isDarkMode }: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
      <div className={`w-full max-w-md mx-auto text-center ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        <div className="mb-8">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-purple-50'
          }`}>
            <ListChecks className={`w-10 h-10 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Guest List Manager
          </h1>
          <p className={`text-base sm:text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Create your first list to start managing guests efficiently. Import existing data or start fresh - it's up to you!
          </p>
        </div>

        <button
          onClick={onCreateList}
          className={`btn-primary ${isDarkMode ? 'dark' : ''} text-lg px-8 py-3 mb-8 transform transition-transform hover:scale-105`}
        >
          <Plus className="w-6 h-6 mr-2" />
          Create Your First List
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
          <Feature
            title="Easy Import"
            description="Import existing guest data from Excel files"
            isDarkMode={isDarkMode}
          />
          <Feature
            title="Smart Filters"
            description="Filter and sort guests by any criteria"
            isDarkMode={isDarkMode}
          />
          <Feature
            title="Custom Fields"
            description="Add custom columns to track any information"
            isDarkMode={isDarkMode}
          />
          <Feature
            title="Task Management"
            description="Keep track of tasks for each guest"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ title, description, isDarkMode }: { title: string; description: string; isDarkMode: boolean }) {
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
    </div>
  );
}