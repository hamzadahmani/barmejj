import {queryKeys} from '../../../query/keys';
import {useQuery} from '@tanstack/react-query';
import {Box, Button, HStack, Input, ScrollView, Text} from 'native-base';
import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text as RNText, View} from 'react-native';
import LoadingSpinner from '../../../components/Loader';
import CommunityHeader from '../../../components/communityHeader';
import {Color} from '../../../helpers/constatn';
import {getAssistantSuggestionsAPI} from '../../../services/community';

export default function SmartAssistantScreen({navigation}: any) {
  const [q, setQ] = useState('');
  const [budget, setBudget] = useState('');
  const [occasion, setOccasion] = useState('');
  const [search, setSearch] = useState({
    q: '',
    budget: undefined as number | undefined,
    occasion: '',
    requestId: 0,
  });
  const [hasSearched, setHasSearched] = useState(false);
  const {data, isFetching, isError, refetch} = useQuery({
    queryKey: [...queryKeys.assistantSuggestions, search],
    queryFn: getAssistantSuggestionsAPI,
    enabled: hasSearched,
    retry: 1,
  });
  const suggestions = Array.isArray(data) ? data : [];

  const submitSearch = () => {
    const parsedBudget = budget.trim() ? Number(budget) : undefined;
    setHasSearched(true);
    setSearch({
      q: q.trim(),
      budget: parsedBudget && parsedBudget > 0 ? parsedBudget : undefined,
      occasion: occasion.trim(),
      requestId: Date.now(),
    });
  };

  return (
    <ScrollView
      bg={Color.background}
      px={5}
      contentContainerStyle={layoutStyles.style1}>
      <LoadingSpinner visible={isFetching} />
      <CommunityHeader
        title="Assistant Barmej"
        subtitle="Écrivez en français, arabe ou tunisien. Exemple : « نحب resto calme pas cher »."
        eyebrow="VOTRE CONCIERGE PERSONNEL"
        onBack={() => navigation.goBack()}
      />
      <Box mt={-8} bg="white" p={5} borderRadius={20} shadow={2}>
        <Text color={Color.text} fontSize={12} fontWeight={700} mb={2}>
          VOTRE ENVIE
        </Text>
        <Input
          value={q}
          onChangeText={setQ}
          placeholder="Que recherchez-vous ?"
          mb={3}
        />
        <HStack space={3}>
          <Box flex={1}>
            <Text color={Color.text} fontSize={11} fontWeight={700} mb={2}>
              BUDGET / PERSONNE
            </Text>
            <Input
              value={budget}
              onChangeText={setBudget}
              keyboardType="number-pad"
              placeholder="Ex. 50 TND"
            />
          </Box>
          <Box flex={1}>
            <Text color={Color.text} fontSize={11} fontWeight={700} mb={2}>
              OCCASION
            </Text>
            <Input
              value={occasion}
              onChangeText={setOccasion}
              placeholder="Anniversaire"
            />
          </Box>
        </HStack>
        <Button
          mt={5}
          minHeight={13}
          py={3.5}
          borderRadius={16}
          bg={Color.main}
          _pressed={{bg: '#33264D'}}
          _text={{color: '#FFFFFF', fontSize: 15, fontWeight: 800}}
          isLoading={isFetching}
          isLoadingText="Recherche en cours"
          spinnerPlacement="end"
          onPress={submitSearch}>
          Trouver mon adresse idéale
        </Button>
      </Box>
      {!hasSearched && (
        <Box mt={6}>
          <Text color={Color.text} fontSize={20} fontWeight={800}>
            Besoin d’inspiration ?
          </Text>
          <Text color={Color.muted} fontSize={13} mt={1} mb={3}>
            Essayez une recherche populaire
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              'Resto calme',
              'Brunch entre amis',
              'Vue sur mer',
              'Sortie pas chère',
            ].map(prompt => (
              <Button
                key={prompt}
                mr={2}
                px={4}
                borderRadius={14}
                bg={Color.mainLight}
                variant="ghost"
                _text={{color: Color.main, fontWeight: 700}}
                onPress={() => setQ(prompt)}>
                {prompt}
              </Button>
            ))}
          </ScrollView>
          <Box
            mt={5}
            bg="white"
            borderWidth={1}
            borderColor={Color.border}
            borderRadius={20}
            p={5}>
            <HStack alignItems="center">
              <Box
                bg={Color.mainLight}
                width={10}
                height={10}
                borderRadius={14}
                alignItems="center"
                justifyContent="center">
                <Text color={Color.main} fontSize={18}>
                  ✦
                </Text>
              </Box>
              <Box flex={1} ml={3}>
                <Text color={Color.text} fontWeight={800}>
                  Une sélection faite pour vous
                </Text>
                <Text color={Color.muted} fontSize={12} mt={1}>
                  L’assistant combine votre envie, votre budget et votre
                  occasion.
                </Text>
              </Box>
            </HStack>
          </Box>
        </Box>
      )}
      {isError && (
        <Box
          mt={6}
          bg="#FFF0F1"
          borderWidth={1}
          borderColor="#FFD5D9"
          p={5}
          borderRadius={18}>
          <Text color={Color.error} fontSize={16} fontWeight={800}>
            L’assistant est momentanément indisponible
          </Text>
          <Text color={Color.muted} mt={2}>
            Vérifiez que le backend sélectionné est démarré et que la dernière
            version est déployée.
          </Text>
          <Button
            mt={4}
            variant="outline"
            borderColor={Color.main}
            _text={{color: Color.main, fontWeight: 700}}
            onPress={() => refetch()}>
            Réessayer
          </Button>
        </Box>
      )}
      {!isError && hasSearched && !isFetching && suggestions.length === 0 && (
        <Box mt={6} bg="white" p={5} borderRadius={18}>
          <Text color={Color.text} fontWeight={800} textAlign="center">
            Aucune suggestion trouvée
          </Text>
          <Text color={Color.muted} mt={2} textAlign="center">
            Essayez un autre budget, une occasion différente ou une recherche
            plus générale.
          </Text>
        </Box>
      )}
      {!isError && suggestions.length > 0 && (
        <Box mt={6} mb={3}>
          <HStack alignItems="flex-end" justifyContent="space-between">
            <Box flex={1} pr={3}>
              <Text color={Color.text} fontSize={21} fontWeight={800}>
                Nos recommandations
              </Text>
              <Text color={Color.muted} fontSize={13} mt={1}>
                Sélectionnées selon vos envies
              </Text>
            </Box>
            <Box bg={Color.mainLight} px={3} py={2} borderRadius={14}>
              <Text color={Color.main} fontSize={11} fontWeight={800}>
                {suggestions.length} RÉSULTATS
              </Text>
            </Box>
          </HStack>
        </Box>
      )}
      <View style={styles.results}>
        {suggestions.map((place: any, index: number) => (
          <Pressable
            key={place.idPlace}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir ${place.placeName}`}
            onPress={() => navigation.navigate('Details', {id: place.idPlace})}
            style={({pressed}) => [styles.card, pressed && styles.cardPressed]}>
            <View style={styles.imageContainer}>
              {place.image ? (
                <Image
                  source={{uri: place.image}}
                  resizeMode="cover"
                  style={styles.image}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <RNText style={styles.imageFallbackText}>BARMEJ</RNText>
                </View>
              )}
              <View style={styles.rankBadge}>
                <RNText style={styles.rankText}>#{index + 1}</RNText>
              </View>
            </View>
            <View style={styles.cardBody}>
              <RNText style={styles.placeName} numberOfLines={1}>
                {place.placeName}
              </RNText>
              <RNText style={styles.subtitle} numberOfLines={1}>
                {place.subTitle || 'Une adresse à découvrir'}
              </RNText>
              <View style={styles.reasonRow}>
                <View style={styles.sparkle}>
                  <RNText style={styles.sparkleText}>✦</RNText>
                </View>
                <RNText style={styles.reason} numberOfLines={2}>
                  {place.reason || 'Suggestion Barmej'}
                </RNText>
              </View>
              <View style={styles.cardFooter}>
                <RNText style={styles.price} numberOfLines={1}>
                  {place.averagePrice
                    ? `≈ ${place.averagePrice} TND / pers.`
                    : 'Budget flexible'}
                </RNText>
                <View style={styles.arrowButton}>
                  <RNText style={styles.arrow}>›</RNText>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  results: {paddingBottom: 10},
  card: {
    width: '100%',
    height: 148,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECE8F4',
    elevation: 2,
    shadowColor: '#251C40',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  cardPressed: {opacity: 0.94, transform: [{scale: 0.99}]},
  imageContainer: {width: 122, height: 148, backgroundColor: '#E9E4F5'},
  image: {width: 122, height: 148},
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9E4F5',
  },
  imageFallbackText: {
    color: '#7464A8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    minWidth: 30,
    height: 26,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(25,21,42,0.78)',
  },
  rankText: {color: '#FFFFFF', fontSize: 11, fontWeight: '800'},
  cardBody: {flex: 1, paddingHorizontal: 14, paddingVertical: 12},
  placeName: {
    color: '#1F1B2E',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },
  subtitle: {color: '#6E6880', fontSize: 12, lineHeight: 17, marginTop: 2},
  reasonRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  sparkle: {
    width: 21,
    height: 21,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE9FC',
    marginRight: 6,
  },
  sparkleText: {color: '#33264D', fontSize: 12, fontWeight: '800'},
  reason: {
    flex: 1,
    color: '#33264D',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 7,
  },
  price: {
    flex: 1,
    color: '#6E6880',
    fontSize: 10,
    fontWeight: '600',
    paddingRight: 4,
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#33264D',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 25,
    fontWeight: '500',
    marginTop: -2,
  },
});

const layoutStyles = {
style1: {paddingBottom: 80}
} as const;
