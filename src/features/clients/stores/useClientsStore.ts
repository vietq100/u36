import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Company, Contact, ClientCategoryOption } from "../types";

interface ClientsState {
  companies: Company[];
  contacts: Contact[];
  industries: ClientCategoryOption[];
  nationalities: ClientCategoryOption[];
  leadSources: ClientCategoryOption[];
  levels: ClientCategoryOption[];

  // Company Actions
  addCompany: (company: Omit<Company, "id" | "industryName" | "nationalityName" | "isActive">) => void;
  updateCompany: (id: number, company: Partial<Company>) => void;
  toggleCompanyActive: (id: number) => void;

  // Contact Actions
  addContact: (contact: Omit<Contact, "id" | "companyName" | "nationalityName" | "leadSourceName" | "levelName" | "isActive">) => void;
  updateContact: (id: number, contact: Partial<Contact>) => void;
  toggleContactActive: (id: number) => void;
}

const initialIndustries: ClientCategoryOption[] = [
  { id: 1, name: "Bất động sản" },
  { id: 2, name: "Tài chính / Ngân hàng" },
  { id: 3, name: "Thương mại / Dịch vụ" },
  { id: 4, name: "Công nghệ thông tin" },
  { id: 5, name: "F&B / Nhà hàng & Cửa hiệu" },
];

const initialNationalities: ClientCategoryOption[] = [
  { id: 1001, name: "Việt Nam" },
  { id: 1002, name: "Nhật Bản" },
  { id: 1003, name: "Hàn Quốc" },
  { id: 1004, name: "Hoa Kỳ" },
  { id: 1005, name: "Singapore" },
];

const initialLeadSources: ClientCategoryOption[] = [
  { id: 2001, name: "Khách tự tìm kiếm" },
  { id: 2002, name: "Đối tác giới thiệu" },
  { id: 2003, name: "Facebook Ads" },
  { id: 2004, name: "Google Search" },
  { id: 2005, name: "Hội thảo / Sự kiện" },
];

const initialLevels: ClientCategoryOption[] = [
  { id: 3001, name: "Giám đốc / CEO" },
  { id: 3002, name: "Trưởng phòng / Quản lý" },
  { id: 3003, name: "Chuyên viên / Nhân viên" },
  { id: 3004, name: "Cá nhân tự do" },
];

const initialCompanies: Company[] = [
  {
    id: 1,
    companyName: "Công ty Cổ phần Phát triển Phú Mỹ Hưng",
    vatCode: "0300609388",
    email: "info@phumyhung.com.vn",
    phone: "02854119999",
    website: "https://phumyhung.com.vn",
    address: "Tòa nhà Lawrence S. Ting, 801 Nguyễn Văn Linh, P. Tân Phú, Quận 7, TP. HCM",
    industryId: 1,
    industryName: "Bất động sản",
    nationalityId: 1001,
    nationalityName: "Việt Nam",
    description: "Đơn vị phát triển đô thị kiểu mẫu Phú Mỹ Hưng Nam Sài Gòn",
    isActive: true,
  },
  {
    id: 2,
    companyName: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank) - CN Nam Sài Gòn",
    vatCode: "0100112437",
    email: "namsaigon@vietcombank.com.vn",
    phone: "02854123456",
    website: "https://vietcombank.com.vn",
    address: "13-15 Nguyễn Lương Bằng, P. Tân Phú, Quận 7, TP. HCM",
    industryId: 2,
    industryName: "Tài chính / Ngân hàng",
    nationalityId: 1001,
    nationalityName: "Việt Nam",
    description: "Chi nhánh cung cấp dịch vụ ngân hàng bán lẻ & tín dụng",
    isActive: true,
  },
  {
    id: 3,
    companyName: "Công ty TNHH Toyota Tsusho Việt Nam (Văn phòng Quận 7)",
    vatCode: "0301476140",
    email: "contact@toyotatsusho.com.vn",
    phone: "02854135555",
    website: "https://toyota-tsusho.com",
    address: "Tầng 5, Tòa nhà Crescent Plaza, 105 Tôn Dật Tiên, Quận 7, TP. HCM",
    industryId: 3,
    industryName: "Thương mại / Dịch vụ",
    nationalityId: 1002,
    nationalityName: "Nhật Bản",
    description: "Văn phòng giao dịch thương mại xuất nhập khẩu & logistics",
    isActive: true,
  },
];

const initialContacts: Contact[] = [
  {
    id: 101,
    contactName: "Nguyễn Văn Nam",
    companyId: 1,
    companyName: "Công ty Cổ phần Phát triển Phú Mỹ Hưng",
    email: "nam.nv@phumyhung.com.vn",
    phone: "0909123456",
    gender: "MALE",
    nationalityId: 1001,
    nationalityName: "Việt Nam",
    leadSourceId: 2001,
    leadSourceName: "Khách tự tìm kiếm",
    levelId: 3002,
    levelName: "Trưởng phòng / Quản lý",
    description: "Liên hệ chính bộ phận hành chính phụ trách thuê mặt bằng văn phòng",
    isActive: true,
  },
  {
    id: 102,
    contactName: "David Harrison",
    companyId: 3,
    companyName: "Công ty TNHH Toyota Tsusho Việt Nam (Văn phòng Quận 7)",
    email: "david.harrison@toyota-tsusho.jp",
    phone: "0988776655",
    gender: "MALE",
    nationalityId: 1004,
    nationalityName: "Hoa Kỳ",
    leadSourceId: 2002,
    leadSourceName: "Đối tác giới thiệu",
    levelId: 3001,
    levelName: "Giám đốc / CEO",
    description: "Đại diện ký kết hợp đồng thuê văn phòng dịch vụ",
    isActive: true,
  },
  {
    id: 103,
    contactName: "Trần Thị Mai",
    companyId: undefined,
    companyName: undefined,
    email: "mai.tt@gmail.com",
    phone: "0912345678",
    gender: "FEMALE",
    nationalityId: 1001,
    nationalityName: "Việt Nam",
    leadSourceId: 2003,
    leadSourceName: "Facebook Ads",
    levelId: 3004,
    levelName: "Cá nhân tự do",
    description: "Khách lẻ có nhu cầu thuê shophouse kinh doanh cửa hàng thời trang",
    isActive: true,
  },
];

export const useClientsStore = create<ClientsState>()(
  persist(
    (set) => ({
      companies: initialCompanies,
      contacts: initialContacts,
      industries: initialIndustries,
      nationalities: initialNationalities,
      leadSources: initialLeadSources,
      levels: initialLevels,

      // Add Company
      addCompany: (company) => set((state) => {
        const newId = state.companies.length > 0 ? Math.max(...state.companies.map(c => c.id)) + 1 : 1;
        const industry = state.industries.find(i => i.id === company.industryId);
        const nationality = state.nationalities.find(n => n.id === company.nationalityId);

        const newCompany: Company = {
          ...company,
          id: newId,
          industryName: industry ? industry.name : "",
          nationalityName: nationality ? nationality.name : "",
          isActive: true,
        };
        return { companies: [...state.companies, newCompany] };
      }),

      // Update Company
      updateCompany: (id, updatedFields) => set((state) => {
        const industry = updatedFields.industryId ? state.industries.find(i => i.id === updatedFields.industryId) : undefined;
        const nationality = updatedFields.nationalityId ? state.nationalities.find(n => n.id === updatedFields.nationalityId) : undefined;

        const updatedCompanies = state.companies.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              ...updatedFields,
              ...(industry && { industryName: industry.name }),
              ...(nationality && { nationalityName: nationality.name }),
            };
          }
          return c;
        });

        // Update companyName in contacts if it changes
        const updatedContacts = state.contacts.map((contact) => {
          if (contact.companyId === id && updatedFields.companyName) {
            return { ...contact, companyName: updatedFields.companyName };
          }
          return contact;
        });

        return {
          companies: updatedCompanies,
          contacts: updatedContacts,
        };
      }),

      // Toggle Company active status
      toggleCompanyActive: (id) => set((state) => ({
        companies: state.companies.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
      })),

      // Add Contact
      addContact: (contact) => set((state) => {
        const newId = state.contacts.length > 0 ? Math.max(...state.contacts.map(c => c.id)) + 1 : 101;
        const company = contact.companyId ? state.companies.find(c => c.id === contact.companyId) : undefined;
        const nationality = contact.nationalityId ? state.nationalities.find(n => n.id === contact.nationalityId) : undefined;
        const leadSource = contact.leadSourceId ? state.leadSources.find(l => l.id === contact.leadSourceId) : undefined;
        const level = contact.levelId ? state.levels.find(lvl => lvl.id === contact.levelId) : undefined;

        const newContact: Contact = {
          ...contact,
          id: newId,
          companyName: company ? company.companyName : undefined,
          nationalityName: nationality ? nationality.name : "",
          leadSourceName: leadSource ? leadSource.name : "",
          levelName: level ? level.name : "",
          isActive: true,
        };

        return { contacts: [...state.contacts, newContact] };
      }),

      // Update Contact
      updateContact: (id, updatedFields) => set((state) => {
        const oldContact = state.contacts.find(c => c.id === id);
        if (!oldContact) return {};

        const company = updatedFields.companyId !== undefined
          ? (updatedFields.companyId ? state.companies.find(c => c.id === updatedFields.companyId) : undefined)
          : (oldContact.companyId ? state.companies.find(c => c.id === oldContact.companyId) : undefined);

        const nationality = updatedFields.nationalityId
          ? state.nationalities.find(n => n.id === updatedFields.nationalityId)
          : undefined;

        const leadSource = updatedFields.leadSourceId
          ? state.leadSources.find(l => l.id === updatedFields.leadSourceId)
          : undefined;

        const level = updatedFields.levelId
          ? state.levels.find(lvl => lvl.id === updatedFields.levelId)
          : undefined;

        const newContact: Contact = {
          ...oldContact,
          ...updatedFields,
          companyName: updatedFields.companyId === 0 ? undefined : (company ? company.companyName : oldContact.companyName),
          ...(nationality && { nationalityName: nationality.name }),
          ...(leadSource && { leadSourceName: leadSource.name }),
          ...(level && { levelName: level.name }),
        };

        return {
          contacts: state.contacts.map(c => c.id === id ? newContact : c)
        };
      }),

      // Toggle Contact active status
      toggleContactActive: (id) => set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
      })),
    }),
    {
      name: "pmh-clients-storage",
    }
  )
);
