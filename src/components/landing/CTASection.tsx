import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

const CTASection = () => {
  return (
    <section id="contact" className="py-24 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Institute?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join 500+ institutes already using EduPro to streamline their operations. 
            Start your free trial today - no credit card required.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Phone className="w-4 h-4" />
              Book a Demo
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Phone className="w-5 h-5" />
              +91 98765 43210
            </a>
            <a href="mailto:hello@edupro.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
              <Mail className="w-5 h-5" />
              hello@edupro.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
