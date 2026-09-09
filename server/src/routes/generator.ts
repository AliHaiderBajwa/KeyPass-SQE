import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Section 3.20: Password generator
router.post('/generate', (req: Request, res: Response) => {
  try {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeDigits = true,
      includeSpecial = true
    } = req.body;
    
    // Section 3.20: Length 0 disables generator
    if (length === 0) {
      return res.json({ password: '', message: 'Generator disabled' });
    }
    
    if (length < 1 || length > 128) {
      return res.status(400).json({ error: 'Length must be between 1 and 128' });
    }
    
    let charset = '';
    if (includeUppercase) charset += CHARSETS.uppercase;
    if (includeLowercase) charset += CHARSETS.lowercase;
    if (includeDigits) charset += CHARSETS.digits;
    if (includeSpecial) charset += CHARSETS.special;
    
    if (charset.length === 0) {
      return res.status(400).json({ error: 'At least one character set required' });
    }
    
    // Generate password using crypto.randomBytes for security
    const password = Array.from(crypto.randomBytes(length))
      .map(byte => charset[byte % charset.length])
      .join('');
    
    res.json({ password });
  } catch (error) {
    console.error('Generate password error:', error);
    res.status(500).json({ error: 'Failed to generate password' });
  }
});

export default router;
