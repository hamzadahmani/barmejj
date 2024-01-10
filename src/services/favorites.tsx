import axios from './request';

export const getFavoritesAPI = async () => {
  const response = await axios.get<any>('getAllFavorites');
  return response.data;
};

export const addFavoritesAPI = async (data: any) => {
  const response = await axios.post<any>(
    `addFavorite?idPlace=${data.idPlace}`,
    data,
  );
  return response.data;
};

export const deleteFavoritesAPI = async (id: string) => {
  const response = await axios.delete<any>(
    `deleteFavoritePlaceByIdPlaceAndUser/${id}`,
  );
  return response.data;
};
