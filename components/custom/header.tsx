import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Logo = () => (
  <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
    Skill<span className="text-primary">Bridge</span>
  </Link>
);

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center mx-auto px-4">
        <div className="mr-4 flex">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button size="sm" asChild>
            <Link href="/dashboard">
              Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
