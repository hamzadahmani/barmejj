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

export default function SearchBar({navigation}: any) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [verified, setVerified] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sort, setSort] = useState('relevance');
  const [ambience, setAmbience] = useState<string | undefined>();
  const [openNow, setOpenNow] = useState(false);
  const normalizedQuery = query.trim();
  const searchEnabled = normalizedQuery.length >= 2 || verified || openNow || Boolean(maxPrice) || Boolean(ambience);
  const filters = {query: normalizedQuery, verified: verified ? 'true' : undefined, openNow: openNow ? 'true' : undefined, maxPrice, sort, ambience};

  const {data: results, isFetching} = useQuery(
    ['getPlacesBySearch', filters],
    getPlacesBySearch,
    {enabled: searchEnabled, keepPreviousData: true},
  );

  const openPlace = (idPlace: number) => {
    Keyboard.dismiss();
    setFocused(false);
    setQuery('');
    navigation.navigate('Details', {id: idPlace});
  };

  return (
    <Box width="100%" zIndex={20}>
      <Input
        height={54}
        fontSize={15}
        value={query}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={setQuery}
        returnKeyType="search"
        placeholder="Restaurant, café ou ambiance..."
        placeholderTextColor="#9995A3"
        InputLeftElement={
          <Box
            ml={3}
            bg={Color.mainLight}
            width={9}
            height={9}
            borderRadius={12}
            alignItems="center"
            justifyContent="center">
            <VectorIcon name="search" size={18} color={Color.main} />
          </Box>
        }
        InputRightElement={
          isFetching ? (
            <Spinner mr={4} size="sm" color={Color.main} />
          ) : query ? (
            <Pressable onPress={() => setQuery('')} p={3}>
              <VectorIcon name="x" size={16} color="#777382" />
            </Pressable>
          ) : undefined
        }
        bgColor="#FFFFFF"
        borderWidth={focused ? 2 : 1}
        borderColor={focused ? Color.main : Color.border}
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
                bg="white"
                borderWidth={1}
                borderColor={Color.border}
                borderRadius={14}
                px={3}
                py={2}>
                <Text color={Color.muted} fontSize="xs" fontWeight={700}>
                  {suggestion}
                </Text>
              </Box>
            </Pressable>
          ))}
        </Flex>
      )}

      {focused && <ScrollView horizontal showsHorizontalScrollIndicator={false} mt={3} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => setOpenNow(value => !value)} mr={2}><Box bg={openNow ? Color.main : 'white'} borderWidth={1} borderColor={openNow ? Color.main : Color.border} borderRadius={14} px={3} py={2}><Text color={openNow ? 'white' : Color.muted} fontSize="xs" fontWeight={700}>Disponible maintenant</Text></Box></Pressable>
        <Pressable onPress={() => setVerified(value => !value)} mr={2}><Box bg={verified ? Color.main : 'white'} borderWidth={1} borderColor={verified ? Color.main : Color.border} borderRadius={14} px={3} py={2}><Text color={verified ? 'white' : Color.muted} fontSize="xs" fontWeight={700}>✓ Vérifiés</Text></Box></Pressable>
        {[40,80].map(price => <Pressable key={price} onPress={() => setMaxPrice(maxPrice === price ? undefined : price)} mr={2}><Box bg={maxPrice===price ? Color.main : 'white'} borderWidth={1} borderColor={maxPrice===price ? Color.main : Color.border} borderRadius={14} px={3} py={2}><Text color={maxPrice===price ? 'white' : Color.muted} fontSize="xs" fontWeight={700}>≤ {price} TND</Text></Box></Pressable>)}
        {['Calme','Romantique','Musique'].map(value => <Pressable key={value} onPress={() => setAmbience(ambience===value ? undefined : value)} mr={2}><Box bg={ambience===value ? Color.main : 'white'} borderWidth={1} borderColor={ambience===value ? Color.main : Color.border} borderRadius={14} px={3} py={2}><Text color={ambience===value ? 'white' : Color.muted} fontSize="xs" fontWeight={700}>{value}</Text></Box></Pressable>)}
        <Pressable onPress={() => setSort(sort==='price'?'relevance':'price')} mr={2}><Box bg={sort==='price' ? Color.main : 'white'} borderWidth={1} borderColor={sort==='price' ? Color.main : Color.border} borderRadius={14} px={3} py={2}><Text color={sort==='price' ? 'white' : Color.muted} fontSize="xs" fontWeight={700}>Prix ↑</Text></Box></Pressable>
      </ScrollView>}

      {searchEnabled && (
        <Box bg="white" borderRadius={20} mt={3} shadow={4} overflow="hidden">
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            px={4}
            py={3}>
            <Text color={Color.text} fontSize="sm" fontWeight={800}>
              Résultats
            </Text>
            <Text color={Color.muted} fontSize="xs">
              {results?.length ?? 0} trouvé(s)
            </Text>
          </Flex>
          <Divider />
          {!isFetching && results?.length === 0 && (
            <Box px={5} py={6} alignItems="center">
              <Text fontSize="2xl">⌕</Text>
              <Text color={Color.text} fontWeight={700} mt={2}>
                Aucune adresse trouvée
              </Text>
              <Text color={Color.muted} fontSize="xs" mt={1}>
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
                      color={Color.text}
                      fontSize="sm"
                      fontWeight={800}
                      numberOfLines={1}>
                      {item.placeName}
                    </Text>
                    <Text
                      color={Color.muted}
                      fontSize="xs"
                      mt={1}
                      numberOfLines={1}>
                      {item.subTitle || 'Établissement'}
                    </Text>
                    <Text color={Color.main} fontSize="10" fontWeight={800} mt={1}>{item.verified ? '✓ Vérifié  ·  ' : ''}{item.rating ? `${item.rating} ★ (${item.reviewCount})` : 'Nouveau'}{item.averagePrice ? `  ·  ${item.averagePrice} TND` : ''}</Text>
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
