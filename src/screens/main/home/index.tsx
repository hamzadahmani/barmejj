import React from 'react';
import MainLayout from '../../../components/layouts/mainLayout';
import ListCardItems from '../../../components/listCardItems';

export default function HomeScreen({navigation, route}: any) {
  const {idCategory} = route.params;
  return (
    <MainLayout>
      <ListCardItems navigation={navigation} idCategory={idCategory} />
    </MainLayout>
  );
}
