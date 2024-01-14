import {Avatar, Box, HStack, Text} from 'native-base';
import React, {useContext} from 'react';
import {AuthContext} from '../../routes/auth/authProvider';
import {StyledUserName} from './styles';

export default function UserDetails() {
  const {userInfo} = useContext(AuthContext) || {};
  console.log('userInfo', userInfo);
  return (
    <HStack>
      <Avatar
        bg="green.500"
        source={{
          uri:
            userInfo?.userPhoto ??
            'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        }}
      />
      <Box paddingX={2}>
        <Text color={'#A1A7B0'}>Bonjour</Text>
        <StyledUserName>
          {`${userInfo?.firstName}  ${userInfo?.lastName}` ?? '-'}
        </StyledUserName>
      </Box>
    </HStack>
  );
}
