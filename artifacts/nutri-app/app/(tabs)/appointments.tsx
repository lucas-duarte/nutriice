import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";
import { getMyAppointments, Appointment } from "@/lib/api";
import Colors from "@/constants/colors";

const C = Colors.light;

function getStatusConfig(status: string) {
  switch (status) {
    case "confirmed": return { color: C.success, label: "Confirmada", icon: "check-circle" as const, bg: "#DCFCE7" };
    case "pending": return { color: C.warning, label: "Pendente", icon: "clock" as const, bg: "#FEF3C7" };
    case "cancelled": return { color: C.error, label: "Cancelada", icon: "x-circle" as const, bg: "#FEE2E2" };
    case "completed": return { color: C.info, label: "Concluída", icon: "check-square" as const, bg: "#DBEAFE" };
    default: return { color: C.textMuted, label: status, icon: "circle" as const, bg: C.backgroundTertiary };
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "initial": return "Consulta Inicial";
    case "followup": return "Retorno";
    case "online": return "Online";
    case "inperson": return "Presencial";
    default: return type;
  }
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const statusConfig = getStatusConfig(appt.status);
  const date = new Date(appt.scheduledAt);
  const isUpcoming = date >= new Date() && appt.status !== "cancelled";

  return (
    <View style={[styles.apptCard, isUpcoming && styles.apptCardUpcoming]}>
      <View style={styles.apptDateBadge}>
        <Text style={styles.apptDay}>{date.getDate()}</Text>
        <Text style={styles.apptMonth}>
          {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
        </Text>
        <Text style={styles.apptYear}>{date.getFullYear()}</Text>
      </View>

      <View style={styles.apptDetails}>
        <Text style={styles.apptTypeName}>{getTypeLabel(appt.type)}</Text>
        <View style={styles.apptTimeRow}>
          <Feather name="clock" size={13} color={C.textSecondary} />
          <Text style={styles.apptTime}>
            {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            {" · "}{appt.durationMinutes} min
          </Text>
        </View>
        {appt.notes ? (
          <Text style={styles.apptNotes} numberOfLines={1}>{appt.notes}</Text>
        ) : null}
      </View>

      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
        <Feather name={statusConfig.icon} size={14} color={statusConfig.color} />
        <Text style={[styles.statusLabel, { color: statusConfig.color }]}>{statusConfig.label}</Text>
      </View>
    </View>
  );
}

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"upcoming" | "all">("upcoming");

  useEffect(() => {
    getUser().then((u) => { if (!u) router.replace("/login"); });
  }, []);

  const { data: appointments, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: getMyAppointments,
  });

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const filtered = appointments
    ? filter === "upcoming"
      ? appointments.filter((a) => new Date(a.scheduledAt) >= new Date() && a.status !== "cancelled")
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      : appointments.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    : [];

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: topPadding }]}>
        <ActivityIndicator size="large" color={C.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={!!isFetching} onRefresh={refetch} tintColor={C.tint} />}
    >
      <Text style={styles.pageTitle}>Consultas</Text>
      <Text style={styles.pageSubtitle}>Gerencie seus agendamentos</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "upcoming" && styles.filterBtnActive]}
          onPress={() => setFilter("upcoming")}
        >
          <Text style={[styles.filterText, filter === "upcoming" && styles.filterTextActive]}>Próximas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="calendar" size={32} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === "upcoming" ? "Nenhuma consulta próxima" : "Nenhuma consulta"}
          </Text>
          <Text style={styles.emptyText}>
            {filter === "upcoming"
              ? "Você não tem consultas agendadas. Seu nutricionista pode agendar para você."
              : "Nenhuma consulta encontrada no histórico."}
          </Text>
        </View>
      ) : (
        filtered.map((appt) => <AppointmentCard key={appt.id} appt={appt} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.backgroundSecondary },
  content: { paddingHorizontal: 20 },
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: C.text, marginBottom: 4 },
  pageSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, marginBottom: 20 },
  filterRow: {
    flexDirection: "row",
    backgroundColor: C.backgroundTertiary,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  filterBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  filterBtnActive: { backgroundColor: C.card, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.textSecondary },
  filterTextActive: { fontFamily: "Inter_600SemiBold", color: C.text },
  emptyState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 12 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: C.backgroundTertiary,
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: C.text },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, textAlign: "center", lineHeight: 20 },
  apptCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  apptCardUpcoming: { borderColor: C.tint, borderWidth: 1.5 },
  apptDateBadge: {
    width: 52, alignItems: "center",
    backgroundColor: C.tintLight,
    borderRadius: 12, padding: 8, marginRight: 14,
  },
  apptDay: { fontFamily: "Inter_700Bold", fontSize: 22, color: C.tintDark, lineHeight: 24 },
  apptMonth: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.tint, textTransform: "uppercase" },
  apptYear: { fontFamily: "Inter_400Regular", fontSize: 10, color: C.textMuted, marginTop: 1 },
  apptDetails: { flex: 1 },
  apptTypeName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text, marginBottom: 4 },
  apptTimeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  apptTime: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary },
  apptNotes: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted, marginTop: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginLeft: 8 },
  statusLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
});
