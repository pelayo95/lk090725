// src/components/charts/BarChart.jsx
import React from 'react';
import { Card } from '../common';

const BarChart = ({ title, data, colors }) => {
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 1) : 1;

    return (
        <Card>
            <h3 className="text-md font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 w-28 truncate">{item.label}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-6">
                            <div
                                className="h-6 rounded-full text-xs font-bold text-white flex items-center px-2"
                                style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: colors[index % colors.length] }}
                            >
                                {item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default BarChart;
