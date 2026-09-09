import React, { useState } from 'react';

interface DatabaseManagerProps {
  onDatabaseOpen: (databaseId: string) => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onDatabaseOpen }) => {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [dbName, setDbName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [useKeyFile, setUseKeyFile] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewDatabase = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/database/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dbName,
          masterKey: { password }
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        onDatabaseOpen(data.id);
        setShowNewDialog(false);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="database-manager">
      <div className="logo">
        <h1>🔐 KeePass Password Safe</h1>
        <p>Secure Password Management</p>
      </div>
      
      <div className="actions">
        <button 
          className="primary"
          onClick={() => setShowNewDialog(true)}
        >
          ➕ New Database
        </button>
        <button 
          onClick={() => setShowOpenDialog(true)}
        >
          📂 Open Database
        </button>
      </div>
      
      {showNewDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Create New Database</h2>
            <input
              type="text"
              placeholder="Database name"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
            />
            <input
              type="password"
              placeholder="Master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label className="checkbox">
              <input
                type="checkbox"
                checked={useKeyFile}
                onChange={(e) => setUseKeyFile(e.target.checked)}
              />
              Use key file (REQ-26: both required if enabled)
            </label>
            {error && <p className="error">{error}</p>}
            <div className="dialog-actions">
              <button 
                onClick={handleNewDatabase}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowNewDialog(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showOpenDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h2>Open Database</h2>
            <p>Select a database file to open</p>
            <div className="dialog-actions">
              <button onClick={() => setShowOpenDialog(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
