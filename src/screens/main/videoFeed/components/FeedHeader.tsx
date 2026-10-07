import React, {
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  type Ref,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {feedColors as c} from '../theme';
import type {FeedMode} from '../types';
import {normalizeKeyword} from '../utils';
import FeedIcon from './FeedIcon';

export type FeedHeaderHandle = {openSearch: (value?: string) => void};

type Props = {
  ref?: Ref<FeedHeaderHandle>;
  top: number;
  mode: FeedMode;
  keyword: string;
  keywords: string[];
  onModeChange: (mode: FeedMode) => void;
  onKeywordChange: (keyword: string) => void;
};

const TABS: Array<{key: FeedMode; label: string}> = [
  {key: 'nearby', label: 'À proximité'},
  {key: 'for-you', label: 'Pour vous'},
];

/**
 * En-tête isolé : la saisie dans la recherche ne re-rend que ce composant,
 * jamais la liste des vidéos.
 */
function FeedHeader({
  ref,
  top,
  mode,
  keyword,
  keywords,
  onModeChange,
  onKeywordChange,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      openSearch: (value = '') => {
        setSearchValue(value);
        setSearchOpen(true);
      },
    }),
    [],
  );

  const filters = useMemo(() => {
    const quick = [
      {key: '', label: 'Tout'},
      ...keywords.map(k => ({key: k, label: k})),
    ];
    const known = quick.some(f => f.key === keyword);
    const list =
      keyword && !known
        ? [quick[0], {key: keyword, label: keyword}, ...quick.slice(1)]
        : quick;
    return list.slice(0, 8);
  }, [keyword, keywords]);

  const suggestions = useMemo(() => {
    const query = normalizeKeyword(searchValue);
    return keywords
      .filter(k => !query || normalizeKeyword(k).includes(query))
      .slice(0, 8);
  }, [keywords, searchValue]);

  const select = useCallback(
    (value: string) => {
      setSearchValue(value);
      setSearchOpen(false);
      onKeywordChange(value);
    },
    [onKeywordChange],
  );

  const submit = useCallback(() => {
    const exact = keywords.find(
      k => normalizeKeyword(k) === normalizeKeyword(searchValue),
    );
    const selected = exact ?? suggestions[0];
    if (selected) select(selected);
  }, [keywords, searchValue, select, suggestions]);

  const close = useCallback(() => {
    setSearchOpen(false);
    setSearchValue(keyword);
  }, [keyword]);

  const toggleSearch = useCallback(() => {
    if (searchOpen) return close();
    setSearchValue(keyword);
    setSearchOpen(true);
  }, [close, keyword, searchOpen]);

  return (
    <>
      <View style={[s.header, {top}]} pointerEvents="box-none">
        <View style={s.tabs}>
          {TABS.map(tab => {
            const selected = mode === tab.key;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{selected}}
                onPress={() => onModeChange(tab.key)}
                style={[s.tab, selected && s.tabSelected]}>
                <Text style={selected ? s.tabActive : s.tabMuted}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityLabel="Rechercher dans les vidéos"
          onPress={toggleSearch}
          style={({pressed}) => [s.searchButton, pressed && s.pressed]}>
          <FeedIcon name={searchOpen ? 'close' : 'search'} size={19} />
        </Pressable>
      </View>

      {searchOpen ? (
        <View style={[s.panel, {top: top + 54}]}>
          <View style={s.inputRow}>
            <FeedIcon name="search" size={17} color={c.primary} />
            <TextInput
              autoFocus
              value={searchValue}
              onChangeText={setSearchValue}
              onSubmitEditing={submit}
              returnKeyType="search"
              placeholder="Plats, ambiances, quartiers…"
              placeholderTextColor="#8B8493"
              style={s.input}
            />
            {searchValue ? (
              <Pressable onPress={() => setSearchValue('')} style={s.clear}>
                <FeedIcon
                  name="close"
                  size={13}
                  color={c.primary}
                  strokeWidth={2.6}
                />
              </Pressable>
            ) : null}
          </View>
          {suggestions.length ? (
            <View style={s.suggestions}>
              {suggestions.map(k => (
                <Pressable
                  key={k}
                  onPress={() => select(k)}
                  style={[s.suggestion, k === keyword && s.suggestionActive]}>
                  <Text
                    style={[
                      s.suggestionText,
                      k === keyword && s.suggestionTextActive,
                    ]}>
                    {k}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={s.noSuggestion}>
              Aucun mot-clé correspondant. Essayez un autre terme.
            </Text>
          )}
        </View>
      ) : filters.length > 1 || keyword ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.filterContent}
          style={[s.filterBar, {top: top + 54}]}>
          {filters.map(filter => {
            const selected = keyword === filter.key;
            return (
              <Pressable
                key={filter.key || 'all'}
                accessibilityRole="button"
                accessibilityState={{selected}}
                onPress={() => onKeywordChange(filter.key)}
                style={[s.chip, selected && s.chipActive]}>
                <Text style={[s.chipText, selected && s.chipTextActive]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </>
  );
}

export default memo(FeedHeader);

const s = StyleSheet.create({
  pressed: {opacity: 0.7},
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    height: 40,
    padding: 4,
    borderRadius: 20,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    height: 30,
    paddingHorizontal: 15,
    borderRadius: 15,
    justifyContent: 'center',
  },
  tabSelected: {backgroundColor: 'rgba(255,255,255,.95)'},
  tabMuted: {color: c.textSoft, fontSize: 13, fontWeight: '700'},
  tabActive: {color: c.goldInk, fontSize: 13, fontWeight: '900'},
  searchButton: {
    position: 'absolute',
    right: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {position: 'absolute', left: 0, right: 0, height: 40},
  filterContent: {paddingHorizontal: 16, gap: 8, alignItems: 'center'},
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: c.glass,
    borderWidth: 1,
    borderColor: c.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {backgroundColor: c.gold, borderColor: c.gold},
  chipText: {color: c.text, fontSize: 12, fontWeight: '700'},
  chipTextActive: {color: c.goldInk, fontWeight: '900'},
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 8,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.98)',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inputRow: {
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#F4F1FA',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    color: '#21182E',
    fontSize: 14,
    fontWeight: '600',
  },
  clear: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E6DFF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    padding: 6,
    paddingTop: 10,
  },
  suggestion: {
    height: 32,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: '#EEE9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionActive: {backgroundColor: c.primary},
  suggestionText: {color: '#4D3A8D', fontSize: 12, fontWeight: '700'},
  suggestionTextActive: {color: c.text},
  noSuggestion: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    color: '#746D7B',
    fontSize: 12,
  },
});
