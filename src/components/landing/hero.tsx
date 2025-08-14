import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import React from "react";

const Hero = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center py-6 px-6">
      <div className="md:mt-6 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <Badge className="bg-primary rounded-full py-1 border-none">
            v1.0.0 is available now! 🚀
          </Badge>
          <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-3xl sm:text-5xl md:text-6xl font-bold !leading-[1.2] tracking-tight">
            Haz que tus clientes regresen y recomienden tu negocio
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg">
            Automatiza la fidelización, mejora la satisfacción y recompensa a
            tus clientes con una solución fácil de usar.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center sm:justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full text-base"
            >
              Get Started <ArrowUpRight className="!h-5 !w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full text-base shadow-none"
            >
              <CirclePlay className="!h-5 !w-5" /> Watch Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Full-width image replacing LogoCloud */}
      <img
        src="/hero.svg"
        alt="Hero Banner"
        className="mt-6 w-5/6 object-cover max-h-[500px]"
      />
    </div>
  );
};

export default Hero;
