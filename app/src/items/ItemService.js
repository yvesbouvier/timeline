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
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {key: 'k2',
        name: 'Police tells X than Y',
        type: 'events',
        percent: {fact: 65},
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      },
      {key: 'k3',
        name: 'The bakery',
        type: 'places',
        coords: {
          "latitude":34.18150377077659,
          "longitude":-118.592517321875
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
          latitude: 37.4054501,
          longitude: -121.9416204,
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
        percent: {fact: 20},
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {
        name: 'The procecution',
        type: 'people',
        percent: {fact: 90},
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      },
      {
        name: 'Gener Delosreyes',
        type: 'people',
        percent: {fact:12},
        content: "Raw denim pour-over readymade Etsy Pitchfork. Four dollar toast pickled locavore bitters McSweeney's blog. Try-hshorts taxidermwave irony lumberhungry Kickstarter next level sriracha typewris kogi heirloom tousled. Disrupt 3 wolf moon lomo four loko. Pug mlkshk fanny pack literally hoodie bespoke, put a bird on it Marfa messenger bag kogi VHS."
      },
      {
        name: 'Lawrence Ray',
        type: 'people',
        percent: {fact: 24},
        content: 'Scratch the furniture spit up on light gray carpet instead of adjacent linoleum so eat a plant, kill a hand p around the house and up and down stairs chasing phantoms.'
      },
      {
        name: 'Ernesto Urbina',
        type: 'people',
        percent: {fact: 100},
        content: 'Webtwo ipsum dolor sit amet, eskobo chumby doostang bebo. Bubbli greplin stypi prezi mzinga heroku wakoopa, shopify airbnb dogster dopplr gooru jumo, reddit plickers edmodo stypi zillow etsy.'
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
