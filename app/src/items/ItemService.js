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
    this.events = [];
    this.places = [];
    this.people = [];
    var events  = [
      {
        name: 'Police finds the car',
        percent: {fact: 20},
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {
        name: 'Police tells X than Y',
        percent: {fact: 65},
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      }];

    var places =  [
      {
        name: 'The bakery',
        coords: {
          latitude: 37.4054511,
          longitude: -121.2402224,
        },
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {
        name: 'The office',
        coords: {
          latitude: 37.4054501,
          longitude: -121.9416204,
        },
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      }];
    var people = [
      {
        name: 'Lia Lugo',
        percent: {fact: 20},
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {
        name: 'George Duke',
        percent: {fact: 90},
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      },
      {
        name: 'Gener Delosreyes',
        percent: {fact:12},
        content: "Raw denim pour-over readymade Etsy Pitchfork. Four dollar toast pickled locavore bitters McSweeney's blog. Try-hshorts taxidermwave irony lumberhungry Kickstarter next level sriracha typewris kogi heirloom tousled. Disrupt 3 wolf moon lomo four loko. Pug mlkshk fanny pack literally hoodie bespoke, put a bird on it Marfa messenger bag kogi VHS."
      },
      {
        name: 'Lawrence Ray',
        percent: {fact: 24},
        content: 'Scratch the furniture spit up on light gray carpet instead of adjacent linoleum so eat a plant, kill a hand p around the house and up and down stairs chasing phantoms.'
      },
      {
        name: 'Ernesto Urbina',
        percent: {fact: 100},
        content: 'Webtwo ipsum dolor sit amet, eskobo chumby doostang bebo. Bubbli greplin stypi prezi mzinga heroku wakoopa, shopify airbnb dogster dopplr gooru jumo, reddit plickers edmodo stypi zillow etsy.'
      },
      {
        name: 'Gani Ferrer',
        percent: {fact: 80},
        content: "Lebowski ipsum yeah? What do you think happens when you get rad? You turn in your library card? Get a newllentesque ac lectus. You don't go out anandit fringilla a ut turpis praesent felis ligula, malesuada suscipit malesuada."
      },
      {
        name: 'Lia Lugo',
        percent: {fact: 20},
        content: 'I love cheese, especially airedale queso. Cheese and biscuits halloumi cauliflower cheese cottage cheese swiss boursin fosrphilly chalk and cheese. Lancashire.'
      },
      {
        name: 'George Duke',
        percent: {fact: 67},
        content: 'Zombie ipsum reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpsurvivor dictum mauris.'
      },
      {
        name: 'Gener Delosreyes',
        percent: {fact: 70},
        content: "Raw denim pour-over readymade Etsy Pitchfork. Four dollar toast pickled locavore bitters McSweeney's blog. Try-hshorts taxidermwave irony lumberhungry Kickstarter next level sriracha typewris kogi heirloom tousled. Disrupt 3 wolf moon lomo four loko. Pug mlkshk fanny pack literally hoodie bespoke, put a bird on it Marfa messenger bag kogi VHS."
      }
    ];

    // Promise-based API
    return {
      loadAllPeople : function() {
        this.people = people;
        // Simulate async nature of real remote calls
        return $q.when(people);
      },
      loadAllPlaces : function() {
        this.places = places;
        return $q.when(places);
      },
      loadAllEvents : function() {
        this.events = events;
        return $q.when(events);
      }
    };
  }

})();
