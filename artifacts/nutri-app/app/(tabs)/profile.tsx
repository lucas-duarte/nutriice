import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getUser, logout } from "@/lib/auth";
import { getMyProfile } from "@/lib/api";
import Colors from "@/constants/colors";

const C = Colors.light;

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    getUser().then((u) => {
      if (!u) { router.replace("/login"); return; }
      setUserName(u.name);
    });
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: getMyProfile,
  });

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: topPadding }]}>
        <ActivityIndicator size="large" color={C.tint} />
      </View>
    );
  }

  function getGenderLabel(g?: string | null) {
    switch (g) {
      case "male": return "Masculino";
      case "female": return "Feminino";
      case "other": return "Outro";
      default: return undefined;
    }
  }

  const initials = (profile?.name || userName || "P")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Meu Perfil</Text>

      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{profile?.name || userName}</Text>
        <Text style={styles.profileEmail}>{profile?.email}</Text>
      </View>

      {(profile?.objective) && (
        <View style={styles.objectiveCard}>
          <Feather name="target" size={18} color={C.tint} />
          <View style={{ flex: 1 }}>
            <Text style={styles.objectiveLabel}>Objetivo</Text>
            <Text style={styles.objectiveText}>{profile.objective}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Telefone" value={profile?.phone} />
          <InfoRow label="Data de Nascimento" value={profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString("pt-BR") : null} />
          <InfoRow label="Sexo" value={getGenderLabel(profile?.gender)} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas</Text>
        <View style={styles.metricsRow}>
          {profile?.height ? (
            <View style={styles.metricCard}>
              <Feather name="trending-up" size={20} color={C.tint} />
              <Text style={styles.metricValue}>{profile.height} cm</Text>
              <Text style={styles.metricLabel}>Altura</Text>
            </View>
          ) : null}
          {profile?.weight ? (
            <View style={styles.metricCard}>
              <Feather name="activity" size={20} color={C.info} />
              <Text style={styles.metricValue}>{profile.weight} kg</Text>
              <Text style={styles.metricLabel}>Peso</Text>
            </View>
          ) : null}
          {profile?.height && profile?.weight ? (
            <View style={styles.metricCard}>
              <Feather name="bar-chart-2" size={20} color={C.warning} />
              <Text style={styles.metricValue}>
                {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}
              </Text>
              <Text style={styles.metricLabel}>IMC</Text>
            </View>
          ) : null}
        </View>
      </View>

      {profile?.observations ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.observationsCard}>
            <Text style={styles.observationsText}>{profile.observations}</Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
        <Feather name="log-out" size={18} color={C.error} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.backgroundSecondary },
  content: { paddingHorizontal: 20 },
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: C.text, marginBottom: 24 },
  profileHeader: { alignItems: "center", marginBottom: 24 },
  avatarLarge: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: C.tint, alignItems: "center", justifyContent: "center",
    shadowColor: C.tint, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    marginBottom: 14,
  },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 32, color: "#fff" },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 22, color: C.text, marginBottom: 4 },
  profileEmail: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary },
  objectiveCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.tintLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
  },
  objectiveLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.tintDark, marginBottom: 2 },
  objectiveText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.text, lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: C.text, marginBottom: 12 },
  infoCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  infoLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary },
  infoValue: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.text },
  metricsRow: { flexDirection: "row", gap: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  metricValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: C.text },
  metricLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary },
  observationsCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  observationsText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.text, lineHeight: 22 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  logoutText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: C.error },
});
