import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  CalendarCheck, 
  BarChart3,
  FileText,
  Bell,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student profiles, admission forms, ID cards, and enrollment tracking.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: GraduationCap,
    title: "Teacher & Staff",
    description: "Manage teacher profiles, subject assignments, salary, and attendance.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: BookOpen,
    title: "Course & Batch",
    description: "Create courses, manage batches, assign teachers, and track capacity.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: DollarSign,
    title: "Fee Management",
    description: "Fee collection, receipts, pending fees, discounts, and payment tracking.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: CalendarCheck,
    title: "Attendance System",
    description: "Daily attendance marking, reports, absent notifications, and analytics.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time insights, collection reports, attendance trends, and growth metrics.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: FileText,
    title: "Online Exams",
    description: "Create MCQ/descriptive exams, auto-grading, results, and rankings.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "SMS, WhatsApp, and email alerts for fees, attendance, and announcements.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Secure login for admin, teachers, students, and parents with permissions.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Everything You Need to Run Your Institute
          </h2>
          <p className="text-lg text-muted-foreground">
            From admissions to results, manage every aspect of your educational 
            institution with our comprehensive suite of tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.title}
              className="group hover:shadow-lg transition-all duration-300 border-border hover:border-primary/20"
            >
              <CardHeader>
                <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
