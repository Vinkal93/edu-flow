import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Download, Plus } from "lucide-react";

const feeData = [
  { id: 1, student: "Rahul Sharma", course: "Web Development", total: 25000, paid: 25000, pending: 0, status: "Paid", dueDate: "-" },
  { id: 2, student: "Priya Singh", course: "Python Programming", total: 18000, paid: 9000, pending: 9000, status: "Pending", dueDate: "25 Dec 2024" },
  { id: 3, student: "Amit Kumar", course: "Data Science", total: 45000, paid: 30000, pending: 15000, status: "Pending", dueDate: "30 Dec 2024" },
  { id: 4, student: "Sneha Gupta", course: "Java Programming", total: 22000, paid: 11000, pending: 11000, status: "Overdue", dueDate: "10 Dec 2024" },
  { id: 5, student: "Vikram Patel", course: "Web Development", total: 25000, paid: 25000, pending: 0, status: "Paid", dueDate: "-" },
];

const Fees = () => {
  const totalCollected = feeData.reduce((sum, f) => sum + f.paid, 0);
  const totalPending = feeData.reduce((sum, f) => sum + f.pending, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fee Management</h1>
            <p className="text-muted-foreground">Track and manage student fee payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Export</Button>
            <Button className="gap-2"><Plus className="w-4 h-4" />Record Payment</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Collected</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-success">₹{totalCollected.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Amount</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-warning">₹{totalPending.toLocaleString()}</div></CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overdue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">{feeData.filter(f => f.status === "Overdue").length} students</div></CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fully Paid</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{feeData.filter(f => f.status === "Paid").length} students</div></CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Total Fee</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeData.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium text-foreground">{fee.student}</TableCell>
                    <TableCell className="text-muted-foreground">{fee.course}</TableCell>
                    <TableCell className="text-foreground">₹{fee.total.toLocaleString()}</TableCell>
                    <TableCell className="text-success">₹{fee.paid.toLocaleString()}</TableCell>
                    <TableCell className="text-warning">₹{fee.pending.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{fee.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={fee.status === "Paid" ? "default" : fee.status === "Overdue" ? "destructive" : "secondary"}>
                        {fee.status}
                      </Badge>
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

export default Fees;
