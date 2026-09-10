export interface DatabaseInfo {
  name: string;
  path: string;
}

export interface Group {
  id: string;
  name: string;
  parentId: string | null;
  children: Group[];
  entries: Entry[];
}

export interface Entry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseState {
  isOpen: boolean;
  name: string;
  path: string;
  groups: Group[];
  selectedGroupId: string | null;
  selectedEntryId: string | null;
  searchQuery: string;
}

export type ModalType =
  | 'new-database'
  | 'open-database'
  | 'change-master-password'
  | 'create-group'
  | 'rename-group'
  | 'create-entry'
  | 'edit-entry'
  | 'delete-entry'
  | 'delete-group'
  | 'password-generator'
  | 'confirm';

export interface ModalState {
  type: ModalType;
  isOpen: boolean;
  data?: any;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}
