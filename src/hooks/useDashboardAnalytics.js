// src/hooks/useDashboardAnalytics.js
import { useMemo } from 'react';
import { getNestedValue } from '../utils/objectUtils';

export const useDashboardAnalytics = ({ companyComplaints, searchQuery, startDate, endDate }) => {
    const filteredComplaints = useMemo(() => {
        return companyComplaints.filter(c => {
            const complaintDate = new Date(c.createdAt);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start) start.setHours(0, 0, 0, 0);
            if (end) end.setHours(23, 59, 59, 999);

            if (start && complaintDate < start) return false;
            if (end && complaintDate > end) return false;

            const query = searchQuery.toLowerCase();
            if (query && !(
                c.id.toLowerCase().includes(query) ||
                (getNestedValue(c.originalData, 'complainant.name') || '').toLowerCase().includes(query) ||
                (c.originalData.accusedPersons || []).some(p => (p.name || '').toLowerCase().includes(query)) ||
                (getNestedValue(c.originalData, 'facts.description') || '').toLowerCase().includes(query)
            )) {
                return false;
            }
            
            return true;
        });
    }, [companyComplaints, searchQuery, startDate, endDate]);
    
    const kpis = useMemo(() => {
        const totalCases = filteredComplaints.length;
        const openCases = filteredComplaints.filter(c => c.status === 'Ingresada').length;
        const inProgressCases = filteredComplaints.filter(c => c.status === 'En Investigación').length;
        const closedCases = filteredComplaints.filter(c => c.status === 'Cerrada').length;
        
        const resolvedCases = filteredComplaints.filter(c => c.status === 'Cerrada' && c.closedAt);
        const totalResolutionTime = resolvedCases.reduce((acc, c) => {
            const start = new Date(c.createdAt).getTime();
            const end = new Date(c.closedAt).getTime();
            return acc + (end - start);
        }, 0);
        
        const avgResolutionDays = resolvedCases.length > 0
            ? Math.round(totalResolutionTime / resolvedCases.length / (1000 * 60 * 60 * 24))
            : 0;

        return { totalCases, openCases, inProgressCases, closedCases, avgResolutionDays };
    }, [filteredComplaints]);

    const statusData = useMemo(() => {
        const counts = filteredComplaints.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [filteredComplaints]);

    const severityData = useMemo(() => {
        const counts = filteredComplaints.reduce((acc, c) => {
            acc[c.severity] = (acc[c.severity] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [filteredComplaints]);

    return { filteredComplaints, kpis, statusData, severityData };
};
