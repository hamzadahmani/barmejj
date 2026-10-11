import axios from './request';

export type LoyaltyAccount = {
  placeId: number;
  placeName: string;
  placeImage?: string;
  balance: number;
  lifetimePoints: number;
  pointsPerVisit: number;
  rewards: LoyaltyReward[];
  nextReward?: LoyaltyReward | null;
  progress: number;
};

export type LoyaltyReward = {
  id: number;
  placeId: number;
  name: string;
  description?: string | null;
  pointsCost: number;
  active: boolean;
  stock?: number | null;
  expiresAt?: string | null;
  available: boolean;
  canClaim: boolean;
  pointsMissing: number;
};
export type LoyaltyRedemption = {
  id: number;
  token: string;
  status: 'PENDING' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';
  pointsCost: number;
  expiresAt: string;
  reward: LoyaltyReward;
  place: {id: number; name: string; image?: string | null};
};

export const getLoyaltyAccountsAPI = async () => {
  const response = await axios.get<LoyaltyAccount[]>('loyalty');
  return response.data;
};

// Fiche d'un lieu : l'absence de programme n'est pas une erreur à afficher.
export const getLoyaltyPlaceAPI = async (placeId: number) => {
  try {
    return (await axios.get(`loyalty/${placeId}`, {silentError: true})).data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};
export const claimLoyaltyRewardAPI = async (rewardId: number) =>
  (await axios.post<LoyaltyRedemption>(`loyalty/rewards/${rewardId}/claim`))
    .data;
export const cancelLoyaltyRedemptionAPI = async (redemptionId: number) =>
  (await axios.post(`loyalty/redemptions/${redemptionId}/cancel`)).data;
