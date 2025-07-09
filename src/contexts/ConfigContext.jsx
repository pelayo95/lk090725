// src/contexts/ConfigContext.js
import React, { useContext, createContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialData } from '../data/mockData';
import { defaultConfig } from '../config/defaultConfig';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [configurations, setConfigurations] = useLocalStorage('configurations', initialData.configurations);

    const getCompanyConfig = (companyId) => {
        return configurations[companyId] || defaultConfig;
    };
    
    const updateCompanyConfig = (companyId, newConfig) => {
        setConfigurations(prev => ({ ...prev, [companyId]: newConfig }));
    };

    const value = { getCompanyConfig, updateCompanyConfig };

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}
