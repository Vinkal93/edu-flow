import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff, Building2, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState<"institute" | "teacher" | "student">("institute");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, roles, isLoading: authLoading } = useAuth();

  // Redirect authenticated users based on their role
  useEffect(() => {
    if (!authLoading && user && roles.length > 0) {
      if (roles.includes("student")) {
        navigate("/student", { replace: true });
      } else if (roles.includes("institute_admin") || roles.includes("teacher")) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, roles, authLoading, navigate]);

  const resolveEmailFromId = async (id: string, type: "teacher" | "student"): Promise<string | null> => {
    try {
      if (type === "teacher") {
        // Look up teacher by employee_id
        const { data: teacher } = await supabase
          .from("teachers")
          .select("profile_id")
          .eq("employee_id", id)
          .maybeSingle();

        if (teacher?.profile_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", teacher.profile_id)
            .maybeSingle();
          return profile?.email || null;
        }
      } else {
        // Look up student by registration_number first, then roll_number
        // Using separate queries to prevent SQL injection
        let student = await supabase
          .from("students")
          .select("profile_id")
          .eq("registration_number", id)
          .maybeSingle();

        if (!student.data) {
          student = await supabase
            .from("students")
            .select("profile_id")
            .eq("roll_number", id)
            .maybeSingle();
        }
        const studentData = student.data;

        if (studentData?.profile_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", studentData.profile_id)
            .maybeSingle();
          return profile?.email || null;
        }
      }
    } catch (error) {
      console.error("Error resolving ID:", error);
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your credentials",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    let emailToUse = identifier;

    // For teachers and students, resolve ID to email if not an email
    if (loginType !== "institute" && !identifier.includes("@")) {
      const resolvedEmail = await resolveEmailFromId(identifier, loginType);
      if (!resolvedEmail) {
        toast({
          title: "Login Failed",
          description: `No ${loginType} found with this ID. Please check your ID and try again.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      emailToUse = resolvedEmail;
    }

    // Validate email format for institute or if email is provided
    if (loginType === "institute" && !identifier.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid credentials. Please check and try again."
          : error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Login Successful",
      description: "Redirecting to dashboard...",
    });

    // Fetch roles and navigate
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      const userRoles = rolesData?.map(r => r.role) || [];

      // Navigate based on role
      setTimeout(() => {
        if (userRoles.includes("student")) {
          navigate("/student", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 500);
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your institute name",
        variant: "destructive",
      });
      return;
    }

    if (!identifier.includes("@")) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // 1. Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: identifier,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: signUpError.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (!signUpData.user) {
        toast({
          title: "Registration Failed",
          description: "Failed to create account",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // 2. Setup institute using edge function
      const { data: setupResult, error: setupError } = await supabase.functions.invoke("setup-institute", {
        body: {
          userId: signUpData.user.id,
          instituteName: fullName,
          email: identifier,
          phone: null,
        },
      });

      if (setupError) {
        console.error("Institute setup error:", setupError);
        toast({
          title: "Setup Error",
          description: "Account created but institute setup failed. Please contact support.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Registration Successful",
        description: "Your institute has been registered. Please login to continue.",
      });
      
      // Clear form
      setFullName("");
      setIdentifier("");
      setPassword("");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const loginTypes = [
    { id: "institute", label: "Institute", icon: Building2, description: "Institute Admin Login" },
    { id: "teacher", label: "Teacher", icon: BookOpen, description: "Teacher Login" },
    { id: "student", label: "Student", icon: User, description: "Student Login" },
  ] as const;

  const getPlaceholder = () => {
    switch (loginType) {
      case "institute":
        return "Enter your email address";
      case "teacher":
        return "Enter your Employee ID";
      case "student":
        return "Enter your Registration/Roll Number";
    }
  };

  const getLabel = () => {
    switch (loginType) {
      case "institute":
        return "Email Address";
      case "teacher":
        return "Employee ID";
      case "student":
        return "Student ID / Roll Number";
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-12 h-12 bg-primary flex items-center justify-center rounded-xl">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl text-foreground">EduPro</span>
          </Link>
        </div>

        {/* Login Type Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {loginTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setLoginType(type.id);
                setIdentifier("");
                setPassword("");
              }}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                loginType === type.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              <type.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-foreground">
              {loginTypes.find((t) => t.id === loginType)?.description}
            </CardTitle>
            <CardDescription>
              {loginType === "institute" 
                ? "Enter your email and password"
                : "Enter your ID and password provided by institute"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup" disabled={loginType !== "institute"}>
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">{getLabel()}</Label>
                    <Input
                      id="identifier"
                      type={loginType === "institute" ? "email" : "text"}
                      placeholder={getPlaceholder()}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Institute Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your institute name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Institute Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {loginType !== "institute" && (
              <p className="text-xs text-muted-foreground text-center mt-4 p-2 bg-muted/50 rounded-lg">
                Your login credentials are provided by your institute
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Developed by <span className="font-medium text-foreground">Vinkal Prajapati</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;