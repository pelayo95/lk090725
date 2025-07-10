// src/pages/admin/Dashboard.jsx
import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardAnalytics } from '../../hooks/useDashboardAnalytics';
import { useAlerts } from '../../hooks/useAlerts';
import { getUserNameById } from '../../utils/userUtils';
import { Card, Input } from '../../components/common';
import AlertsPanel from '../../components/admin/AlertsPanel';
import KPIStat from '../../components/admin/KPIStat';
import WeeklyAgenda from '../../components/admin/WeeklyAgenda';
import BarChart from '../../components/charts/BarChart';
import { FolderOpen, AlertCircle, Search, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
    const { complaints, companies, plans } = useData();
    const { user, allUsers, updateUser } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const userCompany = useMemo(() => companies.find(c => c.id === user.companyId), [companies, user]);
    const userPlan = useMemo(() => plans.find(p => p.id === userCompany?.planId), [plans, userCompany]);
    const features = userPlan?.features || {};

    // Filtrar casos basados en permisos
    const visibleComplaints = useMemo(() => {
        const companyComplaints = complaints.filter(c => c.companyId === user.companyId);
        if (user.permissions.casos_listado_alcance === 'todos') {
            return companyComplaints;
        }
        if (user.permissions.casos_listado_alcance === 'asignados') {
            return companyComplaints.filter(c => c.investigatorIds.includes(user.uid));
        }
        return [];
    }, [complaints, user]);

    const alerts = useAlerts(visibleComplaints, user);
    
    const { filteredComplaints, kpis, statusData, severityData } = useDashboardAnalytics({
        companyComplaints: visibleComplaints, // Usar casos filtrados para los KPIs
        searchQuery, 
        startDate, 
        endDate
    });
    
    const handleAlertClick = (caseId) => {
        updateUser(user.uid, { 
            lastVisited: {
                ...user.lastVisited,
                [caseId]: new Date().toISOString()
            }
        });
    };

    const getInvestigatorNames = (ids) => {
        if (!ids || ids.length === 0) return <span className="text-slate-400 italic">No asignado</span>;
        return ids.map((id, index) => (
            <span key={id}>
                {getUserNameById(id, allUsers) || <span className="text-red-500">?</span>}
                {index < ids.length - 1 && ', '}
            </span>
        ));
    };

    const statusColors = {
        'Ingresada': 'bg-sky-100 text-sky-800',
        'En Investigación': 'bg-amber-100 text-amber-800',
        'Cerrada': 'bg-emerald-100 text-emerald-800'
    };

    return (
        <div className="space-y-6">
            <AlertsPanel alerts={alerts} onAlertClick={handleAlertClick} />

            <h1 className="text-2xl font-bold text-slate-800">Dashboard de Casos</h1>
            
            {features.filtrosAvanzados && (
              <Card>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                          <Input 
                              label="Buscar caso..." id="search" placeholder="ID, denunciante, palabra clave..."
                              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          />
                      </div>
                      <div>
                          <Input label="Fecha Inicio" id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </div>
                      <div>
                          <Input label="Fecha Fin" id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      </div>
                  </div>
              </Card>
            )}

            {user.permissions.dashboard_ver_kpis && features.kpisYMetricas && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <KPIStat title="Casos Totales" value={kpis.totalCases} icon={<FolderOpen className="w-6 h-6"/>}/>
                    <KPIStat title="Casos Abiertos" value={kpis.openCases} icon={<AlertCircle className="w-6 h-6"/>}/>
                    <KPIStat title="En Investigación" value={kpis.inProgressCases} icon={<Search className="w-6 h-6"/>}/>
                    <KPIStat title="Casos Concluidos" value={kpis.closedCases} icon={<CheckCircle className="w-6 h-6"/>}/>
                    <KPIStat title="Resolución Promedio" value={`${kpis.avgResolutionDays} días`} icon={<Clock className="w-6 h-6"/>}/>
                </div>
            )}
            
            {user.permissions.dashboard_ver_graficos && features.graficos && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <BarChart title="Denuncias por Estado" data={statusData} colors={['#38bdf8', '#f59e0b', '#10b981']} />
                    <BarChart title="Denuncias por Gravedad" data={severityData} colors={['#10b981', '#f59e0b', '#ef4444', '#64748b']} />
                </div>
            )}
            
            {user.permissions.casos_ver_listado && (
                <Card className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID Caso</th>
                                <th scope="col" className="px-6 py-3">Fecha Ingreso</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Investigador(es)</th>
                                <th scope="col" className="px-6 py-3">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.map(c => (
                                <tr key={c.id} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{c.id}</th>
                                    <td className="px-6 py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[c.status] || 'bg-slate-100 text-slate-800'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{getInvestigatorNames(c.investigatorIds)}</td>
                                    <td className="px-6 py-4">
                                        <a href={`#admin/cases/${c.id}`} className="font-medium text-indigo-600 hover:underline">Ver Detalles</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
            
            {user.permissions.dashboard_ver_agenda && features.agendaSemanal && <WeeklyAgenda />}
        </div>
    )
};

export default Dashboard;
