// src/pages/boss/BossDashboard.jsx
import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/common';
import KPIStat from '../../components/admin/KPIStat';
import BarChart from '../../components/charts/BarChart';
import { LogOut, Package, Building, Users, AlertCircle } from 'lucide-react';

const BossDashboard = () => {
    const { logout } = useAuth();
    const { companies, users: allUsers, complaints, plans } = useData();

    const globalStats = useMemo(() => {
        if (!companies || !allUsers || !complaints) return { totalCompanies: 0, totalUsers: 0, activeComplaints: 0 };
        const totalCompanies = companies.length;
        const totalUsers = allUsers.filter(u => u.role !== 'boss').length;
        const activeComplaints = complaints.filter(c => c.status !== 'Cerrada').length;
        return { totalCompanies, totalUsers, activeComplaints };
    }, [companies, allUsers, complaints]);
    
    const companiesByPlanData = useMemo(() => {
        if (!companies || !plans) return [];
        const counts = companies.reduce((acc, company) => {
            const plan = plans.find(p => p.id === company.planId);
            const planName = plan ? plan.name : 'Sin Plan';
            acc[planName] = (acc[planName] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [companies, plans]);

    const complaintsByStatusData = useMemo(() => {
       if (!complaints) return [];
       const counts = complaints.reduce((acc, c) => {
           acc[c.status] = (acc[c.status] || 0) + 1;
           return acc;
       }, {});
       return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [complaints]);
    
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Panel Super-Admin</h1>
                <div className="flex items-center gap-4">
                   <a href="#boss/plans">
                       <Button variant="secondary"><Package className="w-4 h-4"/>Planes</Button>
                   </a>
                   <a href="#boss/settings">
                       <Button variant="secondary"><Building className="w-4 h-4"/>Empresas</Button>
                   </a>
                   <Button onClick={logout} variant="secondary">
                       <LogOut className="w-4 h-4"/>Cerrar Sesión
                   </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <KPIStat title="Total Empresas" value={globalStats.totalCompanies} icon={<Building className="w-6 h-6"/>}/>
                <KPIStat title="Total Usuarios" value={globalStats.totalUsers} icon={<Users className="w-6 h-6"/>}/>
                <KPIStat title="Denuncias Activas" value={globalStats.activeComplaints} icon={<AlertCircle className="w-6 h-6"/>}/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="Empresas por Plan" data={companiesByPlanData} colors={['#818cf8', '#6366f1']} />
                <BarChart title="Denuncias por Estado (Global)" data={complaintsByStatusData} colors={['#38bdf8', '#f59e0b', '#10b981']} />
            </div>
        </>
    );
};

export default BossDashboard;
