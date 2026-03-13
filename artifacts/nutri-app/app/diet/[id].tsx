import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";
import { getDiet, Meal, FoodItem } from "@/lib/api";
import Colors from "@/constants/colors";

const C = Colors.light;

function FoodRow({ food }: { food: FoodItem }) {
  return (
    <View style={styles.foodRow}>
      <View style={styles.foodDot} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodQty}>{food.quantity}</Text>
      </View>
      {food.calories ? (
        <Text style={styles.foodCals}>{food.calories} kcal</Text>
      ) : null}
    </View>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const totalCals = meal.foods?.reduce((s, f) => s + (f.calories ?? 0), 0) ?? meal.calories ?? 0;

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealTimeTag}>
          <Feather name="clock" size={12} color={C.tintDark} />
          <Text style={styles.mealTimeText}>{meal.time || "--:--"}</Text>
        </View>
        <Text style={styles.mealOrder}>#{meal.order + 1}</Text>
      </View>

      <Text style={styles.mealName}>{meal.name}</Text>

      {meal.description ? (
        <Text style={styles.mealDesc}>{meal.description}</Text>
      ) : null}

      {meal.foods && meal.foods.length > 0 && (
        <View style={styles.foodsList}>
          <Text style={styles.foodsTitle}>Alimentos</Text>
          {meal.foods.map((food, i) => (
            <FoodRow key={i} food={food} />
          ))}
        </View>
      )}

      {totalCals > 0 && (
        <View style={styles.calsBadge}>
          <Feather name="zap" size={13} color={C.warning} />
          <Text style={styles.calsText}>{Math.round(totalCals)} kcal</Text>
        </View>
      )}
    </View>
  );
}

export default function DietDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    getUser().then((u) => { if (!u) router.replace("/login"); });
  }, []);

  const { data: diet, isLoading } = useQuery({
    queryKey: ["diet", id],
    queryFn: () => getDiet(Number(id)),
    enabled: !!id,
  });

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const totalCals = diet?.totalCalories || diet?.meals?.reduce((s, m) => s + (m.calories ?? 0), 0) || 0;

  if (isLoading || !diet) {
    return (
      <View style={[styles.centered, { paddingTop: topPadding + 60 }]}>
        <ActivityIndicator size="large" color={C.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Plano Alimentar</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dietHero}>
          {diet.isActive && (
            <View style={styles.activeBadge}>
              <Feather name="check-circle" size={12} color={C.tintDark} />
              <Text style={styles.activeBadgeText}>Plano Ativo</Text>
            </View>
          )}
          <Text style={styles.dietName}>{diet.name}</Text>
          {diet.description ? (
            <Text style={styles.dietDesc}>{diet.description}</Text>
          ) : null}

          <View style={styles.dietMeta}>
            {diet.startDate && (
              <View style={styles.metaItem}>
                <Feather name="calendar" size={14} color={C.textSecondary} />
                <Text style={styles.metaText}>
                  {new Date(diet.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  {diet.endDate ? ` – ${new Date(diet.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}` : ""}
                </Text>
              </View>
            )}
            {totalCals > 0 && (
              <View style={styles.metaItem}>
                <Feather name="zap" size={14} color={C.textSecondary} />
                <Text style={styles.metaText}>{Math.round(totalCals)} kcal/dia</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Feather name="coffee" size={14} color={C.textSecondary} />
              <Text style={styles.metaText}>{diet.meals?.length ?? 0} refeições</Text>
            </View>
          </View>
        </View>

        {diet.meals && diet.meals.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Refeições</Text>
            {diet.meals
              .sort((a, b) => a.order - b.order)
              .map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
          </>
        ) : (
          <View style={styles.emptyMeals}>
            <Feather name="coffee" size={28} color={C.textMuted} />
            <Text style={styles.emptyText}>Nenhuma refeição cadastrada ainda</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.backgroundSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.backgroundSecondary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: C.backgroundSecondary,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  headerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: C.text, flex: 1, textAlign: "center" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  dietHero: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: C.tintLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  activeBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: C.tintDark },
  dietName: { fontFamily: "Inter_700Bold", fontSize: 22, color: C.text, marginBottom: 8 },
  dietDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary, marginBottom: 16, lineHeight: 20 },
  dietMeta: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.textSecondary },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: C.text, marginBottom: 14 },
  mealCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  mealHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  mealTimeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.tintLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  mealTimeText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.tintDark },
  mealOrder: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted },
  mealName: { fontFamily: "Inter_700Bold", fontSize: 17, color: C.text, marginBottom: 4 },
  mealDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textSecondary, marginBottom: 14, lineHeight: 19 },
  foodsList: { marginTop: 8 },
  foodsTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  foodRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, gap: 10 },
  foodDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.tint, marginTop: 6 },
  foodInfo: { flex: 1 },
  foodName: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.text },
  foodQty: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary, marginTop: 1 },
  foodCals: { fontFamily: "Inter_500Medium", fontSize: 12, color: C.textMuted },
  calsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
    marginTop: 12,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  calsText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: "#D97706" },
  emptyMeals: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textSecondary },
});
