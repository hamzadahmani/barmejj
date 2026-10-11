// Keep resource prefixes stable: mutations invalidate every parameter variant.
export const queryKeys = {
  adminReservations: ['adminReservations'] as const,
  discovery: ['discovery'] as const,
  favorites: ['favorites'] as const,
  featuredPlaces: ['featuredPlaces'] as const,
  getAllPlacesByCategorie: ['getAllPlacesByCategorie'] as const,
  getPlaceById: ['getPlaceById'] as const,
  getPlacesBySearch: ['getPlacesBySearch'] as const,
  getPlacesNearMe: ['getPlacesNearMe'] as const,
  getReservationsById: ['getReservationsById'] as const,
  groupPlaceCatalog: ['groupPlaceCatalog'] as const,
  groupPlans: ['groupPlans'] as const,
  loyaltyAccounts: ['loyaltyAccounts'] as const,
  myWaitlist: ['myWaitlist'] as const,
  notifications: ['notifications'] as const,
  placeAvailability: ['placeAvailability'] as const,
  placeLoyalty: ['placeLoyalty'] as const,
  placeReviews: ['placeReviews'] as const,
  stayAvailability: ['stayAvailability'] as const,
  myStays: ['myStays'] as const,
  placesByInterest: ['placesByInterest'] as const,
  profile: ['profile'] as const,
  reservations: ['reservations'] as const,
  upcomingReservation: ['upcomingReservation'] as const,
  'video-feed-v1': ['video-feed-v1'] as const,
};

// Invalidate dependent screens only after a successful write.
export const mutationEffects = {
  favorites: {invalidates: [queryKeys.favorites, queryKeys.discovery]},
  stays: {invalidates: [queryKeys.stayAvailability, queryKeys.myStays]},
  profile: {
    invalidates: [
      queryKeys.profile,
      queryKeys.discovery,
      queryKeys['video-feed-v1'],
    ],
  },
  reservation: {
    invalidates: [
      queryKeys.reservations,
      queryKeys.adminReservations,
      queryKeys.getReservationsById,
      queryKeys.upcomingReservation,
      queryKeys.placeAvailability,
      queryKeys.myWaitlist,
      queryKeys.groupPlans,
      queryKeys.notifications,
    ],
  },
  groupPlan: {invalidates: [queryKeys.groupPlans]},
  waitlist: {invalidates: [queryKeys.myWaitlist]},
  review: {
    invalidates: [
      queryKeys.reservations,
      queryKeys.placeReviews,
      queryKeys.getPlaceById,
      queryKeys.discovery,
    ],
  },
  notification: {invalidates: [queryKeys.notifications]},
  loyalty: {
    invalidates: [queryKeys.loyaltyAccounts, queryKeys.placeLoyalty],
  },
};
