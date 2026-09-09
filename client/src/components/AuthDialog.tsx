import React, { useState } from 'react';

interface AuthDialogProps {
  databaseId: string;
  databaseName: string;
  onAuthSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  databaseId,
  databaseName,
  onAuthSuccess,
  onCancel
}) => {
  const [password, setPassword] = useState('');
  const [keyFile, setKeyFile] = useState<string | null>(null);
  const [requiresKeyFile, setRequiresKeyFile] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          databaseId,
          masterKey: {
            password,
            keyFileContent: keyFile
          }
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onAuthSuccess(data.sessionId);
      } else if (data.requiresKeyFile) {
        setRequiresKeyFile(true);
        setError('Key file required (REQ-26)');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setKeyFile(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="auth-dialog">
      <div className="dialog">
        <h2>🔐 Unlock Database</h2>
        <p className="database-name">{databaseName}</p>
        
        <input
          type="password"
          placeholder="Master Password (REQ-24)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        
        {requiresKeyFile && (
          <div className="key-file-upload">
            <label>Key File (REQ-25, REQ-26):</label>
            <input
              type="file"
              onChange={handleKeyFileUpload}
              accept=".key,.txt"
            />
            {keyFile && <span className="success">✓ Key file loaded</span>}
          </div>
        )}
        
        {error && <p className="error">{error}</p>}
        
        <div className="dialog-actions">
          <button 
            onClick={handleLogin}
            disabled={loading || !password}
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
          <button onClick={onCancel}>
            Cancel
          </button>
        </div>
        
        <p className="help-text">
          REQ-27: Lost password = no recovery<br/>
          REQ-28: No backdoor exists
        </p>
      </div>
    </div>
  );
};
