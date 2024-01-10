import {Input, Text} from 'native-base';
import styled from 'styled-components/native';
export const StyledSearchInput = styled(Input)`
  height: 48px;
  background: #ffffff;
  box-shadow: 0px 4px 12px rgba(188, 188, 188, 0.19);
  border-radius: 12px;
  border-width: 0px;
  font-size: 15px;
`;
export const StyledName = styled(Text)`
  color: #101828;
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px; /* 150% */
`;
export const StyledSubName = styled(Text)`
  color: #667085;
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
`;
export const StyledTextStatus = styled(Text)`
  color: #df563f;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
`;
