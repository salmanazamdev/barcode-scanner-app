import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Linking,
  ScrollView,
  Dimensions 
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface ScannedItem {
  id: string;
  type: string;
  data: string;
  timestamp: Date;
}

export default function BarcodeScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    const newScannedItem: ScannedItem = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date()
    };

    setScannedItems(prev => [newScannedItem, ...prev]);

    // Show scan result
    Alert.alert(
      'Barcode Scanned! 🎉',
      `Type: ${type}\nData: ${data}`,
      [
        { text: 'Scan Again', onPress: () => setScanned(false) },
        { text: 'Stop Scanning', onPress: () => setScanning(false) },
        data.startsWith('http') ? { 
          text: 'Open Link', 
          onPress: () => Linking.openURL(data) 
        } : null
      ].filter(Boolean) as any
    );
  };

  const startScanning = () => {
    setScanning(true);
    setScanned(false);
  };

  const stopScanning = () => {
    setScanning(false);
    setScanned(false);
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scanned items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setScannedItems([]) }
      ]
    );
  };

  const copyToClipboard = async (text: string) => {
    // Simple copy simulation - you can add expo-clipboard for real copying
    Alert.alert('Copied!', `"${text}" has been copied!`);
  };

  const openLink = (data: string) => {
    if (data.startsWith('http')) {
      Linking.openURL(data);
    } else {
      Alert.alert('Not a valid URL', 'This barcode data is not a web link');
    }
  };

  // Handle permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Camera Permission</Text>
        </View>
        
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            We need camera access to scan barcodes
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Barcode Scanner</Text>
      </View>

      {scanning ? (
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'pdf417',
                'aztec',
                'ean13',
                'ean8',
                'upc_e',
                'datamatrix',
                'code128',
                'code39',
                'codabar',
                'itf14',
                'upc_a'
              ]
            }}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>
                {scanned ? 'Barcode scanned! ✅' : 'Point camera at barcode'}
              </Text>
              
              <View style={styles.scannerControls}>
                <TouchableOpacity 
                  style={[styles.controlButton, styles.stopButton]} 
                  onPress={stopScanning}
                >
                  <Text style={styles.controlButtonText}>Stop</Text>
                </TouchableOpacity>
                
                {scanned && (
                  <TouchableOpacity 
                    style={[styles.controlButton, styles.scanAgainButton]} 
                    onPress={() => setScanned(false)}
                  >
                    <Text style={styles.controlButtonText}>Scan Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <TouchableOpacity style={styles.startButton} onPress={startScanning}>
            <Text style={styles.startButtonText}>📷 Start Scanning</Text>
          </TouchableOpacity>

          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>
                Scanned Items ({scannedItems.length})
              </Text>
              {scannedItems.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {scannedItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No items scanned yet. Start scanning to see your history here! 📱
                </Text>
              </View>
            ) : (
              scannedItems.map((item) => (
                <View key={item.id} style={styles.historyItem}>
                  <View style={styles.historyItemHeader}>
                    <Text style={styles.historyItemType}>{item.type}</Text>
                    <Text style={styles.historyItemTime}>
                      {item.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  
                  <Text style={styles.historyItemData} numberOfLines={3}>
                    {item.data}
                  </Text>
                  
                  <View style={styles.historyItemActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => copyToClipboard(item.data)}
                    >
                      <Text style={styles.actionButtonText}>Copy</Text>
                    </TouchableOpacity>
                    
                    {item.data.startsWith('http') && (
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.linkButton]}
                        onPress={() => openLink(item.data)}
                      >
                        <Text style={styles.actionButtonText}>Open Link</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#8875FF',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#8875FF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 3,
    borderColor: '#8875FF',
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scannerControls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 15,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 90,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  scanAgainButton: {
    backgroundColor: '#4CAF50',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  startButton: {
    backgroundColor: '#8875FF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#8875FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historySection: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  historyItem: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8875FF',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemType: {
    color: '#8875FF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  historyItemTime: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  historyItemData: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  historyItemActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#404040',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  linkButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});