import { useState } from "react";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { ContactList } from "../components/ContactList";
import { CompanyList } from "../components/CompanyList";
import { UserCheck, Building, BarChart2, PieChart as PieIcon } from "lucide-react";
import { useClientsStore } from "../stores/useClientsStore";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState<"contacts" | "companies">("contacts");
  
  const companies = useClientsStore((state) => state.companies);
  const contacts = useClientsStore((state) => state.contacts);

  // 1. Calculate industry distribution for BarChart
  const industryMap: Record<string, number> = {};
  companies.forEach((c) => {
    const name = c.industryName || "Khác";
    industryMap[name] = (industryMap[name] || 0) + 1;
  });
  const industryData = Object.keys(industryMap).map((name) => ({
    name,
    "Số lượng": industryMap[name],
  }));

  // 2. Calculate lead source distribution for PieChart
  const leadSourceMap: Record<string, number> = {};
  contacts.forEach((c) => {
    const name = c.leadSourceName || "Khác";
    leadSourceMap[name] = (leadSourceMap[name] || 0) + 1;
  });
  const leadSourceData = Object.keys(leadSourceMap).map((name) => ({
    name,
    value: leadSourceMap[name],
  }));

  // Harmony color palette (Teal and Gold)
  const TEAL_COLORS = ["#0d9488", "#0f766e", "#14b8a6", "#2dd4bf", "#115e59"];
  const GOLD_COLORS = ["#ca8a04", "#eab308", "#f59e0b", "#d97706", "#b45309"];
  const PIE_COLORS = [...TEAL_COLORS.slice(0, 3), ...GOLD_COLORS.slice(0, 3)];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Khách hàng & Đối tác"
        description="Quản lý thông tin liên hệ, khách hàng cá nhân và doanh nghiệp đối tác thuê mặt bằng shophouse, văn phòng hoặc căn hộ."
      />

      {/* Statistical Dashboard Panels */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Industry Distribution Chart (BarChart) */}
        <Card className="p-5 flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Phân bổ Doanh nghiệp theo Ngành nghề</h3>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "rgba(var(--card), 0.9)", border: "1px solid rgba(var(--border), 0.4)", borderRadius: "8px" }}
                  labelClassName="text-foreground font-semibold"
                />
                <Bar dataKey="Số lượng" fill="#0d9488" radius={[4, 4, 0, 0]}>
                  {industryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TEAL_COLORS[index % TEAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Lead Sources Chart (PieChart) */}
        <Card className="p-5 flex flex-col h-[280px]">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="h-4.5 w-4.5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Nguồn tiếp cận Khách hàng (Leads)</h3>
          </div>
          <div className="flex-1 w-full text-xs flex items-center justify-between">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadSourceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(var(--card), 0.9)", border: "1px solid rgba(var(--border), 0.4)", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[40%] flex flex-col justify-center space-y-1.5 pl-2 max-h-[180px] overflow-y-auto">
              {leadSourceData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-[10px]">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{entry.name}:</span>
                  <span className="font-semibold text-foreground">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Modern Premium Tabs Header */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "contacts" | "companies")} className="w-full">
        <TabsList variant="underline">
          <TabsTrigger value="contacts" layoutId="activeTabIndicator">
            <UserCheck className="h-4 w-4" />
            <span>Liên hệ & Khách cá nhân</span>
          </TabsTrigger>
          <TabsTrigger value="companies" layoutId="activeTabIndicator">
            <Building className="h-4 w-4" />
            <span>Khách hàng doanh nghiệp</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Panels with AnimatePresence slide effect */}
        <div className="mt-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "contacts" ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "contacts" ? 15 : -15 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value={activeTab} className="mt-0 focus:outline-none">
                {activeTab === "contacts" ? <ContactList /> : <CompanyList />}
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
