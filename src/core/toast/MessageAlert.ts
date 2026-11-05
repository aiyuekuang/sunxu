import { Alert } from 'react-native';

export function messageAlert(title: string, message: string, buttonText = '我知道了') {
  Alert.alert(title, message, [{ text: buttonText }], { cancelable: true });
}
