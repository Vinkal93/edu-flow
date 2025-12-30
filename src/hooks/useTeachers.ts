import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface TeacherWithProfile {
  id: string;
  profile_id: string;
  institute_id: string;
  employee_id: string | null;
  qualification: string | null;
  subjects: string[] | null;
  salary: number;
  experience_years: number;
  joining_date: string | null;
  is_active: boolean;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

interface NewTeacherData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  employeeId: string;
  qualification: string;
  subjects: string[];
  salary: number;
}

export const useTeachers = () => {
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchTeachers = async () => {
    if (!profile?.institute_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("teachers")
        .select(`
          *,
          profile:profiles!teachers_profile_id_fkey(full_name, email, phone, avatar_url)
        `)
        .eq("institute_id", profile.institute_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTeachers(data?.map(t => ({
        ...t,
        salary: t.salary ?? 0,
        experience_years: t.experience_years ?? 0,
        is_active: t.is_active ?? true,
        subjects: t.subjects ?? [],
      })) || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTeacher = async (data: NewTeacherData) => {
    if (!profile?.institute_id) {
      toast({
        title: "Error",
        description: "Institute not found",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Create teacher account through edge function
      const { data: result, error } = await supabase.functions.invoke("create-teacher-account", {
        body: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          instituteId: profile.institute_id,
          employeeId: data.employeeId || `EMP${Date.now().toString().slice(-8)}`,
          qualification: data.qualification,
          subjects: data.subjects,
          salary: data.salary,
        },
      });

      if (error) throw error;
      if (!result?.userId) throw new Error("Failed to create teacher account");

      toast({
        title: "Teacher Added",
        description: `${data.fullName} has been added successfully. Login credentials have been created.`,
      });

      await fetchTeachers();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateTeacher = async (teacherId: string, updates: Partial<TeacherWithProfile>) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .update(updates)
        .eq("id", teacherId);

      if (error) throw error;

      toast({
        title: "Teacher Updated",
        description: "Teacher details have been updated.",
      });

      await fetchTeachers();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating teacher:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const toggleActive = async (teacherId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .update({ is_active: isActive })
        .eq("id", teacherId);

      if (error) throw error;

      toast({
        title: isActive ? "Teacher Activated" : "Teacher Deactivated",
        description: isActive 
          ? "Teacher is now active."
          : "Teacher has been deactivated.",
      });

      await fetchTeachers();
      return { success: true };
    } catch (error: any) {
      console.error("Error toggling teacher status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update teacher",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .update({ is_active: false })
        .eq("id", teacherId);

      if (error) throw error;

      toast({
        title: "Teacher Removed",
        description: "Teacher has been removed from the system.",
      });

      await fetchTeachers();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove teacher",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [profile?.institute_id]);

  return {
    teachers,
    isLoading,
    fetchTeachers,
    addTeacher,
    updateTeacher,
    toggleActive,
    deleteTeacher,
  };
};
