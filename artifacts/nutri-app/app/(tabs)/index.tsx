import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";
import { getMyDiets, getMyAppointments, DietPlan, Appointment } from "@/lib/api";
import Colors from "@/constants/colors";

const C = Colors.light;

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed": return C.success;
    case "pending": return C.warning;
    case "cancelled": return C.error;
    case "completed": return C.info;
    default: return C.textMuted;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "confirmed": return "Confirmada";
    case "pending": return "Pendente";
    case "cancelled": return "Cancelada";
    case "completed": return "Concluída";
    default: return status;
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("Paciente");

  useEffect(() => {
    getUser().then((u) => {
      if (u?.name) setUserName(u.name.split(" ")[0]);
      if (!u) router.replace("/login");
    });
  }, []);

  const dietsQuery = useQuery({ queryKey: ["myDiets"], queryFn: getMyDiets });
  const appointmentsQuery = useQuery({ queryKey: ["myAppointments"], queryFn: getMyAppointments });

  const isLoading = dietsQuery.isLoading || appointmentsQuery.isLoading;
  const isRefreshing = dietsQuery.isFetching || appointmentsQuery.isFetching;

  const activeDiet = dietsQuery.data?.find((d) => d.isActive);
  const upcomingAppointments = appointmentsQuery.data
    ?.filter((a) => a.status !== "cancelled" && a.status !== "completed" && new Date(a.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3) ?? [];

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const onRefresh = () => {
    dietsQuery.refetch();
    appointmentsQuery.refetch();
  };

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
      refreshControl={
        <RefreshControl refreshing={!!isRefreshing} onRefresh={onRefresh} tintColor={C.tint} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {userName}!</Text>
          <Text style={styles.subGreeting}>Acompanhe sua evolução hoje</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{userName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      {activeDiet ? (
        <TouchableOpacity
          style={styles.activeDietCard}
          onPress={() => router.push(`/diet/${activeDiet.id}`)}
          activeOpacity={0.92}
        >
          <View style={styles.activeDietHeader}>
            <View style={styles.activeBadge}>
              <Feather name="check-circle" size={12} color="#FFFFFF" />
              <Text style={styles.activeBadgeText}>Dieta Ativa</Text>
            </View>
          </View>
          <Text style={styles.activeDietName}>{activeDiet.name}</Text>
          {activeDiet.description ? (
            <Text style={styles.activeDietDesc} numberOfLines={2}>{activeDiet.description}</Text>
          ) : null}
          <View style={styles.activeDietFooter}>
            <View style={styles.mealCount}>
              <Feather name="coffee" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.mealCountText}>{activeDiet.meals?.length ?? 0} refeições</Text>
            </View>
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver plano</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="book-open" size={28} color={C.textMuted} />
          <Text style={styles.emptyCardTitle}>Nenhuma dieta ativa</Text>
          <Text style={styles.emptyCardText}>Seu nutricionista ainda não criou um plano para você.</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Próximas Consultas</Text>

      {upcomingAppointments.length === 0 ? (
        <View style={styles.emptyAppointments}>
          <Feather name="calendar" size={24} color={C.textMuted} />
          <Text style={styles.emptyText}>Nenhuma consulta agendada</Text>
        </View>
      ) : (
        upcomingAppointments.map((appt) => (
          <View key={appt.id} style={styles.appointmentCard}>
            <View style={styles.apptDateColumn}>
              <Text style={styles.apptDay}>{new Date(appt.scheduledAt).getDate()}</Text>
              <Text style={styles.apptMonth}>
                {new Date(appt.scheduledAt).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
              </Text>
            </View>
            <View style={styles.apptDivider} />
            <View style={styles.apptInfo}>
              <Text style={styles.apptType}>{getTypeLabel(appt.type)}</Text>
              <Text style={styles.apptTime}>
                <Feather name="clock" size={12} color={C.textMuted} /> {formatTime(appt.scheduledAt)}
              </Text>
              {appt.notes ? (
                <Text style={styles.apptNotes} numberOfLines={1}>{appt.notes}</Text>
              ) : null}
            </View>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(appt.status) }]} />
          </View>
        ))
      )}

      {activeDiet && activeDiet.meals?.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Refeições de Hoje</Text>
          {activeDiet.meals.slice(0, 4).map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealTimeTag}>
                <Text style={styles.mealTimeText}>{meal.time || "--:--"}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                {meal.description ? (
                  <Text style={styles.mealDesc} numberOfLines={1}>{meal.description}</Text>
                ) : null}
                {meal.foods && meal.foods.length > 0 ? (
                  <Text style={styles.mealFoods} numberOfLines={1}>
                    {meal.foods.map((f) => f.name).join(", ")}
                  </Text>
                ) : null}
              </View>
              {meal.calories ? (
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              ) : null}
            </View>
          ))}
          {activeDiet.meals.length > 4 && (
            <TouchableOpacity onPress={() => router.push(`/diet/${activeDiet.id}`)}>
              <Text style={styles.viewMoreText}>Ver todas as refeições →</Text>
            </TouchableOpacity>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.backgroundSecondary },
  content: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { fontFamily: "Inter_700Bold", fontSize: 26, color: C.text },
  subGreeting: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, marginTop: 2 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#fff" },
  activeDietCard: {
    borderRadius: 20,
    backgroundColor: C.tint,
    padding: 20,
    marginBottom: 28,
    shadowColor: C.tint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  activeDietHeader: { flexDirection: "row", marginBottom: 10 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#fff" },
  activeDietName: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff", marginBottom: 6 },
  activeDietDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  activeDietFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mealCount: { flexDirection: "row", alignItems: "center", gap: 6 },
  mealCountText: { fontFamily: "Inter_500Medium", fontSize: 13, color: "rgba(255,255,255,0.9)" },
  viewButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewButtonText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff" },
  emptyCard: {
    alignItems: "center",
    padding: 28,
    backgroundColor: C.card,
    borderRadius: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  emptyCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: C.text },
  emptyCardText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary, textAlign: "center" },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: C.text, marginBottom: 14 },
  emptyAppointments: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
    padding: 18,
    borderRadius: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary },
  appointmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  apptDateColumn: { alignItems: "center", width: 44 },
  apptDay: { fontFamily: "Inter_700Bold", fontSize: 22, color: C.tint },
  apptMonth: { fontFamily: "Inter_500Medium", fontSize: 11, color: C.textSecondary, textTransform: "uppercase" },
  apptDivider: { width: 1, height: 40, backgroundColor: C.border, marginHorizontal: 14 },
  apptInfo: { flex: 1 },
  apptType: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text },
  apptTime: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary, marginTop: 2 },
  apptNotes: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  mealTimeTag: {
    backgroundColor: C.tintLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 12,
    minWidth: 52,
    alignItems: "center",
  },
  mealTimeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.tintDark },
  mealInfo: { flex: 1 },
  mealName: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.text },
  mealDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary, marginTop: 2 },
  mealFoods: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted, marginTop: 1 },
  mealCalories: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.tint },
  viewMoreText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.tint, textAlign: "center", paddingVertical: 12 },
});
