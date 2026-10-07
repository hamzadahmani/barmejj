import {Avatar, Box, HStack, Text} from 'native-base';
import React, {useContext} from 'react';
import {AuthContext} from '../../routes/auth/authProvider';
import {StyledUserName} from './styles';

export default function UserDetails() {
  const {userInfo} = useContext(AuthContext) || {};
  return (
    <HStack alignItems="center" justifyContent="space-between">
      <HStack alignItems="center">
        <Avatar
          bg="#E8E2F5"
          size="md"
          source={{
            uri:
              userInfo?.userPhoto ??
              'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          }}
        />
        <Box paddingX={3}>
          <Text color={'#8B8793'} fontSize="xs">
            Bonjour
          </Text>
          <StyledUserName>
            {userInfo?.firstName || userInfo?.lastName
              ? `${userInfo?.firstName ?? ''} ${
                  userInfo?.lastName ?? ''
                }`.trim()
              : 'Bienvenue sur Barmej'}
          </StyledUserName>
        </Box>
      </HStack>
      <Box
        width={10}
        height={10}
        borderRadius={14}
        bg="#EFE9FC"
        alignItems="center"
        justifyContent="center">
        <Text fontSize="lg">⌁</Text>
      </Box>
    </HStack>
  );
}
