import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to Barcode Scanner Pro
      </Text>

      <ScrollView contentContainerStyle={styles.scroll}>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/features/barcodeScan")}
        >
          <Text style={styles.buttonText}>Scan Barcode</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181818",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 40,
    textAlign: "center",
    marginHorizontal: 30,
    marginTop: 20,
  },
  scroll: {
    flexGrow: 1,
  },
  button: {
    backgroundColor: "#8875FF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
