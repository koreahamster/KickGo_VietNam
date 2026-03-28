import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import { Image, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from "react-native";

import { getActivePaymentAccount, getPaymentProviderColors, getPaymentProviderLabel } from "@/features/team-fee.helpers";
import type { TeamFeeCopy } from "@/features/team-fee.copy";
import type { TeamPaymentAccount, TeamPaymentProvider } from "@/types/team-fee.types";

type TeamFeeAccountsPanelProps = {
  copy: TeamFeeCopy;
  accounts: TeamPaymentAccount[];
  canManage: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  onUploadQr: (provider: TeamPaymentProvider, imageUri: string) => Promise<string>;
  onSubmitAccount: (input: {
    provider: TeamPaymentProvider;
    accountName: string;
    accountNumber: string;
    qrImageUrl: string;
  }) => Promise<void>;
};

type AccountDraft = {
  provider: TeamPaymentProvider;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string;
};

const PROVIDERS: TeamPaymentProvider[] = ["momo", "zalopay", "bank"];

export function TeamFeeAccountsPanel(props: TeamFeeAccountsPanelProps): JSX.Element {
  const { copy, accounts, canManage, isSubmitting, isUploading, onUploadQr, onSubmitAccount } = props;
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [draft, setDraft] = useState<AccountDraft>({ provider: "momo", accountName: "", accountNumber: "", qrImageUrl: "" });

  const orderedAccounts = useMemo(
    () => PROVIDERS.map((provider) => getActivePaymentAccount(accounts, provider)).filter((account): account is TeamPaymentAccount => Boolean(account)),
    [accounts],
  );

  const closeComposer = (): void => {
    if (isSubmitting || isUploading) {
      return;
    }
    setIsComposerOpen(false);
    setDraft({ provider: "momo", accountName: "", accountNumber: "", qrImageUrl: "" });
  };

  const handleOpenProvider = async (account: TeamPaymentAccount): Promise<void> => {
    if (account.provider === "bank") {
      await Share.share({ message: account.account_number ?? "" });
      return;
    }

    const scheme = account.provider === "momo" ? "momo://" : "zalopay://";
    const supported = await Linking.canOpenURL(scheme);
    if (!supported) {
      await Share.share({ message: account.account_number ?? account.account_name });
      return;
    }

    await Linking.openURL(scheme);
  };

  const handlePickQr = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const imageUri = result.assets[0]?.uri;
    if (!imageUri) {
      return;
    }

    const nextUrl = await onUploadQr(draft.provider, imageUri);
    setDraft((current) => ({ ...current, qrImageUrl: nextUrl }));
  };

  const handleSave = async (): Promise<void> => {
    if (!draft.accountName.trim() || !draft.qrImageUrl) {
      return;
    }

    await onSubmitAccount({
      provider: draft.provider,
      accountName: draft.accountName.trim(),
      accountNumber: draft.accountNumber.trim(),
      qrImageUrl: draft.qrImageUrl,
    });
    closeComposer();
  };

  return (
    <View style={styles.panelWrap}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{copy.accountsTitle}</Text>
        {canManage ? (
          <Pressable onPress={() => setIsComposerOpen(true)} style={({ pressed }) => [styles.addButton, pressed ? styles.pressed : null]}>
            <Ionicons color="#ffffff" name="add" size={16} />
            <Text style={styles.addButtonLabel}>{copy.accountAdd}</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.cardList}>
        {orderedAccounts.length === 0 ? <Text style={styles.emptyLabel}>{copy.accountsEmpty}</Text> : null}
        {orderedAccounts.map((account) => {
          const tone = getPaymentProviderColors(account.provider);
          return (
            <View key={account.id} style={[styles.accountCard, { backgroundColor: tone.backgroundColor }]}> 
              <View style={styles.accountHeader}>
                <View>
                  <Text style={[styles.providerLabel, { color: tone.accentColor }]}>{getPaymentProviderLabel(copy, account.provider)}</Text>
                  <Text style={styles.accountName}>{account.account_name}</Text>
                  {account.account_number ? <Text style={styles.accountNumber}>{account.account_number}</Text> : null}
                </View>
                <Ionicons color={tone.accentColor} name="qr-code-outline" size={28} />
              </View>

              {account.qr_image_url ? (
                <Pressable onPress={() => setPreviewUrl(account.qr_image_url)} style={({ pressed }) => [styles.qrPreviewCard, pressed ? styles.pressed : null]}>
                  <Image source={{ uri: account.qr_image_url }} style={styles.qrPreviewImage} />
                  <Text style={styles.qrPreviewLabel}>{copy.qrPreview}</Text>
                </Pressable>
              ) : (
                <Text style={styles.emptyLabel}>{copy.noQrPreview}</Text>
              )}

              <Pressable onPress={() => void handleOpenProvider(account)} style={({ pressed }) => [styles.openButton, pressed ? styles.pressed : null]}>
                <Text style={styles.openButtonLabel}>{account.provider === "bank" ? copy.accountShareBank : copy.accountOpenApp}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Modal animationType="slide" onRequestClose={closeComposer} transparent visible={isComposerOpen}>
        <Pressable onPress={closeComposer} style={styles.overlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{copy.accountFormTitle}</Text>
              <Pressable onPress={closeComposer} style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}>
                <Ionicons color="#111827" name="close" size={18} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.accountsTitle}</Text>
                <View style={styles.providerRow}>
                  {PROVIDERS.map((provider) => {
                    const selected = draft.provider === provider;
                    return (
                      <Pressable
                        key={provider}
                        onPress={() => setDraft((current) => ({ ...current, provider, qrImageUrl: current.provider === provider ? current.qrImageUrl : "" }))}
                        style={({ pressed }) => [styles.providerPill, selected ? styles.providerPillActive : null, pressed ? styles.pressed : null]}
                      >
                        <Text style={[styles.providerPillLabel, selected ? styles.providerPillLabelActive : null]}>{getPaymentProviderLabel(copy, provider)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.accountName}</Text>
                <TextInput
                  onChangeText={(value) => setDraft((current) => ({ ...current, accountName: value }))}
                  placeholder={copy.accountName}
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={draft.accountName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.accountNumber}</Text>
                <TextInput
                  onChangeText={(value) => setDraft((current) => ({ ...current, accountNumber: value }))}
                  placeholder={copy.accountNumber}
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={draft.accountNumber}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{copy.qrUpload}</Text>
                <Pressable disabled={isUploading} onPress={() => void handlePickQr()} style={({ pressed }) => [styles.uploadButton, (pressed || isUploading) ? styles.pressed : null]}>
                  <Ionicons color="#111827" name="image-outline" size={18} />
                  <Text style={styles.uploadButtonLabel}>{isUploading ? copy.qrUploadPending : copy.qrUpload}</Text>
                </Pressable>
                {draft.qrImageUrl ? (
                  <Pressable onPress={() => setPreviewUrl(draft.qrImageUrl)} style={({ pressed }) => [styles.inlinePreviewWrap, pressed ? styles.pressed : null]}>
                    <Image source={{ uri: draft.qrImageUrl }} style={styles.inlinePreviewImage} />
                    <Text style={styles.qrPreviewLabel}>{copy.qrPreview}</Text>
                  </Pressable>
                ) : null}
              </View>

              <Pressable disabled={isSubmitting || isUploading} onPress={() => void handleSave()} style={({ pressed }) => [styles.submitButton, (pressed || isSubmitting || isUploading) ? styles.pressed : null]}>
                <Text style={styles.submitButtonLabel}>{copy.save}</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setPreviewUrl(null)} transparent visible={Boolean(previewUrl)}>
        <Pressable onPress={() => setPreviewUrl(null)} style={styles.previewOverlay}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.previewCard}>
            {previewUrl ? <Image resizeMode="contain" source={{ uri: previewUrl }} style={styles.previewImage} /> : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  panelWrap: { gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  addButton: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8 },
  addButtonLabel: { fontSize: 12, fontWeight: "700", color: "#ffffff" },
  cardList: { gap: 14 },
  emptyLabel: { fontSize: 14, lineHeight: 20, color: "#6b7280" },
  accountCard: { borderRadius: 20, padding: 18, gap: 14 },
  accountHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  providerLabel: { fontSize: 13, fontWeight: "800" },
  accountName: { marginTop: 4, fontSize: 16, fontWeight: "800", color: "#111827" },
  accountNumber: { marginTop: 4, fontSize: 13, color: "#4b5563" },
  qrPreviewCard: { borderRadius: 16, backgroundColor: "rgba(255,255,255,0.7)", padding: 12, alignItems: "center", gap: 10 },
  qrPreviewImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: "#ffffff" },
  qrPreviewLabel: { fontSize: 13, fontWeight: "700", color: "#111827" },
  openButton: { minHeight: 46, borderRadius: 14, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  openButtonLabel: { fontSize: 14, fontWeight: "800", color: "#111827" },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15,23,42,0.36)" },
  sheet: { maxHeight: "88%", borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#ffffff", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  closeButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" },
  fieldGroup: { marginBottom: 16, gap: 8 },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  providerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  providerPill: { borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 9 },
  providerPillActive: { borderColor: "#16a34a", backgroundColor: "#ecfdf5" },
  providerPillLabel: { fontSize: 13, fontWeight: "700", color: "#4b5563" },
  providerPillLabelActive: { color: "#166534" },
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 14, fontSize: 15, color: "#111827" },
  uploadButton: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  uploadButtonLabel: { fontSize: 14, fontWeight: "700", color: "#111827" },
  inlinePreviewWrap: { marginTop: 4, borderRadius: 14, backgroundColor: "#f9fafb", padding: 12, alignItems: "center", gap: 8 },
  inlinePreviewImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: "#ffffff" },
  submitButton: { marginTop: 8, minHeight: 52, borderRadius: 14, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" },
  submitButtonLabel: { fontSize: 15, fontWeight: "800", color: "#ffffff" },
  previewOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.88)", alignItems: "center", justifyContent: "center", padding: 24 },
  previewCard: { width: "100%", borderRadius: 24, backgroundColor: "#111827", padding: 16, alignItems: "center", justifyContent: "center" },
  previewImage: { width: "100%", height: 360 },
  pressed: { opacity: 0.88 },
});
