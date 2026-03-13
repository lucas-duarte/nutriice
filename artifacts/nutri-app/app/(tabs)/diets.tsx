import React, { useEffect } from "react";
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
import { getMyDiets, DietPlan } from "@/lib/api";
import Colors from "@/constants/colors";

const C = Colors.light;

export default function DietsScreen() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    getUser().then((u) => {
      if (!u) router.replace("/login");
    });
  }, []);

  const { data: diets, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["myDiets"],
    queryFn: getMyDiets,
  });

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

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
      <Text style={styles.pageTitle}>Meus Planos</Text>
      <Text style={styles.pageSubtitle}>Planos alimentares prescritos pelo seu nutricionista</Text>

      {!diets || diets.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="book-open" size={32} color={C.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum plano ainda</Text>
          <Text style={styles.emptyText}>Seu nutricionista ainda não criou um plano alimentar para você.</Text>
        </View>
      ) : (
        diets.map((diet) => (
          <DietCard key={diet.id} diet={diet} onPress={() => router.push(`/diet/${diet.id}`)} />
        ))
      )}
    </ScrollView>
  );
}

function DietCard({ diet, onPress }: { diet: DietPlan; onPress: () => void }) {
  const mealCount = diet.meals?.length ?? 0;
  const totalCals = diet.totalCalories || diet.meals?.reduce((s, m) => s + (m.calories ?? 0), 0) || 0;

  return (
    <TouchableOpacity style={[styles.card, diet.isActive && styles.activeCard]} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          {diet.isActive && (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Ativo</Text>
            </View>
          )}
          <Text style={styles.cardTitle}>{diet.name}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={C.textMuted} />
      </View>

      {diet.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{diet.description}</Text>
      ) : null}

      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Feather name="coffee" size={14} color={C.tint} />
          <Text style={styles.statText}>{mealCount} refeições</Text>
        </View>
        {totalCals > 0 && (
          <View style={styles.stat}>
            <Feather name="zap" size={14} color={C.warning} />
            <Text style={styles.statText}>{Math.round(totalCals)} kcal/dia</Text>
          </View>
        )}
        {diet.startDate && (
          <View style={styles.stat}>
            <Feather name="calendar" size={14} color={C.info} />
            <Text style={styles.statText}>
              {new Date(diet.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.backgroundSecondary },
  content: { paddingHorizontal: 20 },
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: C.text, marginBottom: 4 },
  pageSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, marginBottom: 24 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: C.text },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, textAlign: "center", lineHeight: 20 },
  card: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activeCard: {
    borderColor: C.tint,
    borderWidth: 1.5,
    shadowColor: C.tint,
    shadowOpacity: 0.12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardTitleRow: { flex: 1, gap: 6 },
  activePill: {
    alignSelf: "flex-start",
    backgroundColor: C.tintLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activePillText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.tintDark },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text, flex: 1 },
  cardDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary, marginBottom: 14, lineHeight: 18 },
  cardStats: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  stat: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.textSecondary },
});
