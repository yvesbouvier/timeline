(function(){
  'use strict';

  angular.module('item')
      .service('itemService', ['$q', ItemService]);

  /**
   * Item DataService
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadAll: Function}}
   * @constructor
   */
  function ItemService($q) {

    var items  = [
      {
        key: 'k1',
        name: 'Police finds the car',
        type: 'events',
        percent: {fact: 20},
        coords: {
          latitude: 40.72787830000001,
          longitude: -73.99078910000003,
        },
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {key: 'k2',
        name: 'Police tells X than Y',
        type: 'events',
        percent: {fact: 65},
        coords: {
          latitude: 40.71626920000001,
          longitude: -74.00863229999999,
        },
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      },
      {key: 'k3',
        name: 'The bakery',
        type: 'places',
        coords: {
          "latitude":40.7289366,
          "longitude":-74.00222280000003
        },
        options: {
          'draggable': false,
          'icon' : '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png'
        },
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {key: 'k4',
        name: 'The office',
        type: 'places',
        coords: {
          latitude: 40.722655,
          longitude: -73.99837200000002,
        },
        options: {
          'draggable': false,
          'icon' : '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png'
        },
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      },
      {
        name: 'The Defendant',
        type: 'people',
        percent: {fact: 20}
      },
      {
        name: 'The procecution',
        type: 'people',
        percent: {fact: 90}      },
      {
        name: 'Gener Delosreyes',
        type: 'people',
        percent: {fact:12}      },
      {
        name: 'Lawrence Ray',
        type: 'people',
        percent: {fact: 24}      },
      {
        name: 'Ernesto Urbina',
        type: 'people',
        percent: {fact: 100}
      }
    ];


    // Different elements available for an items, depending on its type.
    var elements = {};

    elements['all'] = [
      {'key': 'name', 'label': 'Name', 'type': 'string', 'max_length': 50},
      {'key': 'description', label: 'Description', 'type': 'string', 'max_length': 255}
    ];
    elements['places'] = [
      {'key': 'location', 'label': 'Location', 'type':'lat_long'},
      {'key': 'date_of_start', 'label': 'First created', 'type': 'date'},
      {'key': 'date_of_end', 'label': 'Ended (closed, destroyed)', 'type': 'date'}
    ];
    elements['people'] = [
      {'key': 'date_of_birth', 'label': 'Date of birth', 'type': 'date'},
      {'key': 'date_of_death', 'label': 'Date of death', 'type': 'date'},
      {'key': 'eye_color', 'label': 'Eyes color', 'type': 'select', 'values' : ['black', 'blue', 'green']}
    ];
    elements['events'] = [
      {'key': 'datetime_start', 'label': 'When did it start?', 'type': 'datetime'},
      {'key': 'datetime_end', 'label': 'When did it end?',  'type': 'datetime'},
      {'key': 'time_length', 'label': 'How long did it take?', 'type': 'time'}
    ];

    elements['thing'] = [
      {'key': 'price', 'type': 'number'}
    ];

    var place_types = [
      'accounting',
      'airport',
      'amusement_park',
      'aquarium',
      'art_gallery',
      'atm',
      'bakery',
      'bank',
      'bar',
      'beauty_salon',
      'bicycle_store',
      'book_store',
      'bowling_alley',
      'bus_station',
      'cafe',
      'campground',
      'car_dealer',
      'car_rental',
      'car_repair',
      'car_wash',
      'casino',
      'cemetery',
      'church',
      'city_hall',
      'clothing_store',
      'convenience_store',
      'courthouse',
      'dentist',
      'department_store',
      'doctor',
      'electrician',
      'electronics_store',
      'embassy',
      'establishment',
      'finance',
      'fire_station',
      'florist',
      'food',
      'funeral_home',
      'furniture_store',
      'gas_station',
      'general_contractor',
      'grocery_or_supermarket',
      'gym',
      'hair_care',
      'hardware_store',
      'health',
      'hindu_temple',
      'home_goods_store',
      'hospital',
      'insurance_agency',
      'jewelry_store',
      'laundry',
      'lawyer',
      'library',
      'liquor_store',
      'local_government_office',
      'locksmith',
      'lodging',
      'meal_delivery',
      'meal_takeaway',
      'mosque',
      'movie_rental',
      'movie_theater',
      'moving_company',
      'museum',
      'night_club',
      'painter',
      'park',
      'parking',
      'pet_store',
      'pharmacy',
      'physiotherapist',
      'place_of_worship',
      'plumber',
      'police',
      'post_office',
      'real_estate_agency',
      'restaurant',
      'roofing_contractor',
      'rv_park',
      'school',
      'shoe_store',
      'shopping_mall',
      'spa',
      'stadium',
      'storage',
      'store',
      'subway_station',
      'synagogue',
      'taxi_stand',
      'train_station',
      'travel_agency',
      'university',
      'veterinary_care',
      'zoo'
    ];

    var setKeysOnItems = function(items) {
      for (var i=0; i < items.length; i++) {
        items[i].key = "a" + i;
      }
      return items;
    }

    items = setKeysOnItems(items);

    console.log(items);

    return {
      PLACE_TYPES: place_types,
      loadAllItems : function() {
        this.items = items;
        // Simulate async nature of real remote calls
        return $q.when(items);
      }
    };
  }



})();
