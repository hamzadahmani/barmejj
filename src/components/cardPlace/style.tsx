import {Text} from 'native-base';
import styled from 'styled-components/native';

export const imageBg = {
  backgroundImage: 'url("https://wallpaperaccess.com/full/317501.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
export const StyledTitle = styled(Text)`
  font-family: 'Manrope';
  font-style: normal;
  font-weight: 700;
  font-size: 18px;
  line-height: 24px;
  color: #464646;
`;
export const StyledSubTitle = styled(Text)`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 12px;
`;
export const StyledStatus = styled(Text)`
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 10px;
  line-height: 12px;
  color: white;
  width: 50px;
  padding: 2px 8px;
  border-radius: 4px;
`;
