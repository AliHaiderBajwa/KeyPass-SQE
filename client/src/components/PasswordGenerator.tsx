import React, { useState } from 'react';

interface PasswordGeneratorProps {
  onUsePassword: (password: string) => void;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onUsePassword }) => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          length,
          includeUppercase,
          includeLowercase,
          includeDigits,
          includeSpecial
        })
      });
      
      const data = await response.json();
      setGeneratedPassword(data.password);
    } catch (err) {
      console.error('Failed to generate password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-generator">
      <h3>🎲 Password Generator</h3>
      
      <div className="options">
        <div className="slider">
          <label>
            Length: <strong>{length}</strong>
          </label>
          <input
            type="range"
            min="1"
            max="128"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
          <span className="range-labels">
            <span>1</span>
            <span>128</span>
          </span>
        </div>
        
        <div className="checkboxes">
          <label>
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
            />
            Uppercase (A-Z)
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
            />
            Lowercase (a-z)
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeDigits}
              onChange={(e) => setIncludeDigits(e.target.checked)}
            />
            Digits (0-9)
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeSpecial}
              onChange={(e) => setIncludeSpecial(e.target.checked)}
            />
            Special (!@#$%^&*)
          </label>
        </div>
      </div>
      
      <button 
        onClick={handleGenerate}
        disabled={loading}
        className="generate-btn"
      >
        {loading ? 'Generating...' : '🔄 Generate'}
      </button>
      
      {generatedPassword && (
        <div className="generated">
          <input 
            type="text" 
            value={generatedPassword} 
            readOnly 
            className="password-display"
          />
          <button 
            onClick={() => onUsePassword(generatedPassword)}
            className="use-btn"
          >
            📋 Use This Password
          </button>
        </div>
      )}
    </div>
  );
};
