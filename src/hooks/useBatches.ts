import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Batch {
  id: string;
  name: string;
  course_id: string;
  institute_id: string;
  teacher_id: string | null;
  start_time: string;
  end_time: string;
  start_date: string | null;
  end_date: string | null;
  days_of_week: string[] | null;
  max_capacity: number | null;
  current_strength: number | null;
  is_active: boolean;
  created_at: string | null;
  course?: {
    name: string;
  } | null;
  teacher?: {
    full_name: string;
  } | null;
}

interface NewBatchData {
  name: string;
  courseId: string;
  teacherId?: string;
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  daysOfWeek?: string[];
  maxCapacity?: number;
}

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchBatches = async () => {
    if (!profile?.institute_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("batches")
        .select(`
          *,
          course:courses!batches_course_id_fkey(name),
          teacher:profiles!batches_teacher_id_fkey(full_name)
        `)
        .eq("institute_id", profile.institute_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBatches(data?.map(b => ({
        ...b,
        is_active: b.is_active ?? true,
        current_strength: b.current_strength ?? 0,
        max_capacity: b.max_capacity ?? 30,
      })) || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addBatch = async (data: NewBatchData) => {
    if (!profile?.institute_id) {
      toast({
        title: "Error",
        description: "Institute not found",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { error } = await supabase.from("batches").insert({
        name: data.name,
        course_id: data.courseId,
        institute_id: profile.institute_id,
        teacher_id: data.teacherId || null,
        start_time: data.startTime,
        end_time: data.endTime,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
        days_of_week: data.daysOfWeek || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        max_capacity: data.maxCapacity || 30,
        current_strength: 0,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Batch Created",
        description: `${data.name} has been created successfully.`,
      });

      await fetchBatches();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding batch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create batch",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateBatch = async (batchId: string, updates: Partial<Batch>) => {
    try {
      const { error } = await supabase
        .from("batches")
        .update(updates)
        .eq("id", batchId);

      if (error) throw error;

      toast({
        title: "Batch Updated",
        description: "Batch has been updated successfully.",
      });

      await fetchBatches();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating batch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update batch",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const deleteBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from("batches")
        .update({ is_active: false })
        .eq("id", batchId);

      if (error) throw error;

      toast({
        title: "Batch Deactivated",
        description: "Batch has been deactivated.",
      });

      await fetchBatches();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting batch:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate batch",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [profile?.institute_id]);

  return {
    batches,
    isLoading,
    fetchBatches,
    addBatch,
    updateBatch,
    deleteBatch,
  };
};
