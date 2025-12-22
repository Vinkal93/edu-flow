-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'institute_admin', 'teacher', 'student', 'parent');

-- Create enum for student status
CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'blocked', 'left');

-- Create enum for fee status
CREATE TYPE public.fee_status AS ENUM ('paid', 'pending', 'overdue', 'partial');

-- Create enum for attendance status
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Create institutes table
CREATE TABLE public.institutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    website TEXT,
    established_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table (for all users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (for role management)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_months INTEGER DEFAULT 12,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days_of_week TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    max_capacity INTEGER DEFAULT 30,
    current_strength INTEGER DEFAULT 0,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teachers table (additional info for teachers)
CREATE TABLE public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    employee_id TEXT,
    subjects TEXT[],
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    salary DECIMAL(10,2) DEFAULT 0,
    joining_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    roll_number TEXT,
    registration_number TEXT UNIQUE,
    father_name TEXT,
    mother_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    guardian_phone TEXT,
    guardian_email TEXT,
    admission_date DATE DEFAULT CURRENT_DATE,
    status student_status DEFAULT 'active',
    is_verified BOOLEAN DEFAULT false,
    is_blocked BOOLEAN DEFAULT false,
    block_reason TEXT,
    total_fee DECIMAL(10,2) DEFAULT 0,
    paid_fee DECIMAL(10,2) DEFAULT 0,
    pending_fee DECIMAL(10,2) DEFAULT 0,
    photo_url TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fees table
CREATE TABLE public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    fine DECIMAL(10,2) DEFAULT 0,
    fee_type TEXT DEFAULT 'tuition',
    month TEXT,
    year INTEGER,
    due_date DATE,
    paid_date DATE,
    status fee_status DEFAULT 'pending',
    payment_method TEXT,
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status DEFAULT 'present',
    check_in_time TIME,
    check_out_time TIME,
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, date),
    UNIQUE(teacher_id, date)
);

-- Create notices table
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT[] DEFAULT ARRAY['all'],
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function to get user's institute
CREATE OR REPLACE FUNCTION public.get_user_institute(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT institute_id FROM public.profiles WHERE id = _user_id
$$;

-- RLS Policies for institutes
CREATE POLICY "Institutes viewable by members" ON public.institutes
    FOR SELECT USING (
        id IN (SELECT institute_id FROM public.profiles WHERE id = auth.uid())
        OR public.has_role(auth.uid(), 'super_admin')
    );

CREATE POLICY "Institutes manageable by admins" ON public.institutes
    FOR ALL USING (
        id IN (SELECT institute_id FROM public.profiles WHERE id = auth.uid() AND public.has_role(auth.uid(), 'institute_admin'))
        OR public.has_role(auth.uid(), 'super_admin')
    );

-- RLS Policies for profiles
CREATE POLICY "Profiles viewable by same institute" ON public.profiles
    FOR SELECT USING (
        institute_id = public.get_user_institute(auth.uid())
        OR id = auth.uid()
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Institute admins can manage profiles" ON public.profiles
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND public.has_role(auth.uid(), 'institute_admin')
    );

-- RLS Policies for user_roles
CREATE POLICY "Roles viewable by user" ON public.user_roles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Roles manageable by admins" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'institute_admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for courses
CREATE POLICY "Courses viewable by institute members" ON public.courses
    FOR SELECT USING (institute_id = public.get_user_institute(auth.uid()));

CREATE POLICY "Courses manageable by admins" ON public.courses
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND public.has_role(auth.uid(), 'institute_admin')
    );

-- RLS Policies for batches
CREATE POLICY "Batches viewable by institute members" ON public.batches
    FOR SELECT USING (institute_id = public.get_user_institute(auth.uid()));

CREATE POLICY "Batches manageable by admins" ON public.batches
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND (public.has_role(auth.uid(), 'institute_admin') OR public.has_role(auth.uid(), 'teacher'))
    );

-- RLS Policies for teachers
CREATE POLICY "Teachers viewable by institute members" ON public.teachers
    FOR SELECT USING (institute_id = public.get_user_institute(auth.uid()));

CREATE POLICY "Teachers manageable by admins" ON public.teachers
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND public.has_role(auth.uid(), 'institute_admin')
    );

-- RLS Policies for students
CREATE POLICY "Students viewable by institute members" ON public.students
    FOR SELECT USING (
        institute_id = public.get_user_institute(auth.uid())
        OR profile_id = auth.uid()
    );

CREATE POLICY "Students manageable by admins" ON public.students
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND (public.has_role(auth.uid(), 'institute_admin') OR public.has_role(auth.uid(), 'teacher'))
    );

-- RLS Policies for fees
CREATE POLICY "Fees viewable by institute or student" ON public.fees
    FOR SELECT USING (
        institute_id = public.get_user_institute(auth.uid())
        OR student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
    );

CREATE POLICY "Fees manageable by admins" ON public.fees
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND public.has_role(auth.uid(), 'institute_admin')
    );

-- RLS Policies for attendance
CREATE POLICY "Attendance viewable by institute or self" ON public.attendance
    FOR SELECT USING (
        institute_id = public.get_user_institute(auth.uid())
        OR student_id IN (SELECT id FROM public.students WHERE profile_id = auth.uid())
        OR teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
    );

CREATE POLICY "Attendance manageable by admins and teachers" ON public.attendance
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND (public.has_role(auth.uid(), 'institute_admin') OR public.has_role(auth.uid(), 'teacher'))
    );

-- RLS Policies for notices
CREATE POLICY "Notices viewable by institute members" ON public.notices
    FOR SELECT USING (institute_id = public.get_user_institute(auth.uid()) AND is_published = true);

CREATE POLICY "Notices manageable by admins" ON public.notices
    FOR ALL USING (
        institute_id = public.get_user_institute(auth.uid())
        AND public.has_role(auth.uid(), 'institute_admin')
    );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email
    );
    RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_institutes_updated_at BEFORE UPDATE ON public.institutes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON public.batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON public.teachers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update student fee totals
CREATE OR REPLACE FUNCTION public.update_student_fees()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.students
    SET 
        total_fee = COALESCE((SELECT SUM(amount) FROM public.fees WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)), 0),
        paid_fee = COALESCE((SELECT SUM(paid_amount) FROM public.fees WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)), 0),
        pending_fee = COALESCE((SELECT SUM(amount - paid_amount) FROM public.fees WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)), 0)
    WHERE id = COALESCE(NEW.student_id, OLD.student_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_student_fees_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.fees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_student_fees();

-- Function to update batch strength
CREATE OR REPLACE FUNCTION public.update_batch_strength()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update old batch if batch changed
    IF OLD.batch_id IS NOT NULL AND (NEW.batch_id IS NULL OR NEW.batch_id != OLD.batch_id) THEN
        UPDATE public.batches
        SET current_strength = (SELECT COUNT(*) FROM public.students WHERE batch_id = OLD.batch_id AND status = 'active')
        WHERE id = OLD.batch_id;
    END IF;
    
    -- Update new batch
    IF NEW.batch_id IS NOT NULL THEN
        UPDATE public.batches
        SET current_strength = (SELECT COUNT(*) FROM public.students WHERE batch_id = NEW.batch_id AND status = 'active')
        WHERE id = NEW.batch_id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_batch_strength_trigger
    AFTER INSERT OR UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.update_batch_strength();