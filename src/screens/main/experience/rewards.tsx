import {queryKeys, mutationEffects} from '../../../query/keys';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useMutation, useQuery} from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import CommunityHeader from '../../../components/communityHeader';
import {Color} from '../../../helpers/constatn';
import {
  claimLoyaltyRewardAPI,
  getLoyaltyAccountsAPI,
  LoyaltyRedemption,
  LoyaltyReward,
} from '../../../services/loyalty';
import VectorIcon from '../../../components/vectorIcon';

export default function LoyaltyRewardsScreen({navigation}: any) {
  const {
    data = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.loyaltyAccounts,
    queryFn: getLoyaltyAccountsAPI,
  });
  const [voucher, setVoucher] = useState<LoyaltyRedemption | null>(null);

  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!voucher) return;
    const refresh = () =>
      setSeconds(
        Math.max(
          0,
          Math.floor(
            (new Date(voucher.expiresAt).getTime() - Date.now()) / 1000,
          ),
        ),
      );
    refresh();
    const timer = setInterval(refresh, 1000);
    return () => clearInterval(timer);
  }, [voucher]);
  const rewardMutation = useMutation({
    mutationFn: (reward: LoyaltyReward) => claimLoyaltyRewardAPI(reward.id),
    meta: mutationEffects.loyalty,
    onSuccess: setVoucher,
    onError: (error: any) =>
      Alert.alert(
        'Récompense indisponible',
        error?.response?.data?.message || 'Veuillez réessayer.',
      ),
  });
  const claiming = rewardMutation.isPending
    ? rewardMutation.variables?.id
    : null;
  const claim = (reward: LoyaltyReward) => {
    if (!rewardMutation.isPending) rewardMutation.mutate(reward);
  };
  return (
    <View style={s.screen}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            colors={[Color.main]}
            tintColor={Color.main}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.page}>
        <CommunityHeader
          title="Mes récompenses"
          subtitle="Chaque établissement possède son propre programme et ses cadeaux."
          eyebrow="VOS AVANTAGES"
          onBack={() => navigation.goBack()}
        />
        <View style={s.tip}>
          <Text style={s.tipTitle}>Comment ça marche ?</Text>
          <Text style={s.tipText}>
            Une visite terminée ajoute des points. Choisissez un cadeau, puis
            présentez son QR temporaire à l’établissement.
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator
            color={Color.main}
            size="large"
            style={layoutStyles.style1}
          />
        ) : data.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <VectorIcon name="gift" size={34} color={Color.main} />
            </View>
            <Text style={s.emptyTitle}>Vos cadeaux arriveront ici</Text>
            <Text style={s.emptyText}>
              Terminez une réservation chez un établissement partenaire pour
              gagner vos premiers points.
            </Text>
          </View>
        ) : (
          data.map(account => (
            <View key={account.placeId} style={s.placeCard}>
              <View style={s.placeHead}>
                {account.placeImage ? (
                  <Image
                    source={{uri: account.placeImage}}
                    style={s.placeImage}
                  />
                ) : (
                  <View style={[s.placeImage, s.fallback]}>
                    <Text>★</Text>
                  </View>
                )}
                <View style={s.grow}>
                  <Text style={s.placeName}>{account.placeName}</Text>
                  <Text style={s.earn}>
                    +{account.pointsPerVisit} pts par visite terminée
                  </Text>
                </View>
                <View style={s.balance}>
                  <Text style={s.balanceValue}>{account.balance}</Text>
                  <Text style={s.balanceLabel}>POINTS</Text>
                </View>
              </View>
              <View style={s.progressTrack}>
                <View
                  style={[s.progressFill, {width: `${account.progress}%`}]}
                />
              </View>
              <Text style={s.sectionLabel}>RÉCOMPENSES DISPONIBLES</Text>
              {account.rewards.map(reward => (
                <View
                  key={reward.id}
                  style={[s.reward, !reward.available && s.rewardMuted]}>
                  <View style={s.gift}>
                    <VectorIcon name="gift" size={21} color={Color.main} />
                  </View>
                  <View style={s.grow}>
                    <Text style={s.rewardName}>{reward.name}</Text>
                    {reward.description ? (
                      <Text style={s.rewardDescription}>
                        {reward.description}
                      </Text>
                    ) : null}
                    <Text style={s.cost}>
                      {reward.pointsCost} points
                      {reward.stock != null
                        ? ` · ${reward.stock} restant(s)`
                        : ''}
                    </Text>
                  </View>
                  <Pressable
                    disabled={!reward.canClaim || rewardMutation.isPending}
                    onPress={() => claim(reward)}
                    style={[
                      s.claim,
                      reward.canClaim ? s.claimActive : s.claimDisabled,
                    ]}>
                    {claiming === reward.id ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text
                        style={[
                          s.claimText,
                          !reward.canClaim && s.claimTextDisabled,
                        ]}>
                        {reward.canClaim
                          ? 'Choisir'
                          : `${reward.pointsMissing} pts`}
                      </Text>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      <Modal
        visible={Boolean(voucher)}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setVoucher(null);
          refetch();
        }}>
        <View style={s.overlay}>
          <View style={s.ticket}>
            <View style={s.ticketHandle} />
            <Text style={s.ticketOverline}>BON DE RÉCOMPENSE</Text>
            <Text style={s.ticketTitle}>{voucher?.reward.name}</Text>
            <Text style={s.ticketPlace}>{voucher?.place.name}</Text>
            <View style={s.qr}>
              {voucher ? (
                <QRCode
                  value={voucher.token}
                  size={190}
                  color="#181126"
                  backgroundColor="white"
                />
              ) : null}
            </View>
            <Text style={s.scanText}>Présentez ce code au personnel</Text>
            <Text style={[s.timer, seconds <= 60 && layoutStyles.style2]}>
              {seconds > 0
                ? `Expire dans ${Math.floor(seconds / 60)}:${String(
                    seconds % 60,
                  ).padStart(2, '0')}`
                : 'QR expiré'}
            </Text>
            <View style={s.dashed} />
            <View style={s.ticketRow}>
              <Text style={s.ticketMeta}>VALEUR</Text>
              <Text style={s.ticketMetaValue}>
                {voucher?.pointsCost} points
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setVoucher(null);
                refetch();
              }}
              style={s.close}>
              <Text style={s.closeText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Color.background},
  page: {paddingHorizontal: 18, paddingBottom: 120},
  tip: {
    backgroundColor: '#FFF4E2',
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  tipTitle: {fontSize: 14, fontWeight: '900', color: '#6B4312'},
  tipText: {fontSize: 11, lineHeight: 17, color: '#7B6852', marginTop: 4},
  placeCard: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAE5EF',
  },
  placeHead: {flexDirection: 'row', alignItems: 'center'},
  placeImage: {width: 53, height: 53, borderRadius: 17},
  fallback: {
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {flex: 1, marginLeft: 11},
  placeName: {fontSize: 17, fontWeight: '900', color: Color.text},
  earn: {fontSize: 10, color: Color.muted, marginTop: 3},
  balance: {
    backgroundColor: Color.main,
    borderRadius: 16,
    minWidth: 66,
    paddingVertical: 8,
    alignItems: 'center',
  },
  balanceValue: {fontSize: 20, fontWeight: '900', color: 'white'},
  balanceLabel: {fontSize: 7, fontWeight: '900', color: '#DCD4ED'},
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EFEAF4',
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {height: 6, borderRadius: 3, backgroundColor: '#FFB65B'},
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    color: Color.muted,
    marginTop: 17,
    marginBottom: 4,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECF3',
  },
  rewardMuted: {opacity: 0.58},
  gift: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F5EFFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftText: {fontSize: 19},
  rewardName: {fontSize: 13, fontWeight: '900', color: Color.text},
  rewardDescription: {
    fontSize: 9,
    lineHeight: 13,
    color: Color.muted,
    marginTop: 2,
  },
  cost: {fontSize: 10, fontWeight: '800', color: Color.main, marginTop: 4},
  claim: {
    minWidth: 68,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  claimActive: {backgroundColor: Color.main},
  claimDisabled: {backgroundColor: '#EEEAF2'},
  claimText: {fontSize: 10, fontWeight: '900', color: 'white'},
  claimTextDisabled: {color: '#8C8594'},
  empty: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 23,
    backgroundColor: '#F5EFFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Color.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    color: Color.muted,
    marginTop: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,14,31,.72)',
    justifyContent: 'flex-end',
  },
  ticket: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 25,
    alignItems: 'center',
  },
  ticketHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DED9E4',
    marginBottom: 19,
  },
  ticketOverline: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#FF9F2E',
  },
  ticketTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Color.text,
    marginTop: 6,
    textAlign: 'center',
  },
  ticketPlace: {fontSize: 12, color: Color.muted, marginTop: 4},
  qr: {
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9E3EF',
    marginTop: 18,
  },
  scanText: {fontSize: 11, color: Color.muted, marginTop: 13},
  timer: {fontSize: 13, fontWeight: '900', color: '#248B57', marginTop: 5},
  dashed: {
    width: '100%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D8D1DF',
    marginVertical: 17,
  },
  ticketRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketMeta: {fontSize: 9, fontWeight: '900', color: Color.muted},
  ticketMetaValue: {fontSize: 13, fontWeight: '900', color: Color.text},
  close: {
    width: '100%',
    height: 52,
    borderRadius: 17,
    backgroundColor: Color.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  closeText: {fontSize: 14, fontWeight: '900', color: 'white'},
});

const layoutStyles = {
style1: {marginTop: 40},
style2: {color: '#D94C4C'}
} as const;
