import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Clock, Users, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">لوحة تحكم المدير</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">٥٠,٠٠٠ ر.س</div>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">١٢٣</div>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">طلبات قيد الانتظار</CardTitle>
              <Clock className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">١٥</div>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">عدد العملاء</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">٨٧</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>الطلبات الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">قريباً...</p>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>الشكاوى الجديدة</CardTitle>
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
