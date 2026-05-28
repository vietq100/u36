import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Plus, 
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend
} from "recharts";

// Hardcoded revenue data for expected vs collected
const revenueData = [
  { month: "T1", expected: 12000, collected: 11000 },
  { month: "T2", expected: 14500, collected: 13800 },
  { month: "T3", expected: 15000, collected: 14200 },
  { month: "T4", expected: 18900, collected: 18000 },
  { month: "T5", expected: 21000, collected: 19800 },
  { month: "T6", expected: 24500, collected: 23000 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { units, projects } = usePropertiesStore();
  const { companies, contacts } = useClientsStore();

  // 1. Calculate occupancy statistics
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.statusId === 2).length; // 2 = rented
  const negotiatingUnits = units.filter((u) => u.statusId === 3).length; // 3 = negotiating
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // 2. Calculate monthly rental revenue
  const monthlyRevenue = units
    .filter((u) => u.statusId === 2)
    .reduce((sum, u) => sum + u.price, 0);

  // 3. Project occupancy rates mapping for BarChart
  const projectOccupancyData = projects.map((proj) => {
    const projUnits = units.filter((u) => u.projectId === proj.id);
    const projOccupied = projUnits.filter((u) => u.statusId === 2).length;
    const rate = projUnits.length > 0 ? Math.round((projOccupied / projUnits.length) * 100) : 0;
    return {
      name: proj.projectName.split(" (")[0], // Shorten name
      "Tỷ lệ lấp đầy (%)": rate,
      "Tổng số căn": projUnits.length,
    };
  });

  const STAT_CARDS = [
    {
      title: "Tổng số Bất động sản",
      value: `${totalUnits} căn`,
      desc: `${negotiatingUnits} căn đang thương thảo`,
      icon: Building2,
      color: "from-teal-500/20 to-emerald-500/20 text-emerald-500",
      link: "/properties",
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: `${occupancyRate}%`,
      desc: `${occupiedUnits} căn đang vận hành`,
      icon: Percent,
      color: "from-sky-500/20 to-blue-500/20 text-sky-500",
      link: "/properties",
    },
    {
      title: "Doanh thu hàng tháng",
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(monthlyRevenue),
      desc: "Tổng doanh thu thuê hiệu lực",
      icon: DollarSign,
      color: "from-amber-500/20 to-yellow-500/20 text-amber-500",
      link: "/contracts",
    },
    {
      title: "Khách hàng & Đối tác",
      value: `${companies.length + contacts.length}`,
      desc: `${companies.length} Doanh nghiệp, ${contacts.length} Cá nhân`,
      icon: Users,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-500",
      link: "/clients",
    },
  ];

  const QUICK_ACTIONS = [
    {
      label: "Thêm Bất động sản",
      desc: "Khai báo căn hộ/mặt bằng mới",
      icon: Building2,
      action: () => navigate("/properties"),
      bgColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20",
    },
    {
      label: "Đăng ký Khách hàng",
      desc: "Thêm thông tin liên hệ/công ty",
      icon: Users,
      action: () => navigate("/clients"),
      bgColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20",
    },
    {
      label: "Lập Hợp đồng mới",
      desc: "Soạn thảo thỏa thuận cho thuê",
      icon: FileText,
      action: () => navigate("/contracts"),
      bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
    },
    {
      label: "Tiếp nhận Yêu cầu",
      desc: "Ghi nhận nhu cầu khách hàng",
      icon: MessageSquare,
      action: () => navigate("/inquiries"),
      bgColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 p-6 md:p-8 shadow-xl backdrop-blur-md"
      >
        {/* Glow decorative blobs */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/20 blur-[80px] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-60 h-60 rounded-full bg-accent/15 blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-accent" />
              Hệ thống Quản lý Phú Mỹ Hưng
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-accent bg-clip-text text-transparent">
              PMH Leasing Platform
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chào mừng quay trở lại! Dưới đây là phân tích chi tiết hoạt động kinh doanh, tỷ lệ lấp đầy mặt bằng căn hộ, doanh thu thuê và danh sách khách hàng cần lưu ý hôm nay.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => navigate("/contracts")}
              variant="accent"
              className="shadow-lg shadow-accent/10 hover:shadow-accent/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Lập hợp đồng mới
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex"
            >
              <Card
                onClick={() => navigate(card.link)}
                className="w-full cursor-pointer p-6 hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-300 relative group overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 active:scale-[0.98] border-border/60 bg-card/65 backdrop-blur-md"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
                    <h3 className="text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">{card.value}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{card.desc}</span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color} shrink-0 ml-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 p-5 flex flex-col h-[340px] border-border/60 bg-card/65 backdrop-blur-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Doanh thu dự kiến vs Thực thu</h3>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">6 tháng gần nhất</span>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(var(--card), 0.9)",
                    border: "1px solid rgba(var(--border), 0.4)",
                    borderRadius: "8px",
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area name="Hóa đơn lập (USD)" type="monotone" dataKey="expected" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" />
                <Area name="Thực thu ngân quỹ (USD)" type="monotone" dataKey="collected" stroke="#eab308" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Project Occupancy Rates */}
        <Card className="p-5 flex flex-col h-[340px] border-border/60 bg-card/65 backdrop-blur-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="h-4.5 w-4.5 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">Tỷ lệ lấp đầy theo Dự án</h3>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectOccupancyData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Tỷ lệ lấp đầy"]}
                  contentStyle={{
                    backgroundColor: "rgba(var(--card), 0.9)",
                    border: "1px solid rgba(var(--border), 0.4)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="Tỷ lệ lấp đầy (%)" fill="#0d9488" radius={[4, 4, 0, 0]}>
                  {projectOccupancyData.map((_, index) => {
                    const colors = ["#0d9488", "#0f766e", "#ca8a04"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-5 border-border/60 bg-card/65 backdrop-blur-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            Phím tắt tác vụ nhanh
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.label}
                  onClick={qa.action}
                  className={`flex items-center gap-3.5 p-3 rounded-lg border border-border/20 text-left transition-all duration-200 group ${qa.bgColor} hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="p-2 rounded-md bg-background shadow-sm shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-foreground group-hover:translate-x-0.5 transition-transform">{qa.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{qa.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Expiring Leases Overview */}
        <Card className="lg:col-span-2 p-5 flex flex-col justify-between border-border/60 bg-card/65 backdrop-blur-md hover:shadow-lg transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-amber-500" />
                Căn hộ đang bảo trì / thương thảo cần lưu ý
              </h3>
              <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold">Lưu ý</span>
            </div>
            <div className="space-y-3.5">
              {units.filter(u => u.statusId === 3 || u.statusId === 4).map((unit) => (
                <div key={unit.id} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">{unit.unitName}</span>
                      <span className="text-xs text-muted-foreground">{unit.projectName}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{unit.description}</p>
                  </div>
                  <div className="text-right">
                    <span 
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ 
                        color: unit.statusColor,
                        backgroundColor: `${unit.statusColor}15`,
                        border: `1px solid ${unit.statusColor}30`
                      }}
                    >
                      {unit.statusName}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(unit.price)}/tháng
                    </p>
                  </div>
                </div>
              ))}
              {units.filter(u => u.statusId === 3 || u.statusId === 4).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">Không có căn hộ nào cần xử lý đặc biệt.</p>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-border/40 text-center">
            <Button 
              variant="link"
              onClick={() => navigate("/properties")} 
              className="text-xs text-primary hover:text-primary/80 font-semibold p-0 h-auto"
            >
              Xem chi tiết mặt bằng căn hộ &rarr;
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
