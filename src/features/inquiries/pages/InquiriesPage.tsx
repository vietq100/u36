import { PageHeader } from "@/components/shared/layout/PageHeader";
import { InquiryList } from "../components/InquiryList";
import { MessageSquare, HeartHandshake, CheckCircle2, XCircle } from "lucide-react";
import { useInquiriesStore } from "../stores/useInquiriesStore";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function InquiriesPage() {
  const inquiries = useInquiriesStore((state) => state.inquiries);

  // 1. Calculate active statistics
  const total = inquiries.length;
  const active = inquiries.filter(i => i.statusId >= 1 && i.statusId <= 3).length;
  const won = inquiries.filter(i => i.statusId === 4).length;
  const lost = inquiries.filter(i => i.statusId === 5).length;

  const summaryCards = [
    {
      label: "Tổng số yêu cầu tiếp nhận",
      value: `${total} yêu cầu`,
      desc: "Lịch sử tích lũy hệ thống",
      icon: MessageSquare,
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Đang xử lý / Chăm sóc",
      value: `${active} yêu cầu`,
      desc: "Chờ liên hệ hoặc đang thương thảo",
      icon: HeartHandshake,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Giao dịch thành công",
      value: `${won} giao dịch`,
      desc: "Đã chốt hợp đồng thuê mặt bằng",
      icon: CheckCircle2,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Yêu cầu đã đóng",
      value: `${lost} thất bại`,
      desc: "Khách hủy hoặc không tìm được căn",
      icon: XCircle,
      color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yêu cầu hỗ trợ & Nhu cầu Khách thuê"
        description="Ghi nhận và điều phối các yêu cầu tìm mặt bằng thương mại, shophouse văn phòng hoặc căn hộ của khách hàng đối tác."
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

      {/* Inquiry List Table */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <InquiryList />
      </motion.div>
    </div>
  );
}
