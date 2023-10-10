import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function Tela2() {
  const [data, setData] = useState([]);
  const [arrematantes, setArrematantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [valor, setValor] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedArrematante, setSelectedArrematante] = useState('');

  const ConfirmaDialogo = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Campo vazio</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  useEffect(() => {
    // Carregar a lista de lances da API 'https://leilao-rest-api.herokuapp.com/lance'
    fetch('https://leilao-rest-api.herokuapp.com/lance')
      .then((resp) => resp.json())
      .then((json) => {
        setData(json);
        // Mapear os arrematantes únicos com base em seus IDs
        const uniqueArrematantes = Array.from(new Set(json.map((lance) => (lance.arrematante ? lance.arrematante.id : null))));
        setArrematantes(uniqueArrematantes.filter(Boolean)); // Filtrar nulos
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  // Função para carregar os nomes dos arrematantes com base nos IDs
  const loadArrematanteNomes = async () => {
    const nomes = await Promise.all(
      arrematantes.map(async (arrematanteId) => {
        const response = await fetch(`https://leilao-rest-api.herokuapp.com/participante/${arrematanteId}`);
        const data = await response.json();
        return { id: arrematanteId, nome: data.nome };
      })
    );
    return nomes;
  };

  useEffect(() => {
    // Carregar os nomes dos arrematantes
    loadArrematanteNomes().then((nomes) => {
      setArrematantes(nomes);
    });
  }, []);

  const enviar = () => {
    postLance();
  };

  const postLance = () => {
    if (selectedArrematante === '' || valor === '') {
      setModalVisible(true);
    } else {
      const lanceObj = {
        valor: parseFloat(valor),
        arrematante: {
          id: selectedArrematante,
        },
      };

      fetch('https://leilao-rest-api.herokuapp.com/lance', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lanceObj),
      })
        .then((response) => response.json())
        .then(() => {
          setSelectedArrematante('');
          setValor('');
          // Recarregar a lista de lances após o cadastro
          fetch('https://leilao-rest-api.herokuapp.com/lance')
            .then((resp) => resp.json())
            .then((json) => {
              setData(json);
            })
            .catch((error) => console.error(error));
        })
        .catch((error) => console.error(error));
    }
  };


  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          <ConfirmaDialogo />
          <Picker
            selectedValue={selectedArrematante}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedArrematante(itemValue)
            }>
            <Picker.Item label="Selecione um arrematante" value="" />
            {arrematantes.map((arrematante) => (
              <Picker.Item
                key={arrematante.id.toString()}
                label={arrematante.nome} // Mostrar o nome do arrematante aqui
                value={arrematante.id.toString()}
              />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            onChangeText={setValor}
            value={valor}
            placeholder="Valor"
          />
          <View style={styles.button}>
            <Button title="Enviar" onPress={() => enviar()} />
          </View>
          <FlatList
            data={data}
            style={{ margin: 12 }}
            renderItem={({ item }) => {
              return (
                <View style={styles.item}>
                  <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <Text style={styles.valor}>Valor: {item.valor}</Text>
                    <Text style={styles.nomeArrematante}>Arrematante: {item.arrematante ? item.arrematante.nome : 'N/A'}</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f0d071',
    padding: 8,
  },
  valor: {
    fontSize: 16,
    marginRight: 8,
  },
  nomeArrematante: {
    fontSize: 16,
    flex: 1,
  },
  item: {
    marginVertical: 8,
    flexDirection: 'row',
    borderBottomWidth: 0.2,
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 0.5,
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 10,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    marginHorizontal: 12,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
