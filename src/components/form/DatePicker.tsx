import {Button, Flex, Input, Modal} from 'native-base';
import React, {useEffect, useState} from 'react';
import DatePicker, {getFormatedDate} from 'react-native-modern-datepicker';
import {Color} from '../../helpers/constatn';

export default function DatePickerForm({
  onChange,
  onBlur,
  value,
  disable = false,
}: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    value || getFormatedDate(new Date(), 'YYYY-MM-DD'),
  );

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  const openPicker = () => {
    if (disable) {
      return;
    }

    setModalVisible(true);
  };
  return (
    <>
      <Input
        type={'text'}
        backgroundColor={disable ? '#F4F3F7' : '#F9F9F9'}
        borderColor={disable ? '#E8E5EE' : '#F9F9F9'}
        borderRadius={'10px'}
        _focus={{
          borderColor: Color.main,
          backgroundColor: 'rgba(241, 241, 254, 1)',
        }}
        placeholder={'date de naissance'}
        onPressIn={disable ? undefined : openPicker}
        value={selectedDate?.toString()}
        onBlur={onBlur}
        editable={false}
        showSoftInputOnFocus={false}
        isReadOnly
        isDisabled={disable}
        opacity={disable ? 1 : undefined}
        _disabled={{
          color: Color.text,
          backgroundColor: '#F4F3F7',
          opacity: 1,
        }}
      />
      <Modal
        isOpen={!disable && modalVisible}
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
              onChange(selectedDate);
              setModalVisible(false);
            }}>
            Confirmer
          </Button>
        </Flex>
      </Modal>
    </>
  );
}
