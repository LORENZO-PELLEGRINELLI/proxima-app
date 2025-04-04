# Proxima - App Android

Proxima è un progetto di robotica che include un'app Android sviluppata in React Native per il controllo e il monitoraggio in tempo reale del robot. L'app consente di visualizzare i dati dei sensori, monitorare lo stato della connessione, cambiare modalità (manuale/autonoma) e inviare comandi manuali tramite un joystick interattivo o la tastiera.

## Indice

- [Panoramica](#panoramica)
- [Caratteristiche](#caratteristiche)
- [Requisiti](#requisiti)
- [Installazione e Configurazione](#installazione-e-configurazione)
- [Utilizzo](#utilizzo)
- [Struttura del Codice](#struttura-del-codice)
- [Contributi](#contributi)
- [Licenza](#licenza)

## Panoramica

Questa app Android è stata sviluppata con React Native e Expo ed è parte del progetto Proxima. Essa interagisce con il robot tramite una rete locale (ad esempio, all'indirizzo IP `192.168.1.50`) per:
- Ricevere dati in tempo reale dai sensori del robot (distanza, stato dei sensori IR, stato del movimento, velocità e potenza del segnale WiFi).
- Inviare comandi di movimento (avanti, indietro, sinistra, destra, stop) al robot.
- Passare dalla modalità manuale a quella autonoma.

## Caratteristiche

- **Monitoraggio in Tempo Reale:**  
  L'app effettua richieste HTTP periodiche (ogni 100ms) per aggiornare i dati dei sensori e lo stato del robot.

- **Controllo Manuale:**  
  Fornisce un'interfaccia di controllo tramite un joystick moderno, supportando anche l'input da tastiera (utile in ambienti di emulazione).

- **Modalità di Controllo:**  
  Consente di passare facilmente dalla modalità manuale a quella autonoma tramite pulsanti dedicati.

- **Supporto Tema Scuro/Chiaro:**  
  L'interfaccia offre la possibilità di alternare tra un tema scuro e uno chiaro per migliorare l'usabilità in diverse condizioni di luce.

- **Adattamento Responsive:**  
  L'app rileva la dimensione dello schermo e adatta il layout per dispositivi tablet (con larghezza ≥ 768px).

- **Indicatore di Connessione:**  
  Visualizza lo stato della connessione con il robot tramite un badge che indica "Connected" o "Disconnected".

## Requisiti

- **Ambiente di Sviluppo:**
  - [Node.js](https://nodejs.org/) (versione 14 o superiore)
  - Gestore di pacchetti: npm o yarn
  - [Expo CLI](https://docs.expo.dev/) per eseguire l'app su dispositivi Android o emulatori

- **Dipendenze:**
  - React e React Native
  - Expo (incluso StatusBar)
  - [@expo/vector-icons](https://docs.expo.dev/guides/icons/) per l'uso delle icone (Feather, MaterialCommunityIcons, Ionicons)

## Installazione e Configurazione

1. **Clona il Repository:**

   ```bash
   git clone https://github.com/tuo-username/proxima-android.git
   cd proxima-android
