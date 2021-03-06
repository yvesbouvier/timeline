(function () {

  angular
    .module('item')
    .controller('ItemController', [
      'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
      '$routeParams', '$mdDialog',
      '$rootScope', '$timeout', '$location', '$controller', ItemController
    ]);
  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemController(itemService, $mdSidenav, $mdBottomSheet, $log, $q,
                          $routeParams, $mdDialog, $rootScope,
                          $timeout, $location, $controller) {
    var self = this;


    self.mapController_ = $controller('MapController', {$scope: {}});
    self.dragMarker = self.mapController_.dragMarker;

    self.createMarkers = self.mapController_.createMarkers;
    self.centerToMap = self.mapController_.centerToMap;
    self.updateBounds = self.mapController_.updateBounds;
    self.processResults = self.mapController_.processResults;
    self.searchPlaces = self.mapController_.searchPlaces;
    self.calculateDistance = self.mapController_.calculateDistance;
    self.addTransitLayer = self.mapController_.addTransitLayer;
    self.addTrafficLayer = self.mapController_.addTrafficLayer;
    self.initSearch = self.mapController_.initSearch;
    self.clearMarkers = self.mapController_.clearMarkers;
    self.toggleList = self.mapController_.toggleList;


    self.scope_ = $rootScope;
    self.location_ = $location;
    self.timeout_ = $timeout;
    self.typePage = $routeParams['type'];
    self.items = itemService.items;
    self.itemService_ = itemService;

    self.markers = [];
    self.markerToItemKey = {};
    self.radius = 100;
    self.PLACE_TYPES = itemService.PLACE_TYPES;

    // Open menu origin.
    self.originatorEv = null;
    // Functions
    self.editItem = editItem;
    self.addItem = addItem;
    self.openMenu = openMenu;
    self.getItemsFromMapsPlaces = getItemsFromMapsPlaces;

    self.changeSelectedState = changeSelectedState;

    self.search = search;
    self.initAutocomplete = initAutocomplete;
    self.createItemFromGooglePlace = createItemFromGooglePlace;
    self.clearSearchResults = clearSearchResults;
    self.openMenu = openMenu;
    self.setMarkerDraggable = setMarkerDraggable;
    self.originatorEv = null;

    self.startFromItem = startFromItem;



    self.displaySearch = false;

    self.trafficLayerOn = false;
    self.trafficLayer = null;
    self.transitLayerOn = false;
    self.transitLayer = null;
    self.startItem = {};

    self.controller = $controller;




    function startFromItem(item) {
      self.startItem = item;
    }

    function calculateDistance(item) {


      distanceBetween({
          lat: self.startItem.coords.latitude,
          lng: self.startItem.coords.longitude
        }, {lat: item.coords.latitude, lng: item.coords.longitude},
        item,
        google.maps.TravelMode.DRIVING).then(
        function (output) {
          var resp = output[0];
          var item = output[1];
          alert("Distance by car:" + resp.rows[0].elements[0]['distance']['text'] + "(" + resp.rows[0].elements[0]['duration']['text'] + ")");
        }, function (resp) {
          console.error(resp);
        });

      distanceBetween({
          lat: self.startItem.coords.latitude,
          lng: self.startItem.coords.longitude
        }, {lat: item.coords.latitude, lng: item.coords.longitude},
        item,
        google.maps.TravelMode.WALKING).then(
        function (output) {
          var resp = output[0];
          var item = output[1];
          console.log(resp);
          alert("Distance on foot:" + resp.rows[0].elements[0]['distance']['text'] + "(" + resp.rows[0].elements[0]['duration']['text'] + ")");
        }, function (resp) {
          console.error(resp);
        });

    }

    function initSearch() {
      return self.itemService_.initSearch();

    }

    function setMarkerDraggable(item, isDraggable, map) {
      var marker = self.markerToItemKey[item.key];
      if (isDraggable) {
        marker.draggable = true;
        marker.icon = '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png';
      } else {
        marker.draggable = true;
        marker.icon = '/assets/icons_map/Map-Marker-Push-Pin-1-Pink-icon-32.png';
      }
      marker.setMap(map);
    };

    function dragMarker(item) {
      var marker = self.markerToItemKey[item.key];
      self.setMarkerDraggable(item, !marker.draggable, self.instanceMap);
    }


    function changeSelectedState(item) {
      item.selected = (item.selected === undefined) ? false : item.selected;
      item.selected = !item.selected;

      if (item.coords && item.selected) {
        centerToMap(item);
      }

    }


    function searchPlaces(types, keyword, radius) {
      var service = new google.maps.places.PlacesService(self.instanceMap);
      var center = self.instanceMap.getCenter();
      service.nearbySearch({
        location: {lat: center.lat(), lng: center.lng()},
        types: types,
        keyword: keyword,
        radius: radius,
      }, self.processResults);
    }


    function distanceBetween(origin, destination, item, travelMode) {
      var deferred = $q.defer();
      var originLatLng = new google.maps.LatLng(origin.lat, origin.lng);
      var destinationLatLng = new google.maps.LatLng(destination.lat, destination.lng);
      var service = new google.maps.DistanceMatrixService;
      service.getDistanceMatrix({
        origins: [originLatLng],
        destinations: [destinationLatLng],
        travelMode: travelMode,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, function (response, status) {

        if (status !== google.maps.DistanceMatrixStatus.OK) {
          deferred.reject([response, item]);
        } else {
          deferred.resolve([response, item]);
        }

      });
      return deferred.promise;

    }

    function search(keyword, radius) {
      var service = new google.maps.places.PlacesService(self.instanceMap);
      var center = self.instanceMap.getCenter();
      service.nearbySearch({
        location: {lat: center.lat(), lng: center.lng()},
        types: types,
        keyword: keyword,
        radius: radius,
      }, self.processResults);

    }


    function processResults(results, status, pagination) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      } else {
        var newItems = createItemsFromGooglePlaces(results);
        self.createMarkers(newItems);
        Array.prototype.push.apply(self.items, newItems);
        angular.extend(self.items, newItems);
        var service = new google.maps.places.PlacesService(self.instanceMap);
        var infoWindow = new google.maps.InfoWindow();

        var center = self.instanceMap.getCenter();

        //self.items = getItemsFromMapsPlaces(results, self.items);
        for (var i = 0; i < self.items.length; i++) {
          if (self.items[i].coords) {
            distanceBetween({
                lat: self.items[i].coords.latitude,
                lng: self.items[i].coords.longitude
              }, {lat: center.lat(), lng: center.lng()},
              self.items[i],
              google.maps.TravelMode.DRIVING).then(
              function (output) {
                var resp = output[0];
                var item = output[1];
              }, function (resp) {
                console.error(resp);
              })
          }
        }


        if (pagination.hasNextPage) {
          var moreButton = document.getElementById('more');

          moreButton.disabled = false;

          moreButton.addEventListener('click', function () {
            moreButton.disabled = true;
            pagination.nextPage();
          });
        }

        self.scope_.$apply();
      }
    }




    function createItemFromGooglePlace(place) {

      var item = {
        key: place['place_id'],
        name: place['name'],
        place_id: place['place_id'],
        formatted_phone_number: place['formatted_phone_number'],
        type: 'search_places',
        types: place['types'],
        formatted_address: place['formatted_address'],
        coords: {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        },
        geometry: place.geometry,
        options: {
          'draggable': false,
          'icon': '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png'
        },
        content: null
      };
      if (place.photos) {
        item['image'] = place.photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400});
      }
      return item;
    }

    function createItemsFromGooglePlaces(places) {
      for (var i = 0; i < places.length; i++) {
        places[i] = createItemFromGooglePlace(places[i]);
      }
      ;

      return places;
    }

    function getItemsFromMapsPlaces(item) {
      var newItems = self.items;
      var service = new google.maps.places.PlacesService(self.instanceMap);
      for (var i = 0; i < places.length; i++) {


        newItems.push(self.createItemFromGooglePlace(places[i]));
        /**
         self.timeout_(function(item, place_id, i) {

          console.log(place_id);
          service.getDetails({
            placeId: place_id
          }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              item['formatted_phone_number'] = place['formatted_phone_number'];
              item['formatted_address'] = place['formatted_address'];
              item['opening_hours'] = place['opening_hours'];
              item['url'] = place['url'];
              item['types'] = place['types'];
              console.log('in');
            } else {
              console.log('out');
            }
            items.push(item);
          });

          }(item, place.place_id, i), 100 * i);

         //t(item, place.place_id, i);

         **/

      }
      //self.items = newItems;
      return newItems;
    }


    function editItem(item, ev, index) {
      $mdDialog.show({
          controller: 'ItemDialogController',
          controllerAs: 'ctrl',
          templateUrl: './src/items/view/itemDialog.ng',
          parent: angular.element(document.body),
          locals: {parent: itemService, item: item, indexItem: index},
          targetEvent: ev,
          bindToController: true,
          clickOutsideToClose: true,
          hasBackdrop: false
        })
        .then(function (answer) {
          itemService.status = 'You said the information was "' + answer + '".';
        }, function () {
          itemService.status = 'You cancelled the dialog.';
        });


    }

    function addItem(item) {
      itemService[item.type].push(item);
      self.items = itemService[typePage];
      editItem(self.items[self.items.length - 1], ev);
    }

    function openMenu($mdOpenMenu, ev) {
      self.originatorEv = ev;
      $mdOpenMenu(ev);
    };


    function clearSearchResults() {
      self.items = [];
      self.mapController_.clearMarkers();

    }

    function clearMarkers() {
      for (var i = 0; i < self.markers.length; i++) {
        self.markers[i].setMap(null);
      }
    }

    // This example adds a search box to a map, using the Google Place Autocomplete
    // feature. People can enter geographical searches. The search box will return a
    // pick list containing a mix of places and predicted search terms.

    function initAutocomplete() {
      //TODO: Use the material autocomplete instead. http://stackoverflow.com/questions/30274617/google-maps-autocomplete-with-material-design
      // Create the search box and link it to the UI element.
      var input = document.getElementById('search-box');

      var searchBox = new google.maps.places.SearchBox(input);
      // self.instanceMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      // Bias the SearchBox results towards current map's viewport.
      self.instanceMap.addListener('bounds_changed', function () {
        searchBox.setBounds(self.instanceMap.getBounds());
      });



      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function (marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          markers.push(new google.maps.Marker({
            map: self.instanceMap,
            icon: icon,
            title: place.name,
            position: place.geometry.location
          }));

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
        });
        self.instanceMap.fitBounds(bounds);
      });
    }

    function openMenu($mdOpenMenu, ev) {
      self.originatorEv = ev;
      $mdOpenMenu(ev);
    };

  }

})();
