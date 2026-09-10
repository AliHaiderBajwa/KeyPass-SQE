import { useState, useEffect } from 'react';
import {
  X,
  Copy,
  RefreshCw,
  Check,
  Hash,
  AtSign,
} from 'lucide-react';

interface PasswordGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (length: number, options: any) => Promise<string | null>;
  onCopyToClipboard: (text: string, label: string) => void;
}

export function PasswordGenerator({
  isOpen,
  onClose,
  onGenerate,
  onCopyToClipboard,
}: PasswordGeneratorProps) {
  const [length, setLength] = useState(20);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    const result = await onGenerate(length, {
      useUppercase,
      useLowercase,
      useNumbers,
      useSpecial,
    });
    if (result) setPassword(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && !password) generate();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-lg font-semibold">Password Generator</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--color-bg-tertiary)] rounded-lg text-[var(--color-text-tertiary)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 px-4 py-3 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-border-subtle)] font-mono text-lg tracking-wider text-center">
                {password || 'Click generate'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generate}
                disabled={loading}
                className="btn btn-secondary flex-1 h-9"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Regenerate
              </button>
              <button
                onClick={() => {
                  if (password) {
                    onCopyToClipboard(password, 'Password');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                disabled={!password}
                className="btn btn-primary flex-1 h-9"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-[var(--color-text-secondary)]">Length</label>
                <span className="text-sm font-mono text-[var(--color-accent)]">{length}</span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--color-bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-text-tertiary)] mt-1">
                <span>8</span>
                <span>64</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-[var(--color-text-secondary)]">Character Types</label>

              <button
                onClick={() => setUseUppercase(!useUppercase)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  useUppercase
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                    : 'bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
              >
                <Hash size={18} />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">Uppercase</div>
                  <div className="text-xs opacity-70">A-Z</div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    useUppercase ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform mt-0.5 ${
                      useUppercase ? 'ml-5.5' : 'ml-0.5'
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => setUseLowercase(!useLowercase)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  useLowercase
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                    : 'bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
              >
                <Hash size={18} />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">Lowercase</div>
                  <div className="text-xs opacity-70">a-z</div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    useLowercase ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform mt-0.5 ${
                      useLowercase ? 'ml-5.5' : 'ml-0.5'
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => setUseNumbers(!useNumbers)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  useNumbers
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                    : 'bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
              >
                <Hash size={18} />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">Numbers</div>
                  <div className="text-xs opacity-70">0-9</div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    useNumbers ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform mt-0.5 ${
                      useNumbers ? 'ml-5.5' : 'ml-0.5'
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={() => setUseSpecial(!useSpecial)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  useSpecial
                    ? 'bg-[var(--color-accent-subtle)] border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                    : 'bg-[var(--color-bg-primary)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                }`}
              >
                <AtSign size={18} />
                <div className="text-left flex-1">
                  <div className="text-sm font-medium">Special</div>
                  <div className="text-xs opacity-70">!@#$%^&*</div>
                </div>
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    useSpecial ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-tertiary)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform mt-0.5 ${
                      useSpecial ? 'ml-5.5' : 'ml-0.5'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
