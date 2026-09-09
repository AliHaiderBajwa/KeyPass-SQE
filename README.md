# KeyPass-SQE

A web-based password manager implementation for SE3002 Software Quality Engineering Assignment 01, based on the KeePass Password Safe SRS (v1.10).

## Overview

This project implements a subset of the KeePass Password Safe functionality as a web application with a GUI interface. It demonstrates software quality engineering practices including requirements traceability, test documentation, static analysis, and defect tracking.

## Authors

- **Ali Haider Bajwa** (24i-3102)
- **Abdul Wadood** (24i-3055)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (better-sqlite3) |
| Encryption | AES-256-GCM + SHA-256 (Web Crypto API) |
| Build | Vite (client), tsx (server) |

## Requirements Implemented

### Functional Requirements (7)

| ID | Requirement | Type | SRS Reference |
|----|-------------|------|---------------|
| FR1 | Manage Password Database (New/Open/Save) | CRUD | REQ-1 to REQ-4 |
| FR2 | Manage Groups/Subgroups (Add/Modify/Delete/Find) | CRUD | REQ-7 to REQ-10 |
| FR3 | Manage Password Entries (Add/View-Edit/Duplicate/Delete) | CRUD | REQ-11 to REQ-17 |
| FR4 | Composite Master Key Authentication | Non-CRUD | REQ-24 to REQ-28 |
| FR5 | Password Generator | Non-CRUD | Section 3.20 |
| FR6 | Auto-Type | Non-CRUD | REQ-19 to REQ-21 |
| FR7 | TAN Support | Non-CRUD | REQ-32, REQ-33 |

### Non-Functional Requirements (3)

| ID | Requirement | SRS Reference |
|----|-------------|---------------|
| NFR1 | Security (AES-256-GCM + SHA-256) | Section 2.5 |
| NFR2 | Performance (10-second clipboard auto-clear) | Section 5.1 |
| NFR3 | Reliability/Safety (Data integrity) | Section 5.2 |

## Project Structure

```
keepass-sqe/
├── client/                    # React + TypeScript frontend
│   ├── src/
│   │   ├── components/        # React UI components
│   │   ├── hooks/             # Custom React hooks
│   │   └── App.tsx            # Main application
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   ├── db/                # SQLite schema & migrations
│   │   ├── crypto/            # Encryption utilities
│   │   └── middleware/        # Integrity checking
├── shared/                    # Shared TypeScript types
├── PROJECT_SCOPE.md           # Requirement selection & traceability
├── AI_DEV_LOG.md              # Design decisions log
└── IMPLEMENTATION_PLAN.md     # Task breakdown
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/AliHaiderBajwa/KeyPass-SQE.git
cd KeyPass-SQE/keepass-sqe

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running the Application

```bash
# Terminal 1: Start the backend server
cd server && npm run dev

# Terminal 2: Start the frontend
cd client && npm run dev
```

Open http://localhost:5173 in your browser.

## Design Decisions

See [AI_DEV_LOG.md](AI_DEV_LOG.md) for all 15 design decisions with rationale.

Key decisions:
- AES-256-GCM instead of AES-CBC (more secure)
- JSON-based database format (simpler than .kdb binary)
- Client-side clipboard timer (browser security constraint)
- Auto-Type sequence validation only (no keystroke injection)

## Testing

```bash
# Run server tests
cd server && npm test

# Run client tests
cd client && npm test
```

## Quality Assurance

- **SonarQube:** Static code analysis configured for SonarCloud
- **Jira:** Defect tracking in project KAN
- **TypeScript:** Type-safe codebase for better static analysis

## License

This is an academic project for SE3002 Software Quality Engineering course.
