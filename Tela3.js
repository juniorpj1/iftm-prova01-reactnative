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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Tela3() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [valorMinimo, setValorMinimo] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [idItemToDelete, setIdItemToDelete] = useState(-1);

  const editar = (index) => {
    console.log('editando ' + index);
  };

  const ConfirmaDialogo = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={dialogVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Confirma exclusão?</Text>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                style={[styles.button, styles.buttonClose, { flex: 1 }]}
                onPress={() => setDialogVisible(!dialogVisible)}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose, { flex: 1 }]}
                onPress={() => {
                  setDialogVisible(!dialogVisible);
                  deleteItem(idItemToDelete);
                }}>
                <Text style={styles.textStyle}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const ModalErro = () => {
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
            <Text style={styles.modalText}>Campos vazios ou inválidos</Text>
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
    fetch('https://leilao-rest-api.herokuapp.com/itemdeleilao')
      .then((resp) => resp.json())
      .then((json) => {
        setData(json);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const enviar = () => {
    postItem();
  };

  const postItem = () => {
    if (nome === '' || valorMinimo === '') {
      setModalVisible(true);
    } else {
      const itemObj = {
        nome: nome,
        valorMinimo: parseFloat(valorMinimo),
        leilaoAberto: true,
      };

      fetch('https://leilao-rest-api.herokuapp.com/itemdeleilao', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemObj),
      })
        .then((response) => response.json())
        .then(() => {
          setNome('');
          setValorMinimo('');
          // Recarregar a lista de itens após o cadastro
          fetch('https://leilao-rest-api.herokuapp.com/itemdeleilao')
            .then((resp) => resp.json())
            .then((json) => {
              setData(json);
            })
            .catch((error) => console.error(error));
        })
        .catch((error) => console.error(error));
    }
  };

  const deleteItem = (id) => {
    fetch(`https://leilao-rest-api.herokuapp.com/itemdeleilao/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao excluir o item');
        }
        // Não é necessário analisar a resposta, pois ela está vazia
        // return response.json();
        // Recarregar a lista de itens após a exclusão
        fetch('https://leilao-rest-api.herokuapp.com/itemdeleilao')
          .then((resp) => resp.json())
          .then((json) => {
            setData(json);
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          <ModalErro />
          <ConfirmaDialogo />
          <TextInput
            style={styles.input}
            onChangeText={setNome}
            value={nome}
            placeholder="Nome"
          />
          <TextInput
            style={styles.input}
            onChangeText={setValorMinimo}
            value={valorMinimo}
            placeholder="Valor Mínimo"
            keyboardType="numeric"
          />
          <View style={styles.button}>
            <Button title="Cadastrar" onPress={() => enviar()} />
          </View>
          <FlatList
            data={data}
            style={{ margin: 12 }}
            renderItem={({ item }) => {
              return (
                <View style={styles.item}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nome}>{item.nome}</Text>
                    <Text style={styles.valorMinimo}>Valor Mínimo: R$ {item.valorMinimo.toFixed(2)}</Text>
                  </View>
                  <MaterialIcons
                    name="delete"
                    size={24}
                    color="red"
                    onPress={() => {
                      setIdItemToDelete(item.id);
                      setDialogVisible(true);
                    }}
                  />
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
  nome: {
    fontSize: 16,
    marginBottom: 4,
  },
  valorMinimo: {
    fontSize: 14,
    color: '#666',
  },
  item: {
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
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
