import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, CheckCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    phone: string;
  };
  unread_count?: number;
}

interface Message {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
  is_admin: boolean;
}

export default function LiveChatManagement() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession);

      const channel = supabase
        .channel(`admin-chat:${selectedSession}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${selectedSession}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('chat_sessions')
      .select(`
        *,
        profiles:user_id (
          full_name,
          phone
        )
      `)
      .order('updated_at', { ascending: false });

    if (data) {
      setSessions(data as any);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedSession) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('chat_messages').insert({
      session_id: selectedSession,
      sender_id: user.id,
      sender_name: profile?.full_name || 'Support Team',
      message: newMessage,
      is_admin: true,
    });

    if (error) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل إرسال الرسالة', 'Failed to send message'),
        variant: 'destructive',
      });
    } else {
      setNewMessage("");
      
      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedSession);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ status: 'closed' })
      .eq('id', sessionId);

    if (!error) {
      toast({
        title: t('تم', 'Done'),
        description: t('تم إغلاق الجلسة', 'Session closed'),
      });
      fetchSessions();
      if (selectedSession === sessionId) {
        setSelectedSession(null);
      }
    }
  };

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const closedSessions = sessions.filter((s) => s.status === 'closed');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-8">
          {t('إدارة الدردشة المباشرة', 'Live Chat Management')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {t('المحادثات', 'Conversations')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="active">
                <TabsList className="w-full">
                  <TabsTrigger value="active" className="flex-1">
                    {t('نشطة', 'Active')} ({activeSessions.length})
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">
                    {t('مغلقة', 'Closed')} ({closedSessions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="m-0">
                  <ScrollArea className="h-[500px]">
                    {activeSessions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        {t('لا توجد محادثات نشطة', 'No active conversations')}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {activeSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                              selectedSession === session.id ? 'bg-muted' : ''
                            }`}
                            onClick={() => setSelectedSession(session.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold">
                                {session.profile?.full_name || 'User'}
                              </p>
                              <Badge variant="default" className="gap-1">
                                <Clock className="w-3 h-3" />
                                {t('نشط', 'Active')}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.profile?.phone}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(session.updated_at), {
                                addSuffix: true,
                                locale: language === 'ar' ? ar : undefined,
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="closed" className="m-0">
                  <ScrollArea className="h-[500px]">
                    {closedSessions.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        {t('لا توجد محادثات مغلقة', 'No closed conversations')}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {closedSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                              selectedSession === session.id ? 'bg-muted' : ''
                            }`}
                            onClick={() => setSelectedSession(session.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold">
                                {session.profile?.full_name || 'User'}
                              </p>
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {t('مغلقة', 'Closed')}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {session.profile?.phone}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedSession
                    ? sessions.find((s) => s.id === selectedSession)?.profile?.full_name ||
                      'User'
                    : t('اختر محادثة', 'Select a conversation')}
                </CardTitle>
                {selectedSession &&
                  sessions.find((s) => s.id === selectedSession)?.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCloseSession(selectedSession)}
                    >
                      {t('إغلاق المحادثة', 'Close Chat')}
                    </Button>
                  )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {selectedSession ? (
                <div className="flex flex-col h-[500px]">
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.is_admin ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.is_admin
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-xs font-semibold mb-1">
                              {message.sender_name}
                            </p>
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: language === 'ar' ? ar : undefined,
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {sessions.find((s) => s.id === selectedSession)?.status === 'active' && (
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                          placeholder={t('اكتب ردك...', 'Type your reply...')}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                  {t('اختر محادثة لبدء الرد', 'Select a conversation to start replying')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}