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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, Plus, Download, Eye, Edit, Trash2, 
  Ban, CheckCircle, Shield, ShieldOff, Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStudents } from "@/hooks/useStudents";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";
import { Textarea } from "@/components/ui/textarea";

const Students = () => {
  const { students, isLoading, addStudent, toggleBlock, toggleVerify, deleteStudent } = useStudents();
  const { courses } = useCourses();
  const { batches } = useBatches();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    courseId: "",
    batchId: "",
    fatherName: "",
    motherName: "",
    guardianPhone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });
  const { toast } = useToast();

  const filteredStudents = students.filter(
    (student) =>
      student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStudents = students.filter(s => s.status === "active" && !s.is_blocked);
  const blockedStudents = students.filter(s => s.is_blocked);
  const pendingFeeStudents = students.filter(s => s.pending_fee > 0);

  const handleAddStudent = async () => {
    if (!newStudent.fullName || !newStudent.email || !newStudent.password) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Name, Email, Password)",
        variant: "destructive",
      });
      return;
    }

    if (newStudent.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const result = await addStudent(newStudent);
    setIsSubmitting(false);

    if (result.success) {
      setNewStudent({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        courseId: "",
        batchId: "",
        fatherName: "",
        motherName: "",
        guardianPhone: "",
        gender: "",
        dateOfBirth: "",
        address: "",
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleBlockStudent = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    await toggleBlock(selectedStudent.id, !selectedStudent.is_blocked, blockReason);
    setIsSubmitting(false);
    setIsBlockDialogOpen(false);
    setBlockReason("");
    setSelectedStudent(null);
  };

  const handleVerifyStudent = async (student: any) => {
    await toggleVerify(student.id, !student.is_verified);
  };

  const handleDeleteStudent = async (student: any) => {
    if (confirm(`Are you sure you want to remove ${student.profile?.full_name}?`)) {
      await deleteStudent(student.id);
    }
  };

  const getStatusBadge = (student: any) => {
    if (student.is_blocked) {
      return <Badge variant="destructive">Blocked</Badge>;
    }
    if (student.status === "left") {
      return <Badge variant="secondary">Left</Badge>;
    }
    if (student.status === "inactive") {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getFeeStatusBadge = (student: any) => {
    if (student.pending_fee <= 0) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          Paid
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
        ₹{student.pending_fee.toLocaleString()} Due
      </Badge>
    );
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
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage all students in your institute</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student details. Login credentials will be created automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter student name"
                    value={newStudent.fullName}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@email.com"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={newStudent.courseId}
                    onValueChange={(value) => setNewStudent({ ...newStudent, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch</Label>
                  <Select
                    value={newStudent.batchId}
                    onValueChange={(value) => setNewStudent({ ...newStudent, batchId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newStudent.gender}
                    onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newStudent.dateOfBirth}
                    onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father">Father's Name</Label>
                  <Input
                    id="father"
                    placeholder="Enter father's name"
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother">Mother's Name</Label>
                  <Input
                    id="mother"
                    placeholder="Enter mother's name"
                    value={newStudent.motherName}
                    onChange={(e) => setNewStudent({ ...newStudent, motherName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardian-phone">Guardian Phone</Label>
                  <Input
                    id="guardian-phone"
                    placeholder="9876543210"
                    value={newStudent.guardianPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, guardianPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStudent} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Enroll Student"
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{students.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeStudents.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingFeeStudents.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{blockedStudents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, ID, or course..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {students.length === 0 ? "No students enrolled yet. Add your first student!" : "No students match your search."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 bg-primary/10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {student.profile?.full_name?.split(" ").map((n) => n[0]).join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{student.profile?.full_name || "N/A"}</p>
                              <p className="text-xs text-muted-foreground">{student.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-foreground">{student.roll_number || "—"}</p>
                            <p className="text-xs text-muted-foreground">{student.registration_number}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">{student.course?.name || "—"}</TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell>
                          {student.is_verified ? (
                            <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{getFeeStatusBadge(student)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleVerifyStudent(student)}
                              title={student.is_verified ? "Remove Verification" : "Verify Student"}
                            >
                              {student.is_verified ? (
                                <ShieldOff className="w-4 h-4 text-warning" />
                              ) : (
                                <Shield className="w-4 h-4 text-success" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsBlockDialogOpen(true);
                              }}
                              title={student.is_blocked ? "Unblock Student" : "Block Student"}
                            >
                              <Ban className={`w-4 h-4 ${student.is_blocked ? "text-destructive" : ""}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteStudent(student)}
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

        {/* Block Dialog */}
        <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedStudent?.is_blocked ? "Unblock Student" : "Block Student"}
              </DialogTitle>
              <DialogDescription>
                {selectedStudent?.is_blocked
                  ? `Are you sure you want to unblock ${selectedStudent?.profile?.full_name}?`
                  : `This will prevent ${selectedStudent?.profile?.full_name} from accessing the system.`}
              </DialogDescription>
            </DialogHeader>
            {!selectedStudent?.is_blocked && (
              <div className="space-y-2">
                <Label>Block Reason</Label>
                <Textarea
                  placeholder="Enter reason for blocking (optional)"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant={selectedStudent?.is_blocked ? "default" : "destructive"}
                onClick={handleBlockStudent}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedStudent?.is_blocked ? (
                  "Unblock"
                ) : (
                  "Block"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Student Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 bg-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                      {selectedStudent.profile?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedStudent.profile?.full_name}
                    </h3>
                    <p className="text-muted-foreground">{selectedStudent.profile?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Registration No.</p>
                    <p className="font-medium text-foreground">{selectedStudent.registration_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Roll No.</p>
                    <p className="font-medium text-foreground">{selectedStudent.roll_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Course</p>
                    <p className="font-medium text-foreground">{selectedStudent.course?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Batch</p>
                    <p className="font-medium text-foreground">{selectedStudent.batch?.name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{selectedStudent.profile?.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium text-foreground capitalize">{selectedStudent.gender || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Father's Name</p>
                    <p className="font-medium text-foreground">{selectedStudent.father_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mother's Name</p>
                    <p className="font-medium text-foreground">{selectedStudent.mother_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Fee</p>
                    <p className="font-medium text-foreground">₹{selectedStudent.total_fee?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pending Fee</p>
                    <p className="font-medium text-warning">₹{selectedStudent.pending_fee?.toLocaleString()}</p>
                  </div>
                </div>

                {selectedStudent.is_blocked && selectedStudent.block_reason && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive font-medium">Block Reason:</p>
                    <p className="text-sm text-foreground">{selectedStudent.block_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Students;
