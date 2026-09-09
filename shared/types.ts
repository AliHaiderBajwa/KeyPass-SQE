// Database entity types
export interface Database {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  databaseId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  databaseId: string;
  groupId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  isTan: boolean;
  tanUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MasterKey {
  password?: string;
  keyFileContent?: string;
}

// API request/response types
export interface CreateDatabaseRequest {
  name: string;
  masterKey: MasterKey;
}

export interface AuthRequest {
  databaseId: string;
  masterKey: MasterKey;
}

export interface CreateGroupRequest {
  databaseId: string;
  parentId: string | null;
  name: string;
}

export interface RenameGroupRequest {
  groupId: string;
  name: string;
}

export interface CreateEntryRequest {
  databaseId: string;
  groupId: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface UpdateEntryRequest {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface DuplicateEntryRequest {
  entryId: string;
}

export interface GeneratePasswordRequest {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeDigits: boolean;
  includeSpecial: boolean;
}

export interface GeneratePasswordResponse {
  password: string;
}

export interface CreateTanRequest {
  databaseId: string;
  groupId: string;
  count: number;
}

export interface UseTanRequest {
  entryId: string;
}

// Auto-Type types
export interface AutoTypeSequence {
  prefix: string;
  sequence: string;
  isValid: boolean;
  error?: string;
}

// Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface DatabaseResponse {
  id: string;
  name: string;
  rootGroupId: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  parentId: string | null;
}

export interface EntryResponse {
  id: string;
  title: string;
  username: string;
  url: string;
  isTan: boolean;
  tanUsed: boolean;
}

export interface SessionResponse {
  sessionId: string;
  expiresAt: string;
}

export interface TanResponse {
  id: string;
  tan: string;
}
