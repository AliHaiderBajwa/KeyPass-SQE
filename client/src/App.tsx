import { useState, useMemo } from 'react';
import {
  Lock,
  Search,
  LogOut,
  Settings,
  ListChecks,
  PanelLeft,
} from 'lucide-react';
import { useDatabase } from './hooks/useDatabase';
import { DatabaseManager } from './components/DatabaseManager';
import { GroupSidebar } from './components/GroupSidebar';
import { EntryList } from './components/EntryList';
import { EntryDetail } from './components/EntryDetail';
import { PasswordGenerator } from './components/PasswordGenerator';
import { ToastContainer } from './components/Toast';
import {
  CreateGroupDialog,
  CreateEntryDialog,
  EditEntryDialog,
  ChangeMasterPasswordDialog,
} from './components/Dialogs';

function findEntryInGroups(groups: any[], entryId: string): any {
  for (const group of groups) {
    const entry = group.entries?.find((e: any) => e.id === entryId);
    if (entry) return entry;
    if (group.children) {
      const found = findEntryInGroups(group.children, entryId);
      if (found) return found;
    }
  }
  return null;
}

function findGroupById(groups: any[], id: string): any {
  for (const group of groups) {
    if (group.id === id) return group;
    if (group.children) {
      const found = findGroupById(group.children, id);
      if (found) return found;
    }
  }
  return null;
}

export default function App() {
  const {
    db,
    loading,
    toasts,
    passwordVisible,
    createDatabase,
    openDatabase,
    closeDatabase,
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
  } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const selectedGroup = useMemo(
    () => (db.selectedGroupId ? findGroupById(db.groups, db.selectedGroupId) : null),
    [db.groups, db.selectedGroupId]
  );

  const selectedEntry = useMemo(
    () => (db.selectedEntryId ? findEntryInGroups(db.groups, db.selectedEntryId) : null),
    [db.groups, db.selectedEntryId]
  );



  if (!db.isOpen) {
    return (
      <>
        <DatabaseManager
          loading={loading}
          onCreate={createDatabase}
          onOpen={openDatabase}
        />
        <ToastContainer toasts={toasts} onDismiss={() => {}} />
      </>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-bg-primary)]">
      <div
        className={`${sidebarOpen ? 'w-56' : 'w-0'} transition-all duration-200 overflow-hidden border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] flex-shrink-0`}
      >
        <GroupSidebar
          groups={db.groups}
          selectedGroupId={db.selectedGroupId}
          onSelectGroup={(id) =>
            setDb((prev) => ({ ...prev, selectedGroupId: id, selectedEntryId: null }))
          }
          onCreateGroup={(parentId) => openModal('create-group', { parentId })}
          onRenameGroup={renameGroup}
          onDeleteGroup={deleteGroup}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-secondary)]"
            >
              <PanelLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)]">
                <Lock size={16} className="text-[var(--color-accent)]" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">{db.name}</h1>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">AES-256 encrypted</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
              <input
                type="text"
                placeholder="Search entries..."
                className="input pl-9 h-8 w-48 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowGenerator(true)}
              className="btn btn-ghost h-8 w-8 p-0"
              title="Password generator"
            >
              <ListChecks size={16} />
            </button>

            <button
              onClick={() => openModal('change-master-password')}
              className="btn btn-ghost h-8 w-8 p-0"
              title="Change master password"
            >
              <Settings size={16} />
            </button>

            <button
              onClick={closeDatabase}
              className="btn btn-ghost h-8 w-8 p-0"
              title="Lock database"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 flex-shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)]">
            <EntryList
              group={selectedGroup}
              selectedEntryId={db.selectedEntryId}
              onSelectEntry={(id) => setDb((prev) => ({ ...prev, selectedEntryId: id }))}
              onCreateEntry={() => openModal('create-entry')}
              onCopyToClipboard={copyToClipboard}
              passwordVisible={passwordVisible}
              onTogglePasswordVisibility={togglePasswordVisibility}
            />
          </div>

          <EntryDetail
            entry={selectedEntry}
            onEdit={() => openModal('edit-entry', { entry: selectedEntry })}
            onDelete={() => {
              if (selectedEntry) {
                deleteEntry(selectedEntry.id);
              }
            }}
            onCopyToClipboard={copyToClipboard}
          />
        </div>
      </div>

      <PasswordGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={generatePassword}
        onCopyToClipboard={copyToClipboard}
      />

      <CreateGroupDialog
        isOpen={isModalOpen('create-group')}
        onClose={() => closeModal('create-group')}
        onSubmit={(name) => createGroup(name, getModalData('create-group')?.parentId)}
      />

      <CreateEntryDialog
        isOpen={isModalOpen('create-entry')}
        onClose={() => closeModal('create-entry')}
        onSubmit={(entry) =>
          createEntry({
            ...entry,
            groupId: db.selectedGroupId || '',
          })
        }
        onGeneratePassword={() => {
          closeModal('create-entry');
          setShowGenerator(true);
        }}
      />

      {getModalData('edit-entry')?.entry && (
        <EditEntryDialog
          isOpen={isModalOpen('edit-entry')}
          entry={getModalData('edit-entry').entry}
          onClose={() => closeModal('edit-entry')}
          onSubmit={(id, updates) => updateEntry(id, updates)}
          onGeneratePassword={() => {
            closeModal('edit-entry');
            setShowGenerator(true);
          }}
        />
      )}

      <ChangeMasterPasswordDialog
        isOpen={isModalOpen('change-master-password')}
        onClose={() => closeModal('change-master-password')}
        onSubmit={changeMasterPassword}
      />

      <ToastContainer toasts={toasts} onDismiss={() => {}} />
    </div>
  );
}
