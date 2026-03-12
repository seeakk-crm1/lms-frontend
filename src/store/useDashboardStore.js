import { create } from 'zustand';

const useDashboardStore = create((set) => ({
    isLoading: true,
    kpiData: [],
    leadGrowthData: [],
    pipelineData: [],
    activities: [],
    lobData: [],
    meetings: [],
    error: null,

    fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
            // Simulate network delay for realistic loading animations
            await new Promise(resolve => setTimeout(resolve, 1500));

            set({
                isLoading: false,
                kpiData: [
                    { title: "Today's Leads", value: "14", growth: "+5 leads today", trend: "up", iconName: "Target" },
                    { title: "Total Leads", value: "4,821", growth: "+18% growth", trend: "up", iconName: "Users" },
                    { title: "Closed Leads", value: "1,245", growth: "+3.2% this week", trend: "up", iconName: "CheckCircle2" },
                    { title: "Active Users", value: "92", growth: "-1.4% this week", trend: "down", iconName: "TrendingUp" }
                ],
                leadGrowthData: [
                    { name: 'Mon', leads: 40 }, { name: 'Tue', leads: 60 }, { name: 'Wed', leads: 45 },
                    { name: 'Thu', leads: 80 }, { name: 'Fri', leads: 55 }, { name: 'Sat', leads: 95 }, { name: 'Sun', leads: 110 }
                ],
                pipelineData: [
                    { name: 'New Lead', count: 420, percent: 100, color: 'from-gray-300 to-gray-400' },
                    { name: 'Qualified Lead', count: 280, percent: 66, color: 'from-emerald-300 to-emerald-400' },
                    { name: 'Potential Qualified', count: 190, percent: 45, color: 'from-emerald-400 to-emerald-500' },
                    { name: 'Closure', count: 85, percent: 20, color: 'from-emerald-500 to-emerald-600' }
                ],
                activities: [
                    { id: 1, user: "Alex Chen", action: "assigned lead", target: "Apple Enterprise", time: "10 mins ago", avatar: "https://i.pravatar.cc/100?img=11", status: "assigned" },
                    { id: 2, user: "Sarah Lopez", action: "requested approval", target: "Acme Discount Structure", time: "1 hour ago", avatar: "https://i.pravatar.cc/100?img=5", status: "pending" },
                    { id: 3, user: "Mike Johnson", action: "closed lead", target: "Tesla Fleet Contract", time: "2 hours ago", avatar: null, status: "closed" }
                ],
                lobData: [
                    { name: 'Initial', lost: 45 }, { name: 'Contact', lost: 30 }, { name: 'Demo', lost: 85 },
                    { name: 'Negotiation', lost: 20 }, { name: 'Final', lost: 5 }
                ],
                meetings: [
                    { id: 1, title: 'Follow-up Call - Microsoft Refit', time: '10:00 AM', type: 'call' },
                    { id: 2, title: 'Product Demo - Acme Corp', time: '01:30 PM', type: 'video' },
                    { id: 3, title: 'Lead Qualification - Meta', time: '04:00 PM', type: 'call' }
                ]
            });
        } catch (error) {
            set({ error: "Failed to load dashboard data", isLoading: false });
        }
    }
}));

export default useDashboardStore;
