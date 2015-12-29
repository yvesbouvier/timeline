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
    this.items = [];

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


    // Promise-based API
    return {
      loadAllItems : function() {
        this.items = items;
        // Simulate async nature of real remote calls
        return $q.when(items);
      }
    };
  }

})();
