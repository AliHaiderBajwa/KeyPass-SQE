# SE3002 Assignment 01 — Submission Report

## Quality Evaluation of AI-Generated Software

**SRS:** KeePass Password Safe v1.10 (2008)
**Team:** Ali Haider Bajwa (24i-3102) & Abdul Wadood (24i-3055)
**GitHub:** https://github.com/AliHaiderBajwa/KeyPass-SQE.git
**SonarCloud:** https://sonarcloud.io/dashboard?id=AliHaiderBajwa_KeyPass-SQE
**Jira Project:** KAN — https://alihaiderbajwa123.atlassian.net/jira/software/projects/KAN/

### Submission Checklist

| Item | Status | Location |
|------|--------|----------|
| Pair details and SRS selection | Complete | This report, top of Part 1 |
| 7 FR + 3 NFR scope table with AI assumptions | Complete | Part 1 (lines 11-154) |
| Frozen baseline source code + run instructions | Complete | Part 2 + GitHub repo |
| AI-assisted development record | Complete | Part 2 (lines 185-189) |
| SonarQube report/evidence (complete codebase) | Complete | `sonarcube_output.pdf` + Part 3A |
| SonarQube 5 findings interpreted | Complete | Part 3A (lines 208-243) |
| NFR1 evaluation (Security/Encryption) | Complete | Part 3A NFR table row 1 |
| NFR2 evaluation (Clipboard Auto-Clear) | Complete | Part 3A NFR table row 2 |
| NFR3 evaluation (Reliability/Safety) | Complete | Part 3A NFR table row 3 |
| 12-15 executed test cases | Complete | Part 3B — 16 test cases (TC-01 to TC-16) |
| ≥2 boundary test cases | Complete | TC-03, TC-09, TC-13 (3 total) |
| ≥2 invalid/error test cases | Complete | TC-02, TC-05, TC-07 (3 total) |
| ≥3 manual system-level test cases | Complete | TC-01, TC-04, TC-06, TC-11, TC-14, TC-15, TC-16 (7 total) |
| ≥2 FAILED/BLOCKED test cases | Complete | TC-05 (FAILED), TC-15 (BLOCKED), TC-16 (FAILED) |
| Test condition table (Table A) | Complete | Part 3B (lines 257-282) |
| Test case records (Table B) | Complete | Part 3B (lines 284-524) |
| Traceability table (Table C) | Complete | Part 3B (lines 528-547) |
| Jira defect evidence | **PLACEHOLDER** | Part 4 — to be logged before submission |
| Final quality judgment (300-400 words) | Complete | Part 4 (lines 619-629) |

---

## Part 1 — Requirement Scope and AI Assumptions (30 marks)

### Requirement Selection Summary

| Type | Count | Rule Compliance |
|------|-------|-----------------|
| Functional Requirements (FR) | 7 | 3 CRUD + 4 non-CRUD ✓ |
| Non-Functional Requirements (NFR) | 3 | — |
| **Total** | **10** | ≤3 CRUD FRs ✓ |

### 7 Functional Requirements

#### FR1: Manage Password Database (New/Open/Save)

| Field | Value |
|-------|-------|
| **Req ID** | FR1 |
| **Type** | FR — CRUD |
| **Requirement** | Create a new encrypted database with a master key, open an existing database by navigating to its file and authenticating, and save changes to the database. |
| **SRS Reference** | REQ-1, REQ-2, REQ-3, REQ-4 (Sections 3.1, 3.2, 3.3) |
| **Why Selected** | Core entity management for the primary data store; foundational for all other features. Clear CRUD cycle (Create/Read/Update) with well-defined data flows and alternative flows in the SRS. |
| **Implementation Risk** | The SRS specifies `.kdb` file format (REQ-3) but provides no format specification. The actual file structure, encryption envelope, and serialization are design decisions not covered by the SRS. |
| **AI Assumption** | We used a JSON-based database format stored in SQLite instead of the SRS-specified `.kdb` binary format. The database stores encrypted data as a binary blob in SQLite rather than as a standalone file. |
| **Defence / Basis** | **Design decision** — The SRS mentions `.kdb` extension but provides no format specification. SQLite provides ACID compliance and is appropriate for a web application. This is a justified design decision, not SRS-supported. |

#### FR2: Manage Groups and Subgroups (Add/Modify/Delete/Find)

| Field | Value |
|-------|-------|
| **Req ID** | FR2 |
| **Type** | FR — CRUD |
| **Requirement** | Add new groups/subgroups with a required name, rename existing groups/subgroups, delete groups/subgroups with confirmation, and find entries within a specific group by keyword. |
| **SRS Reference** | REQ-7, REQ-8, REQ-9, REQ-10 (Sections 3.6, 3.7, 3.8, 3.9) |
| **Why Selected** | Organizational entity management; the group tree is the primary navigation structure. Clear validation rules (name required, parent must exist) provide good test conditions. |
| **Implementation Risk** | The SRS defines a tree hierarchy but does not specify maximum depth, concurrent access rules, or what happens to child entries when a group is deleted. |
| **AI Assumption** | When a group is deleted, all child groups and their entries are recursively deleted. No maximum depth limit is enforced. |
| **Defence / Basis** | **Unsupported** — The SRS only mentions confirmation dialog for deletion but does not specify cascade behavior. The recursive deletion is an AI-introduced assumption. We chose this behavior because it is the most common pattern for hierarchical data, but it deviates from the SRS silence on this point. |

#### FR3: Manage Password Entries (Add/View-Edit/Duplicate/Delete)

| Field | Value |
|-------|-------|
| **Req ID** | FR3 |
| **Type** | FR — CRUD |
| **Requirement** | Add new entries (title, username, password, URL, notes) to a group with password confirmation validation, view/edit existing entries, duplicate entries within the same group, and delete entries with confirmation. |
| **SRS Reference** | REQ-11, REQ-12, REQ-13, REQ-14, REQ-15, REQ-16, REQ-17 (Sections 3.10, 3.11, 3.12, 3.13) |
| **Why Selected** | Core data entity management; entries are the primary value stored. Rich validation rules (password match, required group, selection required) provide excellent boundary and error test cases. |
| **Implementation Risk** | The SRS states "not all fields are required" and "an entry can be added with no fields at all" (Section 3.10.1). This flexibility may conflict with typical validation expectations. |
| **AI Assumption** | We require at least a title field when creating an entry, deviating from the SRS allowance of empty entries. Username and password fields are optional. |
| **Defence / Basis** | **Design decision** — The SRS allows entries with no fields at all, but requiring a title is a reasonable UX decision. An entry with no title would be unusable. This is a justified deviation from the SRS. |

#### FR4: Composite Master Key Authentication

| Field | Value |
|-------|-------|
| **Req ID** | FR4 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Authenticate using a master password, a key file, or both (composite key). If any required component is missing or wrong, the database must not open. No recovery mechanism exists for lost credentials. No backdoor exists. |
| **SRS Reference** | REQ-24, REQ-25, REQ-26, REQ-27, REQ-28 (Section 3.17) |
| **Why Selected** | Critical security behaviour with clear, testable rules. The "no recovery" and "no backdoor" constraints are absolute and defensible. |
| **Implementation Risk** | The SRS mentions "Windows account details" as a potential key component (Section 3.17.1). This is platform-specific and must be excluded from our web-based implementation. |
| **AI Assumption** | We only support password-only and password+key-file authentication. Key-file-only authentication is excluded. |
| **Defence / Basis** | **Design decision** — The SRS defines three authentication modes, but key-file-only is unusual for most users. We excluded it for simplicity. This is a design decision, not SRS-supported. |

#### FR5: Password Generator

| Field | Value |
|-------|-------|
| **Req ID** | FR5 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Generate random passwords based on configurable character sets (uppercase, lowercase, digits, special characters) and length. The generator can be disabled by setting length to 0. Generated passwords can be accepted or replaced by the user. |
| **SRS Reference** | Section 3.20 (Password Generator) |
| **Why Selected** | Non-trivial business logic with clear inputs (character set, length) and outputs (random password). Provides good test conditions for randomness validation, boundary values (length=0, minimum length). |
| **Implementation Risk** | The SRS describes generation "based on character sets and patterns" but does not specify the actual generation algorithm, pattern syntax, or rule definitions. |
| **AI Assumption** | We use `crypto.randomBytes()` for cryptographically secure random generation. The minimum length is 8 characters. The generator is always enabled (no length=0 disable). |
| **Defence / Basis** | **Design decision** — The SRS describes high-level behavior but provides no algorithm specification. We chose cryptographically secure generation for security. The minimum length of 8 is a reasonable security baseline. |

#### FR6: Auto-Type

| Field | Value |
|-------|-------|
| **Req ID** | FR6 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Allow users to define a keystroke sequence prefixed with "Auto-Type:" in the notes field of an entry. The sequence must be ≤59 characters (one line). If two auto-type sequences exist in one note, only the first is used. The default sequence is `{USERNAME}{TAB}{PASSWORD}{ENTER}`. |
| **SRS Reference** | REQ-19, REQ-20, REQ-21 (Section 3.15) |
| **Why Selected** | Unique non-CRUD feature with clear, testable constraints (prefix requirement, length limit, first-wins rule). Demonstrates parsing logic and business rule enforcement. |
| **Implementation Risk** | The SRS describes sending keystrokes to "any other open window like browsers or login accounts" (Section 3.15.1). Actual keystroke injection is platform-specific and requires OS-level APIs. |
| **AI Assumption** | We implement Auto-Type as a sequence parser that validates the prefix and length. Actual keystroke sending is replaced with clipboard copy. |
| **Defence / Basis** | **Unsupported** — The SRS describes keystroke injection to other windows, which is impossible in a web browser. We implemented parsing and validation but not the actual sending. This is an unsupported assumption because the core behavior (sending keystrokes) is omitted. |

#### FR7: TAN (Transaction Authentication Number) Support

| Field | Value |
|-------|-------|
| **Req ID** | FR7 |
| **Type** | FR — Non-CRUD |
| **Requirement** | Create one-time-use TAN entries via a TAN wizard. TANs appear as entries with title "<TAN>". Title, username, and URL fields cannot be modified in TAN entries. When a TAN is used, it expires automatically and cannot be used again. |
| **SRS Reference** | REQ-32, REQ-33 (Section 3.21) |
| **Why Selected** | Unique security feature with clear business rules (one-time use, auto-expire, field restrictions). Good for testing state transitions (active → expired) and constraint enforcement. |
| **Implementation Risk** | The SRS does not specify the TAN generation algorithm (length, character set). The "used" trigger — how the system detects a TAN has been "used" — is not defined. |
| **AI Assumption** | TANs are generated as 8-character alphanumeric strings. TANs expire when the user marks them as "used" via a button. Title, username, and URL fields are read-only for TAN entries. |
| **Defence / Basis** | **Design decision** — The SRS describes TAN behavior but provides no generation specification. We chose 8-character alphanumeric for reasonable security. The "mark as used" trigger is a design decision. |

### 3 Non-Functional Requirements

#### NFR1: Security — Encryption

| Field | Value |
|-------|-------|
| **Req ID** | NFR1 |
| **Type** | NFR — Security |
| **Requirement** | The database must be encrypted using AES (Rijndael) with 128-bit block size and 256-bit key size, or Twofish with 256-bit block size and 128-bit key size. A random 128-bit initialization vector must be generated on each save. The 256-bit cipher key must be derived using SHA-256. In-memory passwords must be encrypted using ARC4 with a random 12-byte key. |
| **SRS Reference** | Section 2.5 (Design and Implementation Constraints) |
| **Why Selected** | Core security requirement for a password manager. The SRS provides specific algorithm names, block sizes, and key sizes — making this highly testable and defensible. |
| **Implementation Risk** | Web Crypto API supports AES-GCM but not Twofish natively. ARC4 is deprecated and not available in Web Crypto. |
| **AI Assumption** | We use AES-256-GCM (authenticated encryption) instead of AES-CBC. We omit Twofish. We use AES-GCM for in-memory encryption instead of ARC4. |
| **Defence / Basis** | **Design decision** — AES-GCM is more secure than AES-CBC (provides authentication). Omitting Twofish is acceptable because AES is sufficient. Replacing ARC4 with AES-GCM improves security. These are justified substitutions, not SRS-supported. |

#### NFR2: Performance — Clipboard Auto-Clear

| Field | Value |
|-------|-------|
| **Req ID** | NFR2 |
| **Type** | NFR — Performance |
| **Requirement** | When a password is copied to the clipboard, it must be automatically cleared after exactly 10 seconds. If the password is not pasted within this window, the user must recopy it. |
| **SRS Reference** | Section 5.1 (Performance Requirements) |
| **Why Selected** | Clear, measurable, time-bound requirement. Excellent for boundary testing (9.9s vs 10.1s). Directly tied to security (prevents password leakage via clipboard). |
| **Implementation Risk** | Clipboard API in browsers has security restrictions. `navigator.clipboard.writeText()` is available but clearing after a timeout requires the page to remain active. |
| **AI Assumption** | We implement clipboard clearing as "best effort" — clearing the clipboard after 10 seconds using `setTimeout`. If the user switches tabs, the timer may be throttled by the browser. |
| **Defence / Basis** | **Design decision** — Browser clipboard APIs have security restrictions. We cannot guarantee exact 10-second clearing in all scenarios (e.g., when the tab is inactive). This is a justified limitation, not an unsupported assumption. |

#### NFR3: Reliability/Safety — Data Integrity

| Field | Value |
|-------|-------|
| **Req ID** | NFR3 |
| **Type** | NFR — Reliability/Safety |
| **Requirement** | The system must handle interrupted writes gracefully. If a database file is corrupted (e.g., due to interrupted save), the system should detect this and inform the user. Lost master passwords result in permanent data loss with no recovery. Corrupted database headers render the file unrecoverable. |
| **SRS Reference** | Section 5.2 (Safety Requirements) |
| **Why Selected** | Important reliability requirement for a security-critical application. The SRS explicitly states the failure modes and their consequences, making this testable. |
| **Implementation Risk** | The SRS mentions a "repair functionality" accessible from the tools menu (Section 5.2). Implementing actual database repair is extremely complex. |
| **AI Assumption** | We detect corruption by validating the database structure (checking required tables and columns). We notify the user if corruption is detected. We do not implement repair functionality. |
| **Defence / Basis** | **Design decision** — Corruption detection via structural validation is reasonable. The SRS mentions repair but provides no specification for how it works. We implement detection but not repair, which is a justified design decision. |

---

## Part 2 — AI-Generated GUI Baseline (10 marks)

### Implementation Summary

The application is a web-based password manager with:

- **Frontend:** React + TypeScript + Tailwind CSS v4 + Vite
- **Backend:** Node.js + Express + TypeScript + SQLite (better-sqlite3)
- **Icons:** lucide-react
- **Build:** Vite for frontend, tsx for server

### Key Features Implemented

1. **FR1:** Create/Open/Close database with password authentication
2. **FR2:** Hierarchical groups with create/rename/delete
3. **FR3:** Entries with create/edit/delete and copy-to-clipboard
4. **FR4:** Password-only and password+key-file authentication
5. **FR5:** Password generator with configurable length and character sets
6. **FR6:** Auto-Type sequence parsing and validation
7. **FR7:** TAN generation and one-time-use tracking
8. **NFR1:** AES-256-GCM encryption with PBKDF2 key derivation
9. **NFR2:** 10-second clipboard auto-clear
10. **NFR3:** Database corruption detection

### Frozen Baseline

The first complete runnable version was committed at commit `c355c30` (Initial commit). All subsequent changes were additive or corrective. The baseline is preserved in git history.

### AI-Assisted Development Record

- **Tool used:** OpenCode (AI-assisted coding tool)
- **Approach:** The AI was given the SRS document and asked to implement the selected requirements. The AI generated the initial codebase structure, server routes, client components, and database schema. Manual review and adjustments were made to fix API mismatches and ensure correct behavior.
- **Major assumptions:** See Part 1 AI Assumption column for each requirement.

### Setup / Run Instructions

```bash
# Clone the repository
git clone https://github.com/AliHaiderBajwa/KeyPass-SQE.git
cd KeyPass-SQE

# Install dependencies
npm install
cd client && npm install && cd ..

# Start the server (port 3001)
npx tsx server/src/app.ts

# In a separate terminal, start the client (port 5173)
cd client && npx vite --port 5173

# Open browser to http://localhost:5173
```

**Requirements:** Node.js 18+, npm

---

## Part 3 — Quality Evaluation (45 marks)

### A. SonarQube Report and NFR Evaluation (15 marks)

**SonarQube Configuration:**
- **Project Key:** AliHaiderBajwa_KeyPass-SQE
- **Organization:** alihaiderbajwa
- **Server:** SonarCloud (https://sonarcloud.io)
- **Evidence File:** `sonarcube_output.pdf` (5-page export of full scan results)

**SonarQube Summary:**
- **Total Issues:** 115 issues, 24h estimated effort
- **Security (Vulnerabilities):** 6 issues, 5h 45min effort
- **Reliability (Bugs):** 70 issues, 6h 10min effort
- **Maintainability (Code Smells):** 39 issues

**SonarQube Findings (5 meaningful findings):**

#### Finding 1: Client-Side Request Forgery via Unsanitized User Input (Security — High)

- **What SonarQube reported:** User-supplied input is used directly in API requests without sanitization, potentially allowing client-side request forgery attacks.
- **Where it occurs:** `client/src/hooks/useDatabase.ts` lines 188 and 209 — entry creation and update endpoints forward user input to the server.
- **Why it matters:** An attacker could craft malicious input that causes the server to make unintended requests. This is a **High severity** security vulnerability.
- **Action:** Sanitize and validate all user input before sending to the server. Implement input validation on both client and server sides.

#### Finding 2: API Traversal via Unsanitized User Input (Security — Medium)

- **What SonarQube reported:** User input is used in API paths without sanitization, potentially allowing directory/path traversal attacks.
- **Where it occurs:** `client/src/hooks/useDatabase.ts` lines 188 and 209 — entry and group IDs are passed directly in API URLs.
- **Why it matters:** An attacker could manipulate IDs to access unauthorized resources. This is a **Medium severity** security vulnerability.
- **Action:** Validate that IDs match expected formats (e.g., UUID) before using them in API calls.

#### Finding 3: CORS Configuration Enabled (Security — Medium)

- **What SonarQube reported:** Cross-Origin Resource Sharing (CORS) is enabled with permissive settings.
- **Where it occurs:** `server/src/app.ts` line 10 — `app.use(cors())` with no origin restrictions.
- **Why it matters:** Permissive CORS allows any origin to make requests to the API, potentially enabling cross-site attacks. This is a **Medium severity** security issue.
- **Action:** Restrict CORS to specific trusted origins in production. For development, the current configuration is acceptable.

#### Finding 4: Form Label Accessibility Issues (Reliability — Medium)

- **What SonarQube reported:** Form input fields are not properly associated with their labels using `htmlFor`/`id` attributes.
- **Where it occurs:** Multiple components — `AuthDialog.tsx` L83, `DatabaseManager.tsx` L79, L92, L102, L142.
- **Why it matters:** Screen readers and assistive technologies cannot properly identify form fields, reducing accessibility for users with disabilities. This is a **Medium severity** reliability issue.
- **Action:** Add `id` attributes to inputs and `htmlFor` attributes to labels to create proper associations.

#### Finding 5: autoFocus Attribute Reduces Accessibility (Reliability — Medium, Maintainability — Low)

- **What SonarQube reported:** The `autoFocus` attribute on form elements can reduce usability and accessibility for users.
- **Where it occurs:** `AuthDialog.tsx` L78, `DatabaseManager.tsx` L87.
- **Why it matters:** Automatic focus can disrupt screen reader users and keyboard navigation. SonarQube flags this as both a **Medium reliability** and **Low maintainability** issue.
- **Action:** Remove `autoFocus` attributes or implement focus management that respects user preferences and accessibility standards.

### NFR Evaluation

| NFR | SonarQube Evidence | Other Evaluation Method | Finding / Judgment | Limitation |
|-----|-------------------|------------------------|-------------------|------------|
| NFR1: Security | 6 vulnerabilities found (2 High, 3 Medium, 1 Low); security hotspots require review | Code inspection: AES-256-GCM implemented via Node.js crypto module with PBKDF2 key derivation (100,000 iterations) | Encryption implementation meets security requirements; input validation vulnerabilities identified and need remediation | Cannot verify encryption strength without cryptographic audit |
| NFR2: Performance | N/A (runtime behavior not measured by SonarQube) | Manual testing: Timer-based clipboard clearing implemented using setTimeout | Clipboard clears after 10 seconds in active tab; browser throttling may affect accuracy when tab is inactive | Cannot guarantee exact 10-second clearing in all browser states |
| NFR3: Reliability | 70 reliability bugs identified; form accessibility issues affect usability | Code inspection: Database corruption detection via table/column validation | Corruption detection works; no repair functionality implemented; accessibility issues need attention | SRS mentions repair but no specification provided; repair not implemented |

---

### B. Functional Test Derivation, Execution and Traceability (30 marks)

#### Table A — Test Condition Record

| Test Basis / Requirement | Condition ID | Test Condition |
|--------------------------|--------------|----------------|
| FR1: Create database | COND-01 | Create database with valid name and password |
| FR1: Create database | COND-02 | Create database with duplicate name |
| FR1: Create database | COND-03 | Create database with password < 8 characters |
| FR1: Open database | COND-04 | Open database with correct credentials |
| FR1: Open database | COND-05 | Open database with wrong password |
| FR2: Create group | COND-06 | Create group with valid name |
| FR2: Create group | COND-07 | Create group with empty name |
| FR2: Delete group | COND-08 | Delete group with entries |
| FR3: Create entry | COND-09 | Create entry with all fields |
| FR3: Create entry | COND-10 | Create entry with only title |
| FR3: Edit entry | COND-11 | Edit entry fields |
| FR3: Delete entry | COND-12 | Delete entry |
| FR4: Authentication | COND-13 | Login with password only |
| FR4: Authentication | COND-14 | Login with wrong password |
| FR4: Authentication | COND-15 | Login with password + key file |
| FR5: Password generator | COND-16 | Generate password with default settings |
| FR5: Password generator | COND-17 | Generate password with custom length |
| FR6: Auto-Type | COND-18 | Parse valid Auto-Type sequence |
| FR6: Auto-Type | COND-19 | Parse Auto-Type sequence > 59 characters |
| FR7: TAN support | COND-20 | Create TAN entry |
| FR7: TAN support | COND-21 | Use TAN (mark as used) |
| NFR2: Clipboard | COND-22 | Verify clipboard clears after 10 seconds |

#### Table B — Test Case Record

**TC-01: Create Database with Valid Credentials**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-01 — Create Database (Normal) |
| **Level / Category** | System-level / Manual / Normal |
| **Test Basis / Objective** | FR1: Verify database creation with valid name and password |
| **Preconditions** | Server is running; no database with name "TestDB" exists |
| **Test Data** | Name: "TestDB", Password: "SecurePass123!" |
| **Steps** | 1. Open browser to http://localhost:5173<br>2. Click "Create New Database"<br>3. Enter "TestDB" as name<br>4. Enter "SecurePass123!" as password<br>5. Confirm password<br>6. Click "Create Database" |
| **Expected Result** | Database is created; user is redirected to main view with empty groups |
| **Actual Result** | Database created successfully; main view shows with "TestDB" in header |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC01-home-screen.png` — main view after database creation |

**TC-02: Create Database with Duplicate Name**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-02 — Create Database (Duplicate Name) |
| **Level / Category** | Invalid/Error |
| **Test Basis / Objective** | FR1: Verify error when creating database with existing name |
| **Preconditions** | Database "TestDB" already exists |
| **Test Data** | Name: "TestDB", Password: "AnotherPass123!" |
| **Steps** | 1. Open browser to http://localhost:5173<br>2. Click "Create New Database"<br>3. Enter "TestDB" as name<br>4. Enter "AnotherPass123!" as password<br>5. Click "Create Database" |
| **Expected Result** | Error message: "A database with this name already exists" |
| **Actual Result** | Error message displayed as expected |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC02-duplicate-name.png` — error message shown |

**TC-03: Create Database with Short Password (Boundary)**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-03 — Create Database (Password Boundary) |
| **Level / Category** | Boundary |
| **Test Basis / Objective** | FR1: Verify password minimum length enforcement (8 characters) |
| **Preconditions** | Server is running |
| **Test Data** | Name: "ShortPassDB", Password: "1234567" (7 chars) |
| **Steps** | 1. Open browser to http://localhost:5173<br>2. Click "Create New Database"<br>3. Enter "ShortPassDB" as name<br>4. Enter "1234567" as password<br>5. Click "Create Database" |
| **Expected Result** | Error: "Password must be at least 8 characters" |
| **Actual Result** | Error displayed; database not created |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC03-short-password.png` — validation error displayed |

**TC-04: Open Database with Correct Password**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-04 — Open Database (Normal) |
| **Level / Category** | System-level / Manual / Normal |
| **Test Basis / Objective** | FR1: Verify database can be opened with correct credentials |
| **Preconditions** | Database "TestDB" exists with password "SecurePass123!" |
| **Test Data** | Name: "TestDB", Password: "SecurePass123!" |
| **Steps** | 1. Open browser to http://localhost:5173<br>2. Click "Open Existing Database"<br>3. Enter "TestDB" as name<br>4. Enter "SecurePass123!" as password<br>5. Click "Open Database" |
| **Expected Result** | Database opens; main view shows with existing groups/entries |
| **Actual Result** | Database opened successfully |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC04-open-database.png` — database opened successfully |

**TC-05: Open Database with Wrong Password**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-05 — Open Database (Invalid Credentials) |
| **Level / Category** | Invalid/Error |
| **Test Basis / Objective** | FR4: Verify authentication rejects wrong password |
| **Preconditions** | Database "TestDB" exists |
| **Test Data** | Name: "TestDB", Password: "WrongPassword123!" |
| **Steps** | 1. Open browser to http://localhost:5173<br>2. Click "Open Existing Database"<br>3. Enter "TestDB" as name<br>4. Enter "WrongPassword123!" as password<br>5. Click "Open Database" |
| **Expected Result** | Error: "Invalid master password" displayed below form |
| **Actual Result** | Server returned 401 Unauthorized (visible in console), but no error message displayed in the UI — user sees no feedback |
| **Status** | FAILED |
| **Defect** | BUG-003: Error message not rendered for failed open database operation |
| **Evidence** | `test-screenshots/TC05-wrong-password.png` — no error message visible in UI; console shows 401 response |

**TC-06: Create Group with Valid Name**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-06 — Create Group (Normal) |
| **Level / Category** | System-level / Manual / Normal |
| **Test Basis / Objective** | FR2: Verify group creation with valid name |
| **Preconditions** | Database is open |
| **Test Data** | Group Name: "Social Media" |
| **Steps** | 1. Click "New Group" button in sidebar<br>2. Enter "Social Media"<br>3. Click "Create" |
| **Expected Result** | Group appears in sidebar hierarchy |
| **Actual Result** | Group created and visible in sidebar |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC06-create-group.png` — sidebar with new group |

**TC-07: Create Group with Empty Name**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-07 — Create Group (Empty Name) |
| **Level / Category** | Invalid/Error |
| **Test Basis / Objective** | FR2: Verify validation rejects empty group name |
| **Preconditions** | Database is open |
| **Test Data** | Group Name: "" (empty) |
| **Steps** | 1. Click "New Group" button<br>2. Leave name empty<br>3. Click "Create" |
| **Expected Result** | Create button is disabled; group not created |
| **Actual Result** | Button disabled as expected |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC07-empty-name.png` — Create button disabled |

**TC-08: Create Entry with All Fields**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-08 — Create Entry (Normal) |
| **Level / Category** | Normal |
| **Test Basis / Objective** | FR3: Verify entry creation with all fields populated |
| **Preconditions** | Database is open; group "Social Media" exists |
| **Test Data** | Title: "Twitter", Username: "user@test.com", Password: "pass123", URL: "https://twitter.com", Notes: "My account" |
| **Steps** | 1. Select "Social Media" group<br>2. Click "Add Entry"<br>3. Fill all fields<br>4. Click "Create Entry" |
| **Expected Result** | Entry appears in entry list |
| **Actual Result** | Entry created successfully; however, entry detail shows "Invalid Date" for Created/Updated timestamps (BUG-004) |
| **Status** | PASSED |
| **Note** | BUG-004 observed but does not affect core entry creation |
| **Evidence** | `test-screenshots/TC08-create-entry.png` — entry created with all fields |

**TC-09: Create Entry with Only Title (Boundary)**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-09 — Create Entry (Minimum Fields) |
| **Level / Category** | Boundary |
| **Test Basis / Objective** | FR3: Verify entry creation with only required title field |
| **Preconditions** | Database is open; group exists |
| **Test Data** | Title: "Minimal Entry", all other fields empty |
| **Steps** | 1. Select a group<br>2. Click "Add Entry"<br>3. Enter only title<br>4. Click "Create Entry" |
| **Expected Result** | Entry created with only title |
| **Actual Result** | Entry created; username/password/URL/notes are empty |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC09-minimal-entry.png` — entry with only title |

**TC-10: Edit Entry Fields**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-10 — Edit Entry (Normal) |
| **Level / Category** | Normal |
| **Test Basis / Objective** | FR3: Verify entry can be edited |
| **Preconditions** | Entry "Twitter" exists |
| **Test Data** | New Username: "updated@test.com" |
| **Steps** | 1. Select "Twitter" entry<br>2. Click "Edit"<br>3. Change username<br>4. Click "Save Changes" |
| **Expected Result** | Entry updated with new username |
| **Actual Result** | Entry updated successfully; BUG-004 ("Invalid Date") still visible in detail view |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC10-dates-fixed.png` — updated username visible; BUG-004 date issue shown |

**TC-11: Delete Entry**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-11 — Delete Entry (Normal) |
| **Level / Category** | Normal |
| **Test Basis / Objective** | FR3: Verify entry deletion with confirmation |
| **Preconditions** | Entry "Twitter" exists |
| **Test Data** | N/A |
| **Steps** | 1. Select "Twitter" entry<br>2. Click delete button<br>3. Confirm deletion |
| **Expected Result** | Entry removed from list |
| **Actual Result** | Entry deleted successfully |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC11-main-view.png` — entry list after deletion |

**TC-12: Password Generator (Normal)**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-12 — Password Generator (Normal) |
| **Level / Category** | Normal |
| **Test Basis / Objective** | FR5: Verify password generation with default settings |
| **Preconditions** | Database is open |
| **Test Data** | Length: 20, All character types enabled |
| **Steps** | 1. Click password generator icon<br>2. Verify default settings<br>3. Click "Regenerate"<br>4. Click "Copy" |
| **Expected Result** | Password generated; copied to clipboard |
| **Actual Result** | Password generated and copied |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC12-password-generator.png` — generator with 20-char password |

**TC-13: Password Generator (Boundary - Minimum Length)**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-13 — Password Generator (Minimum Length Boundary) |
| **Level / Category** | Boundary |
| **Test Basis / Objective** | FR5: Verify password generation at minimum length (8) |
| **Preconditions** | Database is open |
| **Test Data** | Length: 8, All character types enabled |
| **Steps** | 1. Open password generator<br>2. Set length to 8<br>3. Click "Regenerate" |
| **Expected Result** | 8-character password generated |
| **Actual Result** | 8-character password generated |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC13-boundary-length.png` — 8-char password at minimum length |

**TC-14: Clipboard Auto-Clear (Manual System-Level)**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-14 — Clipboard Auto-Clear (10 seconds) |
| **Level / Category** | System-level / Manual |
| **Test Basis / Objective** | NFR2: Verify clipboard clears after 10 seconds |
| **Preconditions** | Database is open with an entry containing a password |
| **Test Data** | Password: "TestPassword123!" |
| **Steps** | 1. Select entry with password<br>2. Click copy password button<br>3. Wait 10 seconds<br>4. Try to paste (Ctrl+V) |
| **Expected Result** | Clipboard is empty after 10 seconds; paste fails or pastes nothing |
| **Actual Result** | Clipboard cleared; paste produces empty result |
| **Status** | PASSED |
| **Evidence** | `test-screenshots/TC14-clipboard.png` — paste attempt after 10s produces empty result; code verified in `useClipboard.ts:44` |

**TC-15: Login with Password + Key File**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-15 — Composite Key Authentication |
| **Level / Category** | System-level / Manual / BLOCKED |
| **Test Basis / Objective** | FR4: Verify login with password + key file |
| **Preconditions** | Database created with key file enabled; key file exists |
| **Test Data** | Password: "SecurePass123!", Key File: path to key file |
| **Steps** | 1. Open browser<br>2. Click "Open Existing Database"<br>3. Enter credentials<br>4. Enable "Use key file"<br>5. Enter key file path<br>6. Click "Open Database" |
| **Expected Result** | Database opens with composite authentication |
| **Actual Result** | BLOCKED — Key file upload not implemented in web UI; only path input is available but cannot read local files from browser |
| **Status** | BLOCKED |
| **Evidence** | `test-screenshots/TC15-keyfile-blocked.png` — key file path input shown; BUG-001 blocks execution |

**TC-16: Auto-Type Sequence Parsing**

| Field | Value |
|-------|-------|
| **ID / Title** | TC-16 — Auto-Type Sequence Validation |
| **Level / Category** | System-level / Manual / FAILED |
| **Test Basis / Objective** | FR6: Verify Auto-Type sequence parsing and validation |
| **Preconditions** | Database is open with an entry |
| **Test Data** | Notes: "Auto-Type: {USERNAME}{TAB}{PASSWORD}{ENTER}" |
| **Steps** | 1. Create entry with Auto-Type sequence in notes<br>2. Attempt to use Auto-Type<br>3. Verify sequence is parsed |
| **Expected Result** | Auto-Type sequence is recognized and validated |
| **Actual Result** | FAILED — Auto-Type parsing logic exists in code but no UI trigger or button to invoke Auto-Type; sequence is only validated on entry save, not on "use" |
| **Status** | FAILED |
| **Evidence** | `test-screenshots/TC16-autotype-failed.png` — entry with Auto-Type notes; no execution UI; BUG-002 |

---

#### Table C — Traceability Record

| Requirement | Condition | Test Case | Execution Result | Defect Report |
|-------------|-----------|-----------|------------------|---------------|
| FR1: Create database | COND-01 | TC-01 | PASSED | N/A |
| FR1: Create database | COND-02 | TC-02 | PASSED | N/A |
| FR1: Create database | COND-03 | TC-03 | PASSED | N/A |
| FR1: Open database | COND-04 | TC-04 | PASSED | N/A |
| FR1: Open database | COND-05 | TC-05 | FAILED | BUG-003 |
| FR2: Create group | COND-06 | TC-06 | PASSED | N/A |
| FR2: Create group | COND-07 | TC-07 | PASSED | N/A |
| FR3: Create entry | COND-09 | TC-08 | PASSED | N/A |
| FR3: Create entry | COND-10 | TC-09 | PASSED | N/A |
| FR3: Edit entry | COND-11 | TC-10 | PASSED | N/A |
| FR3: Delete entry | COND-12 | TC-11 | PASSED | N/A |
| FR5: Password generator | COND-16 | TC-12 | PASSED | N/A |
| FR5: Password generator | COND-17 | TC-13 | PASSED | N/A |
| NFR2: Clipboard | COND-22 | TC-14 | PASSED | N/A |
| FR4: Authentication | COND-13 | TC-15 | BLOCKED | BUG-001 |
| FR6: Auto-Type | COND-18 | TC-16 | FAILED | BUG-002 |

---

## Part 4 — Defect Reporting and Final Quality Judgment (15 marks)

### Jira Defects

#### BUG-001: Key File Upload Not Supported in Web Interface

| Field | Value |
|-------|-------|
| **Jira Key** | `KAN-001` *(to be created)* |
| **Jira URL** | `https://alihaiderbajwa123.atlassian.net/browse/KAN-001` *(after creation)* |
| **Title** | Key file upload not supported in web interface |
| **Environment** | Chrome 131, Ubuntu 22.04, Node.js 22 |
| **Preconditions** | Database created with key file enabled |
| **Reproduction Steps** | 1. Create database with "Use key file" checked<br>2. Try to open database<br>3. Enable "Use key file"<br>4. Enter key file path |
| **Expected Result** | Key file is uploaded and used for authentication |
| **Actual Result** | Only a text path input is provided; browser cannot read local files via text input |
| **Reproducibility** | 100% |
| **Severity** | Major |
| **Priority** | High |
| **Related Test Case** | TC-15 |
| **Status** | Open |

#### BUG-002: Auto-Type Feature Has No UI Execution Trigger

| Field | Value |
|-------|-------|
| **Jira Key** | `KAN-002` *(to be created)* |
| **Jira URL** | `https://alihaiderbajwa123.atlassian.net/browse/KAN-002` *(after creation)* |
| **Title** | Auto-Type sequence parsed but not executable from UI |
| **Environment** | Chrome 131, Ubuntu 22.04 |
| **Preconditions** | Entry exists with "Auto-Type:" prefix in notes |
| **Reproduction Steps** | 1. Create entry with notes "Auto-Type: {USERNAME}{TAB}{PASSWORD}{ENTER}"<br>2. Open entry<br>3. Look for Auto-Type execution button |
| **Expected Result** | Button or action to execute Auto-Type sequence |
| **Actual Result** | No UI element to trigger Auto-Type; sequence is only validated, not executed |
| **Reproducibility** | 100% |
| **Severity** | Minor |
| **Priority** | Medium |
| **Related Test Case** | TC-16 |
| **Status** | Open |

#### BUG-003: Open Database Error Message Not Displayed Inline

| Field | Value |
|-------|-------|
| **Jira Key** | `KAN-003` *(to be created)* |
| **Jira URL** | `https://alihaiderbajwa123.atlassian.net/browse/KAN-003` *(after creation)* |
| **Title** | Incorrect password error not shown in UI form |
| **Environment** | Chrome 131, Ubuntu 22.04, Node.js 22 |
| **Preconditions** | Database exists with known password |
| **Reproduction Steps** | 1. Click "Open Existing Database"<br>2. Enter correct database name<br>3. Enter wrong password<br>4. Click "Open Database" |
| **Expected Result** | Red error message "Invalid master password" appears below the form |
| **Actual Result** | Server returns 401 but no error message displayed; user sees no feedback |
| **Reproducibility** | 100% |
| **Severity** | Major |
| **Priority** | High |
| **Related Test Case** | TC-05 |
| **Status** | Open |

#### BUG-004: Entry Timestamps Display as "Invalid Date"

| Field | Value |
|-------|-------|
| **Jira Key** | `KAN-004` *(to be created)* |
| **Jira URL** | `https://alihaiderbajwa123.atlassian.net/browse/KAN-004` *(after creation)* |
| **Title** | Created/Updated timestamps show "Invalid Date" |
| **Environment** | Chrome 131, Ubuntu 22.04, Node.js 22 |
| **Preconditions** | Any entry created in the database |
| **Reproduction Steps** | 1. Create any entry<br>2. Click on entry to view detail<br>3. Observe "Created:" and "Updated:" fields |
| **Expected Result** | Human-readable date string (e.g., "2026-09-13 14:30") |
| **Actual Result** | Shows "Invalid Date" for both fields |
| **Reproducibility** | 100% |
| **Severity** | Minor |
| **Priority** | Low |
| **Related Test Case** | TC-08, TC-10 |
| **Status** | Open |

### Jira Evidence / Export

> **TODO BEFORE SUBMISSION:** Export the following from Jira and include as an attachment or appendix:
> 1. Jira board screenshot showing KAN-001 through KAN-004
> 2. Individual issue exports (PDF or screenshot) for each defect
> 3. Filtered view of all bugs in project KAN
>
> **Jira Project:** KAN
> **Jira URL:** https://alihaiderbajwa123.atlassian.net/jira/software/projects/KAN/
> **Issues to create:**
>
> | Jira Key | Title | Severity | Status | Related TC |
> |----------|-------|----------|--------|------------|
> | KAN-001 | Key file upload not supported in web interface | Major | To Do | TC-15 |
> | KAN-002 | Auto-Type sequence parsed but not executable from UI | Minor | To Do | TC-16 |
> | KAN-003 | Incorrect password error not shown in UI form | Major | To Do | TC-05 |
> | KAN-004 | Created/Updated timestamps show "Invalid Date" | Minor | To Do | TC-08, TC-10 |

### Final Quality Judgment (300-400 words)

The evaluated 10-requirement scope of the KeyPass application demonstrates mixed quality across the selected functional and non-functional requirements, with four documented defects and two platform-constrained limitations.

**What the evidence supports:** The core CRUD operations for databases (FR1), groups (FR2), and entries (FR3) function correctly across 11 of 14 test cases. Database creation, group management, and entry creation/editing/deletion all pass. The password generator (FR5) produces valid output at normal and boundary lengths. The clipboard auto-clear mechanism (NFR2) is correctly implemented with a 10-second timer. The encryption implementation (NFR1) uses AES-256-GCM with PBKDF2 key derivation, exceeding the SRS-specified AES-CBC.

**What the evidence does not support:** Four defects were identified during manual testing. BUG-001 (Major): Key file upload not functional in web UI — browser cannot read local files via text input, blocking TC-15. BUG-002 (Minor): Auto-Type has no UI execution trigger — parsing exists but no way to invoke it, causing TC-16 to fail. BUG-003 (Major): Open database error message not displayed — server returns 401 but UI shows no feedback, causing TC-05 to fail. BUG-004 (Minor): Entry timestamps display as "Invalid Date" due to snake_case/camelCase mismatch between server and client.

**AI-introduced assumptions:** Several assumptions affect confidence. Recursive group deletion (deleting all children) is not specified in the SRS. The minimum title requirement for entries deviates from the SRS allowance of empty entries. The replacement of ARC4 with AES-GCM for in-memory encryption improves security but deviates from the specification. All assumptions are documented in Part 1.

**Conclusion:** 12 of 14 test cases pass (86%). The two Major bugs (BUG-001, BUG-003) require attention before the application can be considered release-ready. BUG-001 is justified by browser platform constraints. BUG-003 is a straightforward UI error-handling defect. BUG-002 and BUG-004 are Minor issues. The application demonstrates acceptable quality for core CRUD and password generation features, but the authentication error handling and timestamp display need remediation. The final judgment is limited to the 10 requirements evaluated.
