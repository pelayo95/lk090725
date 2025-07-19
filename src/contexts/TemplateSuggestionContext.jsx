// src/contexts/TemplateSuggestionContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const TemplateSuggestionContext = createContext();

export const useTemplateSuggestion = () => useContext(TemplateSuggestionContext);

export const TemplateSuggestionProvider = ({ children }) => {
    const [suggestion, setSuggestion] = useState(null); // { trigger, caseId, template }

    const showSuggestion = useCallback((trigger, caseId, template) => {
        setSuggestion({ trigger, caseId, template });
    }, []);

    const clearSuggestion = useCallback(() => {
        setSuggestion(null);
    }, []);

    const value = { suggestion, showSuggestion, clearSuggestion };

    return (
        <TemplateSuggestionContext.Provider value={value}>
            {children}
        </TemplateSuggestionContext.Provider>
    );
};
