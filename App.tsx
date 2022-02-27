/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState } from 'react';
import type { Node } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  FlatList,
  View,
  PanResponder,
  Animated,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import Easing from 'react-native/Libraries/Animated/Easing';

const styles = StyleSheet.create({
  item: {
    textAlign: 'center',
    textAlignVertical : 'center',
    borderRadius: 5,
    width: 50,
    height: 50,
    margin: 6
  }
});

const renderGridItem = ({item, index, separators}, refresh, setRefresh) => {
  const state = {
      pan: new Animated.ValueXY()
  };

  const itemStyleValido = {
    backgroundColor: item !== -1 ? 'red' : 'blue',
    ...styles.item
  }

  let x = 0;
  let y = 0;
  let podeMover = false;
  let podeMoverDireita = false;
  let podeMoverEsquerda = false;
  let podeMoverBaixo = false;
  let podeMoverCima = false;

  gridData.forEach((row, rowIndex) => {
    const itemEncontrado = row.findIndex(e => e === item);
    if(itemEncontrado !== -1) {
      y = rowIndex;
      x = itemEncontrado;
    }
  });
  
  if(gridData[y][x+1] === -1) {
    podeMover = true;
    podeMoverDireita = true;
  }

  if(gridData[y][x-1] === -1) {
    podeMover = true;
    podeMoverEsquerda = false;
  }

  if(gridData[y+1]) {
    if(gridData[y+1][x] === -1) {
      podeMover = true;
      podeMoverBaixo = true;
    }
  }
  
  if(gridData[y-1]) {
    if(gridData[y-1][x] === -1) {
      podeMover = true;
      podeMoverCima = true;
    }  
  }
  
  const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => podeMover,

      onPanResponderMove: function (evt, gestureState) {
        Animated.event([null,{
          dx: (podeMoverEsquerda || podeMoverDireita) ? state.pan.x : new Animated.ValueXY().x,
          dy: (podeMoverBaixo || podeMoverCima) ? state.pan.y : new Animated.ValueXY().y
        }], { useNativeDriver: false })(...arguments);
      },
      
      onPanResponderRelease: (e, gesture) => {
        console.log(gesture.dx);
        flatListItemsStates.forEach((item, index) => {
          const state = item;

          Animated.timing(
              state.pan, {
              toValue: { x:0, y:0 },
              easing: Easing.inOut(Easing.exp),
              useNativeDriver: false
            }
          ).start(({finished}) => {
            if(index == flatListItemsStates.length-1 && finished) {
              flatListItemsStates = [];
              setRefresh(!refresh);
            }
          });
        });
      }
  });

  const listItem = (
    <Animated.View 
      style={{
        transform: [{
            translateX: state.pan.x.interpolate({
                inputRange: [podeMoverEsquerda ? -63 : 0 ,0, podeMoverDireita ? 63 : 0],
                outputRange: [podeMoverEsquerda ? -63 : 0, 0, podeMoverDireita ? 63 : 0],
                extrapolate: 'clamp'
            })
        }, {
            translateY: state.pan.y.interpolate({
              inputRange: [podeMoverCima ? -63: 0, 0, podeMoverBaixo ? 63 : 0],
              outputRange: [podeMoverCima ? -63: 0, 0, podeMoverBaixo ? 63 : 0],
              extrapolate: 'clamp'
            })
        }]
      }}
      {...panResponder.panHandlers}>
      <Text style={itemStyleValido}>{item}</Text>
    </Animated.View>
  );

  flatListItemsStates.push(state);

  return listItem;
};

const gridData = [
  [1,2,3,4],
  [5,6,7,8],
  [9,10,11,12],
  [13,14,15,16]
];

gridData[3][3] = -1;

let flatListItemsStates = [];

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [refresh, setRefresh] = useState(true);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
    alignItems: 'center',
    justifyContent: "center"
  };

  const centerView = {
    flex: 1
  };

  return (
    <SafeAreaView style={backgroundStyle}>
        <View style={{ flex: 1 }}></View>
        <FlatList
          style={centerView}
          numColumns="4"
          data={gridData.flat()}
          renderItem={(renderItemArguments) => renderGridItem(renderItemArguments, refresh, setRefresh)}
          extraData={refresh}
        />
        <View style={{ flex: 1 }}></View>
    </SafeAreaView>
  );
};

export default App;
