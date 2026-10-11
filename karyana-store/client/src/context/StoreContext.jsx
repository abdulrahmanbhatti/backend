import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    storeName: 'Bismillah Karyana & General Store',
    tagline: 'Taza Aur Khalis Ashya Ka Ba-Aitimad Markaz',
    phone: '0300-1234567',
    address: 'Main Bazar, Lahore',
    currency: 'Rs.',
    invoiceFooter: 'Shukriya! Dobara Tashreef Layen.'
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadAlerts(res.data.length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchNotifications();
    }
  }, [user]);

  return (
    <StoreContext.Provider
      value={{
        settings,
        notifications,
        unreadAlerts,
        refreshSettings: fetchSettings,
        refreshNotifications: fetchNotifications
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
