# PROJECT_SCOPE.md — KeePass Password Safe
## SE3002 Assignment 01 — Requirement Scope Selection

**SRS:** KeePass Password Safe v1.10 (2008)
**Authors:** Ali Haider Bajwa (24i-3102) & Abdul Wadood (24i-3055)
**Date:** [Date]

---

## Requirement Selection Summary

| Type | Count | Rule Compliance |
|------|-------|-----------------|
| Functional Requirements (FR) | 7 | 3 CRUD + 4 non-CRUD ✓ |
| Non-Functional Requirements (NFR) | 3 | — |
| **Total** | **10** | ≤3 CRUD FRs ✓ |

---

## 7 Functional Requirements

### FR1: Manage Password Database (New/Open/Save)

| Field | Value |
|-------|-------|
| **Req ID** | FR1 |
| **Type** | FR — CRUD |
| **Requirement** | Create a new encrypted database with a master key, open an existing database by navigating to its file and authenticating, and save changes to the database. |
| **SRS Reference** | REQ-1, REQ-2, REQ-3, REQ-4 (Sections 3.1, 3.2, 3.3) |
| **Why Selected** | Core entity management for the primary data store; foundational for all other features. Clear CRUD cycle (Create/Read/Update) with well-defined data flows and alternative flows in the SRS. |
| **Implementation Risk** | The SRS specifies `.kdb` file format (REQ-3) but provides no format specification. The actual file structure, encryption envelope, and serialization are design decisions not covered by the SRS. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — REQ-1 through REQ-4 are explicitly stated. The `.kdb` extension is mentioned in REQ-3. However, the internal file format is **unsupported** by the SRS (see Unsupported Assumptions below). |

---

### FR2: Manage Groups and Subgroups (Add/Modify/Delete/Find)

| Field | Value |
|-------|-------|
| **Req ID** | FR2 |
| **Type** | FR — CRUD |
| **Requirement** | Add new groups/subgroups with a required name, rename existing groups/subgroups, delete groups/subgroups with confirmation, and find entries within a specific group by keyword. |
| **SRS Reference** | REQ-7, REQ-8, REQ-9, REQ-10 (Sections 3.6, 3.7, 3.8, 3.9) |
| **Why Selected** | Organizational entity management; the group tree is the primary navigation structure. Clear validation rules (name required, parent must exist) provide good test conditions. |
| **Implementation Risk** | The SRS defines a tree hierarchy but does not specify maximum depth, concurrent access rules, or what happens to child entries when a group is deleted. These are design decisions. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — REQ-7 to REQ-10 are explicitly stated. The "subgroup requires selected group" rule (REQ-8) and "name required" rules (REQ-7, REQ-9) are clear. Deletion behavior with child entries is **unsupported** — the SRS only mentions confirmation dialog, not cascade rules. |

---

### FR3: Manage Password Entries (Add/View-Edit/Duplicate/Delete)

| Field | Value |
|-------|-------|
| **Req ID** | FR3 |
| **Type** | FR — CRUD |
| **Requirement** | Add new entries (title, username, password, URL, notes) to a group with password confirmation validation, view/edit existing entries, duplicate entries within the same group, and delete entries with confirmation. |
| **SRS Reference** | REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17 (Sections 3.10, 3.11, 3.12, 3.13) |
| **Why Selected** | Core data entity management; entries are the primary value stored. Rich validation rules (password match, required group, selection required) provide excellent boundary and error test cases. |
| **Implementation Risk** | The SRS states "not all fields are required" and "an entry can be added with no fields at all" (Section 3.10.1). This flexibility may conflict with typical validation expectations. Password confirmation rules (REQ-12, REQ-13, REQ-15) are clear but must be implemented consistently across add and edit flows. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — REQ-11 to REQ-17 are explicitly stated. Password matching rules are unambiguous. The "entry can have no fields" behavior is SRS-supported (Section 3.10.1) but may be a surprising design choice. |

---

### FR4: Composite Master Key Authentication

| Field | Value |
|-------|-------|
| **Req ID** | FR4 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Authenticate using a master password, a key file, or both (composite key). If any required component is missing or wrong, the database must not open. No recovery mechanism exists for lost credentials. No backdoor exists. |
| **SRS Reference** | REQ-24, REQ-25, REQ-26, REQ-27, REQ-28 (Section 3.17) |
| **Why Selected** | Critical security behaviour with clear, testable rules. The "no recovery" and "no backdoor" constraints are absolute and defensible. Non-trivial authentication logic that goes beyond simple CRUD. |
| **Implementation Risk** | The SRS mentions "Windows account details" as a potential key component (Section 3.17.1). This is platform-specific and must be excluded from our web-based implementation. The key file format is not specified. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — REQ-24 to REQ-28 are explicitly stated. The three authentication modes (password-only, key-file-only, composite) are clearly defined. The "no recovery" rule (REQ-27) and "no backdoor" rule (REQ-28) are unambiguous. **Design decision** — we will implement password + key file only, excluding Windows account integration. |

---

### FR5: Password Generator

| Field | Value |
|-------|-------|
| **Req ID** | FR5 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Generate random passwords based on configurable character sets (uppercase, lowercase, digits, special characters) and length. The generator can be disabled by setting length to 0. Generated passwords can be accepted or replaced by the user. |
| **SRS Reference** | Section 3.20 (Password Generator) |
| **Why Selected** | Non-trivial business logic with clear inputs (character set, length) and outputs (random password). Provides good test conditions for randomness validation, boundary values (length=0, minimum length), and configuration. |
| **Implementation Risk** | The SRS describes generation "based on character sets and patterns" and "according to rules" but does not specify the actual generation algorithm, pattern syntax, or rule definitions. These are design decisions. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **Design decision** — Section 3.20 describes the feature at a high level but provides no algorithmic specification. We will implement character-set-based generation with configurable length. Pattern-based and rule-based generation are **unsupported** by the SRS and will be excluded or simplified. |

---

### FR6: Auto-Type

| Field | Value |
|-------|-------|
| **Req ID** | FR6 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Allow users to define a keystroke sequence prefixed with "Auto-Type:" in the notes field of an entry. The sequence must be ≤59 characters (one line). If two auto-type sequences exist in one note, only the first is used. The default sequence is `{USERNAME}{TAB}{PASSWORD}{ENTER}`. |
| **SRS Reference** | REQ-19, REQ-20, REQ-21 (Section 3.15) |
| **Why Selected** | Unique non-CRUD feature with clear, testable constraints (prefix requirement, length limit, first-wins rule). Demonstrates parsing logic and business rule enforcement. |
| **Implementation Risk** | The SRS describes sending keystrokes to "any other open window like browsers or login accounts" (Section 3.15.1). Actual keystroke injection is platform-specific and requires OS-level APIs. In a web implementation, this can only be simulated or restricted to clipboard copy. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — REQ-19 to REQ-21 are explicitly stated. The prefix rule, length limit, and first-wins rule are unambiguous. **Unsupported** — actual keystroke sending to other windows is platform-specific and cannot be replicated in a web application. We will implement the sequence parsing and validation logic, but "sending" will be limited to clipboard copy. |

---

### FR7: TAN (Transaction Authentication Number) Support

| Field | Value |
|-------|-------|
| **Req ID** | FR7 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Create one-time-use TAN entries via a TAN wizard. TANs appear as entries with title "<TAN>". Title, username, and URL fields cannot be modified in TAN entries. When a TAN is used, it expires automatically and cannot be used again. |
| **SRS Reference** | REQ-32, REQ-33 (Section 3.21) |
| **Why Selected** | Unique security feature with clear business rules (one-time use, auto-expire, field restrictions). Good for testing state transitions (active → expired) and constraint enforcement. |
| **Implementation Risk** | The SRS does not specify the TAN generation algorithm (length, character set). The "used" trigger — how the system detects a TAN has been "used" — is not defined. We will need to make design decisions about TAN generation and usage tracking. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — REQ-32 and REQ-33 are explicit. The "<TAN>" title convention, field immutability, and auto-expiration rules are clear. **Design decision** — TAN generation parameters and the "usage" detection mechanism are not specified in the SRS. |

---

## 3 Non-Functional Requirements

### NFR1: Security — Encryption

| Field | Value |
|-------|-------|
| **Req ID** | NFR1 |
| **Type** | NFR — Security |
| **Requirement** | The database must be encrypted using AES (Rijndael) with 128-bit block size and 256-bit key size, or Twofish with 256-bit block size and 128-bit key size. A random 128-bit initialization vector must be generated on each save. The 256-bit cipher key must be derived using SHA-256. In-memory passwords must be encrypted using ARC4 with a random 12-byte key. |
| **SRS Reference** | Section 2.5 (Design and Implementation Constraints) |
| **Why Selected** | Core security requirement for a password manager. The SRS provides specific algorithm names, block sizes, and key sizes — making this highly testable and defensible. |
| **Implementation Risk** | Web Crypto API supports AES-GCM (similar to AES-CBC) but not Twofish natively. SHA-256 is available. ARC4 is deprecated and not available in Web Crypto. We will need to make design decisions about algorithm substitutions. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — Algorithm specifications are explicit in Section 2.5. **Design decision** — we may substitute AES-256-GCM for AES-CBC (more secure, available in Web Crypto), use a JavaScript Twofish library, and replace ARC4 with AES-GCM for in-memory encryption. These substitutions improve security but deviate from the exact SRS specification. |

---

### NFR2: Performance — Clipboard Auto-Clear

| Field | Value |
|-------|-------|
| **Req ID** | NFR2 |
| **Type** | NFR — Performance |
| **Requirement** | When a password is copied to the clipboard, it must be automatically cleared after exactly 10 seconds. If the password is not pasted within this window, the user must recopy it. |
| **SRS Reference** | Section 5.1 (Performance Requirements) |
| **Why Selected** | Clear, measurable, time-bound requirement. Excellent for boundary testing (9.9s vs 10.1s). Directly tied to security (prevents password leakage via clipboard). |
| **Implementation Risk** | Clipboard API in browsers has security restrictions. `navigator.clipboard.writeText()` is available but `clearClipboard()` after a timeout requires the page to remain active. Tab switching or browser throttling may affect timer accuracy. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — The 10-second timeout is explicitly stated in Section 5.1. The security rationale ("password cannot be found by anyone later") is clear. **Design decision** — browser clipboard API limitations may require us to implement this as "best effort" rather than guaranteed 10-second clearing. |

---

### NFR3: Reliability/Safety — Data Integrity

| Field | Value |
|-------|-------|
| **Req ID** | NFR3 |
| **Type** | NFR — Reliability/Safety |
| **Requirement** | The system must handle interrupted writes gracefully. If a database file is corrupted (e.g., due to interrupted save), the system should detect this and inform the user. Lost master passwords result in permanent data loss with no recovery. Corrupted database headers render the file unrecoverable. Regular backups should be recommended. |
| **SRS Reference** | Section 5.2 (Safety Requirements) |
| **Why Selected** | Important reliability requirement for a security-critical application. The SRS explicitly states the failure modes and their consequences, making this testable. |
| **Implementation Risk** | The SRS mentions a "repair functionality" accessible from the tools menu (Section 5.2). Implementing actual database repair is extremely complex. We will detect corruption but cannot implement full repair. |
| **AI Assumption** | *(To be filled during development)* |
| **Defence / Basis** | **SRS-supported** — Section 5.2 explicitly describes: (1) corruption from interrupted USB writes, (2) no recovery for lost master passwords, (3) unrecoverable corrupted headers, (4) backup recommendation. **Design decision** — we will implement corruption detection (hash validation) and user notification, but not the repair functionality. |

---

## Unsupported Assumptions — Flagged for Awareness

The following aspects of the scope have **no defensible SRS basis** and will require explicit design decisions. These are not hidden — they are flagged here before development begins.

| # | Unsupported Aspect | Why It's Unsupported | Our Design Decision |
|---|-------------------|---------------------|---------------------|
| 1 | **`.kdb` file format** | REQ-3 mentions the extension but provides no format specification. The actual binary structure, encryption envelope, and serialization format are not in the SRS. | We will define a JSON-based database format for our web implementation. This is a **design decision** — not SRS-supported. |
| 2 | **Twofish algorithm** | Section 2.5 names Twofish but provides no implementation guidance. Web Crypto API does not support Twofish natively. | We will use AES-256-GCM as the primary cipher (stronger than AES-CBC, natively supported). Twofish will be omitted or implemented via a JavaScript library. This is a **design decision**. |
| 3 | **ARC4 in-memory encryption** | Section 2.5 specifies ARC4 with 12-byte key. ARC4 is deprecated and removed from Web Crypto API. | We will use AES-GCM for in-memory password encryption. This is a **design decision** that improves security. |
| 4 | **Auto-Type keystroke injection** | Section 3.15 describes sending keystrokes to other windows. This requires OS-level APIs (e.g., Windows `SendInput`). Not possible in a web browser. | We will implement Auto-Type sequence parsing, validation, and clipboard copy. Actual keystroke injection will be **simulated** or omitted. This is a **design decision**. |
| 5 | **Global hotkey (Ctrl+Alt+K)** | REQ-31 specifies a system-wide hotkey. This requires OS-level registration. Not possible in a web application. | We will implement a keyboard shortcut within the web app (e.g., Ctrl+K). System-wide hotkey is **unsupported** and will be omitted. |
| 6 | **Key file format** | Section 3.17 describes key files but provides no format specification. The SRS says "a file that locks the database" without defining the file structure. | We will define a simple key file format (e.g., random bytes or a text-based format). This is a **design decision**. |
| 7 | **USB portability** | Section 5.2 mentions USB removal causing corruption. The SRS assumes a desktop application that can be run from a USB drive. | Our web implementation cannot run from a USB. This is an **unsupported** constraint from the original SRS context. |
| 8 | **Windows account integration** | Section 3.17 mentions "Windows account details" as a key component. This is platform-specific. | We will exclude Windows account integration. Only password and key file authentication will be supported. This is a **design decision**. |
| 9 | **Password generation algorithms** | Section 3.20 describes generation "based on character sets and patterns" but provides no algorithm specification. | We will implement character-set-based random generation with configurable length. Pattern-based generation is a **design decision** not specified in the SRS. |
| 10 | **TAN generation parameters** | Section 3.21 describes TANs but provides no specification for length, character set, or generation method. | We will generate TANs as 8-character alphanumeric strings. This is a **design decision** not specified in the SRS. |
| 11 | **Database repair functionality** | Section 5.2 mentions repair from the tools menu but provides no specification for how repair works. | We will detect corruption and notify the user, but not implement repair. This is a **design decision**. |
| 12 | **Print database functionality** | Section 3.4 describes printing but this is not selected as an FR. If implemented, the SRS specifies field selection but not print layout. | Not in scope. If added later, print layout is a **design decision**. |

---

## Traceability Matrix (Pre-Development)

| Req ID | Type | SRS Requirement IDs | CRUD? | Test Readiness |
|--------|------|---------------------|-------|----------------|
| FR1 | FR | REQ-1, REQ-2, REQ-3, REQ-4 | Yes | High — clear data flows |
| FR2 | FR | REQ-7, REQ-8, REQ-9, REQ-10 | Yes | High — validation rules clear |
| FR3 | FR | REQ-11–REQ-17 | Yes | High — password match rules |
| FR4 | FR | REQ-24–REQ-28 | No | High — absolute rules |
| FR5 | FR | Section 3.20 | No | Medium — algorithm undefined |
| FR6 | FR | REQ-19, REQ-20, REQ-21 | No | High — prefix/length rules |
| FR7 | FR | REQ-32, REQ-33 | No | High — state transition |
| NFR1 | NFR | Section 2.5 | — | Medium — algorithm substitution |
| NFR2 | NFR | Section 5.1 | — | High — measurable timeout |
| NFR3 | NFR | Section 5.2 | — | Medium — repair not implemented |

---

## Notes for Development

1. **AI Assumption column** will be filled during development as assumptions are introduced.
2. **All design decisions** listed above must be documented in the final report with rationale.
3. **Unsupported assumptions** must be explicitly mentioned in the Part 1 table of the assignment submission.
4. The **frozen baseline** will be the first complete runnable implementation — all design decisions are locked at that point.
5. **SonarQube** will scan the entire frozen codebase — ensure no secrets or API keys are hardcoded.
6. **Jira defects** will be logged for confirmed, reproducible implementation defects only — not for design decisions that deviate from the SRS.
