import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  BookOpen,
  DollarSign,
  CalendarCheck,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";

interface CourseInfo {
  id: string;
  name: string;
  description: string | null;
  duration_months: number | null;
  fee_amount: number | null;
}

interface BatchInfo {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: string[] | null;
}

interface FeeRecord {
  id: string;
  amount: number;
  paid_amount: number | null;
  status: string | null;
  due_date: string | null;
  month: string | null;
  year: number | null;
  fee_type: string | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
}

const StudentDashboard = () => {
  const { profile, studentDetails, signOut } = useAuth();
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentDetails) return;

      try {
        // Fetch course
        if (studentDetails.course_id) {
          const { data: courseData } = await supabase
            .from("courses")
            .select("*")
            .eq("id", studentDetails.course_id)
            .maybeSingle();
          if (courseData) setCourse(courseData);
        }

        // Fetch batch
        if (studentDetails.batch_id) {
          const { data: batchData } = await supabase
            .from("batches")
            .select("*")
            .eq("id", studentDetails.batch_id)
            .maybeSingle();
          if (batchData) setBatch(batchData);
        }

        // Fetch fees
        const { data: feeData } = await supabase
          .from("fees")
          .select("*")
          .eq("student_id", studentDetails.id)
          .order("created_at", { ascending: false });
        if (feeData) setFees(feeData);

        // Fetch attendance (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", studentDetails.id)
          .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("date", { ascending: false });
        if (attendanceData) setAttendance(attendanceData);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentDetails]);

  const presentDays = attendance.filter((a) => a.status === "present").length;
  const totalDays = attendance.length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  const feeProgress = studentDetails 
    ? (studentDetails.paid_fee / (studentDetails.total_fee || 1)) * 100 
    : 0;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/10 text-success border-success/20">Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case "overdue":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Overdue</Badge>;
      case "partial":
        return <Badge className="bg-info/10 text-info border-info/20">Partial</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAttendanceBadge = (status: string | null) => {
    switch (status) {
      case "present":
        return <Badge className="bg-success/10 text-success">Present</Badge>;
      case "absent":
        return <Badge variant="destructive">Absent</Badge>;
      case "late":
        return <Badge className="bg-warning/10 text-warning">Late</Badge>;
      case "excused":
        return <Badge variant="secondary">Excused</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary flex items-center justify-center rounded-lg">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">EduPro</span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-muted rounded-lg">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <Button variant="ghost" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="w-20 h-20 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {profile?.full_name?.split(" ").map((n) => n[0]).join("") || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{profile?.full_name}</h1>
                  {studentDetails?.is_verified && (
                    <Badge className="bg-success/10 text-success border-success/20 gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Reg No: {studentDetails?.registration_number || "N/A"}</span>
                  <span>Roll No: {studentDetails?.roll_number || "N/A"}</span>
                  <span>Email: {profile?.email}</span>
                </div>
                <div className="flex gap-2">
                  {course && <Badge variant="outline">{course.name}</Badge>}
                  {batch && <Badge variant="secondary">{batch.name}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{course?.name || "Not Assigned"}</div>
              {course?.duration_months && (
                <p className="text-xs text-muted-foreground">{course.duration_months} months duration</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Batch Timing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{batch?.name || "Not Assigned"}</div>
              {batch && (
                <p className="text-xs text-muted-foreground">{batch.start_time} - {batch.end_time}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">{presentDays}/{totalDays} days present</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground">
                ₹{(studentDetails?.pending_fee || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Fee Progress */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fee Payment Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Paid: ₹{(studentDetails?.paid_fee || 0).toLocaleString()}</span>
              <span className="text-muted-foreground">Total: ₹{(studentDetails?.total_fee || 0).toLocaleString()}</span>
            </div>
            <Progress value={feeProgress} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="text-success font-medium">{Math.round(feeProgress)}% Paid</span>
              <span className="text-warning font-medium">₹{(studentDetails?.pending_fee || 0).toLocaleString()} Pending</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fee History */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Fee History</CardTitle>
            </CardHeader>
            <CardContent>
              {fees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No fee records found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.slice(0, 5).map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          {fee.month} {fee.year}
                        </TableCell>
                        <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Attendance */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {attendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No attendance records found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.slice(0, 5).map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {new Date(record.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </TableCell>
                        <TableCell>{getAttendanceBadge(record.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.check_in_time || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
