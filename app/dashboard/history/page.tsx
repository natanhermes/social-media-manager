"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { MessageDetailsModal } from "@/components/message-details-modal";

const messages = [
  {
    id: "1",
    content:
      "Promoção especial! 50% de desconto em todos os produtos até sexta-feira!",
    platforms: ["WhatsApp", "Instagram"],
    sentAt: "2024-01-15 14:30",
    status: "success",
  },
  {
    id: "2",
    content: "Novo produto lançado! Confira nossa nova linha de produtos.",
    platforms: ["Telegram", "Instagram"],
    sentAt: "2024-01-14 10:15",
    status: "success",
  },
  {
    id: "3",
    content: "Manutenção programada para hoje às 22h.",
    platforms: ["WhatsApp", "Telegram", "Instagram"],
    sentAt: "2024-01-13 16:45",
    status: "failed",
  },
  {
    id: "4",
    content: "Mensagem agendada para amanhã",
    platforms: ["WhatsApp"],
    sentAt: "2024-01-16 09:00",
    status: "pending",
  },
  {
    id: "5",
    content: "Lembrete: Reunião de equipe às 15h",
    platforms: ["Telegram"],
    sentAt: "2024-01-12 08:30",
    status: "success",
  },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case "failed":
        return <Badge variant="destructive">Falha</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
        );
      default:
        return null;
    }
  };

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;
    const matchesPlatform =
      platformFilter === "all" ||
      message.platforms.some(
        (platform) => platform.toLowerCase() === platformFilter.toLowerCase()
      );

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const stats = [
    {
      label: "Total de Mensagens",
      value: messages.length,
      color: "text-blue-600",
    },
    {
      label: "Enviadas com Sucesso",
      value: messages.filter((m) => m.status === "success").length,
      color: "text-green-600",
    },
    {
      label: "Falharam",
      value: messages.filter((m) => m.status === "failed").length,
      color: "text-red-600",
    },
    {
      label: "Pendentes",
      value: messages.filter((m) => m.status === "pending").length,
      color: "text-yellow-600",
    },
  ];

  const handleViewDetails = (message: any) => {
    setSelectedMessage(message);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Histórico de Mensagens
        </h1>
        <p className="text-gray-600">
          Visualize e gerencie todas as suas mensagens enviadas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Plataformas</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens ({filteredMessages.length})</CardTitle>
          <CardDescription>
            Lista completa de todas as mensagens enviadas e agendadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Plataformas</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="max-w-xs">
                      <p className="truncate font-medium">{message.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {message.platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="text-xs"
                          >
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {message.sentAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(message.status)}
                        {getStatusBadge(message.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(message)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Nenhuma mensagem encontrada com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <MessageDetailsModal
        message={selectedMessage}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
