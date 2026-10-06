"use client";

import { useState, useEffect, useRef } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";

import { Button } from "../retroui/Button";

export default function PortfolioNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navItems = [
    { name: "About", link: "#about" },
    { name: "Projects", link: "#projects" },
    { name: "Skills", link: "#skills" },
    { name: "Contact", link: "#contact" },
  ];

  // Check if user is still inside hero section
  const isInsideHero = () => {
    const heroSection = document.getElementById("hero");

    if (!heroSection) return false;

    const heroHeight = heroSection.offsetHeight;
    return window.scrollY < heroHeight - 100;
  };

  const resetTimer = () => {
    // Always visible inside hero section
    if (isInsideHero()) {
      setIsVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return;
    }

    // Clear old timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(true);

    timeoutRef.current = setTimeout(() => {
      if (!isMobileMenuOpen) {
        setIsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const events = ["mousemove", "scroll", "touchstart", "keydown"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <Navbar
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Desktop Navbar */}
        <NavBody>
          <NavbarLogo />

          <NavItems items={navItems} />

          <div className="flex items-center gap-3">
  <Button size="lg" variant="default" asChild>
    <a 
      href="https://www.linkedin.com/in/om-selkar-09b29a287/" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      LinkedIn →
    </a>
  </Button>
</div>
        </NavBody>

        {/* Mobile Navbar */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />

            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() =>
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-4 text-xl font-head hover:text-primary transition-colors border-b border-black/10 last:border-none"
              >
                {item.name}
              </a>
            ))}

            <div className="pt-8">
  <Button
    size="lg"
    variant="default"
    className="w-full"
    asChild
  >
    <a
      href="https://www.linkedin.com/in/om-selkar-09b29a287/"
      target="_blank" 
      rel="noopener noreferrer"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      LinkedIn →
    </a>
  </Button>
</div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <div className="h-16" />
    </>
  );
}