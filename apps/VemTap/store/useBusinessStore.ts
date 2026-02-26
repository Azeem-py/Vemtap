import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  manager?: string;
  whatsappNumber?: string;
  smsSenderId?: string;
  chatbotEnabled?: boolean;
  chatbotName?: string;
}

interface BusinessState {
  branches: Branch[];
  activeBranchId: string; // 'all' or a specific branch id
  setActiveBranch: (id: string) => void;
  getBranch: (id: string) => Branch | undefined;
  getActiveBranch: () => Branch | undefined;
}

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'head-office',
    name: 'Head Office',
    address: 'VemTap HQ, Victoria Island, Lagos',
    manager: 'John Owner',
    whatsappNumber: '+234 800 123 4567',
    smsSenderId: 'VEMTAP_HQ',
    chatbotEnabled: true,
    chatbotName: 'VemBot HQ'
  },
  {
    id: 'ikeja-branch',
    name: 'Ikeja Branch',
    address: 'Allen Avenue, Ikeja, Lagos',
    manager: 'Sarah Manager',
    whatsappNumber: '+234 801 222 3333',
    smsSenderId: 'VEMTAP_IKEJA',
    chatbotEnabled: true,
    chatbotName: 'VemBot Ikeja'
  },
  {
    id: 'abuja-branch',
    name: 'Abuja Branch',
    address: 'Apo Garki, Abuja',
    manager: 'Michael Abuja',
    whatsappNumber: '+234 802 333 4444',
    smsSenderId: 'VEMTAP_ABUJA',
    chatbotEnabled: false
  }
];

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      branches: DEFAULT_BRANCHES,
      activeBranchId: 'head-office',
      
      setActiveBranch: (id: string) => set({ activeBranchId: id }),
      
      getBranch: (id: string) => {
        return get().branches.find(b => b.id === id);
      },
      
      getActiveBranch: () => {
        const { branches, activeBranchId } = get();
        return branches.find(b => b.id === activeBranchId);
      }
    }),
    {
      name: 'business-storage',
    }
  )
);
