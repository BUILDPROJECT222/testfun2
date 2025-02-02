import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

const TimeContext = createContext(null);

export const TimeProvider = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState('day');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(prev => prev === 'day' ? 'night' : 'day');
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({ timeOfDay, setTimeOfDay }), [timeOfDay]);

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = () => {
  const context = useContext(TimeContext);
  if (!context) {
    console.warn('useTime must be used within a TimeProvider');
    return { timeOfDay: 'day', setTimeOfDay: () => {} };
  }
  return context;
};

export default TimeContext; 