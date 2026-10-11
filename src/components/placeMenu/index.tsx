import React, {useMemo, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {Color} from '../../helpers/constatn';
import {fonts, night} from '../discovery/theme';

type MenuItem = {
  name: string;
  priceMillimes: number;
  kind: 'MAIN' | 'DRINK' | 'DESSERT' | 'OTHER';
  available?: boolean;
};
export type PlaceMenu = {
  id: number;
  imageUrl: string;
  validatedAt: string | null;
  items: MenuItem[];
};

const KIND_LABELS: Record<MenuItem['kind'], string> = {
  MAIN: 'Plats',
  DRINK: 'Boissons',
  DESSERT: 'Desserts',
  OTHER: 'Autres',
};
const KIND_ORDER: MenuItem['kind'][] = ['MAIN', 'DRINK', 'DESSERT', 'OTHER'];
const COLLAPSED = 6;

/** 12900 millimes → « 12,9 DT » */
export const formatPrice = (millimes: number) =>
  `${(millimes / 1000).toLocaleString('fr-FR', {minimumFractionDigits: 0, maximumFractionDigits: 3})} DT`;

/** Menus validés de l'établissement, affichés sur sa fiche. */
export default function PlaceMenuSection({menus}: {menus?: PlaceMenu[]}) {
  const [expanded, setExpanded] = useState(false);
  const [photo, setPhoto] = useState<number>();
  const items = useMemo(
    () =>
      (menus ?? [])
        .flatMap(menu => menu.items)
        .filter(item => item.available !== false),
    [menus],
  );
  const photos = useMemo(
    () => (menus ?? []).map(menu => ({uri: menu.imageUrl})),
    [menus],
  );
  if (!menus?.length || !items.length) return null;

  const visible = expanded ? items : items.slice(0, COLLAPSED);
  const groups = KIND_ORDER.map(kind => ({
    kind,
    items: visible.filter(item => item.kind === kind),
  })).filter(group => group.items.length);
  const prices = items.map(item => item.priceMillimes);
  const validated = menus[0]?.validatedAt
    ? new Date(menus[0].validatedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <View style={s.headText}>
          <Text style={s.title}>Menu</Text>
          <Text style={s.subtitle}>
            {items.length} plats · de {formatPrice(Math.min(...prices))} à{' '}
            {formatPrice(Math.max(...prices))}
          </Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>PRIX VÉRIFIÉS</Text>
        </View>
      </View>

      <View style={s.card}>
        {photos.length ? (
          <Pressable
            accessibilityRole="imagebutton"
            accessibilityLabel="Voir la photo du menu"
            onPress={() => setPhoto(0)}
            style={s.photoRow}>
            <Image
              source={{uri: photos[0]!.uri}}
              style={s.photo}
              resizeMode="cover"
            />
            <View style={s.photoText}>
              <Text style={s.photoTitle}>Photo du menu</Text>
              <Text style={s.photoHint}>
                {photos.length > 1 ? `${photos.length} pages · ` : ''}Touchez
                pour agrandir
              </Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </Pressable>
        ) : null}

        {groups.map(group => (
          <View key={group.kind} style={s.group}>
            {groups.length > 1 ? (
              <Text style={s.groupLabel}>
                {KIND_LABELS[group.kind].toUpperCase()}
              </Text>
            ) : null}
            {group.items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={s.row}>
                <Text style={s.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={s.dots} />
                <Text style={s.price}>{formatPrice(item.priceMillimes)}</Text>
              </View>
            ))}
          </View>
        ))}

        {items.length > COLLAPSED ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setExpanded(value => !value)}
            style={s.more}>
            <Text style={s.moreText}>
              {expanded ? 'Réduire' : `Voir tout le menu (${items.length})`}
            </Text>
          </Pressable>
        ) : null}

        {validated ? (
          <Text style={s.note}>
            Prix validés par l’établissement le {validated}. Ils peuvent avoir
            changé depuis.
          </Text>
        ) : null}
      </View>

      <ImageView
        images={photos}
        imageIndex={photo ?? 0}
        visible={photo !== undefined}
        onRequestClose={() => setPhoto(undefined)}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {marginTop: 20},
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headText: {flex: 1, paddingRight: 12},
  title: {
    color: Color.text,
    fontSize: 22,
    fontFamily: fonts.display,
    fontWeight: '700',
  },
  subtitle: {color: Color.muted, fontSize: 12, marginTop: 4},
  badge: {
    backgroundColor: Color.mainLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  badgeText: {color: Color.main, fontSize: 11, fontWeight: '800'},
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#2B203A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: night.page,
    borderRadius: 16,
    padding: 10,
    marginBottom: 14,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Color.mainLight,
  },
  photoText: {flex: 1, marginLeft: 12},
  photoTitle: {color: Color.text, fontWeight: '800', fontSize: 14},
  photoHint: {color: Color.muted, fontSize: 12, marginTop: 2},
  chevron: {color: Color.muted, fontSize: 24, paddingHorizontal: 6},
  group: {marginBottom: 6},
  groupLabel: {
    color: Color.main,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 6,
    marginBottom: 4,
  },
  row: {flexDirection: 'row', alignItems: 'flex-end', paddingVertical: 7},
  name: {
    color: Color.text,
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: '72%',
  },
  dots: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E0EE',
    borderStyle: 'dotted',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  price: {color: Color.text, fontSize: 14, fontWeight: '800'},
  more: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Color.mainLight,
    alignItems: 'center',
  },
  moreText: {color: Color.main, fontWeight: '800', fontSize: 13},
  note: {color: Color.muted, fontSize: 11, lineHeight: 16, marginTop: 12},
});
