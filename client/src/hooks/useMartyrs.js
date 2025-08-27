import { useState, useEffect, useCallback } from 'react';
import { martyrsApi } from '../services/api';

export const useMartyrs = (initialParams = {}) => {
  const [martyrs, setMartyrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchMartyrs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await martyrsApi.getAll(params);
      setMartyrs(response.martyrs);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching martyrs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMartyr = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await martyrsApi.addPublic(formData);
      // Refresh the list after adding
      await fetchMartyrs();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMartyrs]);

  const updateMartyr = useCallback(async (id, formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await martyrsApi.update(id, formData);
      // Refresh the list after updating
      await fetchMartyrs();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMartyrs]);

  const deleteMartyr = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await martyrsApi.delete(id);
      // Refresh the list after deleting
      await fetchMartyrs();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMartyrs]);

  // Initial fetch
  useEffect(() => {
    fetchMartyrs(initialParams);
  }, [fetchMartyrs, initialParams]);

  return {
    martyrs,
    loading,
    error,
    pagination,
    fetchMartyrs,
    addMartyr,
    updateMartyr,
    deleteMartyr,
    setError
  };
};
