import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string;
  role: string;
}

export default function ManageEmployees() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "customer" as "admin" | "employee" | "customer"
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [userRole, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const combinedUsers: UserProfile[] = profilesData?.map(profile => {
        const authUser = authUsers?.find((u: any) => u.id === profile.id);
        const userRole = rolesData?.find((r: any) => r.user_id === profile.id);
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          email: authUser?.email || '',
          role: userRole?.role || 'customer'
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "فشل في تحميل المستخدمين", en: "Failed to load users" }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: t({ ar: "تنبيه", en: "Warning" }),
        description: t({ ar: "يرجى ملء جميع الحقول المطلوبة", en: "Please fill all required fields" }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
          phone: formData.phone
        }
      });

      if (authError) throw authError;

      if (formData.role !== 'customer' && authData.user) {
        await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', authData.user.id);
      }

      toast({
        title: t({ ar: "نجح", en: "Success" }),
        description: t({ ar: "تمت إضافة المستخدم بنجاح", en: "User added successfully" }),
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message || t({ ar: "فشل في إضافة المستخدم", en: "Failed to add user" }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', selectedUser.id);

      if (roleError) throw roleError;

      if (formData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          selectedUser.id,
          { password: formData.password }
        );
        if (passwordError) throw passwordError;
      }

      toast({
        title: t({ ar: "نجح", en: "Success" }),
        description: t({ ar: "تم تحديث المستخدم بنجاح", en: "User updated successfully" }),
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message || t({ ar: "فشل في تحديث المستخدم", en: "Failed to update user" }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t({ ar: "هل أنت متأكد من حذف هذا المستخدم؟", en: "Are you sure you want to delete this user?" }))) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: t({ ar: "نجح", en: "Success" }),
        description: t({ ar: "تم حذف المستخدم بنجاح", en: "User deleted successfully" }),
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message || t({ ar: "فشل في حذف المستخدم", en: "Failed to delete user" }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: "",
      full_name: user.full_name || "",
      phone: user.phone || "",
      role: user.role as any
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role: "customer"
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      admin: { ar: "مدير", en: "Admin" },
      employee: { ar: "موظف", en: "Employee" },
      customer: { ar: "عميل", en: "Customer" }
    };
    return language === 'ar' ? labels[role]?.ar : labels[role]?.en;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card className="card-luxury">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {t({ ar: "إدارة المستخدمين", en: "Manage Users" })}
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-luxury">
                  <Plus className="w-4 h-4 ml-2" />
                  {t({ ar: "إضافة مستخدم", en: "Add User" })}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t({ ar: "إضافة مستخدم جديد", en: "Add New User" })}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t({ ar: "البريد الإلكتروني", en: "Email" })}</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t({ ar: "كلمة المرور", en: "Password" })}</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t({ ar: "الاسم الكامل", en: "Full Name" })}</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t({ ar: "رقم الهاتف", en: "Phone" })}</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t({ ar: "الدور", en: "Role" })}</Label>
                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">{t({ ar: "عميل", en: "Customer" })}</SelectItem>
                        <SelectItem value="employee">{t({ ar: "موظف", en: "Employee" })}</SelectItem>
                        <SelectItem value="admin">{t({ ar: "مدير", en: "Admin" })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddUser} disabled={loading} className="w-full btn-luxury">
                    {t({ ar: "إضافة", en: "Add" })}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t({ ar: "الاسم", en: "Name" })}</TableHead>
                  <TableHead>{t({ ar: "البريد الإلكتروني", en: "Email" })}</TableHead>
                  <TableHead>{t({ ar: "الهاتف", en: "Phone" })}</TableHead>
                  <TableHead>{t({ ar: "الدور", en: "Role" })}</TableHead>
                  <TableHead>{t({ ar: "الإجراءات", en: "Actions" })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{getRoleLabel(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t({ ar: "تعديل المستخدم", en: "Edit User" })}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t({ ar: "البريد الإلكتروني", en: "Email" })}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  disabled
                />
              </div>
              <div>
                <Label>{t({ ar: "كلمة المرور الجديدة (اختياري)", en: "New Password (Optional)" })}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <Label>{t({ ar: "الاسم الكامل", en: "Full Name" })}</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>{t({ ar: "رقم الهاتف", en: "Phone" })}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>{t({ ar: "الدور", en: "Role" })}</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t({ ar: "عميل", en: "Customer" })}</SelectItem>
                    <SelectItem value="employee">{t({ ar: "موظف", en: "Employee" })}</SelectItem>
                    <SelectItem value="admin">{t({ ar: "مدير", en: "Admin" })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditUser} disabled={loading} className="w-full btn-luxury">
                {t({ ar: "حفظ التغييرات", en: "Save Changes" })}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
