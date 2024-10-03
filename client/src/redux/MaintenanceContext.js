import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

const MaintenanceContext = createContext();

const initialState = {
  requests: [],
  concernTypes: [],
  loading: false,
  error: null,
  activeTab: 'all',
};

function maintenanceReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_REQUESTS':
      return { ...state, requests: action.payload, loading: false };
    case 'SET_CONCERN_TYPES':
      return { ...state, concernTypes: action.payload };
    case 'UPDATE_REQUEST':
      return {
        ...state,
        requests: state.requests.map(req =>
          req.id === action.payload.id ? action.payload : req
        ),
      };
    case 'ADD_CONCERN_TYPE':
      return {
        ...state,
        concernTypes: [...state.concernTypes, action.payload],
      };
    case 'UPDATE_CONCERN_TYPE':
      return {
        ...state,
        concernTypes: state.concernTypes.map(type =>
          type.id === action.payload.id ? action.payload : type
        ),
      };
    case 'DELETE_CONCERN_TYPE':
      return {
        ...state,
        concernTypes: state.concernTypes.filter(type => type.id !== action.payload),
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
}

export function MaintenanceProvider({ children }) {
  const [state, dispatch] = useReducer(maintenanceReducer, initialState);

  const fetchRequests = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/maintenance-requests');
      dispatch({ type: 'SET_REQUESTS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const fetchConcernTypes = useCallback(async () => {
    try {
      const response = await axios.get('/api/concern-types');
      dispatch({ type: 'SET_CONCERN_TYPES', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const updateRequestStatus = useCallback(async (requestId, newStatus) => {
    try {
      const response = await axios.patch(`/api/maintenance-requests/${requestId}`, {
        status: newStatus,
      });
      dispatch({ type: 'UPDATE_REQUEST', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const addNote = useCallback(async (requestId, note) => {
    try {
      const response = await axios.post(`/api/maintenance-requests/${requestId}/notes`, {
        content: note,
      });
      dispatch({ type: 'UPDATE_REQUEST', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const addConcernType = useCallback(async (newConcern) => {
    try {
      const response = await axios.post('/api/concern-types', newConcern);
      dispatch({ type: 'ADD_CONCERN_TYPE', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const updateConcernType = useCallback(async (concernId, updatedConcern) => {
    try {
      const response = await axios.put(`/api/concern-types/${concernId}`, updatedConcern);
      dispatch({ type: 'UPDATE_CONCERN_TYPE', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const deleteConcernType = useCallback(async (concernId) => {
    try {
      await axios.delete(`/api/concern-types/${concernId}`);
      dispatch({ type: 'DELETE_CONCERN_TYPE', payload: concernId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const setActiveTab = useCallback((tab) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  const value = {
    ...state,
    fetchRequests,
    fetchConcernTypes,
    updateRequestStatus,
    addNote,
    addConcernType,
    updateConcernType,
    deleteConcernType,
    setActiveTab,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenanceContext() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenanceContext must be used within a MaintenanceProvider');
  }
  return context;
}