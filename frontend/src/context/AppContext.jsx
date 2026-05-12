import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLists, createList, updateList, deleteList, reorderLists } from '../api/todoApi';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    try {
      const data = await getLists();
      setLists(data);
    } catch (e) {
      console.error('Failed to fetch lists', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const addList = async (name) => {
    const newList = await createList(name);
    await fetchLists();
    setActiveListId(newList.id);
  };

  const renameList = async (id, name) => {
    await updateList(id, { name });
    await fetchLists();
  };

  const removeList = async (id) => {
    await deleteList(id);
    setActiveListId(1);
    await fetchLists();
  };

  const reorderListItems = async (ordered) => {
    setLists(ordered); // optimistic
    const payload = ordered.map((l, i) => ({ id: l.id, sortOrder: i }));
    await reorderLists(payload);
  };

  const activeList = lists.find(l => l.id === activeListId) ?? null;

  return (
    <AppContext.Provider value={{
      lists, activeListId, setActiveListId,
      activeList, loading,
      addList, renameList, removeList, reorderListItems,
      refreshLists: fetchLists,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);