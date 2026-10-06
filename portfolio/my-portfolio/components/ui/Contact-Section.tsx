'use client';

import { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import { Button } from "../retroui/Button";

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};

    const name = formData.get('user_name')?.toString().trim() || '';
    const email = formData.get('user_email')?.toString().trim() || '';
    const message = formData.get('message')?.toString().trim() || '';

    if (!name) {
      newErrors.user_name = "Yo! What's your name? I can't reply to a ghost!!";
    } else if (name.length < 2) {
      newErrors.user_name = "Name too short bro, at least give me 2 characters!";
    }

    if (!email) {
      newErrors.user_email = "How will I know who you are without an email!?";
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.user_email = "That doesn't look like a valid email address...";
    }

    if (!message) {
      newErrors.message = "Come on! Don't leave me hanging. Write something! ✍️🔥";
    } else if (message.length < 10) {
      newErrors.message = "That's too short! Tell me more about your idea!!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);
    setErrors({});

    try {
      await emailjs.sendForm(
        'service_hb17awe',
        'template_oskkqrz',
        formRef.current,
        'noFo5AdYzFcdei4rJ'
      );

      setStatus({
        type: 'success',
        message: "Message sent successfully! I'll get back to you soon!!"
      });
      formRef.current.reset();
    } catch (error) {
      setStatus({
        type: 'error',
        message: "Something went wrong. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative bg-white py-20 border-t-4 border-black">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side */}
          <div>
            <div className="inline-block px-5 py-1.5 border-2 border-black bg-yellow-300 font-bold uppercase tracking-wider text-sm mb-6">
              LET'S CONNECT
            </div>
            
            <h2 className="text-5xl md:text-6xl font-head font-black leading-tight mb-6">
              HAVE A PROJECT IN MIND?
            </h2>
            
            <p className="text-xl text-zinc-700 max-w-md">
              I'm currently open to internships, freelance opportunities, 
              and interesting collaborations.
            </p>

            <div className="mt-10 space-y-3 text-lg">
              <p><span className="font-bold">Email:</span> omselkar2606@gmail.com</p>
              <p><span className="font-bold">Location:</span> India</p>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 rounded-2xl">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block font-bold mb-2">Your Name</label>
                <input
                  type="text"
                  name="user_name"
                  className="w-full border-2 border-black p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="John Doe"
                />
                {errors.user_name && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.user_name}</p>
                )}
              </div>

              <div>
                <label className="block font-bold mb-2">Email Address</label>
                <input
                  type="email"
                  name="user_email"
                  className="w-full border-2 border-black p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="you@example.com"
                />
                {errors.user_email && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.user_email}</p>
                )}
              </div>

              <div>
                <label className="block font-bold mb-2">Message</label>
                <textarea
                  name="message"
                  rows={6}
                  className="w-full border-2 border-black p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y"
                  placeholder="Hi Om, I have an interesting project..."
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-1 font-medium">{errors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                variant="default"
                disabled={isSubmitting}
                className="w-full text-lg py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
              </Button>

              {status && (
                <div className={`text-center font-bold p-4 rounded-xl border-2 ${
                  status.type === 'success' 
                    ? 'border-green-500 bg-green-100 text-green-700' 
                    : 'border-red-500 bg-red-100 text-red-700'
                }`}>
                  {status.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}