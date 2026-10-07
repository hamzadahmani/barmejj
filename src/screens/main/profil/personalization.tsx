import {queryKeys, mutationEffects} from '../../../query/keys';
import {useMutation, useQuery} from '@tanstack/react-query';
import {useToast} from 'native-base';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LoadingSpinner from '../../../components/Loader';
import Toast from '../../../components/toast';
import {Color} from '../../../helpers/constatn';
import {getProfilAPI, updateProfilAPI} from '../../../services/profil';

const DIETS = ['Halal', 'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose'];
const AMBIENCES = [
  'Calme',
  'Romantique',
  'Familial',
  'Brunch',
  'Musique',
  'Festif',
  'Terrasse',
];
const BUDGETS = [30, 50, 80, 120];

function ChoiceGroup({
  values,
  selected,
  onChange,
}: {
  values: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <View style={s.chips}>
      {values.map(value => {
        const active = selected.includes(value);
        return (
          <Pressable
            key={value}
            accessibilityRole="checkbox"
            accessibilityState={{checked: active}}
            onPress={() =>
              onChange(
                active
                  ? selected.filter(item => item !== value)
                  : [...selected, value],
              )
            }
            style={[s.chip, active && s.chipOn]}>
            <View style={[s.check, active && s.checkOn]}>
              <Text style={[s.checkText, active && s.checkTextOn]}>
                {active ? '✓' : '+'}
              </Text>
            </View>
            <Text style={[s.chipText, active && s.chipTextOn]}>{value}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Section({
  number,
  title,
  subtitle,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <View style={s.number}>
          <Text style={s.numberText}>{number}</Text>
        </View>
        <View style={s.grow}>
          <Text style={s.cardTitle}>{title}</Text>
          <Text style={s.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

export default function PersonalizationScreen({navigation}: any) {
  const toast = useToast();
  const dirty = useRef(false);
  const [diet, setDiet] = useState<string[]>([]);
  const [allergies, setAllergies] = useState('');
  const [ambiences, setAmbiences] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const {data, isLoading} = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfilAPI,
  });
  useEffect(() => {
    if (data && !dirty.current) {
      setDiet(data.dietaryPreferences || []);
      setAllergies((data.allergies || []).join(', '));
      setAmbiences(data.favoriteAmbiences || []);
      setBudget(data.preferredBudget ? String(data.preferredBudget) : '');
    }
  }, [data]);
  const allergyList = useMemo(
    () =>
      allergies
        .split(',')
        .map(value => value.trim())
        .filter(Boolean),
    [allergies],
  );
  const selectedCount =
    diet.length +
    ambiences.length +
    (allergyList.length ? 1 : 0) +
    (budget ? 1 : 0);
  const {mutate, isPending: saving} = useMutation({
    meta: mutationEffects.profile,
    mutationFn: updateProfilAPI,
    onSuccess: () =>
      toast.show({
        placement: 'top',
        render: () => (
          <Toast
            message="Vos préférences sont enregistrées"
            status={Color.success}
          />
        ),
      }),
    onError: (error: any) =>
      Alert.alert(
        'Enregistrement impossible',
        error?.response?.data?.message ||
          'Vérifiez votre connexion et réessayez.',
      ),
  });
  const save = () => {
    const numericBudget = budget ? Number(budget) : null;
    if (
      numericBudget !== null &&
      (!Number.isFinite(numericBudget) ||
        numericBudget < 1 ||
        numericBudget > 1000)
    ) {
      Alert.alert(
        'Budget incorrect',
        'Indiquez un budget compris entre 1 et 1000 TND.',
      );
      return;
    }
    mutate({
      dietaryPreferences: diet,
      allergies: allergyList,
      favoriteAmbiences: ambiences,
      preferredBudget: numericBudget,
    });
  };

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LoadingSpinner visible={isLoading || saving} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.page}
        showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={s.orbOne} />
          <View style={s.orbTwo} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={() => navigation.goBack()}
            style={s.back}>
            <Text style={s.backText}>‹</Text>
          </Pressable>
          <Text style={s.eyebrow}>VOTRE BARMEJ</Text>
          <Text style={s.title}>Des sorties qui vous ressemblent</Text>
          <Text style={s.subtitle}>
            Quelques choix suffisent pour améliorer vos recommandations et
            sécuriser vos réservations.
          </Text>
          <View style={s.summary}>
            <Text style={s.summaryValue}>{selectedCount}</Text>
            <Text style={s.summaryText}>
              préférence{selectedCount > 1 ? 's' : ''} renseignée
              {selectedCount > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <View style={s.content}>
          <Section
            number="01"
            title="Votre alimentation"
            subtitle="Sélectionnez toutes les options qui vous concernent.">
            <ChoiceGroup
              values={DIETS}
              selected={diet}
              onChange={value => {
                dirty.current = true;
                setDiet(value);
              }}
            />
          </Section>
          <Section
            number="02"
            title="Allergies"
            subtitle="Nous les rappellerons pendant vos réservations.">
            <View style={s.inputWrap}>
              <TextInput
                value={allergies}
                onChangeText={value => {
                  dirty.current = true;
                  setAllergies(value);
                }}
                placeholder="Ex. arachides, gluten, fruits de mer"
                placeholderTextColor="#9B95A3"
                style={s.input}
              />
              <Text style={s.inputHint}>
                Séparez plusieurs allergies par une virgule.
              </Text>
            </View>
            {allergyList.length ? (
              <View style={s.allergyPreview}>
                {allergyList.slice(0, 4).map(item => (
                  <View key={item} style={s.allergyTag}>
                    <Text style={s.allergyText}>{item}</Text>
                  </View>
                ))}
                {allergyList.length > 4 ? (
                  <Text style={s.more}>+{allergyList.length - 4}</Text>
                ) : null}
              </View>
            ) : null}
          </Section>
          <Section
            number="03"
            title="Vos ambiances"
            subtitle="Pour chaque occasion, Barmej privilégiera les bons lieux.">
            <ChoiceGroup
              values={AMBIENCES}
              selected={ambiences}
              onChange={value => {
                dirty.current = true;
                setAmbiences(value);
              }}
            />
          </Section>
          <Section
            number="04"
            title="Budget par personne"
            subtitle="Une estimation habituelle, boissons comprises.">
            <View style={s.budgets}>
              {BUDGETS.map(value => {
                const active = budget === String(value);
                return (
                  <Pressable
                    key={value}
                    onPress={() => {
                      dirty.current = true;
                      setBudget(active ? '' : String(value));
                    }}
                    style={[s.budget, active && s.budgetOn]}>
                    <Text style={[s.budgetValue, active && s.budgetValueOn]}>
                      {value}
                    </Text>
                    <Text style={[s.budgetUnit, active && s.budgetValueOn]}>
                      TND
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={s.customRow}>
              <Text style={s.customLabel}>Autre montant</Text>
              <View style={s.budgetInputWrap}>
                <TextInput
                  value={budget}
                  onChangeText={value => {
                    dirty.current = true;
                    setBudget(value.replace(/[^0-9]/g, ''));
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="—"
                  placeholderTextColor="#AAA4B0"
                  style={s.budgetInput}
                />
                <Text style={s.tnd}>TND</Text>
              </View>
            </View>
          </Section>
          <View style={s.privacy}>
            <View style={s.lock}>
              <Text style={s.lockText}>✓</Text>
            </View>
            <View style={s.grow}>
              <Text style={s.privacyTitle}>Vous gardez le contrôle</Text>
              <Text style={s.privacyText}>
                Vous pouvez modifier ces choix à tout moment. Les allergies ne
                sont partagées qu’avec l’établissement lors d’une réservation.
              </Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={save} style={s.save}>
            <View>
              <Text style={s.saveText}>Enregistrer mes préférences</Text>
              <Text style={s.saveHint}>
                Personnaliser mon expérience Barmej
              </Text>
            </View>
            <Text style={s.saveArrow}>→</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: Color.background},
  page: {paddingBottom: 120},
  hero: {
    minHeight: 350,
    backgroundColor: Color.main,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 38,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    overflow: 'hidden',
  },
  orbOne: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(255,255,255,.07)',
    right: -55,
    top: -70,
  },
  orbTwo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245,175,84,.19)',
    left: -40,
    bottom: -42,
  },
  back: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {fontSize: 34, lineHeight: 36, color: 'white'},
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFBC63',
    marginTop: 30,
  },
  title: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1,
    color: 'white',
    marginTop: 8,
    maxWidth: 330,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: '#DCD5E9',
    marginTop: 10,
    maxWidth: 330,
  },
  summary: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    marginTop: 18,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFBC63',
    marginRight: 6,
  },
  summaryText: {fontSize: 10, fontWeight: '800', color: 'white'},
  content: {paddingHorizontal: 18, marginTop: -20},
  card: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EBE5EF',
    shadowColor: '#231A32',
    shadowOpacity: 0.055,
    shadowRadius: 15,
    shadowOffset: {width: 0, height: 7},
    elevation: 2,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 17},
  number: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#EFE9FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numberText: {fontSize: 14, fontWeight: '900', color: Color.main},
  grow: {flex: 1},
  cardTitle: {fontSize: 18, fontWeight: '900', color: Color.text},
  cardSubtitle: {
    fontSize: 10,
    lineHeight: 15,
    color: Color.muted,
    marginTop: 3,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 9},
  chip: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: '#F8F6FC',
    borderWidth: 1.5,
    borderColor: '#ECE8F4',
  },
  chipOn: {backgroundColor: Color.main, borderColor: Color.main},
  check: {
    width: 23,
    height: 23,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  checkOn: {backgroundColor: 'rgba(255,255,255,.20)'},
  checkText: {fontSize: 14, fontWeight: '900', color: Color.main},
  checkTextOn: {color: 'white'},
  chipText: {fontSize: 11, fontWeight: '800', color: Color.text},
  chipTextOn: {color: 'white'},
  inputWrap: {
    backgroundColor: '#F8F6FC',
    borderWidth: 1.5,
    borderColor: '#ECE8F4',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingTop: 3,
    paddingBottom: 10,
  },
  input: {minHeight: 48, fontSize: 13, fontWeight: '600', color: Color.text},
  inputHint: {fontSize: 9, color: Color.muted},
  allergyPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
    marginTop: 11,
  },
  allergyTag: {
    backgroundColor: '#FFF0EB',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  allergyText: {fontSize: 9, fontWeight: '800', color: '#A54432'},
  more: {fontSize: 10, fontWeight: '900', color: Color.main},
  budgets: {flexDirection: 'row', gap: 8},
  budget: {
    flex: 1,
    minHeight: 65,
    borderRadius: 17,
    backgroundColor: '#F8F6FC',
    borderWidth: 1.5,
    borderColor: '#ECE8F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetOn: {backgroundColor: Color.main, borderColor: Color.main},
  budgetValue: {fontSize: 17, fontWeight: '900', color: Color.text},
  budgetUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: Color.muted,
    marginTop: 2,
  },
  budgetValueOn: {color: 'white'},
  customRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ECE8F4',
    marginTop: 15,
    paddingTop: 12,
  },
  customLabel: {fontSize: 11, fontWeight: '800', color: Color.muted},
  budgetInputWrap: {
    height: 46,
    minWidth: 112,
    borderRadius: 14,
    backgroundColor: '#F8F6FC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  budgetInput: {
    minWidth: 50,
    fontSize: 15,
    fontWeight: '900',
    color: Color.text,
    textAlign: 'right',
  },
  tnd: {fontSize: 9, fontWeight: '900', color: Color.muted, marginLeft: 5},
  privacy: {
    backgroundColor: '#E8F5EF',
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  lock: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#19796F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lockText: {fontSize: 18, fontWeight: '900', color: 'white'},
  privacyTitle: {fontSize: 12, fontWeight: '900', color: '#145A43'},
  privacyText: {fontSize: 9, lineHeight: 14, color: '#477263', marginTop: 3},
  save: {
    minHeight: 72,
    borderRadius: 22,
    backgroundColor: Color.main,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveText: {fontSize: 14, fontWeight: '900', color: 'white'},
  saveHint: {fontSize: 9, color: '#DCD5E9', marginTop: 4},
  saveArrow: {fontSize: 25, color: 'white'},
});
