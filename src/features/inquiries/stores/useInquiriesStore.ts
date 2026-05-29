import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Inquiry, InquiryStatusOption } from "../types";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";

interface InquiriesState {
  inquiries: Inquiry[];
  statuses: InquiryStatusOption[];
  
  addInquiry: (inquiry: Omit<Inquiry, "id" | "contactName" | "companyName" | "projectName" | "statusName" | "statusColor" | "isActive" | "creationTime">) => void;
  updateInquiry: (id: number, inquiry: Partial<Inquiry>) => void;
  toggleInquiryActive: (id: number) => void;
  deleteInquiry: (id: number) => void;
}

const initialStatuses: InquiryStatusOption[] = [
  { id: 1, name: "Mới nhận", code: "PENDING", color: "#3b82f6" }, // blue-500
  { id: 2, name: "Đang liên hệ", code: "CONTACTED", color: "#f59e0b" }, // amber-500
  { id: 3, name: "Đang đàm phán", code: "NEGOTIATING", color: "#8b5cf6" }, // purple-500
  { id: 4, name: "Đã chốt (Thành công)", code: "CLOSED_WON", color: "#10b981" }, // emerald-500
  { id: 5, name: "Đã đóng (Thất bại)", code: "CLOSED_LOST", color: "#ef4444" }, // red-500
];

const initialInquiries: Inquiry[] = [
  {
    id: 1,
    inquiryName: "Yêu cầu thuê Scenic Valley 1 - Trần Thị Mai",
    contactId: 103,
    contactName: "Trần Thị Mai",
    companyId: null,
    companyName: null,
    projectId: 2,
    projectName: "Scenic Valley 1",
    askingRent: 1500,
    actualSize: 90,
    statusId: 1,
    statusName: "Mới nhận",
    statusColor: "#3b82f6",
    description: "Khách hàng muốn thuê căn hộ 2-3 phòng ngủ tại Scenic Valley, đầy đủ nội thất, dọn vào ở sớm tháng 6.",
    isActive: true,
    creationTime: "2026-05-25T14:30:00Z",
  },
  {
    id: 2,
    inquiryName: "Thuê shophouse Midtown M7 làm NH - Nguyễn Văn Nam",
    contactId: 101,
    contactName: "Nguyễn Văn Nam",
    companyId: 1,
    companyName: "Công ty Cổ phần Phát triển Phú Mỹ Hưng",
    projectId: 1,
    projectName: "Midtown M7 (The Symphony)",
    askingRent: 2500,
    actualSize: 130,
    statusId: 3,
    statusName: "Đang đàm phán",
    statusColor: "#8b5cf6",
    description: "Cần shophouse thương mại tầng trệt để làm văn phòng đại diện ngân hàng/tín dụng.",
    isActive: true,
    creationTime: "2026-05-24T09:15:00Z",
  }
];

export const useInquiriesStore = create<InquiriesState>()(
  persist(
    (set) => ({
      inquiries: initialInquiries,
      statuses: initialStatuses,

      addInquiry: (inquiryData) => set((state) => {
        const newId = state.inquiries.length > 0 ? Math.max(...state.inquiries.map(i => i.id)) + 1 : 1;
        
        // Find links
        const contact = useClientsStore.getState().contacts.find(c => c.id === inquiryData.contactId);
        const company = inquiryData.companyId ? useClientsStore.getState().companies.find(c => c.id === inquiryData.companyId) : null;
        const project = usePropertiesStore.getState().projects.find(p => p.id === inquiryData.projectId);
        const status = state.statuses.find(s => s.id === inquiryData.statusId);

        const newInquiry: Inquiry = {
          ...inquiryData,
          id: newId,
          contactName: contact ? contact.contactName : "Không xác định",
          companyName: company ? company.companyName : null,
          projectName: project ? project.projectName : "Không xác định",
          statusName: status ? status.name : "Mới nhận",
          statusColor: status ? status.color : "#3b82f6",
          isActive: true,
          creationTime: new Date().toISOString(),
        };

        return { inquiries: [newInquiry, ...state.inquiries] };
      }),

      updateInquiry: (id, updatedFields) => set((state) => {
        const oldInquiry = state.inquiries.find(i => i.id === id);
        if (!oldInquiry) return {};

        const contact = updatedFields.contactId !== undefined
          ? useClientsStore.getState().contacts.find(c => c.id === updatedFields.contactId)
          : useClientsStore.getState().contacts.find(c => c.id === oldInquiry.contactId);

        const company = updatedFields.companyId !== undefined
          ? (updatedFields.companyId ? useClientsStore.getState().companies.find(c => c.id === updatedFields.companyId) : null)
          : (oldInquiry.companyId ? useClientsStore.getState().companies.find(c => c.id === oldInquiry.companyId) : null);

        const project = updatedFields.projectId !== undefined
          ? usePropertiesStore.getState().projects.find(p => p.id === updatedFields.projectId)
          : usePropertiesStore.getState().projects.find(p => p.id === oldInquiry.projectId);

        const status = updatedFields.statusId !== undefined
          ? state.statuses.find(s => s.id === updatedFields.statusId)
          : state.statuses.find(s => s.id === oldInquiry.statusId);

        const newInquiry: Inquiry = {
          ...oldInquiry,
          ...updatedFields,
          contactName: contact ? contact.contactName : oldInquiry.contactName,
          companyName: company ? company.companyName : null,
          projectName: project ? project.projectName : oldInquiry.projectName,
          statusName: status ? status.name : oldInquiry.statusName,
          statusColor: status ? status.color : oldInquiry.statusColor,
        };

        return {
          inquiries: state.inquiries.map(i => i.id === id ? newInquiry : i)
        };
      }),

      toggleInquiryActive: (id) => set((state) => ({
        inquiries: state.inquiries.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i))
      })),

      deleteInquiry: (id) => set((state) => ({
        inquiries: state.inquiries.filter(i => i.id !== id)
      }))
    }),
    {
      name: "pmh-inquiries-storage",
    }
  )
);
