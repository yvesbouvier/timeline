(function(){
  'use strict';

  angular.module('item')
    .service('MapService', ['$q', MapService]);

  /**
   * Map Service
   * Uses embedded, hard-coded data model; acts asynchronously to simulate
   * remote data service call(s).
   *
   * @returns {{loadAll: Function}}
   * @constructor
   */
  function MapService($q) {

    var map;

    return {
      map: map
    };
  }



})();
