-- Refactor has_role() to parameterless version (only works with current authenticated user)
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = _role
    )
$$;

-- Refactor get_user_institute() to parameterless version (only works with current authenticated user)
CREATE OR REPLACE FUNCTION public.get_user_institute()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT institute_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Update RLS policies to use parameterless versions

-- attendance policies
DROP POLICY IF EXISTS "Attendance manageable by admins and teachers" ON public.attendance;
CREATE POLICY "Attendance manageable by admins and teachers" ON public.attendance
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND (has_role('institute_admin'::app_role) OR has_role('teacher'::app_role))
);

DROP POLICY IF EXISTS "Attendance viewable by institute or self" ON public.attendance;
CREATE POLICY "Attendance viewable by institute or self" ON public.attendance
FOR SELECT USING (
    (institute_id = get_user_institute()) 
    OR (student_id IN (SELECT students.id FROM students WHERE students.profile_id = auth.uid())) 
    OR (teacher_id IN (SELECT teachers.id FROM teachers WHERE teachers.profile_id = auth.uid()))
);

-- batches policies
DROP POLICY IF EXISTS "Batches manageable by admins" ON public.batches;
CREATE POLICY "Batches manageable by admins" ON public.batches
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND (has_role('institute_admin'::app_role) OR has_role('teacher'::app_role))
);

DROP POLICY IF EXISTS "Batches viewable by institute members" ON public.batches;
CREATE POLICY "Batches viewable by institute members" ON public.batches
FOR SELECT USING (institute_id = get_user_institute());

-- courses policies
DROP POLICY IF EXISTS "Courses manageable by admins" ON public.courses;
CREATE POLICY "Courses manageable by admins" ON public.courses
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND has_role('institute_admin'::app_role)
);

DROP POLICY IF EXISTS "Courses viewable by institute members" ON public.courses;
CREATE POLICY "Courses viewable by institute members" ON public.courses
FOR SELECT USING (institute_id = get_user_institute());

-- fees policies
DROP POLICY IF EXISTS "Fees manageable by admins" ON public.fees;
CREATE POLICY "Fees manageable by admins" ON public.fees
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND has_role('institute_admin'::app_role)
);

DROP POLICY IF EXISTS "Fees viewable by institute or student" ON public.fees;
CREATE POLICY "Fees viewable by institute or student" ON public.fees
FOR SELECT USING (
    (institute_id = get_user_institute()) 
    OR (student_id IN (SELECT students.id FROM students WHERE students.profile_id = auth.uid()))
);

-- institutes policies
DROP POLICY IF EXISTS "Institutes manageable by admins" ON public.institutes;
CREATE POLICY "Institutes manageable by admins" ON public.institutes
FOR ALL USING (
    (id IN (SELECT profiles.institute_id FROM profiles WHERE profiles.id = auth.uid() AND has_role('institute_admin'::app_role))) 
    OR has_role('super_admin'::app_role)
);

DROP POLICY IF EXISTS "Institutes viewable by members" ON public.institutes;
CREATE POLICY "Institutes viewable by members" ON public.institutes
FOR SELECT USING (
    (id IN (SELECT profiles.institute_id FROM profiles WHERE profiles.id = auth.uid())) 
    OR has_role('super_admin'::app_role)
);

-- notices policies
DROP POLICY IF EXISTS "Notices manageable by admins" ON public.notices;
CREATE POLICY "Notices manageable by admins" ON public.notices
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND has_role('institute_admin'::app_role)
);

DROP POLICY IF EXISTS "Notices viewable by institute members" ON public.notices;
CREATE POLICY "Notices viewable by institute members" ON public.notices
FOR SELECT USING (
    (institute_id = get_user_institute()) 
    AND (is_published = true)
);

-- profiles policies
DROP POLICY IF EXISTS "Institute admins can manage profiles" ON public.profiles;
CREATE POLICY "Institute admins can manage profiles" ON public.profiles
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND has_role('institute_admin'::app_role)
);

DROP POLICY IF EXISTS "Profiles viewable by same institute" ON public.profiles;
CREATE POLICY "Profiles viewable by same institute" ON public.profiles
FOR SELECT USING (
    (institute_id = get_user_institute()) 
    OR (id = auth.uid())
);

-- students policies
DROP POLICY IF EXISTS "Students manageable by admins" ON public.students;
CREATE POLICY "Students manageable by admins" ON public.students
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND (has_role('institute_admin'::app_role) OR has_role('teacher'::app_role))
);

DROP POLICY IF EXISTS "Students viewable by institute members" ON public.students;
CREATE POLICY "Students viewable by institute members" ON public.students
FOR SELECT USING (
    (institute_id = get_user_institute()) 
    OR (profile_id = auth.uid())
);

-- teachers policies
DROP POLICY IF EXISTS "Teachers manageable by admins" ON public.teachers;
CREATE POLICY "Teachers manageable by admins" ON public.teachers
FOR ALL USING (
    (institute_id = get_user_institute()) 
    AND has_role('institute_admin'::app_role)
);

DROP POLICY IF EXISTS "Teachers viewable by institute members" ON public.teachers;
CREATE POLICY "Teachers viewable by institute members" ON public.teachers
FOR SELECT USING (institute_id = get_user_institute());

-- user_roles policies
DROP POLICY IF EXISTS "Roles manageable by admins" ON public.user_roles;
CREATE POLICY "Roles manageable by admins" ON public.user_roles
FOR ALL USING (
    has_role('institute_admin'::app_role) 
    OR has_role('super_admin'::app_role)
);

DROP POLICY IF EXISTS "Roles viewable by user" ON public.user_roles;
CREATE POLICY "Roles viewable by user" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());