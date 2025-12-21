import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Director, Excel Computer Academy",
    content: "EduPro has transformed how we manage our institute. Fee collection is now seamless and attendance tracking saves us hours every week.",
    rating: 5,
    avatar: "RK",
  },
  {
    name: "Priya Sharma",
    role: "Principal, Tech Skills Institute",
    content: "The online exam feature is a game-changer. We can now conduct tests efficiently and students get instant results.",
    rating: 5,
    avatar: "PS",
  },
  {
    name: "Amit Patel",
    role: "Owner, Future Coders Academy",
    content: "Best investment we made for our coaching center. Parent portal keeps parents informed and reduces our workload significantly.",
    rating: 5,
    avatar: "AP",
  },
  {
    name: "Sneha Gupta",
    role: "Admin, Digital Learning Hub",
    content: "The dashboard gives us complete visibility. We can see pending fees, attendance patterns, and student performance at a glance.",
    rating: 5,
    avatar: "SG",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Loved by Institute Owners
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our customers have to say about their experience with EduPro.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="border-border">
              <CardContent className="pt-6">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
