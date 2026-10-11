import {queryKeys} from '../../query/keys';
import {keepPreviousData} from '@tanstack/react-query';
import {useQuery} from '@tanstack/react-query';
import {
  Box,
  Divider,
  Flex,
  Image,
  Input,
  Pressable,
  ScrollView,
  Spinner,
  Text,
} from 'native-base';
import React, {useState} from 'react';
import {Keyboard} from 'react-native';
import {Color} from '../../helpers/constatn';
import {isOpen} from '../../helpers/functions';
import {getPlacesBySearch} from '../../services/search';
import VectorIcon from '../vectorIcon';

export default function SearchBar({navigation, appearance = 'light'}: any) {
  const pearl = appearance === 'pearl';
  const palette = pearl
    ? {
        ...Color,
        main: '#7251C9',
        mainLight: '#EEE8FC',
        border: '#E6E0F1',
        text: '#242337',
        muted: '#706A80',
      }
    : Color;
  const surface = pearl ? '#FFFFFF' : 'white';
  const selectedSurface = pearl ? '#7151BD' : palette.main;
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [verified, setVerified] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sort, setSort] = useState('relevance');
  const [ambience, setAmbience] = useState<string | undefined>();
  const [openNow, setOpenNow] = useState(false);
  const normalizedQuery = query.trim();
  const searchEnabled =
    normalizedQuery.length >= 2 ||
    verified ||
    openNow ||
    Boolean(maxPrice) ||
    Boolean(ambience);
  const filters = {
    query: normalizedQuery,
    verified: verified ? 'true' : undefined,
    openNow: openNow ? 'true' : undefined,
    maxPrice,
    sort,
    ambience,
  };

  const {
    data: results,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.getPlacesBySearch, filters],
    queryFn: getPlacesBySearch,
    enabled: searchEnabled,
    placeholderData: keepPreviousData,
  });

  const openPlace = (idPlace: number) => {
    Keyboard.dismiss();
    setFocused(false);
    setQuery('');
    navigation.navigate('Details', {id: idPlace, source: 'search'});
  };

  return (
    <Box width="100%" zIndex={20}>
      <Input
        height={54}
        fontSize={15}
        value={query}
        accessibilityLabel="Rechercher une adresse"
        testID="explorer-search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={setQuery}
        returnKeyType="search"
        placeholder="Restaurant, café ou ambiance..."
        placeholderTextColor="#9995A3"
        InputLeftElement={
          <Box
            ml={3}
            bg={palette.mainLight}
            width={9}
            height={9}
            borderRadius={12}
            alignItems="center"
            justifyContent="center">
            <VectorIcon name="search" size={18} color={palette.main} />
          </Box>
        }
        InputRightElement={
          isFetching ? (
            <Spinner mr={4} size="sm" color={palette.main} />
          ) : query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
              onPress={() => setQuery('')}
              p={3}>
              <VectorIcon name="x" size={16} color="#6E6880" />
            </Pressable>
          ) : undefined
        }
        bgColor={surface}
        color={palette.text}
        _focus={{backgroundColor: surface, borderColor: palette.main}}
        borderWidth={focused ? 2 : 1}
        borderColor={focused ? palette.main : palette.border}
        borderRadius={18}
      />

      {focused && !query && (
        <Flex direction="row" mt={3}>
          {['Romantique', 'Brunch', 'Musique'].map(suggestion => (
            <Pressable
              key={suggestion}
              onPress={() => setQuery(suggestion)}
              mr={2}>
              <Box
                bg={surface}
                borderWidth={1}
                borderColor={palette.border}
                borderRadius={14}
                px={3}
                py={2}>
                <Text color={palette.muted} fontSize="xs" fontWeight={700}>
                  {suggestion}
                </Text>
              </Box>
            </Pressable>
          ))}
        </Flex>
      )}

      {focused && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          mt={3}
          keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setOpenNow(value => !value)} mr={2}>
            <Box
              bg={openNow ? selectedSurface : surface}
              borderWidth={1}
              borderColor={openNow ? palette.main : palette.border}
              borderRadius={14}
              px={3}
              py={2}>
              <Text
                color={openNow ? 'white' : palette.muted}
                fontSize="xs"
                fontWeight={700}>
                Disponible maintenant
              </Text>
            </Box>
          </Pressable>
          <Pressable onPress={() => setVerified(value => !value)} mr={2}>
            <Box
              bg={verified ? selectedSurface : surface}
              borderWidth={1}
              borderColor={verified ? palette.main : palette.border}
              borderRadius={14}
              px={3}
              py={2}>
              <VectorIcon
                name="check"
                size={14}
                color={verified ? 'white' : palette.main}
              />
              <Text
                color={verified ? 'white' : palette.muted}
                fontSize="xs"
                fontWeight={700}>
                Vérifiés
              </Text>
            </Box>
          </Pressable>
          {[40, 80].map(price => (
            <Pressable
              key={price}
              onPress={() =>
                setMaxPrice(maxPrice === price ? undefined : price)
              }
              mr={2}>
              <Box
                bg={maxPrice === price ? selectedSurface : surface}
                borderWidth={1}
                borderColor={maxPrice === price ? palette.main : palette.border}
                borderRadius={14}
                px={3}
                py={2}>
                <Text
                  color={maxPrice === price ? 'white' : palette.muted}
                  fontSize="xs"
                  fontWeight={700}>
                  ≤ {price} TND
                </Text>
              </Box>
            </Pressable>
          ))}
          {['Calme', 'Romantique', 'Musique'].map(value => (
            <Pressable
              key={value}
              onPress={() =>
                setAmbience(ambience === value ? undefined : value)
              }
              mr={2}>
              <Box
                bg={ambience === value ? selectedSurface : surface}
                borderWidth={1}
                borderColor={ambience === value ? palette.main : palette.border}
                borderRadius={14}
                px={3}
                py={2}>
                <Text
                  color={ambience === value ? 'white' : palette.muted}
                  fontSize="xs"
                  fontWeight={700}>
                  {value}
                </Text>
              </Box>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setSort(sort === 'price' ? 'relevance' : 'price')}
            mr={2}>
            <Box
              bg={sort === 'price' ? selectedSurface : surface}
              borderWidth={1}
              borderColor={sort === 'price' ? palette.main : palette.border}
              borderRadius={14}
              px={3}
              py={2}>
              <Text
                color={sort === 'price' ? 'white' : palette.muted}
                fontSize="xs"
                fontWeight={700}>
                Prix croissant
              </Text>
            </Box>
          </Pressable>
        </ScrollView>
      )}

      {searchEnabled && (
        <Box bg={surface} borderRadius={20} mt={3} shadow={4} overflow="hidden">
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            px={4}
            py={3}>
            <Text color={palette.text} fontSize="sm" fontWeight={800}>
              Résultats
            </Text>
            <Text color={palette.muted} fontSize="xs">
              {results?.length ?? 0} trouvé(s)
            </Text>
          </Flex>
          <Divider />
          {isError ? (
            <Box p={4}>
              <Text color={palette.text}>Recherche indisponible.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  refetch();
                }}
                minHeight={44}
                justifyContent="center">
                <Text color={palette.main}>Réessayer</Text>
              </Pressable>
            </Box>
          ) : null}
          {!isFetching && !isError && results?.length === 0 && (
            <Box px={5} py={6} alignItems="center">
              <VectorIcon name="search" size={28} />
              <Text color={palette.text} fontWeight={700} mt={2}>
                Aucune adresse trouvée
              </Text>
              <Text color={palette.muted} fontSize="xs" mt={1}>
                Essayez un autre nom ou une autre ambiance.
              </Text>
            </Box>
          )}
          {results?.slice(0, 5).map((item: any, index: number) => (
            <React.Fragment key={item.idPlace}>
              {index > 0 && <Divider mx={4} />}
              <Pressable onPress={() => openPlace(item.idPlace)}>
                <Flex direction="row" alignItems="center" px={4} py={3}>
                  <Image
                    source={{uri: item.image}}
                    alt={item.placeName}
                    width={14}
                    height={14}
                    borderRadius={12}
                    resizeMode="cover"
                  />
                  <Box flex={1} ml={3}>
                    <Text
                      color={palette.text}
                      fontSize="sm"
                      fontWeight={800}
                      numberOfLines={1}>
                      {item.placeName}
                    </Text>
                    <Text
                      color={palette.muted}
                      fontSize="xs"
                      mt={1}
                      numberOfLines={1}>
                      {item.subTitle || 'Établissement'}
                    </Text>
                    <Flex
                      direction="row"
                      alignItems="center"
                      flexWrap="wrap"
                      mt={1}>
                      {item.verified ? (
                        <>
                          <VectorIcon name="check" size={12} />
                          <Text color={palette.main} fontSize="10">
                            {' '}
                            Vérifié ·{' '}
                          </Text>
                        </>
                      ) : null}
                      {Number(item.reviewCount) > 0 &&
                      Number(item.rating) >= 1 &&
                      Number(item.rating) <= 5 ? (
                        <>
                          <VectorIcon name="star" size={12} />
                          <Text color={palette.main} fontSize="10">
                            {' '}
                            {Number(item.rating).toFixed(1)} ({item.reviewCount}{' '}
                            avis)
                          </Text>
                        </>
                      ) : (
                        <Text color={palette.muted} fontSize="10">
                          Pas encore d’avis
                        </Text>
                      )}
                      {item.averagePrice != null ? (
                        <Text color={palette.main} fontSize="10">
                          {' '}
                          · {item.averagePrice} TND
                        </Text>
                      ) : null}
                    </Flex>
                  </Box>
                  <Box
                    bg={isOpen(item.horaire) ? '#E8F6EF' : '#FFF0F1'}
                    borderRadius={12}
                    px={2}
                    py={1}>
                    <Text
                      color={isOpen(item.horaire) ? '#157347' : '#B42335'}
                      fontSize="10"
                      fontWeight={800}>
                      {isOpen(item.horaire) ? 'OUVERT' : 'FERMÉ'}
                    </Text>
                  </Box>
                </Flex>
              </Pressable>
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
}
