import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const recentStudents = [
  { id: 1, name: "Rahul Sharma", course: "Web Development", date: "Today", status: "Active" },
  { id: 2, name: "Priya Singh", course: "Python Programming", date: "Yesterday", status: "Active" },
  { id: 3, name: "Amit Kumar", course: "Data Science", date: "2 days ago", status: "Active" },
  { id: 4, name: "Sneha Gupta", course: "Java Programming", date: "3 days ago", status: "Pending" },
  { id: 5, name: "Vikram Patel", course: "Web Development", date: "4 days ago", status: "Active" },
];

const pendingFees = [
  { id: 1, name: "Anjali Verma", amount: 5000, dueDate: "15 Dec", overdue: true },
  { id: 2, name: "Rohit Jain", amount: 7500, dueDate: "18 Dec", overdue: false },
  { id: 3, name: "Kavita Reddy", amount: 3000, dueDate: "20 Dec", overdue: false },
  { id: 4, name: "Suresh Nair", amount: 8500, dueDate: "10 Dec", overdue: true },
];

const RecentActivity = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Admissions */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Admissions</CardTitle>
          <a href="/dashboard/students" className="text-sm text-primary hover:underline">
            View all
          </a>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-4">
                <Avatar className="w-10 h-10 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {student.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.course}</p>
                </div>
                <div className="text-right">
                  <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                    {student.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{student.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Fees */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Pending Fees</CardTitle>
          <a href="/dashboard/fees" className="text-sm text-primary hover:underline">
            View all
          </a>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingFees.map((fee) => (
              <div key={fee.id} className="flex items-center gap-4">
                <Avatar className="w-10 h-10 bg-warning/10">
                  <AvatarFallback className="bg-warning/10 text-warning font-medium">
                    {fee.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fee.name}</p>
                  <p className="text-xs text-muted-foreground">Due: {fee.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₹{fee.amount.toLocaleString()}</p>
                  {fee.overdue && (
                    <Badge variant="destructive" className="mt-1">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
