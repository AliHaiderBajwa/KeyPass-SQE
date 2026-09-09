# AI_DEV_LOG.md — KeePass Password Safe

## Purpose
This log records every implementation decision that isn't explicitly specified in the SRS. Each entry documents: the decision, rationale, and which PROJECT_SCOPE.md row it affects.

---

## Decision Log

### Decision 001: Database Format
- **Decision:** Use JSON-based internal format instead of `.kdb` binary format
- **Why:** The SRS mentions `.kdb` extension (REQ-3) but provides no format specification. Implementing a proprietary binary format would require reverse-engineering and adds unnecessary complexity for a web application.
- **Affects:** FR1 (Manage Password Database)
- **Status:** Design decision — documented in PROJECT_SCOPE.md as unsupported

### Decision 002: AES-256-GCM instead of AES-CBC
- **Decision:** Use AES-256-GCM (Galois/Counter Mode) instead of AES-CBC as specified in Section 2.5
- **Why:** GCM is more secure (provides authentication), natively supported in Web Crypto API, and recommended by NIST. CBC is vulnerable to padding oracle attacks.
- **Affects:** NFR1 (Security — Encryption)
- **Status:** Design decision — improves security over SRS spec

### Decision 003: Omit Twofish algorithm
- **Decision:** Do not implement Twofish encryption
- **Why:** Web Crypto API does not support Twofish natively. Implementing it via JavaScript library would add dependency risk and potential security vulnerabilities. AES-256-GCM is sufficient and more widely supported.
- **Affects:** NFR1 (Security — Encryption)
- **Status:** Design decision — simplifies implementation

### Decision 004: Omit ARC4 in-memory encryption
- **Decision:** Do not implement ARC4 for in-memory password encryption
- **Why:** ARC4 is deprecated (RFC 7465) and removed from Web Crypto API due to known vulnerabilities. Using AES-GCM for all encryption is more secure.
- **Affects:** NFR1 (Security — Encryption)
- **Status:** Design decision — improves security

### Decision 005: Key File Format
- **Decision:** Key files are 64-character hexadecimal strings (32 bytes random data)
- **Why:** The SRS mentions key files but provides no format specification. A simple hex string is easy to generate, parse, and validate.
- **Affects:** FR4 (Composite Master Key Authentication)
- **Status:** Design decision — not specified in SRS

### Decision 006: Auto-Type Implementation Scope
- **Decision:** Implement Auto-Type sequence parsing and validation only; clipboard copy instead of keystroke injection
- **Why:** Actual keystroke injection requires OS-level APIs (Windows SendInput) which are not available in web browsers. We can validate the sequence format and copy to clipboard.
- **Affects:** FR6 (Auto-Type)
- **Status:** Design decision — platform limitation

### Decision 007: TAN Value Storage
- **Decision:** Store TAN value in the password field of the entry with `is_tan=1` flag
- **Why:** TANs are essentially one-time passwords. Storing them in the password field reuses existing infrastructure and keeps the schema simple.
- **Affects:** FR7 (TAN Support)
- **Status:** Design decision — simplifies implementation

### Decision 008: TAN Generation Parameters
- **Decision:** Generate TANs as 8-character alphanumeric strings (A-Z, 0-9)
- **Why:** The SRS does not specify TAN generation parameters. 8 characters provides 2.1 trillion combinations, sufficient for transaction authentication.
- **Affects:** FR7 (TAN Support)
- **Status:** Design decision — not specified in SRS

### Decision 009: Clipboard Timer Client-Side
- **Decision:** Implement 10-second clipboard auto-clear on the client side using `setTimeout`
- **Why:** The SRS specifies 10-second clipboard clearing (Section 5.1). Client-side implementation is more reliable because: (1) server can't access browser clipboard, (2) no network latency, (3) works offline.
- **Affects:** NFR2 (Performance — Clipboard Auto-Clear)
- **Status:** Design decision — technical constraint

### Decision 010: Database Corruption Handling
- **Decision:** Detect corruption via foreign key validation and orphaned record checks; create automatic backups before saves
- **Why:** Section 5.2 mentions corruption from interrupted writes and a repair functionality. Full repair is extremely complex. We detect corruption and notify the user, with backups for recovery.
- **Affects:** NFR3 (Reliability/Safety — Data Integrity)
- **Status:** Design decision — simplifies repair mechanism

### Decision 011: Session-Based Authentication
- **Decision:** Use server-side sessions with 24-hour expiry stored in SQLite
- **Why:** The SRS describes master key authentication but doesn't specify session management. Server-side sessions are more secure than JWT for a password manager.
- **Affects:** FR4 (Composite Master Key Authentication)
- **Status:** Design decision — security best practice

### Decision 012: Password Generator Algorithm
- **Decision:** Use `crypto.getRandomValues()` for cryptographically secure random number generation
- **Why:** Section 3.20 describes password generation but doesn't specify the algorithm. Using Web Crypto API ensures uniform distribution and unpredictability.
- **Affects:** FR5 (Password Generator)
- **Status:** Design decision — security best practice

### Decision 013: Entry Fields Flexibility
- **Decision:** Allow entries with empty fields (no required fields except group membership)
- **Why:** Section 3.10.1 explicitly states "an entry can be added with no fields at all." This is unusual but SRS-supported.
- **Affects:** FR3 (Manage Password Entries)
- **Status:** SRS-supported — surprising but documented

### Decision 014: Group Deletion Behavior
- **Decision:** Cascade delete groups (child groups and entries are deleted when parent is deleted)
- **Why:** The SRS mentions confirmation dialog for deletion but doesn't specify cascade behavior. Cascade is the simplest and most intuitive behavior for a tree structure.
- **Affects:** FR2 (Manage Groups/Subgroups)
- **Status:** Design decision — not specified in SRS

### Decision 015: Windows Account Integration Omitted
- **Decision:** Do not implement Windows account details as a key component
- **Why:** Section 3.17 mentions Windows account integration but this is platform-specific. Our web application cannot access Windows account details.
- **Affects:** FR4 (Composite Master Key Authentication)
- **Status:** Platform limitation — excluded from scope

---

## Notes for Development

1. **All design decisions** must be mentioned in the final 300-400 word quality judgment
2. **Unsupported assumptions** are flagged in PROJECT_SCOPE.md
3. **SRS-supported behaviors** that are surprising (like empty entry fields) must be tested as-is
4. **This log is append-only** — decisions are added as they are made during implementation
