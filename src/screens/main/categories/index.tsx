import {useQuery} from '@tanstack/react-query';
import {Image, ScrollView, View, Text, Box} from 'native-base';
import React from 'react';
import {ImageSourcePropType, StyleSheet, TouchableOpacity} from 'react-native';
import LoadingSpinner from '../../../components/Loader';
import SearchBar from '../../../components/search';
import {Color} from '../../../helpers/constatn';
import {getCategoriesAPI} from '../../../services/categories';

export default function CategorieList({navigation}: any) {
  const listCategorie = [
    {
      source: require('../../../assets/gif/cheers.gif'),
      categoryName: 'After work',
      name: 'After Work',
      path: 'HomeScreen',
    },
    {
      source: require('../../../assets/gif/food-delivery.gif'),
      categoryName: 'Dinner',
      name: 'Restaurants',
      path: 'HomeScreen',
    },
    {
      source: require('../../../assets/gif/toast.gif'),
      categoryName: 'Clubbing',
      name: 'Clubbing et soirées',
      path: 'HomeScreen',
    },
    {
      source: require('../../../assets/gif/way.gif'),
      categoryName: 'Near me',
      name: 'Autour de moi',
      path: 'NearMe',
    },
  ];
  const {isLoading, data} = useQuery(['getCategoriesAPI'], getCategoriesAPI, {
    select: data =>
      data.map((el: any) => {
        const element = listCategorie.find(
          category => category.categoryName === el.categoryName,
        );
        return {
          ...el,
          categoryImage: element?.source,
          name: element?.name,
          path: element?.path,
        };
      }),
  });

  return (
    <ScrollView>
      {<LoadingSpinner visible={isLoading} />}

      <Box style={styles.containerText}>
        <Text style={styles.title}>Catégories</Text>
        <Text style={styles.subTitle}>Sélectionnez votre catégorie </Text>
      </Box>
      <Box padding={5}>
        <SearchBar navigation={navigation} />
      </Box>
      <View style={styles.scrollView}>
        {data?.map(
          (el: {
            name:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined;
            path: any;
            idCategory: any;
            categoryImage: ImageSourcePropType | undefined;
          }) => {
            return (
              <>
                {el.name && (
                  <TouchableOpacity
                    style={styles.container}
                    onPress={() =>
                      navigation.navigate(el.path, {
                        idCategory: el.idCategory,
                      })
                    }>
                    <View style={styles.imgBorder}>
                      <Image
                        resizeMode="center"
                        alt={'gif'}
                        source={el?.categoryImage}
                        style={styles.gifPicture}
                      />
                    </View>
                    <Text>{el.name}</Text>
                  </TouchableOpacity>
                )}
              </>
            );
          },
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categorieName: {
    color: '#090A0A',
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 32,
  },
  containerText: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '600',
    lineHeight: 28,
  },
  subTitle: {
    color: '#6D6D6D',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Inter',
    lineHeight: 28,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  scrollView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  gifPicture: {
    width: 151,
    height: 113,
    borderRadius: 100,
  },
  imgBorder: {
    width: 151,
    height: 113,
    borderRadius: 32,
    overflow: 'hidden',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20%',
    borderColor: Color.main,
    borderWidth: 4,
    backgroundColor: 'white',
  },
});
