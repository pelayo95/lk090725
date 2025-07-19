// src/contexts/TemplateSuggestionContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TemplateSuggestionContext = createContext();

export const useTemplateSuggestion = () => useContext(TemplateSuggestionContext);

export const TemplateSuggestionProvider = ({ children }) => {
    const [suggestion, setSuggestion] = useState(null);

    const showSuggestion = useCallback((trigger, caseId, template) => {
        setSuggestion({ trigger, caseId, template });
    }, []);

    const clearSuggestion = useCallback(() => {
        setSuggestion(null);
    }, []);

    // Hook para escuchar los eventos personalizados
    useEffect(() => {
        const handleShowSuggestion = (event) => {
            const { trigger, caseId, template } = event.detail;
            showSuggestion(trigger, caseId, template);
        };

        window.addEventListener('showSuggestion', handleShowSuggestion);

        // Limpiar el listener cuando el componente se desmonte
        return () => {
            window.removeEventListener('showSuggestion', handleShowSuggestion);
        };
    }, [showSuggestion]);

    const value = { suggestion, showSuggestion, clearSuggestion };

    return (
        <TemplateSuggestionContext.Provider value={value}>
            {children}
        </TemplateSuggestionContext.Provider>
    );
};
