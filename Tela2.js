import { useState, useEffect } from 'react';
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

export default function Tela2() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [nome, onChangeNome] = useState('');
  const [cpf, onChangeCPF] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [idUserEditing, setIdUserEditing] = useState(-1);
  const [indexEditing, setIndexEditing] = useState(-1);
  const [index, setIndex] = useState(-1);

  const editar = (index) => {
    console.log('editando ' + index);
    console.log('editando ' + data[index].id);
    setIndexEditing(index);
    setIdUserEditing(data[index].id);
    onChangeNome(data[index].nome);
    onChangeCPF(data[index].cpf);
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
            <Text style={styles.modalText}>Confirma?</Text>
            <View
              style={{ flexDirection: 'row' }}>
              <Pressable
                style={[styles.button, styles.buttonClose, { flex: 1 }]}
                onPress={() => setDialogVisible(!dialogVisible)}>
                <Text style={styles.textStyle}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonClose, { flex: 1 }]}
                onPress={() => {
                  setDialogVisible(!dialogVisible);
                  deleteUser(data[index].id);
                }}>
                <Text style={styles.textStyle}>ok</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const confirmaAlert = () => {
    Alert.alert(
      'Confirma?',
      `Usuário ${data[index].nome} - ID ${data[index].id} será excluído`,
      [
        {
          text: 'Cancela',
        },
        { text: 'Confirma', onPress: () => deleteUser(data[index].id) },
      ]
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
            <Text style={styles.modalText}>Campo vazio</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>ok</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  };

  useEffect(() => {
    fetch('https://leilao-rest-api.herokuapp.com/participante')
      .then((resp) => resp.json())
      .then((json) => {
        console.log('1', json);
        setData(json);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [posting]);

  const enviar = () => {
    idUserEditing === -1 ? postUser() : putUser();
    setIdUserEditing(-1);
    setIndexEditing(-1);
    onChangeCPF('');
    onChangeNome('');
  };

  const postUser = () => {
    if (nome == '' || cpf == '') {
      setModalVisible(true);
    } else {
      fetch('https://leilao-rest-api.herokuapp.com/participante', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome,
          cpf: cpf,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((responseData) => {
          console.log(JSON.stringify(responseData));
          setPosting(!posting);
        })
        .finally();
    }
  };

  const putUser = () => {
    if (nome == '' || cpf == '') {
      setModalVisible(true);
    } else {
      fetch(
        `https://leilao-rest-api.herokuapp.com/participante/${idUserEditing}`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: nome,
            cpf: cpf,
          }),
        }
      )
        .then((response) => {
          return response.json();
        })
        .then((responseData) => {
          console.log(JSON.stringify(responseData));
          setPosting(!posting);
        })
        .finally();
    }
  };

  const deleteUser = (id) => {
    fetch(`https://leilao-rest-api.herokuapp.com/participante/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao excluir o usuário');
        }
        // Não é necessário analisar a resposta, pois ela está vazia
        // return response.json();
        setPosting(!posting);
      })
      .catch((error) => {
        console.error(error);
        // Trate o erro aqui de acordo com as suas necessidades
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
            onChangeText={onChangeNome}
            value={nome}
            placeholder="Nome"
          />
          <TextInput
            style={styles.input}
            onChangeText={onChangeCPF}
            value={cpf}
            placeholder="CPF"
          />
          <View style={styles.button}>
            <Button title="Enviar" onPress={() => enviar()} />
          </View>
          <FlatList
            data={data}
            style={{ margin: 12 }}
            renderItem={({ item, index }) => {
              return (
                <Pressable onPress={() => editar(index)}>
                  <View style={styles.item}>
                    <View
                      style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <Text style={styles.name}>{item.nome}</Text>
                      <Text style={styles.cpf}>{item.cpf}</Text>
                    </View>
                    {indexEditing === index ? (
                      <MaterialIcons name="edit" size={12} color="red" />
                    ) : (
                      // botão para excluir recurso
                      <Pressable
                        onPress={() => {
                          setIndex(index);
                          setDialogVisible(true);
                        }}>
                        <MaterialIcons
                          name="cancel"
                          size={18}
                          color="red"
                          style={{ padding: 4 }}
                        />
                      </Pressable>
                    )}
                  </View>
                </Pressable>
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
  name: {
    fontSize: 12,
    marginRight: 8,
    flex: 2,
  },
  cpf: {
    fontSize: 12,
    marginRight: 8,
    flex: 3,
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
