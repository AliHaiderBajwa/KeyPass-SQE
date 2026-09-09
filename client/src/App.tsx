import React, { useState, useEffect } from 'react';
import { DatabaseManager } from './components/DatabaseManager';
import { AuthDialog } from './components/AuthDialog';
import { GroupTree } from './components/GroupTree';
import { EntryList } from './components/EntryList';
import { EntryForm } from './components/EntryForm';
import { PasswordGenerator } from './components/PasswordGenerator';
import { TanWizard } from './components/TanWizard';
import { TanEntry } from './components/TanEntry';
import { AutoTypeConfig } from './components/AutoTypeConfig';
import { useClipboard } from './hooks/useClipboard';
import { useDatabase } from './hooks/useDatabase';
import './App.css';

function App() {
  const { 
    databaseId, 
    databaseName, 
    isAuthenticated, 
    openDatabase, 
    authenticate,
    logout 
  } = useDatabase();
  
  const { copiedText, timeRemaining, copyToClipboard } = useClipboard();
  
  const [groups, setGroups] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showTanWizard, setShowTanWizard] = useState(false);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);

  // Load data when database is opened
  useEffect(() => {
    if (databaseId && isAuthenticated) {
      loadData();
    }
  }, [databaseId, isAuthenticated]);

  const loadData = async () => {
    if (!databaseId) return;
    
    try {
      const [groupsRes, entriesRes] = await Promise.all([
        fetch(`/api/groups/${databaseId}`),
        fetch(`/api/entries/database/${databaseId}`)
      ]);
      
      const groupsData = await groupsRes.json();
      const entriesData = await entriesRes.json();
      
      setGroups(groupsData.groups || []);
      setEntries(entriesData.entries || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleDatabaseOpen = (id: string) => {
    openDatabase(id, 'Database');
  };

  const handleAuthSuccess = (sid: string) => {
    authenticate(sid);
  };

  const handleAddGroup = async (parentId: string | null, name: string) => {
    if (!databaseId) return;
    
    try {
      await fetch('/api/groups/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId, parentId, name })
      });
      loadData();
    } catch (err) {
      console.error('Failed to add group:', err);
    }
  };

  const handleRenameGroup = async (groupId: string, name: string) => {
    try {
      await fetch('/api/groups/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, name })
      });
      loadData();
    } catch (err) {
      console.error('Failed to rename group:', err);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      });
      loadData();
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
    setShowEntryForm(true);
  };

  const handleSaveEntry = async (entry: any) => {
    if (!databaseId) return;
    
    try {
      if (entry.id) {
        // Update existing entry
        await fetch('/api/entries/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } else {
        // Create new entry
        await fetch('/api/entries/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...entry, databaseId })
        });
      }
      setShowEntryForm(false);
      setSelectedEntryId(null);
      loadData();
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const handleDuplicateEntry = async (entryId: string) => {
    try {
      await fetch('/api/entries/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });
      loadData();
    } catch (err) {
      console.error('Failed to duplicate entry:', err);
    }
  };

  const handleCopyPassword = (password: string) => {
    copyToClipboard(password);
  };

  const handleCreateTans = async (count: number) => {
    if (!databaseId || !selectedGroupId) return;
    
    try {
      await fetch('/api/tan/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseId, groupId: selectedGroupId, count })
      });
      setShowTanWizard(false);
      loadData();
    } catch (err) {
      console.error('Failed to create TANs:', err);
    }
  };

  const handleUseTan = async (tanId: string) => {
    try {
      await fetch('/api/tan/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId: tanId })
      });
      loadData();
    } catch (err) {
      console.error('Failed to use TAN:', err);
    }
  };

  // Show database manager if no database selected
  if (!databaseId) {
    return <DatabaseManager onDatabaseOpen={handleDatabaseOpen} />;
  }

  // Show auth dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthDialog
        databaseId={databaseId}
        databaseName={databaseName}
        onAuthSuccess={handleAuthSuccess}
        onCancel={() => openDatabase('', '')}
      />
    );
  }

  // Get entries for selected group
  const groupEntries = entries.filter(e => e.group_id === selectedGroupId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🔐 KeePass Password Safe</h1>
        <div className="header-actions">
          {copiedText && (
            <div className="clipboard-warning">
              ⏱️ Password copied! Auto-clears in <strong>{timeRemaining}s</strong>
            </div>
          )}
          <button onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}>
            🎲 Generator
          </button>
          {selectedGroupId && (
            <>
              <button onClick={() => setShowEntryForm(true)}>
                ➕ Add Entry
              </button>
              <button onClick={() => setShowTanWizard(true)}>
                🔑 Create TANs
              </button>
            </>
          )}
          <button onClick={logout}>
            🚪 Logout
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <aside className="sidebar">
          <GroupTree
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onAddGroup={handleAddGroup}
            onRenameGroup={handleRenameGroup}
            onDeleteGroup={handleDeleteGroup}
          />
          
          {showPasswordGenerator && (
            <PasswordGenerator onUsePassword={handleCopyPassword} />
          )}
        </aside>
        
        <section className="content">
          <EntryList
            entries={groupEntries}
            selectedEntryId={selectedEntryId}
            onSelectEntry={handleSelectEntry}
            onDeleteEntry={handleDeleteEntry}
            onDuplicateEntry={handleDuplicateEntry}
            onCopyPassword={handleCopyPassword}
          />
          
          {showEntryForm && (
            <EntryForm
              entryId={selectedEntryId}
              groupId={selectedGroupId}
              onSave={handleSaveEntry}
              onCancel={() => {
                setShowEntryForm(false);
                setSelectedEntryId(null);
              }}
            />
          )}
          
          {showTanWizard && (
            <TanWizard
              groupId={selectedGroupId || ''}
              onCreateTans={handleCreateTans}
              onCancel={() => setShowTanWizard(false)}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
