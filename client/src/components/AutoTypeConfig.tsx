import React from 'react';

interface AutoTypeConfigProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const AUTO_TYPE_PREFIX = 'Auto-Type:';
const MAX_SEQUENCE_LENGTH = 59;
const DEFAULT_AUTO_TYPE = '{USERNAME}{TAB}{PASSWORD}{ENTER}';

export const AutoTypeConfig: React.FC<AutoTypeConfigProps> = ({
  notes,
  onNotesChange
}) => {
  // Parse existing auto-type from notes
  const lines = notes.split('\n');
  let existingAutoType = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(AUTO_TYPE_PREFIX)) {
      existingAutoType = trimmed.substring(AUTO_TYPE_PREFIX.length).trim();
      break;
    }
  }
  
  const sequence = existingAutoType || DEFAULT_AUTO_TYPE;
  const isValid = sequence.length <= MAX_SEQUENCE_LENGTH;
  const remaining = MAX_SEQUENCE_LENGTH - sequence.length;

  const handleSequenceChange = (value: string) => {
    // Update notes with auto-type line
    const otherLines = notes.split('\n')
      .filter(line => !line.trim().startsWith(AUTO_TYPE_PREFIX));
    
    if (value) {
      otherLines.push(`${AUTO_TYPE_PREFIX} ${value}`);
    }
    
    onNotesChange(otherLines.join('\n'));
  };

  return (
    <div className="auto-type-config">
      <h4>⌨️ Auto-Type Sequence</h4>
      <p className="help-text">
        REQ-19: Must start with "Auto-Type:" prefix<br/>
        REQ-20: Max 59 characters<br/>
        REQ-21: If two exist, only first is used
      </p>
      
      <input
        type="text"
        value={sequence}
        onChange={(e) => handleSequenceChange(e.target.value)}
        maxLength={MAX_SEQUENCE_LENGTH}
        className={!isValid ? 'invalid' : ''}
        placeholder={DEFAULT_AUTO_TYPE}
      />
      
      <div className="sequence-info">
        <span className={`char-count ${remaining < 0 ? 'over' : ''}`}>
          {sequence.length}/{MAX_SEQUENCE_LENGTH}
        </span>
        {!isValid && (
          <span className="error">
            Sequence exceeds {MAX_SEQUENCE_LENGTH} characters (REQ-20)
          </span>
        )}
      </div>
      
      <div className="examples">
        <p><strong>Available placeholders:</strong></p>
        <code>{'{USERNAME}'}</code> <code>{'{PASSWORD}'}</code> <code>{'{URL}'}</code> <code>{'{TAB}'}</code> <code>{'{ENTER}'}</code>
      </div>
    </div>
  );
};
