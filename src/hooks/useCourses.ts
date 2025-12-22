import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  name: string;
  description: string | null;
  duration_months: number | null;
  fee_amount: number | null;
  is_active: boolean;
  institute_id: string;
  created_at: string | null;
}

interface NewCourseData {
  name: string;
  description?: string;
  duration_months?: number;
  fee_amount?: number;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchCourses = async () => {
    if (!profile?.institute_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("institute_id", profile.institute_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCourses(data?.map(c => ({
        ...c,
        is_active: c.is_active ?? true,
      })) || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = async (data: NewCourseData) => {
    if (!profile?.institute_id) {
      toast({
        title: "Error",
        description: "Institute not found",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { error } = await supabase.from("courses").insert({
        name: data.name,
        description: data.description || null,
        duration_months: data.duration_months || null,
        fee_amount: data.fee_amount || null,
        institute_id: profile.institute_id,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Course Added",
        description: `${data.name} has been created successfully.`,
      });

      await fetchCourses();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add course",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Course Updated",
        description: "Course has been updated successfully.",
      });

      await fetchCourses();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .update({ is_active: false })
        .eq("id", courseId);

      if (error) throw error;

      toast({
        title: "Course Deactivated",
        description: "Course has been deactivated.",
      });

      await fetchCourses();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate course",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [profile?.institute_id]);

  return {
    courses,
    isLoading,
    fetchCourses,
    addCourse,
    updateCourse,
    deleteCourse,
  };
};
