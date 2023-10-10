import { Text, View } from 'react-native';

const Texto = ({ texto1, texto2 }) => {
  return (
    <View
      style={{
        flex: 1,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color:'#c73' }}>{texto1}</Text>
      <Text style={{fontWeight:'800', color:'#58c'}}>{texto2}</Text>
    </View>
  );
};

export default Texto;
