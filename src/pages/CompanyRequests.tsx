import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Building2, ArrowLeft } from "lucide-react";
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

export default function CompanyRequests() {
  const { t } = useLanguage();
  const { userRole, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    fetchRequests();
  }, [userRole]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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

  const handleApprove = async (requestId: string, userId: string) => {
    try {
      // Update company request status
      const { error: requestError } = await supabase
        .from('company_requests')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Add company role to user
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'company'
        });

      if (roleError) throw roleError;

      toast({
        title: t({ ar: "تمت الموافقة", en: "Approved" }),
        description: t({ ar: "تم قبول طلب الشركة بنجاح", en: "Company request approved successfully" }),
      });

      fetchRequests();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from('company_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: t({ ar: "تم الرفض", en: "Rejected" }),
        description: t({ ar: "تم رفض طلب الشركة", en: "Company request rejected" }),
      });

      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
      fetchRequests();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t({ ar: "قيد المراجعة", en: "Pending" }), variant: "secondary" as const },
      approved: { label: t({ ar: "مقبول", en: "Approved" }), variant: "default" as const },
      rejected: { label: t({ ar: "مرفوض", en: "Rejected" }), variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ ar: "العودة", en: "Back" })}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {t({ ar: "طلبات الشركات", en: "Company Requests" })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t({ ar: "لا توجد طلبات", en: "No requests" })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t({ ar: "اسم الشركة", en: "Company Name" })}</TableHead>
                      <TableHead>{t({ ar: "السجل التجاري", en: "CR" })}</TableHead>
                      <TableHead>{t({ ar: "الشخص المسؤول", en: "Contact Person" })}</TableHead>
                      <TableHead>{t({ ar: "الحالة", en: "Status" })}</TableHead>
                      <TableHead>{t({ ar: "الإجراءات", en: "Actions" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.company_name_ar}</div>
                            <div className="text-sm text-muted-foreground">{request.company_name_en}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.commercial_register}</TableCell>
                        <TableCell>
                          <div>
                            <div>{request.contact_person}</div>
                            <div className="text-sm text-muted-foreground">{request.contact_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(request.id, request.user_id)}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                {t({ ar: "قبول", en: "Approve" })}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                {t({ ar: "رفض", en: "Reject" })}
                              </Button>
                            </div>
                          )}
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ ar: "رفض الطلب", en: "Reject Request" })}</DialogTitle>
            <DialogDescription>
              {t({ ar: "الرجاء إدخال سبب الرفض", en: "Please enter the reason for rejection" })}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t({ ar: "أدخل سبب الرفض", en: "Enter rejection reason" })}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t({ ar: "إلغاء", en: "Cancel" })}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
              {t({ ar: "تأكيد الرفض", en: "Confirm Rejection" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}