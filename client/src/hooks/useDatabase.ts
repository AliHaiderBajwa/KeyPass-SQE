import { useState, useCallback } from 'react';

export function useDatabase() {
  const [databaseId, setDatabaseId] = useState<string | null>(null);
  const [databaseName, setDatabaseName] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const openDatabase = useCallback(async (id: string, name: string) => {
    setDatabaseId(id);
    setDatabaseName(name);
  }, []);

  const authenticate = useCallback(async (sid: string) => {
    setSessionId(sid);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setSessionId(null);
    setDatabaseId(null);
    setDatabaseName('');
  }, []);

  return { 
    databaseId, 
    databaseName,
    isAuthenticated, 
    sessionId,
    openDatabase,
    authenticate,
    logout
  };
}
