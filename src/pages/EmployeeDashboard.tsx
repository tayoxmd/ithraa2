import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeDashboard() {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole !== 'employee') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">لوحة تحكم الموظف</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>الطلبات المسندة إليك</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">قريباً...</p>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>الشكاوى</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">قريباً...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
