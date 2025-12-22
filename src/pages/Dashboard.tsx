import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Users, GraduationCap, DollarSign, CalendarCheck, TrendingUp, UserPlus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  newAdmissions: number;
}

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalFees: 0,
    paidFees: 0,
    pendingFees: 0,
    newAdmissions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("this_month");

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.institute_id) return;

      try {
        setIsLoading(true);
        
        // Fetch students count
        const { count: totalStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("institute_id", profile.institute_id);

        const { count: activeStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("institute_id", profile.institute_id)
          .eq("status", "active");

        // Fetch teachers count
        const { count: totalTeachers } = await supabase
          .from("teachers")
          .select("*", { count: "exact", head: true })
          .eq("institute_id", profile.institute_id)
          .eq("is_active", true);

        // Fetch courses count
        const { count: totalCourses } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("institute_id", profile.institute_id)
          .eq("is_active", true);

        // Fetch fees
        const { data: feesData } = await supabase
          .from("fees")
          .select("amount, paid_amount, status")
          .eq("institute_id", profile.institute_id);

        const totalFees = feesData?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
        const paidFees = feesData?.reduce((sum, f) => sum + (f.paid_amount || 0), 0) || 0;
        const pendingFees = totalFees - paidFees;

        // New admissions (this week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { count: newAdmissions } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("institute_id", profile.institute_id)
          .gte("admission_date", oneWeekAgo.toISOString().split("T")[0]);

        setStats({
          totalStudents: totalStudents || 0,
          activeStudents: activeStudents || 0,
          totalTeachers: totalTeachers || 0,
          totalCourses: totalCourses || 0,
          totalFees,
          paidFees,
          pendingFees,
          newAdmissions: newAdmissions || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [profile?.institute_id, dateFilter]);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      change: `${stats.activeStudents} active`,
      changeType: "positive" as const,
      description: "enrolled",
    },
    {
      title: "Active Teachers",
      value: stats.totalTeachers,
      icon: GraduationCap,
      change: `${stats.totalCourses} courses`,
      changeType: "positive" as const,
      description: "teaching",
    },
    {
      title: "Fees Collected",
      value: formatCurrency(stats.paidFees),
      icon: DollarSign,
      change: `of ${formatCurrency(stats.totalFees)}`,
      changeType: "positive" as const,
      description: "collected",
    },
    {
      title: "Today's Attendance",
      value: "0%",
      icon: CalendarCheck,
      change: "No data",
      changeType: "neutral" as const,
      description: "present",
    },
    {
      title: "Pending Fees",
      value: formatCurrency(stats.pendingFees),
      icon: TrendingUp,
      change: "outstanding",
      changeType: stats.pendingFees > 0 ? "negative" as const : "neutral" as const,
    },
    {
      title: "New Admissions",
      value: stats.newAdmissions,
      icon: UserPlus,
      change: "This week",
      changeType: "neutral" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name || "User"}! Here's what's happening at your institute.
            </p>
          </div>
          
          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Quick Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Student Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <span className="text-sm font-medium text-success">{stats.activeStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Inactive</span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {stats.totalStudents - stats.activeStudents}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fee Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Collected</span>
                  <span className="text-sm font-medium text-success">{formatCurrency(stats.paidFees)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium text-warning">{formatCurrency(stats.pendingFees)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Institute Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Courses</span>
                  <span className="text-sm font-medium">{stats.totalCourses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Teachers</span>
                  <span className="text-sm font-medium">{stats.totalTeachers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
