import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, Users, UserX, Download } from "lucide-react";
import { useState } from "react";

const students = [
  { id: 1, name: "Rahul Sharma", course: "Web Development", status: "Present" },
  { id: 2, name: "Priya Singh", course: "Python Programming", status: "Present" },
  { id: 3, name: "Amit Kumar", course: "Data Science", status: "Absent" },
  { id: 4, name: "Sneha Gupta", course: "Java Programming", status: "Present" },
  { id: 5, name: "Vikram Patel", course: "Web Development", status: "Late" },
  { id: 6, name: "Anjali Verma", course: "Python Programming", status: "Present" },
  { id: 7, name: "Rohit Jain", course: "Data Science", status: "Present" },
  { id: 8, name: "Kavita Reddy", course: "Java Programming", status: "Absent" },
];

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(students);
  const present = attendanceData.filter(s => s.status === "Present").length;
  const absent = attendanceData.filter(s => s.status === "Absent").length;

  const updateStatus = (id: number, status: string) => {
    setAttendanceData(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">Mark and track daily attendance</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="today">
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Export</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Students</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{attendanceData.length}</div></CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Present</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">{present}</div></CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Absent</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{absent}</div></CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Attendance %</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{Math.round((present / attendanceData.length) * 100)}%</div></CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mark Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-foreground">{student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.course}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "Present" ? "default" : student.status === "Late" ? "secondary" : "destructive"}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant={student.status === "Present" ? "default" : "outline"} onClick={() => updateStatus(student.id, "Present")}>Present</Button>
                        <Button size="sm" variant={student.status === "Absent" ? "destructive" : "outline"} onClick={() => updateStatus(student.id, "Absent")}>Absent</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
