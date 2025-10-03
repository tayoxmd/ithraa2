import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Shield } from "lucide-react";
import { employeeSchema } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Employee {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  profiles: {
    full_name: string;
    phone: string;
  };
}

const allPermissions = [
  { key: 'manage_hotels', label: { ar: 'إدارة الفنادق', en: 'Manage Hotels', fr: 'Gérer les hôtels', es: 'Gestionar hoteles', ru: 'Управление отелями', id: 'Kelola Hotel', ms: 'Urus Hotel' } },
  { key: 'manage_bookings', label: { ar: 'إدارة الحجوزات', en: 'Manage Bookings', fr: 'Gérer les réservations', es: 'Gestionar reservas', ru: 'Управление бронированием', id: 'Kelola Pemesanan', ms: 'Urus Tempahan' } },
  { key: 'manage_complaints', label: { ar: 'إدارة الشكاوى', en: 'Manage Complaints', fr: 'Gérer les plaintes', es: 'Gestionar quejas', ru: 'Управление жалобами', id: 'Kelola Keluhan', ms: 'Urus Aduan' } },
  { key: 'view_reports', label: { ar: 'عرض التقارير', en: 'View Reports', fr: 'Voir les rapports', es: 'Ver informes', ru: 'Просмотр отчетов', id: 'Lihat Laporan', ms: 'Lihat Laporan' } },
  { key: 'manage_employees', label: { ar: 'إدارة الموظفين', en: 'Manage Employees', fr: 'Gérer les employés', es: 'Gestionar empleados', ru: 'Управление сотрудниками', id: 'Kelola Karyawan', ms: 'Urus Pekerja' } },
];

export default function ManageEmployees() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    } else if (!loading) {
      fetchEmployees();
    }
  }, [userRole, loading, navigate]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role,
        permissions,
        profiles (
          full_name,
          phone
        )
      `)
      .eq('role', 'employee');
    
    if (data) {
      setEmployees(data as any);
    }
  };

  const handleAddEmployee = async () => {
    // التحقق من صحة المدخلات
    const validationResult = employeeSchema.safeParse({
      email: newEmail,
      password: newPassword,
      fullName: newName,
      phone: newPhone,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: t({ ar: "خطأ في البيانات", en: "Validation Error", fr: "Erreur de validation", es: "Error de validación", ru: "Ошибка валидации", id: "Kesalahan Validasi", ms: "Ralat Pengesahan" }),
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validationResult.data.email,
      password: validationResult.data.password,
      options: {
        data: {
          full_name: validationResult.data.fullName,
          phone: validationResult.data.phone,
        }
      }
    });

    if (authError) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: authError.message,
        variant: "destructive",
      });
      return;
    }

    if (authData.user) {
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          role: 'employee',
          permissions: selectedPermissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {})
        })
        .eq('user_id', authData.user.id);

      if (roleError) {
        toast({
          title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
          description: roleError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t({ ar: "تم إضافة الموظف", en: "Employee Added", fr: "Employé ajouté", es: "Empleado agregado", ru: "Сотрудник добавлен", id: "Karyawan Ditambahkan", ms: "Pekerja Ditambah" }),
        description: t({ ar: "تم إضافة الموظف بنجاح", en: "Employee added successfully", fr: "Employé ajouté avec succès", es: "Empleado agregado exitosamente", ru: "Сотрудник успешно добавлен", id: "Karyawan berhasil ditambahkan", ms: "Pekerja berjaya ditambah" }),
      });

      setNewEmail("");
      setNewName("");
      setNewPhone("");
      setNewPassword("");
      setSelectedPermissions([]);
      setDialogOpen(false);
      fetchEmployees();
    }
  };

  const handleUpdatePermissions = async (employeeId: string, permissions: string[]) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ 
        permissions: permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {})
      })
      .eq('id', employeeId);

    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: t({ ar: "تم التحديث", en: "Updated", fr: "Mis à jour", es: "Actualizado", ru: "Обновлено", id: "Diperbarui", ms: "Dikemas kini" }),
      description: t({ ar: "تم تحديث الصلاحيات بنجاح", en: "Permissions updated successfully", fr: "Autorisations mises à jour avec succès", es: "Permisos actualizados exitosamente", ru: "Разрешения успешно обновлены", id: "Izin berhasil diperbarui", ms: "Kebenaran berjaya dikemas kini" }),
    });

    fetchEmployees();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ ar: "العودة", en: "Back", fr: "Retour", es: "Volver", ru: "Назад", id: "Kembali", ms: "Kembali" })}
          </Button>
          <h1 className="text-3xl font-bold text-gradient-luxury">{t({ ar: "إدارة الموظفين", en: "Manage Employees", fr: "Gérer les employés", es: "Gestionar empleados", ru: "Управление сотрудниками", id: "Kelola Karyawan", ms: "Urus Pekerja" })}</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6">
              <Plus className="w-4 h-4 mr-2" />
              {t({ ar: "إضافة موظف جديد", en: "Add New Employee", fr: "Ajouter un nouvel employé", es: "Agregar nuevo empleado", ru: "Добавить нового сотрудника", id: "Tambah Karyawan Baru", ms: "Tambah Pekerja Baru" })}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t({ ar: "إضافة موظف جديد", en: "Add New Employee", fr: "Ajouter un nouvel employé", es: "Agregar nuevo empleado", ru: "Добавить нового сотрудника", id: "Tambah Karyawan Baru", ms: "Tambah Pekerja Baru" })}</DialogTitle>
              <DialogDescription>
                {t({ ar: "أدخل معلومات الموظف وحدد الصلاحيات", en: "Enter employee information and select permissions", fr: "Entrez les informations de l'employé et sélectionnez les autorisations", es: "Ingrese la información del empleado y seleccione permisos", ru: "Введите информацию о сотруднике и выберите разрешения", id: "Masukkan informasi karyawan dan pilih izin", ms: "Masukkan maklumat pekerja dan pilih kebenaran" })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t({ ar: "الاسم الكامل", en: "Full Name", fr: "Nom complet", es: "Nombre completo", ru: "Полное имя", id: "Nama Lengkap", ms: "Nama Penuh" })}</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <Label>{t({ ar: "البريد الإلكتروني", en: "Email", fr: "E-mail", es: "Correo electrónico", ru: "Эл. почта", id: "Email", ms: "E-mel" })}</Label>
                <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div>
                <Label>{t({ ar: "رقم الجوال", en: "Phone", fr: "Téléphone", es: "Teléfono", ru: "Телефон", id: "Telepon", ms: "Telefon" })}</Label>
                <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <div>
                <Label>{t({ ar: "كلمة المرور", en: "Password", fr: "Mot de passe", es: "Contraseña", ru: "Пароль", id: "Kata Sandi", ms: "Kata Laluan" })}</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div>
                <Label className="mb-2 block">{t({ ar: "الصلاحيات", en: "Permissions", fr: "Autorisations", es: "Permisos", ru: "Разрешения", id: "Izin", ms: "Kebenaran" })}</Label>
                <div className="space-y-2">
                  {allPermissions.map((perm) => (
                    <div key={perm.key} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={perm.key}
                        checked={selectedPermissions.includes(perm.key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([...selectedPermissions, perm.key]);
                          } else {
                            setSelectedPermissions(selectedPermissions.filter(p => p !== perm.key));
                          }
                        }}
                      />
                      <label htmlFor={perm.key}>{t(perm.label)}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddEmployee} className="w-full">
                {t({ ar: "إضافة", en: "Add", fr: "Ajouter", es: "Agregar", ru: "Добавить", id: "Tambah", ms: "Tambah" })}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-4">
          {employees.map((employee) => (
            <Card key={employee.id} className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{employee.profiles?.full_name || t({ ar: "بدون اسم", en: "No Name", fr: "Sans nom", es: "Sin nombre", ru: "Без имени", id: "Tanpa Nama", ms: "Tiada Nama" })}</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingEmployee(employee)}>
                        <Shield className="w-4 h-4 mr-2" />
                        {t({ ar: "تعديل الصلاحيات", en: "Edit Permissions", fr: "Modifier les autorisations", es: "Editar permisos", ru: "Изменить разрешения", id: "Edit Izin", ms: "Edit Kebenaran" })}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{t({ ar: "تعديل الصلاحيات", en: "Edit Permissions", fr: "Modifier les autorisations", es: "Editar permisos", ru: "Изменить разрешения", id: "Edit Izin", ms: "Edit Kebenaran" })}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {allPermissions.map((perm) => (
                          <div key={perm.key} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id={`${employee.id}-${perm.key}`}
                              defaultChecked={employee.permissions?.[perm.key]}
                              onCheckedChange={(checked) => {
                                const currentPerms = Object.keys(employee.permissions || {}).filter(k => employee.permissions[k]);
                                const newPerms = checked 
                                  ? [...currentPerms, perm.key]
                                  : currentPerms.filter(p => p !== perm.key);
                                handleUpdatePermissions(employee.id, newPerms);
                              }}
                            />
                            <label htmlFor={`${employee.id}-${perm.key}`}>{t(perm.label)}</label>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{employee.profiles?.phone}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium">{t({ ar: "الصلاحيات الحالية:", en: "Current Permissions:", fr: "Autorisations actuelles:", es: "Permisos actuales:", ru: "Текущие разрешения:", id: "Izin Saat Ini:", ms: "Kebenaran Semasa:" })}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.keys(employee.permissions || {}).filter(k => employee.permissions[k]).map(perm => {
                      const permObj = allPermissions.find(p => p.key === perm);
                      return permObj ? (
                        <span key={perm} className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                          {t(permObj.label)}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
