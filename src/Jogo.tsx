import React, { useState } from 'react';
import type { Node } from 'react';

import {
    SafeAreaView,
    Text,
    useColorScheme,
    FlatList,
    View,
    PanResponder,
    Animated,
    Alert
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import Easing from 'react-native/Libraries/Animated/Easing';
import { randomNumber } from './Util/Random';

let jaEstaMovendo = false,
    flatListItemsPans = [],
    gridData = [];

function novoJogo() {
    gridData = [];

    function gerarNumero() {
        const numRandom = randomNumber(1, 16);
        if (sequencia.find((e) => e === numRandom)) {
            gerarNumero();
            return;
        };
        sequencia.push(numRandom);
    }

    const sequencia = [randomNumber(1, 16)];
    
    while (sequencia.length !== 16) {
        gerarNumero();
    }

    sequencia[sequencia.findIndex(i => i === 16)] = -1;

    for (let index = 0; index < 4; index++) {
        gridData.push(sequencia.slice(index * 4, (index * 4 + 4)));
    }
}

novoJogo();

const blocoStyle = {
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: 5,
    width: 85,
    height: 85,
    margin: 5
};

const renderGridItem = ({item: blocoAtual, index, separators}, grid, setGrid) => {
    if (blocoAtual === -1) return <View style={{...blocoStyle}}></View>;

    const pan = new Animated.ValueXY();

    const itemStyleValido = {
        backgroundColor: blocoAtual !== -1 ? 'red' : 'blue',
        ...blocoStyle
    }

    let espacoEmBrancoX = 0,
        espacoEmBrancoY = 0,
        podeMover = false,
        podeMoverDireita = false,
        podeMoverEsquerda = false,
        podeMoverBaixo = false,
        podeMoverCima = false;

    grid.forEach((row, rowIndex) => {
        const espacoEmBrancoEncontrado = row.findIndex(e => e === blocoAtual);

        if (espacoEmBrancoEncontrado !== -1) {
            espacoEmBrancoY = rowIndex;
            espacoEmBrancoX = espacoEmBrancoEncontrado;
        }
    });

    if (grid[espacoEmBrancoY][espacoEmBrancoX + 1] === -1) {
        podeMover = true;
        podeMoverDireita = true;
    }

    if (grid[espacoEmBrancoY][espacoEmBrancoX - 1] === -1) {
        podeMover = true;
        podeMoverEsquerda = true;
    }

    if (grid[espacoEmBrancoY + 1]) {
        if (grid[espacoEmBrancoY + 1][espacoEmBrancoX] === -1) {
            podeMover = true;
            podeMoverBaixo = true;
        }
    }

    if (grid[espacoEmBrancoY - 1]) {
        if (grid[espacoEmBrancoY - 1][espacoEmBrancoX] === -1) {
            podeMover = true;
            podeMoverCima = true;
        }
    }

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => podeMover && !jaEstaMovendo,

        onPanResponderMove: function (evt, gestureState) {
            Animated.event([null, {
                dx: (podeMoverEsquerda || podeMoverDireita) ? pan.x : new Animated.ValueXY().x,
                dy: (podeMoverBaixo || podeMoverCima) ? pan.y : new Animated.ValueXY().y
            }], { useNativeDriver: false })(...arguments);
            jaEstaMovendo = true;
        },

        onPanResponderRelease: (e, gesture) => {
            if (Math.abs(gesture.dy) > 60 || Math.abs(gesture.dx) > 60) {
                let posicaoInvalidaX = 0;
                let posicaoInvalidaY = 0;

                grid.forEach((row, rowIndex) => {
                    const itemEncontrado = row.findIndex(e => e === -1);
                    if (itemEncontrado === -1) return;
                    posicaoInvalidaY = rowIndex;
                    posicaoInvalidaX = itemEncontrado;
                });

                grid[posicaoInvalidaY][posicaoInvalidaX] = blocoAtual;
                grid[espacoEmBrancoY][espacoEmBrancoX] = -1;

                flatListItemsPans.forEach((state, index) => {
                    Animated.timing(
                        pan, {
                        duration: 1,
                        toValue: { x: 0, y: 0 },
                        easing: Easing.linear(Easing.linear),
                        useNativeDriver: false
                    }
                    ).start(({ finished }) => {
                        if (index == flatListItemsPans.length - 1 && finished) {
                            flatListItemsPans = [];
                            setGrid([...grid]);
                            jaEstaMovendo = false;

                            if (grid.flat().join('') === [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, -1].join('')) {
                                Alert.alert("Parabéns!", "Você venceu!");
                                novoJogo();
                                setGrid([...gridData]);
                            }
                        }
                    });
                });

                return true;
            };

            flatListItemsPans.forEach((item, index) => {
                Animated.timing(pan, {
                    toValue: { x: 0, y: 0 },
                    easing: Easing.inOut(Easing.exp),
                    useNativeDriver: false
                }).start(({ finished }) => {
                    if (index == flatListItemsPans.length - 1 && finished) {
                        flatListItemsPans = [];
                        setGrid([...grid]);
                        jaEstaMovendo = false;
                    }
                });
            });
        }
    });

    const listItem = (
        <Animated.View
            style={{
                transform: [{
                    translateX: pan.x.interpolate({
                        inputRange: [(podeMoverEsquerda ? -95 : 0), 0, (podeMoverDireita ? 95 : 0)],
                        outputRange: [(podeMoverEsquerda ? -95 : 0), 0, (podeMoverDireita ? 95 : 0)],
                        extrapolate: 'clamp'
                    })
                }, {
                    translateY: pan.y.interpolate({
                        inputRange: [(podeMoverCima ? -95 : 0), 0, (podeMoverBaixo ? 95 : 0)],
                        outputRange: [(podeMoverCima ? -95 : 0), 0, (podeMoverBaixo ? 95 : 0)],
                        extrapolate: 'clamp'
                    })
                }]
            }}
            {...panResponder.panHandlers}>
            <Text style={itemStyleValido}>{blocoAtual}</Text>
        </Animated.View>
    );

    flatListItemsPans.push(pan);

    return listItem;
};

const App: () => Node = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const [grid, setGrid] = useState(gridData);
    
    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
        flex: 1, 
        alignItems: 'center',
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <FlatList
                style={{ width: 95*4, height: 95*4 }}
                contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                numColumns="4"
                data={grid.flat()}
                renderItem={(renderItemArguments) => renderGridItem(renderItemArguments, grid, setGrid)}
                extraData={grid.flat()}
            />
        </SafeAreaView>
    );
};

export default App;