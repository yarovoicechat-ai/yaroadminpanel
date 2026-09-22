'use client';

import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface ChartProps {
    data?: any[];
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

const tooltipStyle = {
    backgroundColor: 'rgba(13, 18, 34, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '14px',
    color: '#f8fafc',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
    padding: '10px 14px',
    fontSize: '12px'
};

export function RevenueChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500 text-xs font-medium">No revenue data available</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#c4b5fd' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export function EarningsChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500 text-xs font-medium">No earnings data recorded</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <defs>
                    <linearGradient id="barEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: '#6ee7b7' }}
                />
                <Bar dataKey="earnings" fill="url(#barEarnings)" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function CallChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500 text-xs font-medium">No call activity data</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={tooltipStyle}
                />
                <Line type="monotone" dataKey="calls" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: '#38bdf8' }} activeDot={{ r: 5 }} name="Calls" />
                <Line type="monotone" dataKey="duration" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} name="Duration (min)" />
            </LineChart>
        </ResponsiveContainer>
    );
}

export function DistributionChart({ data = [] }: ChartProps) {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full text-slate-500 text-xs font-medium">No distribution data</div>;
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="type"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={tooltipStyle}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
