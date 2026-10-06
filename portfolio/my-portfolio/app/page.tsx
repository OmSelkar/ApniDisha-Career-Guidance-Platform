import { Button } from "@/components/retroui/Button"
import PortfolioNavbar from "@/components/ui/Navbar"
import HeroSection from "@/components/ui/Hero-Section"
import ProjectsSection from "@/components/ui/Project-Section"
import SkillsSection from "@/components/ui/Skills-Section"
import ContactSection from "@/components/ui/Contact-Section"
import AboutSection from "@/components/ui/About"
export default function Page() {
  return (
    <>
      <PortfolioNavbar />
      
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </>
  )
}
