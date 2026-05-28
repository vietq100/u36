import { PageHeader } from "@/components/shared/layout/PageHeader";
import { ContractList } from "../components/ContractList";
import { FileText, ShieldAlert, BadgeDollarSign, CalendarDays } from "lucide-react";
import { useContractsStore } from "../stores/useContractsStore";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function ContractsPage() {
  const contracts = useContractsStore((state) => state.contracts);

  // 1. Calculate active metrics
  const activeContracts = contracts.filter((c) => c.statusId === 2);
  const totalValue = activeContracts.reduce((sum, c) => sum + c.contractAmount, 0);
  const totalDeposit = activeContracts.reduce((sum, c) => sum + c.depositAmount, 0);

  // 2. Count contracts expiring soon (e.g. within 90 days)
  const expiringSoonCount = contracts.filter((c) => {
    if (c.statusId !== 2) return false;
    const expiry = new Date(c.expiryDate).getTime();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    return expiry - Date.now() < ninetyDays && expiry - Date.now() > 0;
  }).length;

  const summaryCards = [
    {
      label: "Hợp đồng hoạt động",
      value: `${activeContracts.length} bản`,
      desc: "Đang phát sinh doanh thu thuê",
      icon: FileText,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Doanh số hợp đồng",
      value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalValue),
      desc: `Tiền cọc giữ chỗ: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(totalDeposit)}`,
      icon: BadgeDollarSign,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Cần lưu ý gia hạn",
      value: `${expiringSoonCount} hợp đồng`,
      desc: "Sắp hết hạn trong vòng 90 ngày",
      icon: ShieldAlert,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Hợp đồng chờ ký kết",
      value: `${contracts.filter(c => c.statusId === 1).length} bản nháp`,
      desc: "Chờ phê duyệt điều khoản",
      icon: CalendarDays,
      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Hợp đồng thuê BĐS"
        description="Quản lý các thỏa thuận cho thuê căn hộ, shophouse thương mại, biệt thự và văn phòng dịch vụ tại khu đô thị Phú Mỹ Hưng."
      />

      {/* Stats Widgets */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
                <h3 className="text-xl font-bold text-foreground mt-1">{card.value}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{card.desc}</p>
              </div>
              <div className={`p-3 rounded-lg border ${card.color} shrink-0 ml-3`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* Contract List Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <ContractList />
      </motion.div>
    </div>
  );
}
