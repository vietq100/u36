import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LeaseContract, ContractStatusOption } from "../types";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";

interface ContractsState {
  contracts: LeaseContract[];
  statuses: ContractStatusOption[];
  
  addContract: (contract: Omit<LeaseContract, "id" | "companyName" | "contactName" | "unitName" | "projectName" | "statusName" | "statusColor" | "isActive" | "creationTime">) => void;
  updateContract: (id: number, contract: Partial<LeaseContract>) => void;
  toggleContractActive: (id: number) => void;
  deleteContract: (id: number) => void;
}

const initialStatuses: ContractStatusOption[] = [
  { id: 1, name: "Bản nháp", code: "DRAFT", color: "#64748b" }, // slate-500
  { id: 2, name: "Đang hiệu lực", code: "ACTIVE", color: "#10b981" }, // emerald-500
  { id: 3, name: "Hết hạn", code: "EXPIRED", color: "#ef4444" }, // red-500
  { id: 4, name: "Chờ thanh lý", code: "PENDING_TERMINATION", color: "#f59e0b" }, // amber-500
];

const initialContracts: LeaseContract[] = [
  {
    id: 1,
    referenceNumber: "HD-2024-001",
    companyId: 3,
    companyName: "Công ty TNHH Toyota Tsusho Việt Nam (Văn phòng Quận 7)",
    contactId: 102,
    contactName: "David Harrison",
    unitId: 102,
    unitName: "MD-15-08",
    projectId: 1,
    projectName: "Midtown M7 (The Symphony)",
    commencementDate: "2024-01-01",
    expiryDate: "2026-12-31",
    depositAmount: 3600,
    contractAmount: 43200,
    statusId: 2,
    statusName: "Đang hiệu lực",
    statusColor: "#10b981",
    description: "Hợp đồng thuê văn phòng dịch vụ cao cấp thời hạn 3 năm, thanh toán mỗi 3 tháng.",
    isActive: true,
    creationTime: "2024-01-01T08:00:00Z",
  }
];

export const useContractsStore = create<ContractsState>()(
  persist(
    (set) => ({
      contracts: initialContracts,
      statuses: initialStatuses,

      addContract: (contractData) => set((state) => {
        const newId = state.contracts.length > 0 ? Math.max(...state.contracts.map(c => c.id)) + 1 : 1;
        
        // Find links
        const company = contractData.companyId ? useClientsStore.getState().companies.find(c => c.id === contractData.companyId) : null;
        const contact = useClientsStore.getState().contacts.find(c => c.id === contractData.contactId);
        const unit = usePropertiesStore.getState().units.find(u => u.id === contractData.unitId);
        const status = state.statuses.find(s => s.id === contractData.statusId);

        const newContract: LeaseContract = {
          ...contractData,
          id: newId,
          companyName: company ? company.companyName : null,
          contactName: contact ? contact.contactName : "Không xác định",
          unitName: unit ? unit.unitName : "N/A",
          projectId: unit ? unit.projectId : 0,
          projectName: unit ? unit.projectName : "N/A",
          statusName: status ? status.name : "Bản nháp",
          statusColor: status ? status.color : "#64748b",
          isActive: true,
          creationTime: new Date().toISOString(),
        };

        // If contract is active, update the unit status to rented
        if (contractData.statusId === 2 && contractData.unitId) {
          usePropertiesStore.getState().updateUnit(contractData.unitId, { statusId: 2 });
        }

        return { contracts: [newContract, ...state.contracts] };
      }),

      updateContract: (id, updatedFields) => set((state) => {
        const oldContract = state.contracts.find(c => c.id === id);
        if (!oldContract) return {};

        const company = updatedFields.companyId !== undefined
          ? (updatedFields.companyId ? useClientsStore.getState().companies.find(c => c.id === updatedFields.companyId) : null)
          : (oldContract.companyId ? useClientsStore.getState().companies.find(c => c.id === oldContract.companyId) : null);

        const contact = updatedFields.contactId !== undefined
          ? useClientsStore.getState().contacts.find(c => c.id === updatedFields.contactId)
          : useClientsStore.getState().contacts.find(c => c.id === oldContract.contactId);

        const unit = updatedFields.unitId !== undefined
          ? usePropertiesStore.getState().units.find(u => u.id === updatedFields.unitId)
          : usePropertiesStore.getState().units.find(u => u.id === oldContract.unitId);

        const status = updatedFields.statusId !== undefined
          ? state.statuses.find(s => s.id === updatedFields.statusId)
          : state.statuses.find(s => s.id === oldContract.statusId);

        const newContract: LeaseContract = {
          ...oldContract,
          ...updatedFields,
          companyName: company ? company.companyName : null,
          contactName: contact ? contact.contactName : oldContract.contactName,
          unitName: unit ? unit.unitName : oldContract.unitName,
          projectId: unit ? unit.projectId : oldContract.projectId,
          projectName: unit ? unit.projectName : oldContract.projectName,
          statusName: status ? status.name : oldContract.statusName,
          statusColor: status ? status.color : oldContract.statusColor,
        };

        // Unit status updates logic
        // 1. If unit changed, free the old unit, rent the new one
        if (updatedFields.unitId && updatedFields.unitId !== oldContract.unitId) {
          usePropertiesStore.getState().updateUnit(oldContract.unitId, { statusId: 1 }); // AVAILABLE
          if (newContract.statusId === 2) {
            usePropertiesStore.getState().updateUnit(updatedFields.unitId, { statusId: 2 }); // RENTED
          }
        } 
        // 2. If status changed, update unit status accordingly
        else if (updatedFields.statusId && updatedFields.statusId !== oldContract.statusId) {
          const currentUnitId = oldContract.unitId;
          if (updatedFields.statusId === 2) {
            // ACTIVE contract -> RENTED unit
            usePropertiesStore.getState().updateUnit(currentUnitId, { statusId: 2 });
          } else if (updatedFields.statusId === 3 || updatedFields.statusId === 4) {
            // EXPIRED or TERMINATED contract -> AVAILABLE unit
            usePropertiesStore.getState().updateUnit(currentUnitId, { statusId: 1 });
          }
        }

        return {
          contracts: state.contracts.map(c => c.id === id ? newContract : c)
        };
      }),

      toggleContractActive: (id) => set((state) => ({
        contracts: state.contracts.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
      })),

      deleteContract: (id) => set((state) => {
        const contract = state.contracts.find(c => c.id === id);
        if (contract && contract.statusId === 2) {
          // Free unit if contract deleted
          usePropertiesStore.getState().updateUnit(contract.unitId, { statusId: 1 });
        }
        return {
          contracts: state.contracts.filter(c => c.id !== id)
        };
      })
    }),
    {
      name: "pmh-contracts-storage",
    }
  )
);
