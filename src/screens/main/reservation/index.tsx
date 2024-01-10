import {
  Box,
  Flex,
  Input,
  ScrollView,
  Text,
  ChevronUpIcon,
  ChevronDownIcon,
  Divider,
  Modal,
  Button,
  FlatList,
  TextArea,
  useToast,
} from 'native-base';
import React, {useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import SvgComponentCalendar from '../../../assets/Calendar';
import SvgUser from '../../../assets/UserRounded';
import {Color} from '../../../helpers/constatn';
import DatePicker, {getToday} from 'react-native-modern-datepicker';
import {useMutation} from '@tanstack/react-query';
import {addReservationAPI} from '../../../services/reservation';
import LoadingSpinner from '../../../components/Loader';
import {
  transformTime,
  trasformedReservationTime,
} from '../../../helpers/functions';
import Toast from '../../../components/toast';

export default function Resevation({route, navigation}: any) {
  const {id} = route.params;
  const [gustNumber, setGustNumber] = useState('0');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [modalVisible, setModalVisible] = React.useState(false);
  const toast = useToast();

  const [selectedTime, setSelectedTime] = useState(null);
  const [note, setNote] = useState('');

  const startTime = new Date(0, 0, 0, 10, 0, 0); // 10:00 AM
  const endTime = new Date(0, 0, 0, 18, 0, 0); // 6:00 PM

  const timeIntervals = [];
  let currentTime = new Date(startTime);
  while (currentTime <= endTime) {
    const formattedTime = currentTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    timeIntervals.push({label: formattedTime, value: formattedTime});
    currentTime.setMinutes(currentTime.getMinutes() + 30);
  }

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={{padding: 10}}
      onPress={() => setSelectedTime(item.value)}>
      <Text
        style={{
          color: selectedTime === item.value ? Color.main : 'black',
          borderColor: selectedTime === item.value ? Color.main : 'black',
          borderWidth: 1,
          width: 70,
          borderRadius: 8,
          backgroundColor: selectedTime === item.value ? '#F3F0FF' : 'white',
          textAlign: 'center',
          fontFamily: 'Poppins',
          fontSize: 12,
          fontWeight: 600,
          paddingVertical: 7,
        }}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const handleChange = (text: string) => {
    const newValue = text.replace(/[^0-9]/g, '');
    setGustNumber(newValue);
  };
  const handleChangeNote = (text: string) => {
    setNote(text);
  };

  const handleUp = () => setGustNumber((Number(gustNumber) + 1).toString());
  const handleDown = () => setGustNumber((Number(gustNumber) - 1).toString());

  const {mutate: reservationMutate, isLoading} = useMutation(
    (data: any) => addReservationAPI(data),
    {
      onSuccess: () => {
        navigation.goBack();

        toast.show({
          placement: 'top',
          render: () => {
            return (
              <Toast
                message={'Votre réservation a bien été enregistrée'}
                status={'#008000'}
              />
            );
          },
        });
      },
      onError: err => {
        console.warn('err', err);
      },
    },
  );

  const handleSubmitReservation = () => {
    const dataToSend = {
      idPlace: id,
      reservationDate: selectedDate.replaceAll('/', '-'),
      reservationTime: transformTime(selectedTime ?? ''),
      numberOfPersons: Number(gustNumber),
      message: note,
    };

    reservationMutate(dataToSend);
  };
  return (
    <ScrollView paddingX={15} contentContainerStyle={{paddingBottom: 100}}>
      {<LoadingSpinner visible={isLoading} />}

      <Box bgColor={'#fff'} mt={2} borderRadius={10} py={'12px'} px={'17px'}>
        <Text mb={2}>Veuillez sélectionner le nombre d'invités</Text>
        <Input
          mx="3"
          placeholder="Input"
          w="100%"
          value={gustNumber}
          InputLeftElement={<SvgUser />}
          backgroundColor={'#F9F9F9'}
          keyboardType={'numeric'}
          borderColor={'#F9F9F9'}
          onChangeText={handleChange}
          borderRadius={'10px'}
          InputRightElement={
            <Flex flexDirection={'row'} gap={2} mr={2}>
              <TouchableOpacity
                onPress={handleUp}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff',
                  padding: 7,
                  borderRadius: 6,
                }}>
                <ChevronUpIcon color={Color.main} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDown}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#fff',
                  padding: 7,
                  borderRadius: 6,
                }}>
                <ChevronDownIcon color={Color.main} />
              </TouchableOpacity>
            </Flex>
          }
        />
      </Box>

      <Box bgColor={'#fff'} mt={2} borderRadius={10} py={'12px'} px={'17px'}>
        {selectedDate && <Text>{selectedDate}</Text>}

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text mb={2}>Veuillez choisir une heure ci-dessous</Text>
          <SvgComponentCalendar />
        </TouchableOpacity>
        <Divider my={2} />
        <Modal
          isOpen={modalVisible}
          onClose={() => setModalVisible(false)}
          paddingX={10}>
          <DatePicker
            selected={selectedDate}
            onSelectedChange={(date: any) => setSelectedDate(date)}
            minimumDate={new Date()?.toString()}
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
                setSelectedDate(getToday()), setModalVisible(false);
              }}
              width={100}>
              Annuler
            </Button>
            <Button
              width={100}
              borderRadius={'5px'}
              backgroundColor={Color.main}
              onPress={() => setModalVisible(false)}>
              Confirmer
            </Button>
          </Flex>
        </Modal>
        <View>
          <FlatList
            contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap'}}
            data={trasformedReservationTime(startTime, endTime)}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <Divider my={2} />

        <TextArea
          style={{
            backgroundColor: '#F9F9F9',
            borderColor: Color.main,
            borderRadius: 10,
            borderWidth: 1,
          }}
          onChangeText={handleChangeNote}
          value={note}
          h={20}
          placeholder="Tapez votre note"
          autoCompleteType={undefined}
        />
      </Box>

      <Flex />
      <Button
        borderRadius={'12px'}
        mt={3}
        onPress={handleSubmitReservation}
        backgroundColor={Color.main}>
        Réservez
      </Button>
    </ScrollView>
  );
}
