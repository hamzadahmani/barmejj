import {Button, Flex, Input, Modal} from 'native-base';
import React, {useState} from 'react';
import DatePicker, {getFormatedDate} from 'react-native-modern-datepicker';
import {Color} from '../../helpers/constatn';

export default function DatePickerForm({onChange, onBlur, value}: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    getFormatedDate(new Date(), 'YYYY-MM-DD'),
  );
  return (
    <>
      <Input
        type={'text'}
        backgroundColor={'#F9F9F9'}
        borderColor={'#F9F9F9'}
        borderRadius={'10px'}
        _focus={{
          borderColor: Color.main,
          backgroundColor: 'rgba(241, 241, 254, 1)',
        }}
        placeholder={'date de naissance'}
        onPressIn={() => setModalVisible(true)}
        value={selectedDate?.toString()}
        onBlur={onBlur}
      />
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        paddingX={10}>
        <DatePicker
          selected={selectedDate}
          current={selectedDate}
          onSelectedChange={(date: any) =>
            setSelectedDate(date?.replaceAll('/', '-'))
          }
          maximumDate={getFormatedDate(new Date(), 'YYYY-MM-DD')}
          mode="calendar"
          options={{
            textHeaderColor: Color.main,
            textDefaultColor: Color.main,
            selectedTextColor: '#fff',
            mainColor: Color.main,
            textSecondaryColor: Color.main,
            borderColor: 'rgba(122, 146, 165, 0.1)',
          }}
        />
        <Flex
          flexDirection={'row'}
          justifyContent={'space-around'}
          backgroundColor={'#FFF'}
          width={'100%'}
          py={2}>
          <Button
            backgroundColor={'#E7EAEE'}
            borderRadius={'5px'}
            _text={{
              color: 'rgba(125, 128, 141, 1)',
            }}
            onPress={() => {
              setModalVisible(false);
            }}
            width={100}>
            Annuler
          </Button>
          <Button
            width={100}
            borderRadius={'5px'}
            backgroundColor={Color.main}
            onPress={() => {
              onChange(selectedDate), setModalVisible(false);
            }}>
            Confirmer
          </Button>
        </Flex>
      </Modal>
    </>
  );
}
