import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTaskSettings } from "@/hooks/useTaskSettings";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function TaskSettings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useTaskSettings();
  
  const [dragSpeed, setDragSpeed] = useState(1.0);
  const [showAnimations, setShowAnimations] = useState(true);
  const [colorScheme, setColorScheme] = useState({
    new: "#3b82f6",
    pending: "#f59e0b",
    delegated: "#8b5cf6",
    confirmed: "#10b981",
    approved: "#059669",
  });

  useEffect(() => {
    if (settings) {
      setDragSpeed(settings.drag_speed);
      setShowAnimations(settings.show_animations);
      setColorScheme(settings.color_scheme);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      drag_speed: dragSpeed,
      show_animations: showAnimations,
      color_scheme: colorScheme,
    });
  };

  const handleColorChange = (status: string, color: string) => {
    setColorScheme((prev) => ({
      ...prev,
      [status]: color,
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/task-manager")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Task Manager
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Task Manager Settings</h1>
            <p className="text-muted-foreground">
              Customize your task management experience
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-4">Performance</h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable smooth animations when dragging tasks
                      </p>
                    </div>
                    <Switch
                      checked={showAnimations}
                      onCheckedChange={setShowAnimations}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Drag Speed: {dragSpeed.toFixed(1)}x</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Adjust the responsiveness of drag and drop
                    </p>
                    <Slider
                      value={[dragSpeed]}
                      onValueChange={(value) => setDragSpeed(value[0])}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h2 className="text-xl font-semibold mb-4">Color Scheme</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Customize the colors for each task status
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(colorScheme).map(([status, color]) => (
                    <div key={status} className="space-y-2">
                      <Label className="capitalize">{status}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) =>
                            handleColorChange(status, e.target.value)
                          }
                          className="w-20 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={color}
                          onChange={(e) =>
                            handleColorChange(status, e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate("/task-manager")}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
