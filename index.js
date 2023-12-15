import {
  View,
  Text,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

const apiKey = "189182eec5a49486e5229f22f6aa39f5";
const url = `https://api.openweathermap.org/data/2.5/onecall?&units=metric&exclude=minutely&appid=${apiKey}`;

const Weather = () => {
  const [forecast, setForecast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadForecast = async () => {
    setRefreshing(true);
    // permission tp access location
    const { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      // permission denied alert
      Alert.alert("Permission to access location was denied");
    }
    // get current location
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    // fetching data
    const response = await fetch(
      `${url}&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
    );
    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Error", "Something went wrong");
    } else {
      setForecast(data);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadForecast();
  }, []);

  if (!forecast) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  // get current weather
  const current = forecast.current.weather[0];
  //   console.log(forecast);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadForecast()}
            style={{ marginTop: 50 }}
          />
        }
      >
        <Text style={styles.title}>Current Weather</Text>
        <Text style={{ alignItems: "center", textAlign: "center" }}>
          Your Location
        </Text>
        <Text style={{ alignItems: "center", textAlign: "center" }}>
          {forecast.timezone}
        </Text>
        <View style={styles.current}>
          <Image
            style={styles.largeIcon}
            source={{
              uri: `http://openweathermap.org/img/wn/${current.icon}@4x.png`,
            }}
          />
          <Text style={styles.currentTemp}>
            {Math.round(forecast.current.temp)} °C
          </Text>
        </View>
        <Text style={styles.currentDescription}>
          {forecast.current.description}
        </Text>
        <View style={styles.extraInfo}>
          <View style={styles.info}>
            <Image
              source={require("./assets/temp.png")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 40 / 2,
                marginLeft: 50,
              }}
            />
            <Text style={styles.text}>Feels Like</Text>
            <Text style={styles.text}>{forecast.current.feels_like} °C</Text>
          </View>
          <View style={styles.info}>
            <Image
              source={require("./assets/Humi.png")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 40 / 2,
                marginLeft: 50,
              }}
            />
            <Text style={styles.text}>Humidity</Text>
            <Text style={styles.text}>{forecast.current.humidity} %</Text>
          </View>
        </View>
        <View>
          <Text style={styles.subtitle}>Hourly Forecast</Text>
        </View>
        <FlatList
          horizontal
          data={forecast.hourly.slice(0, 24)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={(hour) => {
            const weather = hour.item.weather[0];
            let dt = new Date(hour.item.dt * 1000);
            return (
              <View style={styles.hour}>
                <Text>{dt.toLocaleTimeString().replace(/:\d+ /, " ")}</Text>
                <Text>{Math.round(hour.item.temp)} °C</Text>
                <Image
                  style={styles.smallIcon}
                  source={{
                    uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
                  }}
                />
                <Text style={{ fontWeight: "bold", color: "#346751" }}>
                  {weather.description}
                </Text>
              </View>
            );
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Weather;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECDBBA",
  },
  title: {
    textAlign: "center",
    fontSize: 36,
    fontWeight: "bold",
    color: "#C84B31",
  },
  current: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
  },
  largeIcon: {
    width: 300,
    height: 250,
  },
  currentTemp: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  currentDescription: {
    width: "100%",
    textAlign: "center",
    fontWeight: "200",
    fontSize: 24,
    marginBottom: 5,
  },
  info: {
    width: Dimensions.get("screen").width / 2.5,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 15,
    justifyContent: "center",
  },
  extraInfo: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
    padding: 10,
  },
  text: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    marginVertical: 12,
    marginLeft: 7,
    color: "#C84831",
    fontWeight: "bold",
  },
  hour: {
    padding: 6,
    alignItems: "center",
  },
  smallIcon: {
    width: 100,
    height: 100,
  },
});
