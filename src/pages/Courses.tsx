import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Clock, BookOpen, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: number;
  name: string;
  duration: string;
  fee: number;
  teacher: string;
  students: number;
  maxSeats: number;
  status: "Active" | "Full" | "Upcoming";
  batches: string[];
}

const initialCourses: Course[] = [
  { id: 1, name: "Web Development", duration: "6 months", fee: 25000, teacher: "Dr. Rajesh Verma", students: 35, maxSeats: 40, status: "Active", batches: ["Morning", "Evening"] },
  { id: 2, name: "Python Programming", duration: "4 months", fee: 18000, teacher: "Prof. Meena Sharma", students: 28, maxSeats: 30, status: "Active", batches: ["Morning", "Weekend"] },
  { id: 3, name: "Data Science", duration: "8 months", fee: 45000, teacher: "Sunil Kumar", students: 25, maxSeats: 25, status: "Full", batches: ["Evening"] },
  { id: 4, name: "Java Programming", duration: "5 months", fee: 22000, teacher: "Anita Patel", students: 20, maxSeats: 35, status: "Active", batches: ["Morning", "Evening"] },
  { id: 5, name: "Database Management", duration: "3 months", fee: 15000, teacher: "Vikash Singh", students: 0, maxSeats: 30, status: "Upcoming", batches: ["Weekend"] },
];

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: "",
    duration: "",
    fee: "",
    teacher: "",
    maxSeats: "",
  });
  const { toast } = useToast();

  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.duration || !newCourse.fee) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const course: Course = {
      id: courses.length + 1,
      name: newCourse.name,
      duration: newCourse.duration,
      fee: parseInt(newCourse.fee) || 0,
      teacher: newCourse.teacher || "TBD",
      students: 0,
      maxSeats: parseInt(newCourse.maxSeats) || 30,
      status: "Upcoming",
      batches: ["Morning"],
    };

    setCourses([...courses, course]);
    setNewCourse({ name: "", duration: "", fee: "", teacher: "", maxSeats: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Course Added",
      description: `${course.name} has been added successfully.`,
    });
  };

  const handleDeleteCourse = (id: number) => {
    setCourses(courses.filter((c) => c.id !== id));
    toast({
      title: "Course Deleted",
      description: "Course has been removed from the system.",
    });
  };

  const getStatusBadge = (status: Course["status"]) => {
    const colors = {
      Active: "bg-success/10 text-success border-success/20",
      Full: "bg-warning/10 text-warning border-warning/20",
      Upcoming: "bg-info/10 text-info border-info/20",
    };
    return (
      <Badge variant="outline" className={colors[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Courses & Batches</h1>
            <p className="text-muted-foreground">Manage your institute's courses and batch schedules</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Enter the course details to add a new program.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Full Stack Development"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Select
                    value={newCourse.duration}
                    onValueChange={(value) => setNewCourse({ ...newCourse, duration: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 Month</SelectItem>
                      <SelectItem value="2 months">2 Months</SelectItem>
                      <SelectItem value="3 months">3 Months</SelectItem>
                      <SelectItem value="4 months">4 Months</SelectItem>
                      <SelectItem value="6 months">6 Months</SelectItem>
                      <SelectItem value="8 months">8 Months</SelectItem>
                      <SelectItem value="12 months">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Course Fee (₹) *</Label>
                  <Input
                    id="fee"
                    type="number"
                    placeholder="25000"
                    value={newCourse.fee}
                    onChange={(e) => setNewCourse({ ...newCourse, fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Assign Teacher</Label>
                  <Select
                    value={newCourse.teacher}
                    onValueChange={(value) => setNewCourse({ ...newCourse, teacher: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Rajesh Verma">Dr. Rajesh Verma</SelectItem>
                      <SelectItem value="Prof. Meena Sharma">Prof. Meena Sharma</SelectItem>
                      <SelectItem value="Sunil Kumar">Sunil Kumar</SelectItem>
                      <SelectItem value="Anita Patel">Anita Patel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSeats">Maximum Seats</Label>
                  <Input
                    id="maxSeats"
                    type="number"
                    placeholder="30"
                    value={newCourse.maxSeats}
                    onChange={(e) => setNewCourse({ ...newCourse, maxSeats: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleAddCourse}>
                  Add Course
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{courses.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {courses.filter((c) => c.status === "Active").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {courses.reduce((sum, c) => sum + c.students, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Course Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                ₹{Math.round(courses.reduce((sum, c) => sum + c.fee, 0) / courses.length).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-foreground">{course.name}</CardTitle>
                    <CardDescription className="mt-1">{course.teacher}</CardDescription>
                  </div>
                  {getStatusBadge(course.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{course.students}/{course.maxSeats} seats</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {course.batches.map((batch) => (
                    <Badge key={batch} variant="secondary" className="text-xs">
                      {batch}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xl font-bold text-foreground">
                    ₹{course.fee.toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Courses;
