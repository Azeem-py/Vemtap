'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { Visitor } from '@/lib/store/mockDashboardStore';
import toast from 'react-hot-toast';
import {
    Users, UserPlus, Repeat, Calendar, TrendingUp, TrendingDown,
    ChevronDown, Trash, Send, Download, Gift, ArrowRight, MessageSquare, Zap
} from 'lucide-react';
import LogoIcon from '@/components/brand/LogoIcon';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import SendMessageModal from '@/components/dashboard/SendMessageModal';
import VisitorDetailsModal from '@/components/dashboard/VisitorDetailsModal';
import PreviewRewardModal from '@/components/dashboard/PreviewRewardModal';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useBusinessStore } from '@/store/useBusinessStore';


export default function DashboardPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [showClearModal, setShowClearModal] = useState(false);
    const [selectedVisitorForMsg, setSelectedVisitorForMsg] = useState<{ visitor: Visitor, type: 'welcome' | 'reward' } | null>(null);
    const [selectedVisitorForDetails, setSelectedVisitorForDetails] = useState<Visitor | null>(null);
    const [rewardPreviewVisitor, setRewardPreviewVisitor] = useState<Visitor | null>(null);

    // Fetch Dashboard Data
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: dashboardApi.fetchDashboardData,
    });

    // Mutation: Add Visitor (Simulates inbound traffic)
    const addVisitorMutation = useMutation({
        mutationFn: dashboardApi.addVisitor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('New visitor check-in simulated!');
        },
    });

    // Mutation: Clear Dashboard
    const clearDashboardMutation = useMutation({
        mutationFn: dashboardApi.clearDashboard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Dashboard data cleared');
        },
    });

    const { getActiveBranch, activeBranchId } = useBusinessStore();
    const { hasReachedVisitorLimit, getPlan } = useSubscriptionStore();
    const currentPlan = getPlan();

    const handleSimulateVisitor = () => {
        if (data && hasReachedVisitorLimit(data.stats.totalVisitors)) {
            toast.error(`You have reached the ${currentPlan?.name} plan limit of ${currentPlan?.visitorLimit} visitors. Please upgrade to continue tracking.`);
            return;
        }

        const activeBranch = getActiveBranch();
        const bId = activeBranchId === 'all' ? 'head-office' : activeBranchId;
        const loc = activeBranch?.address || 'Head Office';

        const isNew = Math.random() > 0.5;
        const newVisitor: Visitor = {
            id: Math.random().toString(36).substr(2, 9),
            name: isNew ? `New User ${Math.floor(Math.random() * 100)}` : `Returning User ${Math.floor(Math.random() * 100)}`,
            phone: `+234 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
            time: 'Just now',
            timestamp: Date.now(),
            status: isNew ? 'new' : 'returning',
            branchId: bId,
            location: loc,
        };
        addVisitorMutation.mutate(newVisitor);
    };

    const handleClearDashboard = () => {
        setShowClearModal(true);
    };

    const confirmClear = () => {
        clearDashboardMutation.mutate();
        setShowClearModal(false);
    };

    const stats = [
        {
            label: 'Total Visitors',
            value: data?.stats.totalVisitors.toLocaleString() || '0',
            change: '+12.5%',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            label: 'New Visitors',
            value: data?.stats.newVisitors.toLocaleString() || '0',
            change: '+36.8%',
            trend: 'up',
            icon: UserPlus,
            color: 'green'
        },
        {
            label: 'Repeat Visitors',
            value: data?.stats.repeatVisitors.toLocaleString() || '0',
            change: '+8.2%',
            trend: 'up',
            icon: Repeat,
            color: 'purple'
        },
        {
            label: 'Today\'s Visits',
            value: data?.stats.todaysVisits.toLocaleString() || '0',
            change: '-2.4%',
            trend: 'down',
            icon: Calendar,
            color: 'orange'
        },
    ];

    const maxVisits = data ? Math.max(...data.activityData.map((d: any) => d.visits)) : 100;

    // Computed audience breakdown
    const totalVisitors = data?.stats?.totalVisitors || 0;
    const repeatVisitors = data?.stats?.repeatVisitors || 0;
    const newVisitors = data?.stats?.newVisitors || 0;
    const returningPct = totalVisitors > 0 ? Math.round((repeatVisitors / totalVisitors) * 100) : 0;
    const newPct = totalVisitors > 0 ? 100 - returningPct : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 h-screen">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl font-display font-bold text-text-main mb-1">Dashboard</h1>
                    <p className="text-sm text-text-secondary font-medium">Welcome back! Here's what's happening today.</p>
                </div>

                <div className="flex items-center gap-3">
                    {currentPlan?.id === 'free' && (
                        <button
                            onClick={() => router.push('/#pricing')}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-lg shadow-primary/20"
                        >
                            <Zap size={14} />
                            Upgrade
                        </button>
                    )}
                    <button
                        onClick={handleClearDashboard}
                        disabled={clearDashboardMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                    >
                        <Trash size={16} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Stats Grid — compact 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

                    return (
                        <div key={index} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <IconComponent className="text-primary" size={18} />
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${stat.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    <TrendIcon size={10} />
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-0.5">{stat.label}</p>
                            <p className="text-2xl font-display font-bold text-text-main">{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid: Chart + Audience + Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Visitor Activity Chart — spans 7 cols */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-display font-bold text-text-main">Visitor Activity</h2>
                            <p className="text-[10px] text-text-secondary">Today's hourly breakdown</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                    <span className="text-[9px] font-bold text-text-secondary uppercase">All</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                                    <span className="text-[9px] font-bold text-text-secondary uppercase">New</span>
                                </div>
                            </div>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-secondary hover:text-text-main hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                                <span>This Week</span>
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex items-end justify-between gap-2 h-48">
                        {data?.activityData.map((d: any, index: number) => {
                            const newVisits = Math.floor(d.visits * 0.4);
                            const totalPct = maxVisits > 0 ? (d.visits / maxVisits) * 100 : 0;
                            const newPctBar = d.visits > 0 ? (newVisits / d.visits) * 100 : 0;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                                    <div className="w-full rounded-t-md relative flex flex-col justify-end" style={{ height: '100%' }}>
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                                            {d.visits} ({newVisits} new)
                                        </div>

                                        {/* Total Bar */}
                                        <div
                                            className="w-full bg-primary/15 rounded-t-md transition-all relative overflow-hidden"
                                            style={{ height: `${totalPct}%`, minHeight: d.visits > 0 ? '4px' : '0' }}
                                        >
                                            {/* New Visitor portion */}
                                            <div
                                                className="w-full bg-emerald-500/80 rounded-t-md absolute bottom-0 left-0"
                                                style={{ height: `${newPctBar}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-text-main">{d.visits}</p>
                                        <p className="text-[8px] text-text-secondary font-medium uppercase tracking-tighter">{d.hour}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Audience Breakdown — spans 5 cols, split into 2 rows */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    {/* Audience Growth Donut */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex-1">
                        <h2 className="text-base font-display font-bold text-text-main mb-4">Audience Growth</h2>
                        <div className="flex items-center gap-6">
                            <div className="relative size-28 shrink-0">
                                <svg className="size-full" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
                                    {/* Returning = primary, New = emerald */}
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary)" strokeWidth="10" strokeDasharray={`${(returningPct / 100) * 251.2} 251.2`} strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 50 50)" />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="10" strokeDasharray={`${(newPct / 100) * 251.2} 251.2`} strokeDashoffset={`${-(returningPct / 100) * 251.2}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-lg font-black text-slate-900">{totalVisitors}</p>
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between p-2.5 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 bg-primary rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-slate-500">Returning</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-slate-900">{repeatVisitors}</span>
                                        <span className="text-[9px] font-bold text-slate-400 ml-1">({returningPct}%)</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 bg-emerald-500 rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-slate-500">New</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-slate-900">{newVisitors}</span>
                                        <span className="text-[9px] font-bold text-slate-400 ml-1">({newPct}%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions — compact */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <h2 className="text-base font-display font-bold text-text-main mb-3">Quick Actions</h2>
                        <div className="space-y-2">
                            <button
                                onClick={handleSimulateVisitor}
                                disabled={addVisitorMutation.isPending}
                                className="w-full flex items-center justify-between p-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-50 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                                        {addVisitorMutation.isPending ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <UserPlus size={16} />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-xs leading-none mb-0.5">Simulate Check-in</p>
                                        <p className="text-[9px] text-white/70 font-medium">Generate a test visit</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </button>

                            {[
                                { label: 'New Message', icon: MessageSquare, route: '/dashboard/messaging', color: 'bg-indigo-50 text-indigo-600' },
                                { label: 'Add Device', icon: LogoIcon, route: '/dashboard/settings/devices', color: 'bg-blue-50 text-blue-600' },
                                { label: 'Export Data', icon: Download, route: '/dashboard/visitors/all', color: 'bg-green-50 text-green-600' }
                            ].map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(action.route)}
                                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl transition-all group hover:border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                                            <action.icon size={16} />
                                        </div>
                                        <p className="font-bold text-xs text-text-main">{action.label}</p>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Visitors */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-display font-bold text-text-main mb-0.5">Recent Visitors</h2>
                        <p className="text-[10px] text-text-secondary">Latest customer check-ins</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/visitors/all')}
                        className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                        View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-wider text-text-secondary">Name</th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-wider text-text-secondary">Phone</th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-wider text-text-secondary">Time</th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-wider text-text-secondary">Status</th>
                                <th className="text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-wider text-text-secondary">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.recentVisitors.slice(0, 5).map((visitor: Visitor, index: number) => (
                                <tr
                                    key={visitor.id || index}
                                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedVisitorForDetails(visitor)}
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Users className="text-primary" size={14} />
                                            </div>
                                            <span className="font-bold text-sm text-text-main">{visitor.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-text-secondary font-medium">{visitor.phone}</td>
                                    <td className="py-3 px-4 text-sm text-text-secondary font-medium">{visitor.time}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${visitor.status === 'new'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-primary/10 text-primary'
                                            }`}>
                                            {visitor.status === 'new' ? 'New' : 'Returning'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVisitorForMsg({
                                                        visitor,
                                                        type: visitor.status === 'new' ? 'welcome' : 'reward'
                                                    });
                                                }}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-primary/20 transition-colors"
                                            >
                                                <Send size={10} />
                                                {visitor.status === 'new' ? 'Welcome' : 'Message'}
                                            </button>
                                            {visitor.status === 'returning' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setRewardPreviewVisitor(visitor);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                                >
                                                    <Gift size={10} />
                                                    Reward
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data?.recentVisitors.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-text-secondary font-medium">
                                        No recent visitors found. Click "Simulate Check-in" to add test data.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                title="Clear Dashboard Data"
                description="Are you sure you want to clear all dashboard data? This will reset all stats and visitor history."
            >
                <div className="flex gap-3 py-4">
                    <button onClick={() => setShowClearModal(false)} className="flex-1 h-12 border border-gray-100 text-text-main font-bold rounded-xl hover:bg-gray-50 transition-all text-sm">
                        Cancel
                    </button>
                    <button onClick={confirmClear} className="flex-1 h-12 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 text-sm">
                        Clear Everything
                    </button>
                </div>
            </Modal>

            <SendMessageModal
                isOpen={!!selectedVisitorForMsg}
                onClose={() => setSelectedVisitorForMsg(null)}
                recipientName={selectedVisitorForMsg?.visitor.name || ''}
                recipientPhone={selectedVisitorForMsg?.visitor.phone}
                type={selectedVisitorForMsg?.type || 'welcome'}
            />

            <VisitorDetailsModal
                isOpen={!!selectedVisitorForDetails}
                onClose={() => setSelectedVisitorForDetails(null)}
                visitor={selectedVisitorForDetails}
            />

            <PreviewRewardModal
                isOpen={!!rewardPreviewVisitor}
                onClose={() => setRewardPreviewVisitor(null)}
                rewardTitle="Free Coffee or Pastry"
                businessName={data?.businessName || 'Your Business'}
            />
        </div >
    );
}
