import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Ethos } from "@/components/site/Ethos";
import { Projects } from "@/components/site/Projects";
import { Journal } from "@/components/site/Journal";
import { Contact } from "@/components/site/Contact";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <SmoothScroll>
      <main className="min-h-screen bg-background text-foreground">
        <Nav />
        <Hero />
        <Ethos />
        <Projects />
        <Journal />
        <Contact />
      </main>
    </SmoothScroll>
  );
}
