import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { classifyWithGemini } from '../services/geminiService';
import { auth } from '../config/firebase';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      await requestPermission();
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  const captureAndClassify = async () => {
    if (!cameraRef.current) return;
    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      const { latitude, longitude } = location.coords;

      const result = await classifyWithGemini(photo.uri);

      navigation.navigate('Results', {
        imageUri: photo.uri,
        result,
        location: { latitude, longitude },
        userId: auth.currentUser?.uid,
      });
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
    }
    setIsProcessing(false);
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermission}>
          Camera access is required. Please enable it in Settings.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.frameGuide} />
          <Text style={styles.hint}>
            Centre the diseased leaf in the frame
          </Text>
        </View>
      </CameraView>

      {isProcessing ? (
        <View style={styles.processingBar}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.processingText}>Analysing leaf...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.captureButton} onPress={captureAndClassify}>
          <Text style={styles.captureText}>📸 Scan Crop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frameGuide: {
    width: 260, height: 260,
    borderWidth: 2, borderColor: '#4CAF50',
    borderRadius: 12, backgroundColor: 'transparent',
  },
  hint: { color: '#fff', marginTop: 12, fontSize: 14, textAlign: 'center' },
  captureButton: {
    backgroundColor: '#2E7D32', padding: 18,
    margin: 24, borderRadius: 50, alignItems: 'center',
  },
  captureText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  processingBar: {
    backgroundColor: '#1B5E20', padding: 18,
    margin: 24, borderRadius: 50,
    flexDirection: 'row', justifyContent: 'center', gap: 12,
  },
  processingText: { color: '#fff', fontSize: 16 },
  noPermission: { color: '#fff', textAlign: 'center', padding: 40, fontSize: 16 },
  button: { backgroundColor: '#2E7D32', padding: 16, margin: 24, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});