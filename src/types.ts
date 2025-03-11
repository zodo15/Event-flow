export interface Column {
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'status' | 'task' | 'date' | 'number';
  visible?: boolean;
  order?: number;
  dataType?: string;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  category?: string;
}

export interface GuestData {
  id: string;
  status: string;
  [key: string]: any;
}

export interface List {
  id: string;
  name: string;
  columns: Column[];
  guests: GuestData[];
  tasks: Task[];
  categories: string[];
  statusTags: string[];
}