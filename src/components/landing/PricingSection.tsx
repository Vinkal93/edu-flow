import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for trying out EduPro",
    features: [
      "Up to 25 students",
      "1 Course/Batch",
      "Basic attendance",
      "Fee tracking",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Basic",
    price: "₹499",
    period: "/month",
    description: "For small coaching centers",
    features: [
      "Up to 100 students",
      "5 Courses/Batches",
      "Full attendance system",
      "Fee management & receipts",
      "SMS notifications",
      "Basic reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For growing institutes",
    features: [
      "Up to 500 students",
      "Unlimited Courses",
      "Online exams & results",
      "Parent portal",
      "WhatsApp integration",
      "Advanced analytics",
      "Multi-staff access",
      "24/7 support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large institutions",
    features: [
      "Unlimited students",
      "Multi-branch support",
      "Custom integrations",
      "Dedicated account manager",
      "On-premise option",
      "SLA guarantee",
      "White-label solution",
      "API access",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your institute size. All plans include 
            14-day free trial with no credit card required.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? "border-2 border-primary shadow-xl scale-105" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
