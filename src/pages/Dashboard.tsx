import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Users, GraduationCap, DollarSign, CalendarCheck, TrendingUp, UserPlus } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Students",
      value: 248,
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
      description: "from last month",
    },
    {
      title: "Active Teachers",
      value: 18,
      icon: GraduationCap,
      change: "+2",
      changeType: "positive" as const,
      description: "new this month",
    },
    {
      title: "Fees Collected",
      value: "₹4.52L",
      icon: DollarSign,
      change: "+8%",
      changeType: "positive" as const,
      description: "this month",
    },
    {
      title: "Today's Attendance",
      value: "92%",
      icon: CalendarCheck,
      change: "-3%",
      changeType: "negative" as const,
      description: "from yesterday",
    },
    {
      title: "Pending Fees",
      value: "₹1.24L",
      icon: TrendingUp,
      change: "23 students",
      changeType: "neutral" as const,
    },
    {
      title: "New Admissions",
      value: 15,
      icon: UserPlus,
      change: "This week",
      changeType: "neutral" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your institute.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts */}
        <DashboardCharts />

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
