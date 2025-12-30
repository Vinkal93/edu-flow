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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Eye, Trash2, Loader2, UserCheck, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeachers } from "@/hooks/useTeachers";

const Teachers = () => {
  const { teachers, isLoading, addTeacher, toggleActive, deleteTeacher } = useTeachers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    employeeId: "",
    qualification: "",
    subjects: [] as string[],
    salary: 0,
  });
  const { toast } = useToast();

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeTeachers = teachers.filter(t => t.is_active);
  const inactiveTeachers = teachers.filter(t => !t.is_active);
  const totalSalary = activeTeachers.reduce((sum, t) => sum + (t.salary || 0), 0);

  const handleAddTeacher = async () => {
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Name, Email, Password)",
        variant: "destructive",
      });
      return;
    }

    if (newTeacher.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await addTeacher(newTeacher);
    setIsSubmitting(false);

    if (result.success) {
      setNewTeacher({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        employeeId: "",
        qualification: "",
        subjects: [],
        salary: 0,
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleToggleActive = async (teacher: any) => {
    await toggleActive(teacher.id, !teacher.is_active);
  };

  const handleDeleteTeacher = async (teacher: any) => {
    if (confirm(`Are you sure you want to remove ${teacher.profile?.full_name}?`)) {
      await deleteTeacher(teacher.id);
    }
  };

  const getStatusBadge = (teacher: any) => {
    if (!teacher.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Enter teacher details. Login credentials will be created automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter teacher name"
                    value={newTeacher.fullName}
                    onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newTeacher.password}
                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
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
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input
                    id="employee-id"
                    placeholder="Auto-generated if empty"
                    value={newTeacher.employeeId}
                    onChange={(e) => setNewTeacher({ ...newTeacher, employeeId: e.target.value })}
                  />
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
                  <Label htmlFor="subjects">Subjects (comma separated)</Label>
                  <Input
                    id="subjects"
                    placeholder="Math, Science, English"
                    onChange={(e) => setNewTeacher({ 
                      ...newTeacher, 
                      subjects: e.target.value.split(",").map(s => s.trim()).filter(Boolean) 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="35000"
                    value={newTeacher.salary || ""}
                    onChange={(e) => setNewTeacher({ ...newTeacher, salary: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTeacher} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Teacher"
                  )}
                </Button>
              </DialogFooter>
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
              <div className="text-2xl font-bold text-success">{activeTeachers.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{inactiveTeachers.length}</div>
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
                placeholder="Search by name, email, or ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {teachers.length === 0 ? "No teachers added yet. Add your first teacher!" : "No teachers match your search."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Qualification</TableHead>
                      <TableHead>Salary</TableHead>
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
                                {teacher.profile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{teacher.profile?.full_name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{teacher.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground font-mono">{teacher.employee_id || "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjects?.slice(0, 2).map((subject, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {(teacher.subjects?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(teacher.subjects?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{teacher.qualification || "—"}</TableCell>
                        <TableCell className="text-foreground font-medium">₹{(teacher.salary || 0).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(teacher)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleToggleActive(teacher)}
                              title={teacher.is_active ? "Deactivate Teacher" : "Activate Teacher"}
                            >
                              {teacher.is_active ? (
                                <UserX className="w-4 h-4 text-warning" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-success" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTeacher(teacher)}
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
            )}
          </CardContent>
        </Card>

        {/* View Teacher Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Teacher Details</DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 bg-secondary">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-medium">
                      {selectedTeacher.profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedTeacher.profile?.full_name}
                    </h3>
                    <p className="text-muted-foreground">{selectedTeacher.profile?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employee ID</p>
                    <p className="font-medium text-foreground font-mono">{selectedTeacher.employee_id || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedTeacher.profile?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Qualification</p>
                    <p className="font-medium text-foreground">{selectedTeacher.qualification || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Experience</p>
                    <p className="font-medium text-foreground">{selectedTeacher.experience_years || 0} years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Salary</p>
                    <p className="font-medium text-foreground">₹{(selectedTeacher.salary || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joining Date</p>
                    <p className="font-medium text-foreground">{selectedTeacher.joining_date || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Subjects</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTeacher.subjects?.map((subject: string, i: number) => (
                        <Badge key={i} variant="outline">
                          {subject}
                        </Badge>
                      )) || <span className="text-muted-foreground">—</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Teachers;
