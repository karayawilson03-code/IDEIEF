import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { WebView } from 'react-native-webview';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useTranslation } from 'react-i18next';
import '../config/i18n';

const DISEASE_COLORS: Record<string, string> = {
  'Late Blight': '#C62828',
  'Early Blight': '#E65100',
  'Bacterial Wilt': '#AD1457',
  'Common Scab': '#6A1B9A',
  'Black Scurf': '#212121',
  'Soft Rot': '#F57F17',
  'Healthy': '#2E7D32',
};

function getMapHTML(lat: number, lng: number, disease: string) {
  const color = DISEASE_COLORS[disease] ?? '#333';
  return `
<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>body,html,#map{margin:0;padding:0;height:200px}</style>
</head><body><div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false })
    .setView([${lat}, ${lng}], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  var icon = L.divIcon({
    html: '<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff"></div>',
    iconSize: [14, 14], className: ''
  });
  L.marker([${lat}, ${lng}], { icon: icon })
    .addTo(map).bindPopup('${disease}').openPopup();
</script></body></html>`;
}

export default function ResultsScreen({ route, navigation }) {
  const { imageUri, result, location, userId } = route.params;
  const [isSaved, setIsSaved] = useState(false);
  const [isSwahili, setIsSwahili] = useState(false);
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = isSwahili ? 'en' : 'sw';
    i18n.changeLanguage(newLang);
    setIsSwahili(!isSwahili);
  };

  useEffect(() => {
    saveReport();
  }, []);

  const saveReport = async () => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `reports/${userId}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'diseaseReports'), {
        userId,
        timestamp: new Date(),
        gpsLatitude: location.latitude,
        gpsLongitude: location.longitude,
        predictedDisease: result.disease,
        confidenceScore: result.confidence,
        inferenceSource: result.source,
        imageUrl,
        severity: result.severity,
      });

      setIsSaved(true);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const color = DISEASE_COLORS[result.disease] || '#333';
  const recommendation = isSwahili
    ? result.recommendation.sw
    : result.recommendation.en;

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: color }]}>
        <Text style={styles.headerLabel}>DIAGNOSIS</Text>
        <Text style={styles.diseaseName}>{result.disease}</Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            Confidence: {(result.confidence * 100).toFixed(0)}% · {result.severity} severity
          </Text>
        </View>
        <Text style={styles.inferenceNote}>
          ✓ Analysed by {result.source === 'gemini' ? 'Gemini Vision AI' : 'On-device AI'}
        </Text>
      </View>

      <Image source={{ uri: imageUri }} style={styles.leafImage} resizeMode="cover" />

      <View style={styles.languageRow}>
        <Text style={styles.langLabel}>English</Text>
        <Switch
          value={isSwahili}
          onValueChange={toggleLanguage}
          trackColor={{ true: '#2E7D32' }}
        />
        <Text style={styles.langLabel}>Kiswahili</Text>
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recTitle}>Management Recommendation</Text>
        <Text style={styles.recText}>{recommendation}</Text>
      </View>

      <WebView
        style={styles.map}
        source={{ html: getMapHTML(location.latitude, location.longitude, result.disease) }}
        scrollEnabled={false}
      />

      <View style={styles.metaCard}>
        <Text style={styles.metaText}>
          📍 {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </Text>
        <Text style={styles.metaText}>🕐 {new Date().toLocaleString()}</Text>
        <Text style={[styles.metaText, { color: isSaved ? '#2E7D32' : '#999' }]}>
          {isSaved ? '✓ Report saved to cloud' : '⏳ Saving to cloud...'}
        </Text>
      </View>

      <View style={styles.diseaseInfo}>
        <Text style={styles.diseaseInfoTitle}>About {result.disease}</Text>
        <Text style={styles.diseaseInfoText}>
          {result.disease === 'Late Blight' && 'Caused by Phytophthora infestans. Spreads rapidly in cool humid conditions.'}
          {result.disease === 'Early Blight' && 'Caused by Alternaria solani. Appears as dark concentric ring lesions.'}
          {result.disease === 'Bacterial Wilt' && 'Caused by Ralstonia solanacearum. No chemical cure available.'}
          {result.disease === 'Common Scab' && 'Caused by Streptomyces scabies. Affects tuber skin quality.'}
          {result.disease === 'Black Scurf' && 'Caused by Rhizoctonia solani. Affects stems and tubers.'}
          {result.disease === 'Soft Rot' && 'Caused by Pectobacterium carotovorum. Causes tuber decay.'}
          {result.disease === 'Healthy' && 'No disease detected. Continue monitoring your crop weekly.'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.btnText}>Scan Another Leaf</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('History')}>
          <Text style={styles.btnText}>View History</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { padding: 24, alignItems: 'center' },
  headerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, letterSpacing: 2 },
  diseaseName: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 6, textAlign: 'center' },
  confidenceBadge: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 },
  confidenceText: { color: '#fff', fontSize: 14 },
  inferenceNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 },
  leafImage: { width: '100%', height: 240 },
  languageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  langLabel: { fontSize: 15, fontWeight: '500' },
  recommendationCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 2 },
  recTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  recText: { fontSize: 15, lineHeight: 24, color: '#444' },
  map: { height: 200, margin: 16, borderRadius: 12, overflow: 'hidden' },
  metaCard: { margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, gap: 6 },
  metaText: { fontSize: 13, color: '#666' },
  diseaseInfo: { margin: 16, backgroundColor: '#F3E5F5', borderRadius: 12, padding: 16 },
  diseaseInfoTitle: { fontSize: 15, fontWeight: 'bold', color: '#4A148C', marginBottom: 8 },
  diseaseInfoText: { fontSize: 14, color: '#555', lineHeight: 22 },
  actions: { padding: 16, gap: 12, marginBottom: 32 },
  scanAgainBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center' },
  historyBtn: { backgroundColor: '#1565C0', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});