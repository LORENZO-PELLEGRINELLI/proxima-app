import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// Component per mostrare lo stato della connessione
const ConnectionStatus = ({ isConnected }) => {
  return (
    <View
      style={[
        styles.connectionBadge,
        isConnected ? styles.connected : styles.disconnected,
      ]}
    >
      <View style={styles.statusIndicator} />
      <Text style={styles.connectionText}>
        {isConnected ? "Connected" : "Disconnected"}
      </Text>
    </View>
  );
};

// Component per la visualizzazione dei dati dei sensori
const SensorData = ({ distance, irLeft, irRight }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Feather name="compass" size={24} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Sensors</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.sensorValue}>
          <Text style={styles.sensorLabel}>Distance</Text>
          <Text style={styles.sensorReading}>{distance.toFixed(1)} cm</Text>
          <View style={styles.sensorBar}>
            <View
              style={[
                styles.sensorProgress,
                { width: `${Math.min(100, distance)}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.sensorsGrid}>
          <View style={styles.irSensor}>
            <Text style={styles.sensorLabel}>Left IR</Text>
            <Text
              style={[
                styles.sensorStatus,
                irLeft ? styles.clear : styles.blocked,
              ]}
            >
              {irLeft ? "Clear" : "Blocked"}
            </Text>
          </View>
          <View style={styles.irSensor}>
            <Text style={styles.sensorLabel}>Right IR</Text>
            <Text
              style={[
                styles.sensorStatus,
                irRight ? styles.clear : styles.blocked,
              ]}
            >
              {irRight ? "Clear" : "Blocked"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Component per la visualizzazione dello stato del movimento
const MovementStatus = ({ movement, speed }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Feather name="activity" size={24} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>Movement</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.movementInfo}>
          <View style={styles.currentStatus}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.movementValue}>{movement}</Text>
          </View>
          <View style={styles.speedDisplay}>
            <Text style={styles.statusLabel}>Speed</Text>
            <View style={styles.speedGauge}>
              <Text style={styles.speedValue}>{speed}%</Text>
              <View style={styles.speedBar}>
                <View style={[styles.speedIndicator, { width: `${speed}%` }]} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// Component per la visualizzazione dello stato del WiFi
const WifiStatus = ({ wifiStrength }) => {
  // Calcola la qualità del segnale in percentuale
  const signalQuality = Math.max(
    0,
    Math.min(100, (wifiStrength + 90) * (100 / 60))
  );
  let qualityLabel = "Very Poor";
  if (signalQuality > 80) qualityLabel = "Excellent";
  else if (signalQuality > 60) qualityLabel = "Good";
  else if (signalQuality > 40) qualityLabel = "Fair";
  else if (signalQuality > 20) qualityLabel = "Poor";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Feather name="wifi" size={24} style={styles.cardIcon} />
        <Text style={styles.cardTitle}>WiFi Status</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.wifiInfo}>
          <Text style={styles.signalValue}>{wifiStrength} dBm</Text>
          <View style={styles.signalMeter}>
            <View style={styles.signalBars}>
              <View
                style={[styles.bar, signalQuality > 20 && styles.activeBar]}
              />
              <View
                style={[styles.bar, signalQuality > 40 && styles.activeBar]}
              />
              <View
                style={[styles.bar, signalQuality > 60 && styles.activeBar]}
              />
              <View
                style={[styles.bar, signalQuality > 80 && styles.activeBar]}
              />
            </View>
            <Text style={styles.signalQuality}>{qualityLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function App() {
  const [robotData, setRobotData] = useState({
    distance: 0,
    irLeft: 1,
    irRight: 1,
    movement: "🛑 Stopped",
    speed: 0,
    wifiStrength: -65,
  });
  const [controlMode, setControlMode] = useState("manual");
  const [isConnected, setIsConnected] = useState(false);
  const commandIntervalRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(Dimensions.get("window").width);
    };
    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => subscription?.remove();
  }, []);

  const isTablet = windowWidth >= 768;

  // Fetch dei dati dal robot (simulazione o endpoint reale)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://192.168.1.50/data");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setRobotData(data);
        setIsConnected(true);
      } catch (error) {
        console.error("Request error:", error);
        setIsConnected(false);
      }
    };

    const interval = setInterval(fetchData, 100);
    return () => clearInterval(interval);
  }, []);

  // Funzione per inviare comandi al robot
  const sendCommand = async (command) => {
    try {
      await fetch(`http://192.168.1.50/command?cmd=${command}`);
    } catch (error) {
      console.error("Error sending command:", error);
    }
  };

  // Cambio modalità (manuale/autonomous)
  const switchMode = async (mode) => {
    setControlMode(mode);
    try {
      await fetch(`http://192.168.1.50/command?mode=${mode}`);
    } catch (error) {
      console.error("Error changing mode:", error);
    }
  };

  // Gestione degli eventi della tastiera (solo per emulazione su web)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (controlMode !== "manual") return;
      let command = "";
      switch (event.key) {
        case "ArrowUp":
          command = "forward";
          break;
        case "ArrowDown":
          command = "backward";
          break;
        case "ArrowLeft":
          command = "left";
          break;
        case "ArrowRight":
          command = "right";
          break;
        default:
          return;
      }
      if (!commandIntervalRef.current) {
        sendCommand(command);
        commandIntervalRef.current = setInterval(
          () => sendCommand(command),
          100
        );
      }
    };

    const handleKeyUp = (event) => {
      if (controlMode !== "manual") return;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        if (commandIntervalRef.current) {
          clearInterval(commandIntervalRef.current);
          commandIntervalRef.current = null;
        }
        sendCommand("stop");
      }
    };
  }, [controlMode]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            {/* Usando MaterialCommunityIcons per Monitor */}
            <MaterialCommunityIcons
              name="monitor-dashboard"
              size={28}
              style={styles.dashboardIcon}
            />
            <Text style={styles.headerTitle}>Robot Control Dashboard</Text>
          </View>
          <ConnectionStatus isConnected={isConnected} />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[styles.main, isTablet && styles.tabletMain]}
      >
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              controlMode === "autonomous" && styles.activeModeButton,
            ]}
            onPress={() => switchMode("autonomous")}
            disabled={controlMode === "autonomous"}
          >
            <Feather name="zap" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Autonomous Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              controlMode === "manual" && styles.activeModeButton,
            ]}
            onPress={() => switchMode("manual")}
            disabled={controlMode === "manual"}
          >
            <Feather name="compass" size={20} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Manual Mode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dashboardGrid}>
          <SensorData
            distance={robotData.distance}
            irLeft={robotData.irLeft}
            irRight={robotData.irRight}
          />
          <MovementStatus
            movement={robotData.movement}
            speed={robotData.speed}
          />
          <WifiStatus wifiStrength={robotData.wifiStrength} />
        </View>

        {controlMode === "manual" && (
          <View style={styles.manualControlPanel}>
            <Text style={styles.controlPanelTitle}>Manual Control</Text>
            <Text style={styles.controlDescription}>
              Use the buttons below or arrow keys on your keyboard
            </Text>
            <View style={styles.controlPad}>
              <TouchableOpacity
                style={styles.controlButton}
                onPressIn={() => sendCommand("forward")}
                onPressOut={() => sendCommand("stop")}
              >
                <Text style={styles.controlButtonText}>▲</Text>
              </TouchableOpacity>
              <View style={styles.middleRow}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => sendCommand("left")}
                  onPressOut={() => sendCommand("stop")}
                >
                  <Text style={styles.controlButtonText}>◄</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => sendCommand("stop")}
                >
                  <Text style={styles.controlButtonText}>■</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => sendCommand("right")}
                  onPressOut={() => sendCommand("stop")}
                >
                  <Text style={styles.controlButtonText}>►</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.controlButton}
                onPressIn={() => sendCommand("backward")}
                onPressOut={() => sendCommand("stop")}
              >
                <Text style={styles.controlButtonText}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.keyboardHint}>
              You can also use your keyboard arrow keys
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    backgroundColor: "#007bff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  dashboardIcon: {
    color: "#fff",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  connectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connected: {
    backgroundColor: "#4caf50",
  },
  disconnected: {
    backgroundColor: "#f44336",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginRight: 4,
  },
  connectionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  main: {
    padding: 16,
  },
  tabletMain: {
    paddingHorizontal: 32,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeModeButton: {
    backgroundColor: "#007bff",
  },
  buttonIcon: {
    marginRight: 4,
    color: "#000",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  dashboardGrid: {
    flexDirection: "column",
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 8,
    color: "#007bff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardContent: {
    // content styling for each card
  },
  sensorValue: {
    marginBottom: 12,
  },
  sensorLabel: {
    fontSize: 14,
    color: "#555",
  },
  sensorReading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sensorBar: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  sensorProgress: {
    height: 6,
    backgroundColor: "#007bff",
  },
  sensorsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  irSensor: {
    flex: 1,
    alignItems: "center",
  },
  sensorStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  clear: {
    color: "#4caf50",
  },
  blocked: {
    color: "#f44336",
  },
  movementInfo: {
    flexDirection: "column",
  },
  currentStatus: {
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#555",
  },
  movementValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  speedDisplay: {
    flexDirection: "column",
  },
  speedGauge: {
    marginTop: 4,
  },
  speedValue: {
    fontSize: 14,
    marginBottom: 4,
  },
  speedBar: {
    height: 6,
    backgroundColor: "#ddd",
    borderRadius: 3,
    overflow: "hidden",
  },
  speedIndicator: {
    height: 6,
    backgroundColor: "#007bff",
  },
  wifiInfo: {
    alignItems: "center",
  },
  signalValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  signalMeter: {
    alignItems: "center",
  },
  signalBars: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bar: {
    width: 6,
    height: 20,
    backgroundColor: "#ddd",
    marginHorizontal: 2,
  },
  activeBar: {
    backgroundColor: "#007bff",
  },
  signalQuality: {
    fontSize: 14,
    color: "#555",
  },
  manualControlPanel: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 3,
    alignItems: "center",
    marginTop: 16,
  },
  controlPanelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  controlDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    textAlign: "center",
  },
  controlPad: {
    flexDirection: "column",
    alignItems: "center",
  },
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 8,
  },
  controlButton: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 4,
    margin: 4,
    minWidth: 50,
    alignItems: "center",
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  keyboardHint: {
    marginTop: 12,
    fontSize: 12,
    color: "#777",
  },
});
