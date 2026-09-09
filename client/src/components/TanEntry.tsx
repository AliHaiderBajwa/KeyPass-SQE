import React from 'react';

interface TanEntryProps {
  tanId: string;
  tan: string;
  isUsed: boolean;
  onUseTan: (tanId: string) => void;
  onCopyTan: (tan: string) => void;
}

export const TanEntry: React.FC<TanEntryProps> = ({
  tanId,
  tan,
  isUsed,
  onUseTan,
  onCopyTan
}) => {
  const handleUse = () => {
    if (window.confirm('Use this TAN? It will expire permanently (REQ-33).')) {
      onUseTan(tanId);
    }
  };

  return (
    <div className={`tan-entry ${isUsed ? 'used' : 'active'}`}>
      <div className="tan-info">
        <span className="tan-label">🔑 TAN:</span>
        <span className="tan-value">
          {isUsed ? (
            <span className="expired">EXPIRED (REQ-33)</span>
          ) : (
            <span className="active">{tan}</span>
          )}
        </span>
      </div>
      
      <div className="tan-actions">
        {!isUsed && (
          <>
            <button 
              className="icon-btn"
              onClick={() => onCopyTan(tan)}
              title="Copy to clipboard"
            >
              📋
            </button>
            <button 
              className="use-btn"
              onClick={handleUse}
              title="Mark as used"
            >
              ✓ Use TAN
            </button>
          </>
        )}
        {isUsed && (
          <span className="badge expired-badge">
            Used
          </span>
        )}
      </div>
    </div>
  );
};
