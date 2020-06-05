import React, { useState, useEffect } from 'react'
import { Alert, Image, ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather as Icon } from '@expo/vector-icons'
import { useRoute, useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'
import * as Location from 'expo-location'
import MapView, { Marker } from 'react-native-maps'
import { SvgUri } from 'react-native-svg'

import api from '../../services/api'

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface Point {
  id: number,
  name: string,
  image: string,
  image_url: string,
  latitude: number,
  longitude: number,
}

interface Params {
  uf: string,
  city: string
}

const Points = () => {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [initialPosition, setInitalPosition] = useState<[number, number]>([0, 0])
  const [points, setPoints] = useState<Point[]>([])

  const navigation = useNavigation()
  const route = useRoute()

  const routeParams = route.params as Params

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionAsync()

      if (status !== 'granted') {
        Alert.alert('Ooooops...', 'Precisamos de sua permissão para obter sua localização')

        return
      }

      const location = await Location.getCurrentPositionAsync()

      const { latitude, longitude } = location.coords

      setInitalPosition([
        latitude,
        longitude
      ])
    }

    loadPosition()
  }, [])

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data)
    })
  }, [])

  useEffect(() => {
    api.get('points', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItems
      }
    }).then(response => {
      setPoints(response.data)
    })
  }, [selectedItems])

  function handleNavigateBack() {
    navigation.goBack()
  }

  function handleNavigateToDetails(id: number) {
    navigation.navigate('Details', { point_id: id })
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.includes(id)

    if (alreadySelected >= 0) {
      setSelectedItems([
        ...selectedItems.filter((idFiltered) => idFiltered !== id)
      ])
    }
    else {
      setSelectedItems([ ...selectedItems, id ])
    }
  }

  return (
    <>
      <View style={ styles.container }>
        <TouchableOpacity onPress={ handleNavigateBack }>
          <Icon name="arrow-left" size={ 20 } color="#34CB79"/>
        </TouchableOpacity>

        <Text style={ styles.title }>Bem vindo</Text>
        <Text style={ styles.description }>Encontre no mapa um ponto de coleta</Text>

        <View style={ styles.mapContainer }>
          { initialPosition[0] !== 0 && (
            <MapView style={ styles.map }
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014
              }}>
              { points.map(currentPoint => (
                <Marker
                  key={ String(currentPoint.id) }
                  style={ styles.mapMarker }
                  onPress={ () => handleNavigateToDetails(currentPoint.id) }
                  coordinate={{
                    latitude: currentPoint.latitude,
                    longitude: currentPoint.longitude,
                    latitudeDelta: 0.014,
                    longitudeDelta: 0.014
                  }}>
                  <View style={ styles.mapMarkerContainer }>
                    <Image style={ styles.mapMarkerImage } source={{ uri: currentPoint.image_url }}/>
                    <Text style={ styles.mapMarkerTitle }>{ currentPoint.name }</Text>
                  </View>
                </Marker>
              )) }
            </MapView>
          ) }
        </View>
      </View>

      <View style={ styles.itemsContainer }>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={ false }
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          { items.map(currentItem => (
            <TouchableOpacity
              key={ String(currentItem.id) }
              style={[
                styles.item,
                selectedItems.includes(currentItem.id) ? styles.selectedItem : {}
              ]}
              onPress={ () => handleSelectItem(currentItem.id) }
              activeOpacity={ 0.6 }
            >
              <SvgUri width={ 42 } height={ 42 } uri={ currentItem.image_url }/>
              <Text style={ styles.itemTitle }>{ currentItem.title }</Text>
            </TouchableOpacity>
          )) }
        </ScrollView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
})

export default Points