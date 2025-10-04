import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  role: string;
}

export default function AuditLogs() {
  const { userRole, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'admin') {
        navigate('/');
        return;
      }
      fetchUsers();
      fetchLogs();
    }
  }, [userRole, loading, navigate, selectedUser]);

  const fetchUsers = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name');

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const combinedUsers: User[] = profilesData?.map(profile => {
        const userRole = rolesData?.find((r: any) => r.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name || 'Unknown',
          role: userRole?.role || 'customer'
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedUser && selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return t({ ar: 'غير معروف', en: 'Unknown' });
    const user = users.find(u => u.id === userId);
    return user?.full_name || t({ ar: 'غير معروف', en: 'Unknown' });
  };

  const getRoleLabel = (role: string | null) => {
    const labels: Record<string, { ar: string; en: string }> = {
      admin: { ar: "مدير", en: "Admin" },
      employee: { ar: "موظف", en: "Employee" },
      customer: { ar: "عميل", en: "Customer" }
    };
    return role && labels[role] ? (language === 'ar' ? labels[role]?.ar : labels[role]?.en) : '-';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6" />
              {t({ ar: "سجل الأحداث", en: "Audit Logs" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder={t({ ar: "اختر مستخدم", en: "Select User" })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ ar: "الكل", en: "All" })}</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({getRoleLabel(user.role)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t({ ar: "التاريخ", en: "Date" })}</TableHead>
                    <TableHead>{t({ ar: "المستخدم", en: "User" })}</TableHead>
                    <TableHead>{t({ ar: "الدور", en: "Role" })}</TableHead>
                    <TableHead>{t({ ar: "الإجراء", en: "Action" })}</TableHead>
                    <TableHead>{t({ ar: "النوع", en: "Type" })}</TableHead>
                    <TableHead>{t({ ar: "التفاصيل", en: "Details" })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLogs ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {t({ ar: "جاري التحميل...", en: "Loading..." })}
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {t({ ar: "لا توجد سجلات", en: "No logs found" })}
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{getUserName(log.user_id)}</TableCell>
                        <TableCell>{getRoleLabel(log.user_role)}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.entity_type}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}