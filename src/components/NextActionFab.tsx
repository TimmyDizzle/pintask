import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";

interface NextActionFabProps {
  onClick: () => void;
}

export function NextActionFab({ onClick }: NextActionFabProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className="md:hidden fixed bottom-5 right-5 z-40 h-14 px-5 rounded-full shadow-lg gap-2"
      aria-label="Tell me what to do next"
    >
      <Target className="h-5 w-5" />
      What's Next?
    </Button>
  );
}
