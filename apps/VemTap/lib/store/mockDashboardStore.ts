import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  time: string;
  timestamp: number;
  status: 'new' | 'returning';
  optIn?: boolean;
  surveyAnswers?: Record<string, any>;
  branchId: string;
  location?: string;
}

export interface ActivityPoint {
  hour: string;
  visits: number;
  branchId: string;
}

export interface Reward {
  id: string;
  title: string;
  points: number;
  description: string;
  active: boolean;
  branchId?: string; // Optional: Some rewards might be specific to a branch
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  scope: 'ADMIN' | 'DASHBOARD';
  branchId?: string;
}

export interface Message {
  id: string;
  name: string;
  type: 'WhatsApp' | 'SMS' | 'Email';
  audience: string;
  content?: string;
  status: 'Active' | 'Scheduled' | 'Recurring' | 'Completed' | 'Draft';
  sent: number;
  delivered: string;
  deliveryRate: number; // Percentage
  clicks: number;
  opens?: number; // For Email/WhatsApp
  ctr: number; // Click-through rate percentage
  timestamp: number;
  branchId: string;
}

export interface Template {
  id: string;
  title: string;
  category: string;
  type: 'WhatsApp' | 'SMS' | 'Email' | 'Any';
  content: string;
  textColor?: string;
  isSystem?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Staff';
  status: 'Active' | 'Inactive';
  lastActive: string;
  branchId: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'Card' | 'Sticker' | 'Fob';
  code: string;
  location: string;
  assignedTo: string; // Business name or 'Unassigned'
  lastActive: string;
  status: 'active' | 'inactive';
  batteryLevel: number;
  totalScans: number;
  timestamp: number;
  branchId: string;
}

export interface RedemptionRequest {
  id: string;
  visitorId: string;
  visitorName: string;
  rewardTitle: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'declined';
  branchId: string;
}

export interface DashboardState {
  visitors: Visitor[];
  activityData: ActivityPoint[];
  rewards: Reward[];
  notifications: Notification[];
  messages: Message[];
  staffMembers: Staff[];
  devices: Device[];
  redemptionRequests: RedemptionRequest[];
  templates: Template[];
  stats: {
    totalVisitors: number;
    newVisitors: number;
    repeatVisitors: number;
    todaysVisits: number;
  };
  // Actions
  addVisitor: (visitor: Visitor) => void;
  importVisitors: (visitors: Visitor[]) => void;
  addReward: (reward: Reward) => void;
  updateReward: (id: string, reward: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  toggleReward: (id: string, active: boolean) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, message: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  updateMessageStatus: (id: string, status: Message['status']) => void;
  addStaff: (staff: Staff) => void;
  updateStaffMember: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  updateVisitor: (id: string, updates: Partial<Visitor>) => void;
  deleteVisitor: (id: string) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  addRedemptionRequest: (request: Omit<RedemptionRequest, 'id' | 'status' | 'timestamp'>) => void;
  approveRedemption: (id: string) => void;
  declineRedemption: (id: string) => void;
  recordExternalTap: (visitorData: { name: string; email?: string; phone: string; uniqueId?: string; branchId?: string; location?: string }) => void;
  reset: () => void;
}

const initialVisitors: Visitor[] = [
  { 
    id: '1', 
    name: 'John Doe', 
    phone: '+234 801 234 5678', 
    email: 'john.doe@example.com',
    time: '2 mins ago', 
    timestamp: Date.now() - 120000, 
    status: 'new',
    optIn: true,
    surveyAnswers: { q1: 5, q2: 'Yes' },
    branchId: 'head-office',
    location: 'Main Entrance'
  },
  { 
    id: '2', 
    name: 'Jane Smith', 
    phone: '+234 802 345 6789', 
    email: 'jane@smith.io',
    time: '15 mins ago', 
    timestamp: Date.now() - 900000, 
    status: 'returning',
    optIn: true,
    surveyAnswers: { q1: 4, q2: 'Maybe', q3: 'Great service!' },
    branchId: 'head-office',
    location: 'Reception'
  },
  { 
    id: '3', 
    name: 'Mike Johnson', 
    phone: '+234 803 456 7890', 
    time: '1 hour ago', 
    timestamp: Date.now() - 3600000, 
    status: 'new',
    optIn: false,
    branchId: 'ikeja-branch',
    location: 'Allen Ave Entrance'
  },
  { 
    id: '4', 
    name: 'Sarah Williams', 
    phone: '+234 804 567 8901', 
    email: 'sarah.w@gmail.com',
    time: '2 hours ago', 
    timestamp: Date.now() - 7200000, 
    status: 'returning',
    optIn: true,
    branchId: 'abuja-branch',
    location: 'Apo Main'
  },
  { 
    id: '5', 
    name: 'David Brown', 
    phone: '+234 805 678 9012', 
    time: '3 hours ago', 
    timestamp: Date.now() - 10800000, 
    status: 'new',
    optIn: false,
    branchId: 'head-office',
    location: 'Side Gate'
  },
];

const initialActivityData: ActivityPoint[] = [
  { hour: '9 AM', visits: 12, branchId: 'head-office' },
  { hour: '10 AM', visits: 24, branchId: 'head-office' },
  { hour: '11 AM', visits: 35, branchId: 'head-office' },
  { hour: '12 PM', visits: 48, branchId: 'head-office' },
  { hour: '1 PM', visits: 42, branchId: 'head-office' },
  { hour: '2 PM', visits: 38, branchId: 'head-office' },
  { hour: '3 PM', visits: 45, branchId: 'head-office' },
  { hour: '4 PM', visits: 52, branchId: 'head-office' },
  { hour: '9 AM', visits: 5, branchId: 'ikeja-branch' },
  { hour: '10 AM', visits: 10, branchId: 'ikeja-branch' },
  { hour: '9 AM', visits: 8, branchId: 'abuja-branch' },
];

const initialRewards: Reward[] = [
  { id: '1', title: 'Free Coffee', points: 100, description: 'Get a free coffee on us', active: true, branchId: 'head-office' },
  { id: '2', title: '10% Off', points: 250, description: '10% off your next purchase', active: true },
  { id: '3', title: 'VIP Access', points: 500, description: 'VIP access for one month', active: false, branchId: 'abuja-branch' },
];

const initialNotifications: Notification[] = [
    { id: '1', title: 'Welcome', message: 'Welcome to your new dashboard!', timestamp: Date.now(), read: false, type: 'info', scope: 'DASHBOARD', branchId: 'head-office' },
    { id: '2', title: 'System Healthy', message: 'Platform services are running optimally.', timestamp: Date.now(), read: true, type: 'success', scope: 'ADMIN' },
    { id: '3', title: 'Pending Approval', message: '3 businesses are waiting for verification.', timestamp: Date.now() - 3600000, read: false, type: 'warning', scope: 'ADMIN' },
    { id: '4', title: 'Device Offline', message: '12 devices in Lagos sector are offline.', timestamp: Date.now() - 7200000, read: false, type: 'error', scope: 'ADMIN' },
];

const initialMessages: Message[] = [
  { 
    id: '1', 
    name: 'Weekend Coffee Special', 
    type: 'WhatsApp', 
    audience: 'All Customers', 
    status: 'Active', 
    sent: 1240, 
    delivered: '1.2k', 
    deliveryRate: 98,
    clicks: 156, 
    opens: 1180,
    ctr: 12.5,
    timestamp: Date.now() - 86400000,
    branchId: 'head-office'
  },
  { 
    id: '2', 
    name: 'Welcome Message', 
    type: 'SMS', 
    audience: 'New Customers', 
    status: 'Recurring', 
    sent: 412, 
    delivered: '395', 
    deliveryRate: 95,
    clicks: 84, 
    ctr: 20.3,
    timestamp: Date.now() - 172800000,
    branchId: 'head-office'
  },
  { 
    id: '3', 
    name: 'VIP Night Invitation', 
    type: 'WhatsApp', 
    audience: 'VIP Members', 
    status: 'Scheduled', 
    sent: 0, 
    delivered: '0', 
    deliveryRate: 0,
    clicks: 0, 
    ctr: 0,
    timestamp: Date.now() + 86400000,
    branchId: 'head-office'
  },
  { 
    id: '4', 
    name: 'October Newsletter', 
    type: 'Email', 
    audience: 'Newsletter Subs', 
    status: 'Completed', 
    sent: 2840, 
    delivered: '2.6k', 
    deliveryRate: 92,
    clicks: 312, 
    opens: 1950,
    ctr: 10.9,
    timestamp: Date.now() - 604800000,
    branchId: 'head-office'
  },
];

const initialStaff: Staff[] = [
    { id: '1', name: 'John Manager', email: 'john@greenterrace.com', role: 'Owner', status: 'Active', lastActive: 'Now', branchId: 'head-office' },
    { id: '2', name: 'Sarah Supervisor', email: 'sarah.s@example.com', role: 'Manager', status: 'Active', lastActive: '2h ago', branchId: 'ikeja-branch' },
    { id: '3', name: 'Michael Cashier', email: 'mike.c@example.com', role: 'Staff', status: 'Active', lastActive: '1d ago', branchId: 'head-office' },
];

const initialDevices: Device[] = [
    { id: '1', name: 'Main Entrance', type: 'Card', code: 'NFC-001', location: 'Front Door', assignedTo: 'Green Terrace Cafe', lastActive: '2 mins ago', status: 'active', batteryLevel: 85, totalScans: 1247, timestamp: Date.now(), branchId: 'head-office' },
    { id: '2', name: 'Table 5', type: 'Sticker', code: 'NFC-002', location: 'Dining Area', assignedTo: 'Tech Hub Lagos', lastActive: '15 mins ago', status: 'active', batteryLevel: 92, totalScans: 892, timestamp: Date.now(), branchId: 'ikeja-branch' },
    { id: '3', name: 'Checkout Counter', type: 'Fob', code: 'NFC-003', location: 'Cashier', assignedTo: 'Unassigned', lastActive: 'Never', status: 'inactive', batteryLevel: 0, totalScans: 2341, timestamp: Date.now(), branchId: 'abuja-branch' },
];

const initialTemplates: Template[] = [
    { id: '1', title: 'Welcome Message', category: 'Onboarding', type: 'Any', content: "Hello {name}! Welcome to {business}. We're glad to have you!", textColor: 'blue', isSystem: true },
    { id: '2', title: 'Weekend Promo', category: 'Marketing', type: 'WhatsApp', content: "Hey {name}, check out our weekend specials! 20% off all items.", textColor: 'green', isSystem: true },
    { id: '3', title: 'We Miss You', category: 'Retention', type: 'SMS', content: "Hi {name}, it's been a while. Come back and get a free coffee!", textColor: 'purple', isSystem: true },
];

const initialStats = {
  totalVisitors: 2847,
  newVisitors: 512,
  repeatVisitors: 1234,
  todaysVisits: 89,
};

export const useMockDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      visitors: initialVisitors,
      activityData: initialActivityData,
      rewards: initialRewards,
      notifications: initialNotifications,
      messages: initialMessages,
      staffMembers: initialStaff,
      devices: initialDevices,
      redemptionRequests: [],
      templates: initialTemplates,
      stats: initialStats,

      addVisitor: (visitor) =>
        set((state) => {
          const newVisitors = [visitor, ...state.visitors];
          const currentHour = new Date().getHours();
          const hourLabel = currentHour > 12 ? `${currentHour - 12} PM` : `${currentHour === 0 ? 12 : currentHour} ${currentHour >= 12 ? 'PM' : 'AM'}`;
          
          const newActivity = [...state.activityData];
          const activityIndex = newActivity.findIndex(a => a.hour === hourLabel && a.branchId === visitor.branchId);
          if (activityIndex >= 0) {
             newActivity[activityIndex].visits += 1;
          } else {
             newActivity.push({ hour: hourLabel, visits: 1, branchId: visitor.branchId });
          }

          const newStats = { ...state.stats };
          newStats.totalVisitors += 1;
          newStats.todaysVisits += 1;
          if (visitor.status === 'new') {
            newStats.newVisitors += 1;
          } else {
            newStats.repeatVisitors += 1;
          }

          return {
            visitors: newVisitors,
            activityData: newActivity,
            stats: newStats,
          };
        }),

      importVisitors: (imported) => set((state) => ({
        visitors: [...imported, ...state.visitors]
      })),

      addReward: (reward) => set((state) => ({ rewards: [...state.rewards, reward] })),
      updateReward: (id, updates) => set((state) => ({
        rewards: state.rewards.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      deleteReward: (id) => set((state) => ({ rewards: state.rewards.filter((r) => r.id !== id) })),
      toggleReward: (id, active) => set((state) => ({ rewards: state.rewards.map((r) => r.id === id ? { ...r, active } : r) })),
      
      addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
      markNotificationRead: (id) => set((state) => ({ 
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) 
      })),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),

      clearNotifications: () => set({ notifications: [] }),

      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteMessage: (id) => set((state) => ({ messages: state.messages.filter(c => c.id !== id) })),
      updateMessageStatus: (id, status) => set((state) => ({
        messages: state.messages.map(c => c.id === id ? { ...c, status } : c)
      })),

      addStaff: (staff: Staff) => set((state) => ({ staffMembers: [...state.staffMembers, staff] })),
      updateStaffMember: (id: string, updates: Partial<Staff>) => set((state) => ({
        staffMembers: state.staffMembers.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteStaff: (id: string) => set((state) => ({ staffMembers: state.staffMembers.filter(s => s.id !== id) })),

      addDevice: (device) => set((state) => ({ devices: [...state.devices, device] })),
      updateDevice: (id, updates) => set((state) => ({
        devices: state.devices.map(d => d.id === id ? { ...d, ...updates } : d)
      })),
      deleteDevice: (id) => set((state) => ({ devices: state.devices.filter(d => d.id !== id) })),
      updateVisitor: (id, updates) => set((state) => ({
        visitors: state.visitors.map(v => v.id === id ? { ...v, ...updates } : v)
      })),
      deleteVisitor: (id) => set((state) => ({
        visitors: state.visitors.filter(v => v.id !== id)
      })),
      addTemplate: (template) => set((state) => ({ templates: [...state.templates, template] })),
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTemplate: (id) => set((state) => ({ templates: state.templates.filter(t => t.id !== id) })),
      recordExternalTap: (visitorData) => set((state) => {
        const existingIndex = state.visitors.findIndex(v => 
          (visitorData.phone && v.phone === visitorData.phone) || 
          (visitorData.uniqueId && v.id === visitorData.uniqueId)
        );

        let newVisitors = [...state.visitors];
        let isReturning = false;

        // Auto-Location Logic
        const branchId = visitorData.branchId || 'head-office';
        let location = visitorData.location;
        
        if (!location) {
          // Fallback map for mock branches
          const locationMap: Record<string, string> = {
            'head-office': 'Victoria Island, Lagos',
            'ikeja-branch': 'Allen Avenue, Ikeja',
            'abuja-branch': 'Apo Garki, Abuja'
          };
          location = locationMap[branchId] || 'Main Location';
        }

        if (existingIndex > -1) {
          isReturning = true;
          const updatedVisitor = {
            ...newVisitors[existingIndex],
            time: 'Just now',
            timestamp: Date.now(),
            status: 'returning' as const,
            branchId,
            location
          };
          newVisitors.splice(existingIndex, 1);
          newVisitors.unshift(updatedVisitor);
        } else {
          const newVisitor = {
            id: visitorData.uniqueId || `V-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            name: visitorData.name,
            phone: visitorData.phone,
            time: 'Just now',
            timestamp: Date.now(),
            status: 'new' as const,
            branchId,
            location
          };
          newVisitors.unshift(newVisitor);
        }

        const newStats = { ...state.stats };
        newStats.todaysVisits += 1;
        if (isReturning) {
          newStats.repeatVisitors += 1;
        } else {
          newStats.totalVisitors += 1;
          newStats.newVisitors += 1;
        }

        // Add a notification for the business
        const notification: Notification = {
          id: `N-${Date.now()}`,
          title: isReturning ? 'Returning Visitor' : 'New Visitor',
          message: `${visitorData.name} just tapped at ${location}.`,
          timestamp: Date.now(),
          read: false,
          type: 'success',
          scope: 'DASHBOARD',
          branchId
        };

        return {
          visitors: newVisitors,
          stats: newStats,
          notifications: [notification, ...state.notifications]
        };
      }),

      addRedemptionRequest: (request) => set((state) => {
        const newRequest: RedemptionRequest = {
          ...request,
          id: `RR-${Date.now()}`,
          status: 'pending',
          timestamp: Date.now()
        };
        
        const notification: Notification = {
          id: `N-RED-${Date.now()}`,
          title: 'Reward Requested',
          message: `${request.visitorName} wants to redeem ${request.rewardTitle}.`,
          timestamp: Date.now(),
          read: false,
          type: 'warning',
          scope: 'DASHBOARD',
          branchId: request.branchId
        };
        
        return {
          redemptionRequests: [newRequest, ...state.redemptionRequests],
          notifications: [notification, ...state.notifications]
        };
      }),

      approveRedemption: (id) => set((state) => {
        const request = state.redemptionRequests.find(r => r.id === id);
        if (!request) return state;

        const notification: Notification = {
          id: `N-APP-${Date.now()}`,
          title: 'Redemption Approved',
          message: `Approved ${request.rewardTitle} for ${request.visitorName}.`,
          timestamp: Date.now(),
          read: false,
          type: 'success',
          scope: 'DASHBOARD',
          branchId: request.branchId
        };

        return {
          redemptionRequests: state.redemptionRequests.map(r => r.id === id ? { ...r, status: 'approved' } : r),
          notifications: [notification, ...state.notifications]
        };
      }),

      declineRedemption: (id) => set((state) => {
        const request = state.redemptionRequests.find(r => r.id === id);
        if (!request) return state;

        const notification: Notification = {
          id: `N-DEC-${Date.now()}`,
          title: 'Redemption Declined',
          message: `Declined ${request.rewardTitle} for ${request.visitorName}.`,
          timestamp: Date.now(),
          read: false,
          type: 'info',
          scope: 'DASHBOARD',
          branchId: request.branchId
        };

        return {
          redemptionRequests: state.redemptionRequests.map(r => r.id === id ? { ...r, status: 'declined' } : r),
          notifications: [notification, ...state.notifications]
        };
      }),

      reset: () =>
        set({
          visitors: initialVisitors,
          activityData: initialActivityData,
          rewards: initialRewards,
          notifications: initialNotifications,
          messages: initialMessages,
          staffMembers: initialStaff,
          devices: initialDevices,
          redemptionRequests: [],
          templates: initialTemplates,
          stats: initialStats,
        }),
    }),
    {
      name: 'dashboard-storage-v3', 
      storage: createJSONStorage(() => localStorage),
    }
  )
);
