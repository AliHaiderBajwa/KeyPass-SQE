import React, { useState, useEffect } from 'react';
import { AutoTypeConfig } from './AutoTypeConfig';

interface EntryFormProps {
  entryId: string | null;
  groupId: string | null;
  onSave: (entry: any) => void;
  onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  entryId,
  groupId,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (entryId) {
      setLoading(true);
      fetch(`/api/entries/${entryId}`)
        .then(res => res.json())
        .then(data => {
          setTitle(data.title);
          setUsername(data.username);
          setPassword(data.password);
          setConfirmPassword(data.password);
          setUrl(data.url);
          setNotes(data.notes);
        })
        .catch(() => setError('Failed to load entry'))
        .finally(() => setLoading(false));
    }
  }, [entryId]);

  const handleSubmit = () => {
    // REQ-12, REQ-13: Password and confirm must match
    if (password !== confirmPassword) {
      setError('Passwords do not match (REQ-12, REQ-13)');
      return;
    }
    
    onSave({
      id: entryId,
      groupId,
      title,
      username,
      password,
      url,
      notes
    });
  };

  if (loading) {
    return <div className="entry-form loading">Loading...</div>;
  }

  return (
    <div className="entry-form">
      <h3>{entryId ? '✏️ Edit Entry' : '➕ New Entry'}</h3>
      
      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          placeholder="Entry title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="Password (REQ-12)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm password (REQ-13)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>URL</label>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label>Notes</label>
        <textarea
          placeholder="Additional notes ( REQ-14: can be empty)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>
      
      <AutoTypeConfig
        notes={notes}
        onNotesChange={setNotes}
      />
      
      {error && <p className="error">{error}</p>}
      
      <div className="form-actions">
        <button onClick={handleSubmit}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};
