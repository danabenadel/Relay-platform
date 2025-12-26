import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput,
  TouchableOpacity, StyleSheet
} from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword]   = useState('');

  const onLogin = () => {
    console.log('Login with', { username, password });
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.container}>
        <Text style={s.title}>Welcome</Text>
        <Text style={s.subtitle}>Sign In to continue</Text>

        <View style={{ height: 26 }} />

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          autoCapitalize="none"
          keyboardType="email-address"
          style={s.input}
        />

        <View style={{ height: 16 }} />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={s.input}
        />

        <View style={{ height: 26 }} />

        <TouchableOpacity style={s.button} onPress={onLogin} activeOpacity={0.85}>
          <Text style={s.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={{ height: 26 }} />

        <Text style={s.mutedCenter}>Forgot Password?</Text>
        <View style={{ height: 10 }} />
        <Text style={s.mutedCenter}>Don't have an account? Sign Up</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: 'bold', fontSize: 26, color: '#1C1C1C' },
  subtitle: { fontSize: 18, color: '#1C1C1C', marginTop: 6 },
  input: {
    width: '100%',
    borderWidth: 1, borderColor: '#CFCFD6',
    borderRadius: 6, paddingHorizontal: 12, paddingVertical: 12
  },
  button: {
    width: '100%', height: 49, backgroundColor: '#3B62FF',
    borderRadius: 10, alignItems: 'center', justifyContent: 'center'
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  mutedCenter: { fontSize: 14, color: '#87879D', textAlign: 'center' }
});
