import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, UserCircle, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Owner {
  id: string;
  owner_name_ar: string;
  owner_name_en: string;
  national_id: string | null;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
}

export default function ManageOwners() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState({
    owner_name_ar: "",
    owner_name_en: "",
    national_id: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    active: true,
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    fetchOwners();
  }, [userRole]);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hotel_owners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOwners(data || []);
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editMode && selectedOwner) {
        const { error } = await supabase
          .from('hotel_owners')
          .update(formData)
          .eq('id', selectedOwner.id);

        if (error) throw error;

        toast({
          title: t({ ar: "تم التحديث", en: "Updated" }),
          description: t({ ar: "تم تحديث بيانات المالك بنجاح", en: "Owner data updated successfully" }),
        });
      } else {
        const { error } = await supabase
          .from('hotel_owners')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: t({ ar: "تم الإضافة", en: "Added" }),
          description: t({ ar: "تم إضافة المالك بنجاح", en: "Owner added successfully" }),
        });
      }

      resetForm();
      fetchOwners();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (owner: Owner) => {
    setSelectedOwner(owner);
    setFormData({
      owner_name_ar: owner.owner_name_ar,
      owner_name_en: owner.owner_name_en,
      national_id: owner.national_id || "",
      phone: owner.phone,
      email: owner.email || "",
      address: owner.address || "",
      notes: owner.notes || "",
      active: owner.active,
    });
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (ownerId: string) => {
    if (!confirm(t({ ar: "هل أنت متأكد من حذف هذا المالك؟", en: "Are you sure you want to delete this owner?" }))) {
      return;
    }

    try {
      const { error } = await supabase
        .from('hotel_owners')
        .delete()
        .eq('id', ownerId);

      if (error) throw error;

      toast({
        title: t({ ar: "تم الحذف", en: "Deleted" }),
        description: t({ ar: "تم حذف المالك بنجاح", en: "Owner deleted successfully" }),
      });

      fetchOwners();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      owner_name_ar: "",
      owner_name_en: "",
      national_id: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      active: true,
    });
    setEditMode(false);
    setSelectedOwner(null);
    setDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t({ ar: "العودة", en: "Back" })}
            </Button>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t({ ar: "إضافة مالك", en: "Add Owner" })}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {t({ ar: "إدارة المُلاك", en: "Manage Owners" })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>
            ) : owners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t({ ar: "لا يوجد مُلاك", en: "No owners" })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t({ ar: "الاسم", en: "Name" })}</TableHead>
                      <TableHead>{t({ ar: "رقم الهوية", en: "ID Number" })}</TableHead>
                      <TableHead>{t({ ar: "الجوال", en: "Phone" })}</TableHead>
                      <TableHead>{t({ ar: "البريد", en: "Email" })}</TableHead>
                      <TableHead>{t({ ar: "الحالة", en: "Status" })}</TableHead>
                      <TableHead>{t({ ar: "الإجراءات", en: "Actions" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.map((owner) => (
                      <TableRow key={owner.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{owner.owner_name_ar}</div>
                            <div className="text-sm text-muted-foreground">{owner.owner_name_en}</div>
                          </div>
                        </TableCell>
                        <TableCell>{owner.national_id || "-"}</TableCell>
                        <TableCell>{owner.phone}</TableCell>
                        <TableCell>{owner.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={owner.active ? "default" : "secondary"}>
                            {owner.active ? t({ ar: "نشط", en: "Active" }) : t({ ar: "غير نشط", en: "Inactive" })}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(owner)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(owner.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode 
                ? t({ ar: "تعديل مالك", en: "Edit Owner" })
                : t({ ar: "إضافة مالك جديد", en: "Add New Owner" })
              }
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name_ar">
                  {t({ ar: "الاسم (عربي)", en: "Name (Arabic)" })} *
                </Label>
                <Input
                  id="owner_name_ar"
                  value={formData.owner_name_ar}
                  onChange={(e) => setFormData({ ...formData, owner_name_ar: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner_name_en">
                  {t({ ar: "الاسم (إنجليزي)", en: "Name (English)" })} *
                </Label>
                <Input
                  id="owner_name_en"
                  value={formData.owner_name_en}
                  onChange={(e) => setFormData({ ...formData, owner_name_en: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="national_id">
                  {t({ ar: "رقم الهوية", en: "ID Number" })}
                </Label>
                <Input
                  id="national_id"
                  value={formData.national_id}
                  onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t({ ar: "رقم الجوال", en: "Phone" })} *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                {t({ ar: "البريد الإلكتروني", en: "Email" })}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                {t({ ar: "العنوان", en: "Address" })}
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                {t({ ar: "ملاحظات", en: "Notes" })}
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="active">
                {t({ ar: "نشط", en: "Active" })}
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                {t({ ar: "إلغاء", en: "Cancel" })}
              </Button>
              <Button type="submit">
                {editMode 
                  ? t({ ar: "تحديث", en: "Update" })
                  : t({ ar: "إضافة", en: "Add" })
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}