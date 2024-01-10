import {Flex} from 'native-base';
import React from 'react';

export default function MainLayout({children}: any) {
  return (
    <Flex gap={5} paddingX={5} bgColor={'#F5F5F5'}>
      {children}
    </Flex>
  );
}
