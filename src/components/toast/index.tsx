import {Box, Text} from 'native-base';
import React from 'react';

export default function Toast({message, status}: any) {
  return (
    <Box bg={status} px="5" py="2" rounded="sm" mb={5}>
      <Text color={'#fff'} fontSize={14} fontFamily={'Inter'}>
        {message}
      </Text>
    </Box>
  );
}
