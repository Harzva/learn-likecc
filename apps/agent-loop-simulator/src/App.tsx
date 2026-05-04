import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SidebarNav from './components/SidebarNav';
import HeroSection from './components/sections/HeroSection';
import SimulatorSection from './components/sections/SimulatorSection';
import AgentLoopSection from './components/sections/AgentLoopSection';
import ToolSystemSection from './components/sections/ToolSystemSection';
import CommandSection from './components/sections/CommandSection';
import HiddenFeaturesSection from './components/sections/HiddenFeaturesSection';

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeSection, setActiveSection] = useState('simulator');

  useEffect(() => {
    const sections = ['simulator', 'Agent循环', '工具系统', '命令目录', '扩展能力'];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const handleStepChange = (step: number) => {
    if (step >= 0 && step <= 12) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="min-h-[100dvh]">
      <Navbar />
      <SidebarNav activeSection={activeSection} />
      <main className="lg:pl-[176px]">
        <HeroSection />
        <SimulatorSection
          currentStep={currentStep}
          onStepChange={handleStepChange}
        />
        <AgentLoopSection />
        <ToolSystemSection />
        <CommandSection />
        <HiddenFeaturesSection />
      </main>
    </div>
  );
}
