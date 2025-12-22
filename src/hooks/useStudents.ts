import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type StudentStatus = Database["public"]["Enums"]["student_status"];

interface StudentWithProfile {
  id: string;
  profile_id: string | null;
  institute_id: string;
  course_id: string | null;
  batch_id: string | null;
  registration_number: string | null;
  roll_number: string | null;
  father_name: string | null;
  mother_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  admission_date: string | null;
  status: StudentStatus | null;
  is_verified: boolean;
  is_blocked: boolean;
  block_reason: string | null;
  total_fee: number;
  paid_fee: number;
  pending_fee: number;
  profile: {
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  course: {
    name: string;
  } | null;
  batch: {
    name: string;
  } | null;
}

interface NewStudentData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  courseId: string;
  batchId: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
}

export const useStudents = () => {
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchStudents = async () => {
    if (!profile?.institute_id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          profile:profiles!students_profile_id_fkey(full_name, email, phone, avatar_url),
          course:courses!students_course_id_fkey(name),
          batch:batches!students_batch_id_fkey(name)
        `)
        .eq("institute_id", profile.institute_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setStudents(data?.map(s => ({
        ...s,
        is_verified: s.is_verified ?? false,
        is_blocked: s.is_blocked ?? false,
        total_fee: s.total_fee ?? 0,
        paid_fee: s.paid_fee ?? 0,
        pending_fee: s.pending_fee ?? 0,
      })) || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async (data: NewStudentData) => {
    if (!profile?.institute_id) {
      toast({
        title: "Error",
        description: "Institute not found",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // 1. Create auth user with admin API through edge function
      const { data: authResult, error: authError } = await supabase.functions.invoke("create-student-account", {
        body: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone,
          instituteId: profile.institute_id,
        },
      });

      if (authError) throw authError;
      if (!authResult?.userId) throw new Error("Failed to create user account");

      // 2. Create student record
      const registrationNumber = `STU${Date.now().toString().slice(-8)}`;
      const rollNumber = `R${Math.floor(1000 + Math.random() * 9000)}`;

      const { error: studentError } = await supabase.from("students").insert({
        profile_id: authResult.userId,
        institute_id: profile.institute_id,
        course_id: data.courseId || null,
        batch_id: data.batchId || null,
        registration_number: registrationNumber,
        roll_number: rollNumber,
        father_name: data.fatherName || null,
        mother_name: data.motherName || null,
        guardian_phone: data.guardianPhone || null,
        gender: data.gender || null,
        date_of_birth: data.dateOfBirth || null,
        address: data.address || null,
        status: "active",
        is_verified: false,
        is_blocked: false,
      });

      if (studentError) throw studentError;

      toast({
        title: "Student Added",
        description: `${data.fullName} has been enrolled successfully. Login credentials have been created.`,
      });

      await fetchStudents();
      return { success: true };
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const updateStudent = async (studentId: string, updates: Partial<StudentWithProfile>) => {
    try {
      const { error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", studentId);

      if (error) throw error;

      await fetchStudents();
      return { success: true };
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const toggleBlock = async (studentId: string, isBlocked: boolean, reason?: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({
          is_blocked: isBlocked,
          block_reason: isBlocked ? reason : null,
        })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: isBlocked ? "Student Blocked" : "Student Unblocked",
        description: isBlocked 
          ? "Student has been blocked from accessing the system."
          : "Student can now access the system.",
      });

      await fetchStudents();
      return { success: true };
    } catch (error: any) {
      console.error("Error toggling block:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const toggleVerify = async (studentId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ is_verified: isVerified })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: isVerified ? "Student Verified" : "Verification Removed",
        description: isVerified 
          ? "Student profile has been verified."
          : "Student verification has been removed.",
      });

      await fetchStudents();
      return { success: true };
    } catch (error: any) {
      console.error("Error toggling verify:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const deleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ status: "left" })
        .eq("id", studentId);

      if (error) throw error;

      toast({
        title: "Student Removed",
        description: "Student has been marked as left.",
      });

      await fetchStudents();
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove student",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [profile?.institute_id]);

  return {
    students,
    isLoading,
    fetchStudents,
    addStudent,
    updateStudent,
    toggleBlock,
    toggleVerify,
    deleteStudent,
  };
};
