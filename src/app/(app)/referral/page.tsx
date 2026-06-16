"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Check, Users, Gift, Share2, Award, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralStats {
  totalInvited: number;
  activeFriends: number;
  rewardsEarned: number;
}

interface ReferralActivity {
  id: string;
  friendName: string;
  status: "Pendente" | "Meta Concluída" | "Ativo";
  date: string;
  reward: string;
}

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats>({
    totalInvited: 0,
    activeFriends: 0,
    rewardsEarned: 0,
  });
  const [activities, setActivities] = useState<ReferralActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de chamada de API (TAL-152/TAL-172)
        // No futuro: const res = await fetch('/api/referral');
        
        // Mock de dados para a implementação da UI (TAL-151)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setReferralCode("user-" + Math.random().toString(36).substring(7));
        setStats({
          totalInvited: 15,
          activeFriends: 6,
          rewardsEarned: 45, // dias de premium
        });
        setActivities([
          { id: "1", friendName: "Carlos Oliveira", status: "Meta Concluída", date: "12/06/2026", reward: "15 dias Premium" },
          { id: "2", friendName: "Mariana Dias", status: "Meta Concluída", date: "10/06/2026", reward: "15 dias Premium" },
          { id: "3", friendName: "João Pedro", status: "Meta Concluída", date: "05/06/2026", reward: "15 dias Premium" },
          { id: "4", friendName: "Fernanda Lima", status: "Ativo", date: "13/06/2026", reward: "-" },
          { id: "5", friendName: "Ricardo Santos", status: "Pendente", date: "14/06/2026", reward: "-" },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados de indicação:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const referralLink = typeof window !== "undefined" 
    ? `${window.location.origin}/ref/${referralCode}` 
    : `https://talkvex.com/ref/${referralCode}`;

  const copyToClipboard = () => {
    if (loading) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-10 animate-fade-up">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-6">
        <div className="inline-flex items-center justify-center p-2 bg-accent/10 rounded-full mb-2">
          <Gift className="h-6 w-6 text-accent" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Convide amigos e cresçam juntos
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ao indicar o Talkvex, você ajuda seus amigos a alcançarem metas e ganha dias de acesso Premium para cada meta concluída por eles.
        </p>
      </section>

      {/* Link Generator */}
      <Card className="border-accent/20 bg-accent/5 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Share2 className="h-5 w-5 text-accent" />
            Seu link de indicação
          </CardTitle>
          <CardDescription>
            Compartilhe este link com seus amigos para começar a ganhar recompensas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Input 
                readOnly 
                value={loading ? "Gerando seu link..." : referralLink} 
                className="font-mono text-sm bg-background/50 border-accent/20 focus-visible:ring-accent h-12 pr-10"
              />
              {!loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                </div>
              )}
            </div>
            <Button 
              onClick={copyToClipboard} 
              size="lg"
              className={cn(
                "w-full md:w-auto transition-all duration-300 min-w-[140px]", 
                copied ? "bg-success hover:bg-success/90" : "bg-accent hover:opacity-90"
              )}
              disabled={loading}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convites Enviados</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.totalInvited}</div>
            <p className="text-xs text-muted-foreground mt-1">Links clicados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amigos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : stats.activeFriends}</div>
            <p className="text-xs text-muted-foreground mt-1">Cadastros realizados</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-accent/30 shadow-lg shadow-accent/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas Acumuladas</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{loading ? "..." : `${stats.rewardsEarned} dias`}</div>
            <p className="text-xs text-muted-foreground mt-1">Acesso Premium garantido</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
          <CardDescription>Veja quem já entrou no Talkvex através do seu link.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Amigo</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Recompensa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-5 w-32 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-5 w-24 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-5 w-24 bg-muted rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : activities.length > 0 ? (
                  activities.map((activity) => (
                    <TableRow key={activity.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{activity.friendName}</TableCell>
                      <TableCell className="text-muted-foreground">{activity.date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={activity.status === "Meta Concluída" ? "default" : "outline"}
                          className={cn(
                            activity.status === "Meta Concluída" && "bg-success/10 text-success border-success/20",
                            activity.status === "Ativo" && "bg-accent/10 text-accent border-accent/20",
                            activity.status === "Pendente" && "opacity-60"
                          )}
                        >
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-accent">
                        {activity.reward !== "-" ? activity.reward : <span className="text-muted-foreground font-normal">-</span>}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="h-8 w-8 opacity-20" />
                        <p>Nenhuma indicação ainda. Comece a compartilhar seu link!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
