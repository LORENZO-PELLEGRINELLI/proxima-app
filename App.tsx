import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

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
const SensorData = ({ distance, irLeft, irRight, isDarkMode }) => {
  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <View style={styles.cardHeader}>
        <Feather
          name="compass"
          size={24}
          style={[styles.cardIcon, isDarkMode && styles.darkCardIcon]}
        />
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
          Sensors
        </Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.sensorValue}>
          <Text
            style={[styles.sensorLabel, isDarkMode && styles.darkSecondaryText]}
          >
            Distance
          </Text>
          <Text style={[styles.sensorReading, isDarkMode && styles.darkText]}>
            {distance.toFixed(1)} cm
          </Text>
          <View style={[styles.sensorBar, isDarkMode && styles.darkProgressBg]}>
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
            <Text
              style={[
                styles.sensorLabel,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Left IR
            </Text>
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
            <Text
              style={[
                styles.sensorLabel,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Right IR
            </Text>
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
const MovementStatus = ({ movement, speed, isDarkMode }) => {
  return (
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <View style={styles.cardHeader}>
        <Feather
          name="activity"
          size={24}
          style={[styles.cardIcon, isDarkMode && styles.darkCardIcon]}
        />
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
          Movement
        </Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.movementInfo}>
          <View style={styles.currentStatus}>
            <Text
              style={[
                styles.statusLabel,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Status
            </Text>
            <Text style={[styles.movementValue, isDarkMode && styles.darkText]}>
              {movement}
            </Text>
          </View>
          <View style={styles.speedDisplay}>
            <Text
              style={[
                styles.statusLabel,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Speed
            </Text>
            <View style={styles.speedGauge}>
              <Text style={[styles.speedValue, isDarkMode && styles.darkText]}>
                {speed}%
              </Text>
              <View
                style={[styles.speedBar, isDarkMode && styles.darkProgressBg]}
              >
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
const WifiStatus = ({ wifiStrength, isDarkMode }) => {
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
    <View style={[styles.card, isDarkMode && styles.darkCard]}>
      <View style={styles.cardHeader}>
        <Feather
          name="wifi"
          size={24}
          style={[styles.cardIcon, isDarkMode && styles.darkCardIcon]}
        />
        <Text style={[styles.cardTitle, isDarkMode && styles.darkText]}>
          WiFi Status
        </Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.wifiInfo}>
          <Text style={[styles.signalValue, isDarkMode && styles.darkText]}>
            {wifiStrength} dBm
          </Text>
          <View style={styles.signalMeter}>
            <View style={styles.signalBars}>
              <View
                style={[
                  styles.bar,
                  isDarkMode && styles.darkBar,
                  signalQuality > 20 && styles.activeBar,
                ]}
              />
              <View
                style={[
                  styles.bar,
                  isDarkMode && styles.darkBar,
                  signalQuality > 40 && styles.activeBar,
                ]}
              />
              <View
                style={[
                  styles.bar,
                  isDarkMode && styles.darkBar,
                  signalQuality > 60 && styles.activeBar,
                ]}
              />
              <View
                style={[
                  styles.bar,
                  isDarkMode && styles.darkBar,
                  signalQuality > 80 && styles.activeBar,
                ]}
              />
            </View>
            <Text
              style={[
                styles.signalQuality,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              {qualityLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Componente del joystick moderno
const ModernJoystick = ({ sendCommand, isDarkMode }) => {
  const [activeButton, setActiveButton] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (command) => {
    setActiveButton(command);
    sendCommand(command);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setActiveButton(null);
    sendCommand("stop");
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.joystickContainer}>
      <View style={styles.joystickGrid}>
        {/* Top button (Forward) */}
        <View style={styles.joystickRow}>
          <View style={styles.joystickSpacer} />
          <TouchableOpacity
            style={[
              styles.joystickButton,
              isDarkMode && styles.darkJoystickButton,
              activeButton === "forward" && styles.activeJoystickButton,
            ]}
            onPressIn={() => handlePressIn("forward")}
            onPressOut={handlePressOut}
          >
            <Feather
              name="chevron-up"
              size={28}
              color={isDarkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>
          <View style={styles.joystickSpacer} />
        </View>

        {/* Middle row (Left, Stop, Right) */}
        <View style={styles.joystickRow}>
          <TouchableOpacity
            style={[
              styles.joystickButton,
              isDarkMode && styles.darkJoystickButton,
              activeButton === "left" && styles.activeJoystickButton,
            ]}
            onPressIn={() => handlePressIn("left")}
            onPressOut={handlePressOut}
          >
            <Feather
              name="chevron-left"
              size={28}
              color={isDarkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.joystickCenterButton,
              isDarkMode && styles.darkJoystickCenterButton,
            ]}
            onPress={() => sendCommand("stop")}
          >
            <Animated.View
              style={[
                styles.centerButtonInner,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Feather
                name="square"
                size={20}
                color={isDarkMode ? "#333" : "#fff"}
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.joystickButton,
              isDarkMode && styles.darkJoystickButton,
              activeButton === "right" && styles.activeJoystickButton,
            ]}
            onPressIn={() => handlePressIn("right")}
            onPressOut={handlePressOut}
          >
            <Feather
              name="chevron-right"
              size={28}
              color={isDarkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom button (Backward) */}
        <View style={styles.joystickRow}>
          <View style={styles.joystickSpacer} />
          <TouchableOpacity
            style={[
              styles.joystickButton,
              isDarkMode && styles.darkJoystickButton,
              activeButton === "backward" && styles.activeJoystickButton,
            ]}
            onPressIn={() => handlePressIn("backward")}
            onPressOut={handlePressOut}
          >
            <Feather
              name="chevron-down"
              size={28}
              color={isDarkMode ? "#fff" : "#333"}
            />
          </TouchableOpacity>
          <View style={styles.joystickSpacer} />
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
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // Toggle dark/light theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <MaterialCommunityIcons
              name="monitor-dashboard"
              size={28}
              style={styles.dashboardIcon}
            />
            <Text style={styles.headerTitle}>Robot Control Dashboard</Text>
          </View>
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
              <Ionicons
                name={isDarkMode ? "sunny-outline" : "moon-outline"}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <ConnectionStatus isConnected={isConnected} />
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.main,
          isTablet && styles.tabletMain,
          isDarkMode && styles.darkMain,
        ]}
      >
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              isDarkMode && styles.darkModeButton,
              controlMode === "autonomous" && styles.activeModeButton,
            ]}
            onPress={() => switchMode("autonomous")}
            disabled={controlMode === "autonomous"}
          >
            <Feather
              name="zap"
              size={20}
              style={[
                styles.buttonIcon,
                isDarkMode && styles.darkButtonIcon,
                controlMode === "autonomous" && styles.activeButtonIcon,
              ]}
            />
            <Text
              style={[
                styles.buttonText,
                isDarkMode && styles.darkButtonText,
                controlMode === "autonomous" && styles.activeButtonText,
              ]}
            >
              Autonomous Mode
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              isDarkMode && styles.darkModeButton,
              controlMode === "manual" && styles.activeModeButton,
            ]}
            onPress={() => switchMode("manual")}
            disabled={controlMode === "manual"}
          >
            <Feather
              name="compass"
              size={20}
              style={[
                styles.buttonIcon,
                isDarkMode && styles.darkButtonIcon,
                controlMode === "manual" && styles.activeButtonIcon,
              ]}
            />
            <Text
              style={[
                styles.buttonText,
                isDarkMode && styles.darkButtonText,
                controlMode === "manual" && styles.activeButtonText,
              ]}
            >
              Manual Mode
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dashboardGrid}>
          <SensorData
            distance={robotData.distance}
            irLeft={robotData.irLeft}
            irRight={robotData.irRight}
            isDarkMode={isDarkMode}
          />
          <MovementStatus
            movement={robotData.movement}
            speed={robotData.speed}
            isDarkMode={isDarkMode}
          />
          <WifiStatus
            wifiStrength={robotData.wifiStrength}
            isDarkMode={isDarkMode}
          />
        </View>

        {controlMode === "manual" && (
          <View
            style={[styles.manualControlPanel, isDarkMode && styles.darkCard]}
          >
            <Text
              style={[styles.controlPanelTitle, isDarkMode && styles.darkText]}
            >
              Manual Control
            </Text>
            <Text
              style={[
                styles.controlDescription,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
              Use the joystick below or arrow keys on your keyboard
            </Text>

            <ModernJoystick sendCommand={sendCommand} isDarkMode={isDarkMode} />

            <Text
              style={[
                styles.keyboardHint,
                isDarkMode && styles.darkSecondaryText,
              ]}
            >
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
  darkContainer: {
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#007bff",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  darkHeader: {
    backgroundColor: "#1a1f3c",
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
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggle: {
    padding: 8,
    marginRight: 12,
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
  darkMain: {
    backgroundColor: "#121212",
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  darkModeButton: {
    backgroundColor: "#2c2c2c",
  },
  activeModeButton: {
    backgroundColor: "#007bff",
  },
  buttonIcon: {
    marginRight: 8,
    color: "#333",
  },
  darkButtonIcon: {
    color: "#e0e0e0",
  },
  activeButtonIcon: {
    color: "#fff",
  },
  buttonText: {
    color: "#333",
    fontWeight: "bold",
  },
  darkButtonText: {
    color: "#e0e0e0",
  },
  activeButtonText: {
    color: "#fff",
  },
  dashboardGrid: {
    flexDirection: "column",
    gap: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkCard: {
    backgroundColor: "#1e1e1e",
    shadowColor: "#000",
    shadowOpacity: 0.2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIcon: {
    marginRight: 8,
    color: "#007bff",
  },
  darkCardIcon: {
    color: "#4da3ff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  darkText: {
    color: "#fff",
  },
  darkSecondaryText: {
    color: "#aaa",
  },
  cardContent: {
    // content styling for each card
  },
  sensorValue: {
    marginBottom: 16,
  },
  sensorLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  sensorReading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sensorBar: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  darkProgressBg: {
    backgroundColor: "#333",
  },
  sensorProgress: {
    height: 8,
    backgroundColor: "#007bff",
  },
  sensorsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  irSensor: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 4,
  },
  sensorStatus: {
    fontSize: 16,
    fontWeight: "bold",
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
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  movementValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  speedDisplay: {
    flexDirection: "column",
  },
  speedGauge: {
    marginTop: 4,
  },
  speedValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  speedBar: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  speedIndicator: {
    height: 8,
    backgroundColor: "#007bff",
  },
  wifiInfo: {
    alignItems: "center",
  },
  signalValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  signalMeter: {
    alignItems: "center",
  },
  signalBars: {
    flexDirection: "row",
    marginBottom: 8,
  },
  bar: {
    width: 8,
    height: 24,
    backgroundColor: "#ddd",
    marginHorizontal: 3,
    borderRadius: 2,
  },
  darkBar: {
    backgroundColor: "#444",
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
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  controlPanelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  controlDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  keyboardHint: {
    marginTop: 16,
    fontSize: 12,
    color: "#777",
  },
  // Modern Joystick Styles
  joystickContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  joystickGrid: {
    width: 220,
    height: 220,
  },
  joystickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 70,
    marginVertical: 4,
  },
  joystickSpacer: {
    width: 70,
  },
  joystickButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  darkJoystickButton: {
    backgroundColor: "#2c2c2c",
  },
  activeJoystickButton: {
    backgroundColor: "#007bff",
  },
  joystickCenterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  darkJoystickCenterButton: {
    backgroundColor: "#4da3ff",
  },
  centerButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
