import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div 
        className={cn(
          "rounded-full border-solid border-primary/20 animate-spin",
          sizeClasses[size]
        )}
        style={{
          borderTopColor: "hsl(var(--primary))",
          animationDuration: "1s"
        }}
      />
    </div>
  );
}
