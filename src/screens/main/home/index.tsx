import React from 'react';
import MainLayout from '../../../components/layouts/mainLayout';
import ListCardItems from '../../../components/listCardItems';

export default function HomeScreen({navigation, route}: any) {
  const {idCategory, intent, interest} = route.params ?? {};
  return (
    <MainLayout>
      <ListCardItems key={interest || intent || idCategory || "all"} navigation={navigation} idCategory={idCategory} intent={intent} interest={interest} />
    </MainLayout>
  );
}
