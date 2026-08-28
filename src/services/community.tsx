import axios from './request';

export const createReviewAPI = async (data: any) => (await axios.post('reviews', data)).data;
export const getPlaceReviewsAPI = async (placeId: number) => (await axios.get(`places/${placeId}/reviews`)).data;

export const getMyWaitlistAPI = async () => (await axios.get('waitlist/mine')).data;
export const joinWaitlistAPI = async (data: any) => (await axios.post('waitlist', data)).data;
export const cancelWaitlistAPI = async (id: number) => axios.patch(`waitlist/${id}/cancel`);
export const confirmWaitlistAPI = async (id: number) => (await axios.post(`waitlist/${id}/confirm`)).data;

export const getGroupPlansAPI = async () => (await axios.get('group-plans')).data;
export const createGroupPlanAPI = async (data: any) => (await axios.post('group-plans', data)).data;
export const voteGroupOptionAPI = async (id: number) => axios.post(`group-options/${id}/vote`);
export const finalizeGroupPlanAPI = async (id: number) => (await axios.post(`group-plans/${id}/finalize`)).data;

export const getAssistantSuggestionsAPI = async ({queryKey}: any) => {
  const [, params] = queryKey;
  return (await axios.get('assistant/suggestions', {params})).data;
};
