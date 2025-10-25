import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TaskManager() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Task Manager</h1>
            <p className="text-muted-foreground">
              Manage and track your tasks efficiently
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/task-settings")}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
        
        <KanbanBoard />
      </div>
    </div>
  );
}
