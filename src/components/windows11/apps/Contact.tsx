import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, CheckCircle } from "lucide-react";

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
        <CheckCircle className="h-12 w-12 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Message Sent!</h3>
        <p className="text-sm text-muted-foreground text-center">
          Thank you for reaching out. I'll get back to you soon.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSent(false)}>
          Send Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="name" className="text-xs">Name</Label>
        <Input id="name" placeholder="Your name" required className="mt-1 h-9 text-sm" />
      </div>
      <div>
        <Label htmlFor="email" className="text-xs">Email</Label>
        <Input id="email" type="email" placeholder="your@email.com" required className="mt-1 h-9 text-sm" />
      </div>
      <div>
        <Label htmlFor="message" className="text-xs">Message</Label>
        <Textarea id="message" placeholder="Write your message..." required className="mt-1 text-sm min-h-[100px]" />
      </div>
      <Button type="submit" className="w-full gap-2" size="sm">
        <Send className="h-4 w-4" /> Send Message
      </Button>
    </form>
  );
};

export default Contact;
