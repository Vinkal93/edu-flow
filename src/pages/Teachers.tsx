import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  salary: number;
  joiningDate: string;
  status: "Active" | "On Leave" | "Resigned";
}

const initialTeachers: Teacher[] = [
  { id: 1, name: "Dr. Rajesh Verma", email: "rajesh@edupro.com", phone: "9876543220", subject: "Web Development", qualification: "M.Tech, PhD", salary: 45000, joiningDate: "2022-05-15", status: "Active" },
  { id: 2, name: "Prof. Meena Sharma", email: "meena@edupro.com", phone: "9876543221", subject: "Python Programming", qualification: "M.Sc, B.Ed", salary: 38000, joiningDate: "2023-01-10", status: "Active" },
  { id: 3, name: "Sunil Kumar", email: "sunil@edupro.com", phone: "9876543222", subject: "Data Science", qualification: "M.Tech (AI/ML)", salary: 52000, joiningDate: "2022-08-20", status: "Active" },
  { id: 4, name: "Anita Patel", email: "anita@edupro.com", phone: "9876543223", subject: "Java Programming", qualification: "MCA", salary: 35000, joiningDate: "2023-03-05", status: "On Leave" },
  { id: 5, name: "Vikash Singh", email: "vikash@edupro.com", phone: "9876543224", subject: "Database Management", qualification: "M.Sc (IT)", salary: 40000, joiningDate: "2022-11-12", status: "Active" },
];

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    qualification: "",
    salary: "",
  });
  const { toast } = useToast();

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.subject) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const teacher: Teacher = {
      id: teachers.length + 1,
      ...newTeacher,
      salary: parseInt(newTeacher.salary) || 0,
      joiningDate: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setTeachers([teacher, ...teachers]);
    setNewTeacher({ name: "", email: "", phone: "", subject: "", qualification: "", salary: "" });
    setIsAddDialogOpen(false);
    toast({
      title: "Teacher Added",
      description: `${teacher.name} has been added successfully.`,
    });
  };

  const handleDeleteTeacher = (id: number) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    toast({
      title: "Teacher Removed",
      description: "Teacher has been removed from the system.",
    });
  };

  const getStatusBadge = (status: Teacher["status"]) => {
    const variants = {
      Active: "default",
      "On Leave": "secondary",
      Resigned: "destructive",
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const totalSalary = teachers.filter((t) => t.status === "Active").reduce((sum, t) => sum + t.salary, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Teachers & Staff</h1>
            <p className="text-muted-foreground">Manage your institute's teaching staff</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Enter the teacher details to add them to your institute.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter teacher name"
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@email.com"
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={newTeacher.subject}
                    onValueChange={(value) => setNewTeacher({ ...newTeacher, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Python Programming">Python Programming</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Java Programming">Java Programming</SelectItem>
                      <SelectItem value="Database Management">Database Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    placeholder="M.Tech, PhD, etc."
                    value={newTeacher.qualification}
                    onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="35000"
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({ ...newTeacher, salary: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleAddTeacher}>
                  Add Teacher
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{teachers.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {teachers.filter((t) => t.status === "Active").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {teachers.filter((t) => t.status === "On Leave").length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Salary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">₹{totalSalary.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-border">
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 bg-secondary">
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-sm font-medium">
                              {teacher.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{teacher.name}</p>
                            <p className="text-xs text-muted-foreground">{teacher.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{teacher.subject}</TableCell>
                      <TableCell className="text-muted-foreground">{teacher.qualification}</TableCell>
                      <TableCell className="text-foreground font-medium">₹{teacher.salary.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{teacher.joiningDate}</TableCell>
                      <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Teachers;
