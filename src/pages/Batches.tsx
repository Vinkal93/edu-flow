import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Calendar,
  Layers,
} from "lucide-react";
import { useBatches } from "@/hooks/useBatches";
import { useCourses } from "@/hooks/useCourses";
import { useToast } from "@/hooks/use-toast";

const daysOfWeekOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Batches = () => {
  const { batches, isLoading, addBatch, updateBatch, deleteBatch } = useBatches();
  const { courses } = useCourses();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  
  const [newBatch, setNewBatch] = useState({
    name: "",
    courseId: "",
    startTime: "09:00",
    endTime: "12:00",
    startDate: "",
    endDate: "",
    daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    maxCapacity: 30,
  });

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && batch.is_active) ||
      (statusFilter === "inactive" && !batch.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleAddBatch = async () => {
    if (!newBatch.name || !newBatch.courseId) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const result = await addBatch(newBatch);
    if (result.success) {
      setIsAddDialogOpen(false);
      setNewBatch({
        name: "",
        courseId: "",
        startTime: "09:00",
        endTime: "12:00",
        startDate: "",
        endDate: "",
        daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        maxCapacity: 30,
      });
    }
  };

  const handleEditBatch = async () => {
    if (!editingBatch) return;

    const result = await updateBatch(editingBatch.id, {
      name: editingBatch.name,
      start_time: editingBatch.start_time,
      end_time: editingBatch.end_time,
      days_of_week: editingBatch.days_of_week,
      max_capacity: editingBatch.max_capacity,
      is_active: editingBatch.is_active,
    });

    if (result.success) {
      setIsEditDialogOpen(false);
      setEditingBatch(null);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (confirm("Are you sure you want to deactivate this batch?")) {
      await deleteBatch(batchId);
    }
  };

  const toggleDayOfWeek = (day: string, isEdit = false) => {
    if (isEdit && editingBatch) {
      const currentDays = editingBatch.days_of_week || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter((d: string) => d !== day)
        : [...currentDays, day];
      setEditingBatch({ ...editingBatch, days_of_week: newDays });
    } else {
      const newDays = newBatch.daysOfWeek.includes(day)
        ? newBatch.daysOfWeek.filter((d) => d !== day)
        : [...newBatch.daysOfWeek, day];
      setNewBatch({ ...newBatch, daysOfWeek: newDays });
    }
  };

  const activeBatches = batches.filter((b) => b.is_active).length;
  const totalCapacity = batches.reduce((sum, b) => sum + (b.max_capacity || 0), 0);
  const totalStrength = batches.reduce((sum, b) => sum + (b.current_strength || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Batches</h1>
            <p className="text-muted-foreground">Manage all batches and schedules</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Set up a new batch with schedule and capacity
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="batch-name">Batch Name *</Label>
                  <Input
                    id="batch-name"
                    placeholder="e.g., Morning Batch A"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select
                    value={newBatch.courseId}
                    onValueChange={(value) => setNewBatch({ ...newBatch, courseId: value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={newBatch.startTime}
                      onChange={(e) => setNewBatch({ ...newBatch, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={newBatch.endTime}
                      onChange={(e) => setNewBatch({ ...newBatch, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newBatch.endDate}
                      onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeekOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${day}`}
                          checked={newBatch.daysOfWeek.includes(day)}
                          onCheckedChange={() => toggleDayOfWeek(day)}
                        />
                        <label
                          htmlFor={`day-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day.slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-capacity">Max Capacity</Label>
                  <Input
                    id="max-capacity"
                    type="number"
                    min={1}
                    value={newBatch.maxCapacity}
                    onChange={(e) => setNewBatch({ ...newBatch, maxCapacity: parseInt(e.target.value) || 30 })}
                  />
                </div>

                <Button className="w-full" onClick={handleAddBatch}>
                  Create Batch
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Total Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{batches.length}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Active Batches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{activeBatches}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalCapacity}</div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Current Strength
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalStrength}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search batches..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading batches...</div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No batches found. Create your first batch!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 flex items-center justify-center rounded-lg">
                              <Layers className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{batch.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {batch.teacher?.full_name || "No teacher assigned"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {batch.course?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm">
                              {batch.start_time?.slice(0, 5)} - {batch.end_time?.slice(0, 5)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {batch.days_of_week?.slice(0, 3).map((day) => (
                              <Badge key={day} variant="outline" className="text-xs">
                                {day.slice(0, 3)}
                              </Badge>
                            ))}
                            {(batch.days_of_week?.length || 0) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(batch.days_of_week?.length || 0) - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground">
                            {batch.current_strength}/{batch.max_capacity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={batch.is_active ? "default" : "secondary"}>
                            {batch.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingBatch(batch);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteBatch(batch.id)}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Batch</DialogTitle>
              <DialogDescription>
                Update batch schedule and settings
              </DialogDescription>
            </DialogHeader>
            {editingBatch && (
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="edit-batch-name">Batch Name</Label>
                  <Input
                    id="edit-batch-name"
                    value={editingBatch.name}
                    onChange={(e) => setEditingBatch({ ...editingBatch, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-start-time">Start Time</Label>
                    <Input
                      id="edit-start-time"
                      type="time"
                      value={editingBatch.start_time?.slice(0, 5) || "09:00"}
                      onChange={(e) => setEditingBatch({ ...editingBatch, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-end-time">End Time</Label>
                    <Input
                      id="edit-end-time"
                      type="time"
                      value={editingBatch.end_time?.slice(0, 5) || "12:00"}
                      onChange={(e) => setEditingBatch({ ...editingBatch, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeekOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-day-${day}`}
                          checked={editingBatch.days_of_week?.includes(day)}
                          onCheckedChange={() => toggleDayOfWeek(day, true)}
                        />
                        <label
                          htmlFor={`edit-day-${day}`}
                          className="text-sm font-medium leading-none"
                        >
                          {day.slice(0, 3)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-max-capacity">Max Capacity</Label>
                  <Input
                    id="edit-max-capacity"
                    type="number"
                    min={1}
                    value={editingBatch.max_capacity || 30}
                    onChange={(e) => setEditingBatch({ ...editingBatch, max_capacity: parseInt(e.target.value) || 30 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is-active"
                    checked={editingBatch.is_active}
                    onCheckedChange={(checked) => setEditingBatch({ ...editingBatch, is_active: !!checked })}
                  />
                  <label htmlFor="edit-is-active" className="text-sm font-medium leading-none">
                    Active
                  </label>
                </div>

                <Button className="w-full" onClick={handleEditBatch}>
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Batches;
