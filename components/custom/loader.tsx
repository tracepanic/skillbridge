import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

function Loader({ size = 30, className = "" }) {
  return (
    <div
      className={cn(
        "mt-10 flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <Loader2 className="animate-spin text-gray-500" size={size} />
    </div>
  );
}

export { Loader };
