import React, { useState } from 'react';

interface TanWizardProps {
  groupId: string;
  onCreateTans: (count: number) => void;
  onCancel: () => void;
}

export const TanWizard: React.FC<TanWizardProps> = ({
  groupId,
  onCreateTans,
  onCancel
}) => {
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreateTans(count);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tan-wizard">
      <div className="dialog">
        <h3>🔑 Create TANs</h3>
        <p>
          Transaction Authentication Numbers (TANs) are one-time-use codes.<br/>
          REQ-32: Title, username, URL cannot be changed<br/>
          REQ-33: TAN expires permanently after first use
        </p>
        
        <div className="form-group">
          <label>Number of TANs to create:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          />
        </div>
        
        <div className="info-box">
          <p>Each TAN will be:</p>
          <ul>
            <li>8 characters (alphanumeric)</li>
            <li>Stored with title "&lt;TAN&gt;"</li>
            <li>Marked as used after first use</li>
          </ul>
        </div>
        
        <div className="dialog-actions">
          <button 
            onClick={handleCreate}
            disabled={loading || count < 1}
          >
            {loading ? 'Creating...' : `Create ${count} TANs`}
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
