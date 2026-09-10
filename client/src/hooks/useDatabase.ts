import { useState, useCallback } from 'react';
import type {
  DatabaseState,
  Entry,
  ModalState,
  Toast,
} from '../types';

const API_BASE = '/api';

function generateId(): string {
  return crypto.randomUUID();
}

export function useDatabase() {
  const [db, setDb] = useState<DatabaseState>({
    isOpen: false,
    name: '',
    path: '',
    groups: [],
    selectedGroupId: null,
    selectedEntryId: null,
    searchQuery: '',
  });

  const [modals, setModals] = useState<ModalState[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({});

  const addToast = useCallback(
    (type: Toast['type'], message: string, duration = 4000) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const openModal = useCallback((type: ModalState['type'], data?: any) => {
    setModals((prev) => [...prev, { type, isOpen: true, data }]);
  }, []);

  const closeModal = useCallback((type: ModalState['type']) => {
    setModals((prev) => prev.filter((m) => m.type !== type));
  }, []);

  const isModalOpen = useCallback(
    (type: ModalState['type']) => modals.some((m) => m.type === type),
    [modals]
  );

  const getModalData = useCallback(
    (type: ModalState['type']) => modals.find((m) => m.type === type)?.data,
    [modals]
  );

  const createDatabase = useCallback(
    async (name: string, password: string, keyFilePath?: string) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/database`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, password, keyFilePath }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setDb({
          isOpen: true,
          name,
          path: data.path,
          groups: data.groups,
          selectedGroupId: data.groups[0]?.id ?? null,
          selectedEntryId: null,
          searchQuery: '',
        });

        addToast('success', 'Database created successfully');
        return true;
      } catch (err: any) {
        addToast('error', err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const openDatabase = useCallback(
    async (name: string, password: string, keyFilePath?: string) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/database/open`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, password, keyFilePath }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setDb({
          isOpen: true,
          name,
          path: data.path,
          groups: data.groups,
          selectedGroupId: data.groups[0]?.id ?? null,
          selectedEntryId: null,
          searchQuery: '',
        });

        addToast('success', 'Database unlocked');
        return true;
      } catch (err: any) {
        addToast('error', err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const closeDatabase = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/database`, { method: 'DELETE' });
      setDb({
        isOpen: false,
        name: '',
        path: '',
        groups: [],
        selectedGroupId: null,
        selectedEntryId: null,
        searchQuery: '',
      });
      addToast('success', 'Database locked');
    } catch (err: any) {
      addToast('error', err.message);
    }
  }, [addToast]);

  const refreshData = useCallback(async () => {
    if (!db.isOpen) return;
    try {
      const res = await fetch(`${API_BASE}/database`);
      const data = await res.json();
      if (data.groups) {
        setDb((prev) => ({
          ...prev,
          groups: data.groups,
          name: data.name || prev.name,
          path: data.path || prev.path,
        }));
      }
    } catch (err: any) {
      addToast('error', err.message);
    }
  }, [db.isOpen, addToast]);

  const createGroup = useCallback(
    async (name: string, parentId?: string) => {
      try {
        const res = await fetch(`${API_BASE}/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, parentId: parentId || null }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        await refreshData();
        addToast('success', 'Group created');
      } catch (err: any) {
        addToast('error', err.message);
      }
    },
    [refreshData, addToast]
  );

  const renameGroup = useCallback(
    async (id: string, name: string) => {
      try {
        const res = await fetch(`${API_BASE}/groups/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        await refreshData();
        addToast('success', 'Group renamed');
      } catch (err: any) {
        addToast('error', err.message);
      }
    },
    [refreshData, addToast]
  );

  const deleteGroup = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_BASE}/groups/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        setDb((prev) => ({
          ...prev,
          selectedGroupId:
            prev.selectedGroupId === id
              ? prev.groups[0]?.id ?? null
              : prev.selectedGroupId,
          selectedEntryId: null,
        }));
        await refreshData();
        addToast('success', 'Group deleted');
      } catch (err: any) {
        addToast('error', err.message);
      }
    },
    [refreshData, addToast]
  );

  const createEntry = useCallback(
    async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const res = await fetch(`${API_BASE}/entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        await refreshData();
        addToast('success', 'Entry created');
      } catch (err: any) {
        addToast('error', err.message);
      }
    },
    [refreshData, addToast]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<Entry>) => {
      try {
        const res = await fetch(`${API_BASE}/entries/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        await refreshData();
        addToast('success', 'Entry updated');
      } catch (err: any) {
        addToast('error', err.message);
      }
    },
    [refreshData, addToast]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`${API_BASE}/entries/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        setDb((prev) => ({
          ...prev,
          selectedEntryId:
            prev.selectedEntryId === id ? null : prev.selectedEntryId,
        }));
        await refreshData();
        addToast('success', 'Entry deleted');
      } catch (err: any) {
        addToast('error', err.message);
      }
    },
    [refreshData, addToast]
  );

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast('info', `${label} copied to clipboard`);
        setTimeout(() => {
          navigator.clipboard.writeText('');
        }, 10000);
      } catch {
        addToast('error', 'Failed to copy');
      }
    },
    [addToast]
  );

  const togglePasswordVisibility = useCallback((entryId: string) => {
    setPasswordVisible((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
  }, []);

  const changeMasterPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/database/master-password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        addToast('success', 'Master password changed');
        return true;
      } catch (err: any) {
        addToast('error', err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const generatePassword = useCallback(
    async (length: number, options: any) => {
      try {
        const res = await fetch(`${API_BASE}/password/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ length, ...options }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data.password;
      } catch (err: any) {
        addToast('error', err.message);
        return null;
      }
    },
    [addToast]
  );

  return {
    db,
    loading,
    toasts,
    passwordVisible,
    createDatabase,
    openDatabase,
    closeDatabase,
    refreshData,
    createGroup,
    renameGroup,
    deleteGroup,
    createEntry,
    updateEntry,
    deleteEntry,
    copyToClipboard,
    togglePasswordVisibility,
    changeMasterPassword,
    generatePassword,
    setDb,
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
    addToast,
  };
}
