import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { HomeBannerSlider } from "@/features/home/components/HomeBannerSlider";
import { HomeMyTeams } from "@/features/home/components/HomeMyTeams";
import { HomeNextMatch } from "@/features/home/components/HomeNextMatch";
import { HomePendingActions } from "@/features/home/components/HomePendingActions";
import { HomePopularShorts } from "@/features/home/components/HomePopularShorts";
import { HomeQuickActions } from "@/features/home/components/HomeQuickActions";
import { HomeRecentResults } from "@/features/home/components/HomeRecentResults";
import { HomeRegionRank } from "@/features/home/components/HomeRegionRank";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import { getHomeCopy } from "@/features/home/home-copy";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { usePendingActions } from "@/hooks/home/usePendingActions";
import { useProfile } from "@/hooks/useProfile";

function HomeGateCard(props: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}): JSX.Element {
  const { title, body, primaryLabel, onPrimaryPress, secondaryLabel, onSecondaryPress } = props;

  return (
    <View style={styles.gateWrap}>
      <View style={styles.gateCard}>
        <Text style={styles.gateTitle}>{title}</Text>
        <Text style={styles.gateBody}>{body}</Text>
        <View style={styles.gateActions}>
          <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} />
          {secondaryLabel && onSecondaryPress ? (
            <PrimaryButton label={secondaryLabel} onPress={onSecondaryPress} variant="secondary" />
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getHomeCopy(language);
  const auth = useAuth();
  const profile = useProfile({ enabled: auth.isAuthenticated });
  const userId = auth.user?.id ?? null;

  const onboarding = useOnboardingStatus({
    userId,
    enabled: auth.isAuthenticated,
    hasCommonProfile: profile.hasProfile,
  });

  const isGateLoading =
    auth.isLoading ||
    (auth.isAuthenticated && profile.isProfileLoading) ||
    (auth.isAuthenticated && profile.hasProfile && onboarding.isLoading);

  const isProfileReady = auth.isAuthenticated && profile.hasProfile && onboarding.isOnboardingComplete;
  usePendingActions(userId, isProfileReady);
  const onboardingCTA = onboarding.onboardingCTA;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HomeBannerSlider copy={copy} />
        <HomeQuickActions copy={copy} />

        {isGateLoading ? (
          <>
            <View style={styles.sectionPad}>
              <HomeSectionSkeleton height={184} />
            </View>
            <View style={styles.sectionPad}>
              <HomeSectionSkeleton height={120} />
            </View>
            <View style={styles.sectionPad}>
              <HomeSectionSkeleton count={2} height={92} />
            </View>
          </>
        ) : !auth.isAuthenticated ? (
          <HomeGateCard
            title={copy.onboardingTitle}
            body={copy.needProfileBody}
            primaryLabel={copy.login}
            onPrimaryPress={() => router.push("/(auth)/login")}
          />
        ) : !profile.hasProfile ? (
          <HomeGateCard
            title={copy.needProfileTitle}
            body={copy.needProfileBody}
            primaryLabel={copy.continueOnboarding}
            onPrimaryPress={() => router.push("/(onboarding)/create-profile")}
            secondaryLabel={copy.notifications}
            onSecondaryPress={() => router.push("/(settings)/settings")}
          />
        ) : onboardingCTA ? (
          <HomeGateCard
            title={onboardingCTA.title}
            body={onboardingCTA.description}
            primaryLabel={onboardingCTA.buttonLabel}
            onPrimaryPress={() => router.push(onboardingCTA.route)}
          />
        ) : (
          <>
            {onboarding.showFacilityRegistrationCTA ? (
              <HomeGateCard
                title="운동장을 등록해주세요"
                body="시설 관리자는 운동장을 등록하면 예약 현황과 수익을 바로 확인할 수 있어요."
                primaryLabel="운동장 등록하기"
                onPrimaryPress={() => router.push("/(tabs)/facility-management")}
              />
            ) : null}
            <HomeNextMatch copy={copy} enabled={isProfileReady} language={language} userId={userId} />
            <HomeMyTeams copy={copy} enabled={isProfileReady} userId={userId} />
            <HomePendingActions copy={copy} enabled={isProfileReady} userId={userId} />
            <HomeRecentResults copy={copy} enabled={isProfileReady} language={language} userId={userId} />
            <HomeRegionRank copy={copy} enabled={isProfileReady} userId={userId} />
          </>
        )}

        <HomePopularShorts copy={copy} language={language} />

        {auth.errorMessage ? <Text style={styles.errorText}>{auth.errorMessage}</Text> : null}
        {!auth.errorMessage && profile.profileErrorMessage ? (
          <Text style={styles.errorText}>{profile.profileErrorMessage}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionPad: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gateWrap: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gateCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  gateTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  gateBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  gateActions: {
    marginTop: 18,
    gap: 10,
  },
  errorText: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 18,
    color: "#b91c1c",
  },
});
