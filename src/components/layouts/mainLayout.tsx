import {Flex} from 'native-base';
import React from 'react';

export default function MainLayout({children}: any) {
  return (
    <Flex flex={1} bgColor={'#F7F5F9'}>
      {children}
    </Flex>
  );
}
