import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Key, RefreshCw, Copy, Plus, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface APIKey {
  id: string;
  api_key: string;
  api_secret: string;
  is_active: boolean;
  rate_limit: number;
  allowed_origins: any;
  created_at: string;
  expires_at?: string;
}

export default function APISettings() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [newOrigin, setNewOrigin] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'manager') {
        navigate('/');
        return;
      }
      fetchAPIKeys();
    }
  }, [userRole, loading, navigate]);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to ensure allowed_origins is an array
      const transformedData = (data || []).map(key => ({
        ...key,
        allowed_origins: Array.isArray(key.allowed_origins) ? key.allowed_origins : []
      }));
      
      setApiKeys(transformedData as any);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const generateAPIKey = async () => {
    try {
      const apiKey = `ethraa_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const apiSecret = `secret_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      const { error } = await supabase
        .from('api_settings')
        .insert([{
          api_key: apiKey,
          api_secret: apiSecret,
          is_active: true,
          rate_limit: 1000,
          allowed_origins: []
        }]);

      if (error) throw error;

      toast({
        title: t({ ar: "تم إنشاء API Key", en: "API Key Created" }),
        description: t({ ar: "تم إنشاء مفتاح API جديد بنجاح", en: "New API key created successfully" }),
      });

      fetchAPIKeys();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('api_settings')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t({ ar: "تم التحديث", en: "Updated" }),
        description: t({ ar: "تم تحديث حالة المفتاح", en: "Key status updated" }),
      });

      fetchAPIKeys();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm(t({ ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete?" }))) return;

    try {
      const { error } = await supabase
        .from('api_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t({ ar: "تم الحذف", en: "Deleted" }),
        description: t({ ar: "تم حذف المفتاح", en: "Key deleted" }),
      });

      fetchAPIKeys();
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addOrigin = async (keyId: string, currentOrigins: string[]) => {
    if (!newOrigin.trim()) return;

    try {
      const updatedOrigins = [...currentOrigins, newOrigin.trim()];
      
      const { error } = await supabase
        .from('api_settings')
        .update({ allowed_origins: updatedOrigins })
        .eq('id', keyId);

      if (error) throw error;

      setNewOrigin("");
      setEditingKey(null);
      fetchAPIKeys();
      
      toast({
        title: t({ ar: "تم الإضافة", en: "Added" }),
        description: t({ ar: "تم إضافة النطاق", en: "Origin added" }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeOrigin = async (keyId: string, currentOrigins: string[], originToRemove: string) => {
    try {
      const updatedOrigins = currentOrigins.filter(o => o !== originToRemove);
      
      const { error } = await supabase
        .from('api_settings')
        .update({ allowed_origins: updatedOrigins })
        .eq('id', keyId);

      if (error) throw error;

      fetchAPIKeys();
      
      toast({
        title: t({ ar: "تم الحذف", en: "Deleted" }),
        description: t({ ar: "تم حذف النطاق", en: "Origin removed" }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t({ ar: "تم النسخ", en: "Copied" }),
      description: t({ ar: "تم نسخ المفتاح إلى الحافظة", en: "Key copied to clipboard" }),
    });
  };

  if (loading || loadingKeys) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card className="card-luxury">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Key className="w-6 h-6" />
                {t({ ar: "إعدادات API", en: "API Settings" })}
              </CardTitle>
              <Button onClick={generateAPIKey} className="gap-2">
                <Plus className="w-4 h-4" />
                {t({ ar: "إنشاء مفتاح جديد", en: "Generate New Key" })}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {apiKeys.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t({ ar: "لا توجد مفاتيح API", en: "No API keys" })}
              </p>
            ) : (
              apiKeys.map((key) => (
                <Card key={key.id} className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{t({ ar: "مفتاح API", en: "API Key" })}</h3>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? t({ ar: "نشط", en: "Active" }) : t({ ar: "غير نشط", en: "Inactive" })}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleKeyStatus(key.id, key.is_active)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteKey(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>{t({ ar: "مفتاح API", en: "API Key" })}</Label>
                      <div className="flex gap-2">
                        <Input value={key.api_key} readOnly className="font-mono text-sm" />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(key.api_key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>{t({ ar: "المفتاح السري", en: "API Secret" })}</Label>
                      <div className="flex gap-2">
                        <Input
                          type={showSecret[key.id] ? "text" : "password"}
                          value={key.api_secret}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowSecret({ ...showSecret, [key.id]: !showSecret[key.id] })}
                        >
                          👁️
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(key.api_secret)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>{t({ ar: "حد المعدل", en: "Rate Limit" })}</Label>
                      <Input value={`${key.rate_limit} ${t({ ar: "طلب/ساعة", en: "requests/hour" })}`} readOnly />
                    </div>

                    <div>
                      <Label>{t({ ar: "النطاقات المسموحة", en: "Allowed Origins" })}</Label>
                      <div className="space-y-2">
                        {key.allowed_origins?.map((origin, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input value={origin} readOnly className="text-sm" />
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => removeOrigin(key.id, key.allowed_origins, origin)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {editingKey === key.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={newOrigin}
                              onChange={(e) => setNewOrigin(e.target.value)}
                              placeholder="https://example.com"
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => addOrigin(key.id, key.allowed_origins)}
                            >
                              {t({ ar: "إضافة", en: "Add" })}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingKey(null);
                                setNewOrigin("");
                              }}
                            >
                              {t({ ar: "إلغاء", en: "Cancel" })}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingKey(key.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {t({ ar: "إضافة نطاق", en: "Add Origin" })}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      {t({ ar: "تم الإنشاء:", en: "Created:" })} {new Date(key.created_at).toLocaleString()}
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* API Documentation */}
            <Card className="p-6 bg-muted/30">
              <h3 className="font-bold text-lg mb-4">{t({ ar: "توثيق API", en: "API Documentation" })}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <Label>{t({ ar: "نقطة النهاية الأساسية", en: "Base Endpoint" })}</Label>
                  <code className="block bg-background p-2 rounded mt-1">
                    https://orqhoejabexcdjmdgzxg.supabase.co/rest/v1/
                  </code>
                </div>
                <div>
                  <Label>{t({ ar: "مثال على طلب", en: "Example Request" })}</Label>
                  <Textarea
                    readOnly
                    rows={6}
                    className="font-mono text-xs mt-1"
                    value={`curl -X GET \\
  'https://orqhoejabexcdjmdgzxg.supabase.co/rest/v1/hotels' \\
  -H 'apikey: YOUR_API_KEY' \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
                  />
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
