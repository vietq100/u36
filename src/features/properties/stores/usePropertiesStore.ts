import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Unit } from "../types";

export interface StatusOption {
  id: number;
  name: string;
  code: string;
  color: string;
}

interface PropertiesState {
  projects: Project[];
  units: Unit[];
  statuses: StatusOption[];

  // Project Actions
  addProject: (project: Omit<Project, "id" | "numberOfUnits" | "isActive">) => void;
  updateProject: (id: number, project: Partial<Project>) => void;
  toggleProjectActive: (id: number) => void;

  // Unit Actions
  addUnit: (unit: Omit<Unit, "id" | "projectName" | "statusName" | "statusColor" | "isActive">) => void;
  updateUnit: (id: number, unit: Partial<Unit>) => void;
  toggleUnitActive: (id: number) => void;
}



const initialStatuses: StatusOption[] = [
  { id: 1, name: "Trống (Sẵn sàng)", code: "AVAILABLE", color: "#10b981" }, // emerald-500
  { id: 2, name: "Đã cho thuê", code: "RENTED", color: "#3b82f6" }, // blue-500
  { id: 3, name: "Đang thương thảo", code: "NEGOTIATING", color: "#f59e0b" }, // amber-500
  { id: 4, name: "Đang bảo trì", code: "MAINTENANCE", color: "#ef4444" }, // red-500
];

const initialUnits: Unit[] = [
  {
    id: 101,
    unitName: "SV1-02-03",
    projectId: 2,
    projectName: "Scenic Valley 1",
    floorId: 0,
    floorName: "Tầng 2",
    actualSize: 85,
    price: 1200,
    statusId: 1,
    statusName: "Trống (Sẵn sàng)",
    statusColor: "#10b981",
    description: "Căn hộ 2 phòng ngủ hướng hồ bơi, đầy đủ nội thất cao cấp",
    isActive: true,
  },
  {
    id: 102,
    unitName: "MD-15-08",
    projectId: 1,
    projectName: "Midtown M7 (The Symphony)",
    floorId: 0,
    floorName: "Tầng 15",
    actualSize: 110,
    price: 1800,
    statusId: 2,
    statusName: "Đã cho thuê",
    statusColor: "#3b82f6",
    description: "Căn hộ 3 phòng ngủ view sông, nội thất nhập khẩu châu Âu",
    isActive: true,
  },
  {
    id: 103,
    unitName: "CR2-01-01",
    projectId: 3,
    projectName: "Crescent Residence 2",
    floorId: 0,
    floorName: "Tầng 1",
    actualSize: 250,
    price: 6500,
    statusId: 3,
    statusName: "Đang thương thảo",
    statusColor: "#f59e0b",
    description: "Mặt bằng kinh doanh F&B thương mại tầng trệt ven hồ Bán Nguyệt",
    isActive: true,
  },
  {
    id: 104,
    unitName: "MD-01-02",
    projectId: 1,
    projectName: "Midtown M7 (The Symphony)",
    floorId: 0,
    floorName: "Tầng 1",
    actualSize: 145,
    price: 4200,
    statusId: 4,
    statusName: "Đang bảo trì",
    statusColor: "#ef4444",
    description: "Cửa hàng shophouse mặt tiền đường Nguyễn Lương Bằng, đang sơn sửa lại",
    isActive: true,
  },
];

export const usePropertiesStore = create<PropertiesState>()(
  persist(
    (set) => ({
      projects: [],
      units: initialUnits,
      statuses: initialStatuses,

      // Add Project
      addProject: (project) => set((state) => {
        const newId = state.projects.length > 0 ? Math.max(...state.projects.map(p => p.id)) + 1 : 1;
        const newProject: Project = {
          ...project,
          id: newId,
          numberOfUnits: 0,
          isActive: true,
        };
        return { projects: [...state.projects, newProject] };
      }),

      // Update Project
      updateProject: (id, updatedFields) => set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)),
        units: state.units.map((u) => {
          if (u.projectId === id && updatedFields.projectName) {
            return { ...u, projectName: updatedFields.projectName };
          }
          return u;
        })
      })),

      // Toggle Project active status
      toggleProjectActive: (id) => set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
      })),

      // Add Unit
      addUnit: (unit) => set((state) => {
        const newId = state.units.length > 0 ? Math.max(...state.units.map(u => u.id)) + 1 : 101;
        const project = state.projects.find(p => p.id === unit.projectId);
        const status = state.statuses.find(s => s.id === unit.statusId);

        const newUnit: Unit = {
          ...unit,
          id: newId,
          projectName: project ? project.projectName : "Dự án khác",
          statusName: status ? status.name : "Trống",
          statusColor: status ? status.color : "#10b981",
          isActive: true,
        };

        // Increase unit count of the project
        const updatedProjects = state.projects.map(p =>
          p.id === unit.projectId ? { ...p, numberOfUnits: p.numberOfUnits + 1 } : p
        );

        return {
          units: [...state.units, newUnit],
          projects: updatedProjects
        };
      }),

      // Update Unit
      updateUnit: (id, updatedFields) => set((state) => {
        const oldUnit = state.units.find(u => u.id === id);
        if (!oldUnit) return {};

        const project = updatedFields.projectId
          ? state.projects.find(p => p.id === updatedFields.projectId)
          : state.projects.find(p => p.id === oldUnit.projectId);

        const status = updatedFields.statusId
          ? state.statuses.find(s => s.id === updatedFields.statusId)
          : state.statuses.find(s => s.id === oldUnit.statusId);

        // Handle project unit count adjustments if projectId changed
        let updatedProjects = state.projects;
        if (updatedFields.projectId && updatedFields.projectId !== oldUnit.projectId) {
          updatedProjects = state.projects.map(p => {
            if (p.id === oldUnit.projectId) return { ...p, numberOfUnits: Math.max(0, p.numberOfUnits - 1) };
            if (p.id === updatedFields.projectId) return { ...p, numberOfUnits: p.numberOfUnits + 1 };
            return p;
          });
        }

        const newUnit: Unit = {
          ...oldUnit,
          ...updatedFields,
          ...(project && { projectName: project.projectName }),
          ...(status && { statusName: status.name, statusColor: status.color }),
        };

        return {
          units: state.units.map(u => u.id === id ? newUnit : u),
          projects: updatedProjects
        };
      }),

      // Toggle Unit active status
      toggleUnitActive: (id) => set((state) => ({
        units: state.units.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u)
      })),
    }),
    {
      name: "pmh-properties-storage",
    }
  )
);
