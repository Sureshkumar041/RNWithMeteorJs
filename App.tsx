/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
// import Meteor, {Mongo, withTracker} from '@meteorrn/core';
import Meteor from 'react-native-meteor';
// import NetInfo from '@react-native-community/netinfo';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const collectionName = ['links', 'users'],
    currentCollectionName = collectionName?.[0];
  const IPAddress = '192.168.1.250';
  const baseURL = `http://${IPAddress}:3000/api`;
  const isDarkMode = useColorScheme() === 'dark';
  const [insertedData, setInsertedData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>('');
  const [deleteId, setDeleteId] = useState('');

  // const connectMongo = () => {
  //   try {
  //     Meteor.connect('localhost:27017/websocket');
  //     const Todos = new Mongo.Collection('suresh');
  //   } catch (error: any) {
  //     console.log('catch: ', error?.message);
  //   }
  // };

  // Insert data using Meteor func
  const insertData = async () => {
    try {
      Meteor.call(
        `${currentCollectionName}.insert`,
        {name: userData},
        (err: any, res: any) => {
          if (err) {
            console.log('Insert err: ', err);
          } else {
            console.log('res: ', res);
            setUserData('');
            setTimeout(() => {
              getData();
            }, 2000);
          }
        },
      );
    } catch (error: any) {
      console.log('catch insertData: ', error?.message);
    }
  };

  // Insert data using API
  const insertDataApi = async () => {
    try {
      // System IP Address
      const res = await fetch(`${baseURL}/links`, {
        method: 'post',
        body: JSON.stringify({name: userData}),
      });
      console.log('insertDataApi: ', await res.json());
      setUserData('');
      getData();
    } catch (error: any) {
      console.log('catch insertDataApi: ', error?.message);
    }
  };

  // Delete data using API
  const deleteDataApi = async (delId: string) => {
    try {
      const res = await fetch(`${baseURL}/links/${delId}`, {
        method: 'delete',
        body: JSON.stringify({name: userData}),
      });
      setUserData('');
      console.log('deleteDataApi: ', await res.json());
      getData();
    } catch (error: any) {
      console.log('catch deleteDataApi: ', error?.message);
    }
  };

  const deleteData = async (delId: string) => {
    try {
      // const res = await Meteor.collection(currentCollectionName).insertAsync({
      //   name: userData,
      // });
      const res = await Meteor.collection(currentCollectionName).remove({
        _id: delId,
      }); // This directly manipulates the collection
      console.log('deleteData: ', res);
      getData();
    } catch (error: any) {
      console.log('catch deleteData: ', error?.message);
    }
  };

  // Get data using API
  const getDataApi = async () => {
    try {
      const res = await fetch(`${baseURL}/links`, {
        method: 'get',
      });
      // console.log('getDataApi: ', await res.json());
    } catch (error: any) {
      console.log('catch getDataApi: ', error?.message);
    }
  };

  // @meteorrn/core using this package unable retrieve data from Collection
  const connectMongo = async () => {
    try {
      Meteor.connect('ws://192.168.1.250:3000/websocket');
      // if (getColletion.ready()) {
      const data = await Meteor.collection('links').find();
      console.log('data: ', data);
      // }
    } catch (error: any) {
      console.log('catch connectMongo: ', error?.message);
    }
  };

  // Get data using Meteor func
  const getData = async () => {
    try {
      const todosData = Meteor.collection(currentCollectionName).find();
      if (todosData) {
        setInsertedData(todosData);
      }
    } catch (error: any) {
      console.log('catch getData: ', error?.message);
    }
  };

  useEffect(() => {
    getDataApi();
  }, []);

  useEffect(() => {
    // connectMongo();
    Meteor.connect(`ws://${IPAddress}:3000/websocket`);

    // Subscribe to 'todos' collection
    const handle = Meteor.subscribe(currentCollectionName);

    // Check for subscription readiness and fetch data
    const interval = setInterval(() => {
      if (handle.ready()) {
        getData();
        clearInterval(interval);
      } else {
        console.log('Else: ', handle.ready());
      }
    }, 500);

    // Clean up on unmount
    return () => {
      handle.stop();
      clearInterval(interval);
    };
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            padding: 15,
            rowGap: 15,
          }}>
          <View>
            <TextInput
              placeholder="Enter text"
              value={userData}
              onChangeText={t => setUserData(t)}
              style={{borderWidth: 0.4, padding: 12}}
              onSubmitEditing={() => {
                console.log('Call');
                String(userData)?.trim() && insertData();
              }}
            />
          </View>
          <Button title="Clear input" onPress={() => setUserData('')} />
          <FlatList
            data={insertedData}
            keyExtractor={(item, index) => String(index)}
            renderItem={({item, index}) => (
              <TouchableOpacity
                style={{padding: 10, flexDirection: 'row', columnGap: 12}}
                onPress={() => {
                  deleteDataApi(item?._id);
                }}
                onLongPress={() => {
                  deleteData(item?._id);
                }}>
                <Text>{index + 1}</Text>
                <Text>{item?.name}</Text>
              </TouchableOpacity>
            )}
          />
          <Button
            title="Insert data using Api"
            onPress={() => insertDataApi()}
          />
          {/* <Button
            title="Delete data using Api"
            onPress={() => deleteDataApi()}
          /> */}
          <Text>Click on any row it will delete directly from collection</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
