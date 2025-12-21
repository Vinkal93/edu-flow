import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const monthlyData = [
  { month: "Jan", students: 45, fees: 125000 },
  { month: "Feb", students: 52, fees: 145000 },
  { month: "Mar", students: 48, fees: 138000 },
  { month: "Apr", students: 61, fees: 167000 },
  { month: "May", students: 55, fees: 152000 },
  { month: "Jun", students: 67, fees: 185000 },
];

const courseData = [
  { name: "Web Dev", value: 35 },
  { name: "Python", value: 25 },
  { name: "Java", value: 20 },
  { name: "Data Science", value: 15 },
  { name: "Others", value: 5 },
];

const attendanceData = [
  { day: "Mon", present: 92 },
  { day: "Tue", present: 88 },
  { day: "Wed", present: 95 },
  { day: "Thu", present: 91 },
  { day: "Fri", present: 85 },
  { day: "Sat", present: 78 },
];

const COLORS = ["hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(291, 64%, 42%)", "hsl(215, 20%, 65%)"];

const DashboardCharts = () => {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Fee Collection Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Fee Collection (₹)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="fees" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Course Distribution */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Students by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {courseData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Trend */}
      <Card className="border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-foreground">Weekly Attendance (%)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[70, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="hsl(142, 71%, 45%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
