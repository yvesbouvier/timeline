(function () {

  angular
    .module('item')
    .controller('MapController', [
      'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
      '$routeParams', '$mdDialog',
      '$rootScope', '$timeout', '$location', 'MapService', MapController
    ]);
  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function MapController(itemService, $mdSidenav, $mdBottomSheet, $log, $q,
                          $routeParams, $mdDialog, $rootScope,
                          $timeout, $location, MapService) {
    var self = this;
    self.scope_ = $rootScope;
    self.location_ = $location;
    self.timeout_ = $timeout;
    self.typePage = $routeParams['type'];
    self.items = itemService.items;
    self.mapService_ = MapService;
    self.markers = [];
    self.markerToItemKey = {};
    self.radius = 100;
    self.PLACE_TYPES = itemService.PLACE_TYPES;

    // Open menu origin.
    self.originatorEv = null;
    // Functions
    self.editItem = editItem;
    self.toggleList = togglePeopleList;
    self.addItem = addItem;
    self.dragMarker = dragMarker;
    self.openMenu = openMenu;
    self.getItemsFromMapsPlaces = getItemsFromMapsPlaces;
    self.createMarkers = createMarkers;
    self.centerToMap = centerToMap;
    self.loadInitialMap = loadInitialMap;
    self.changeSelectedState = changeSelectedState;
    self.updateBounds = updateBounds;
    self.processResults = processResults;
    self.searchPlaces = searchPlaces;
    self.search = search;
    self.initAutocomplete = initAutocomplete;
    self.createItemFromGooglePlace = createItemFromGooglePlace;
    self.clearSearchResults = clearSearchResults;
    self.clearMarkers = clearMarkers;
    self.openMenu = openMenu;
    self.setMarkerDraggable = setMarkerDraggable;
    self.originatorEv = null;

    self.startFromItem = startFromItem;
    self.calculateDistance = calculateDistance;

    self.addTransitLayer = addTransitLayer;
    self.addTrafficLayer = addTrafficLayer;

    self.initSearch = initSearch;

    self.displaySearch = false;

    self.trafficLayerOn = false;
    self.trafficLayer = null;
    self.transitLayerOn = false;
    self.transitLayer = null;
    self.startItem = {};





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
          console.log(resp);
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
      self.displaySearch = true;
      self.initAutocomplete();

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
      self.setMarkerDraggable(item, !marker.draggable, self.mapService_.map);
    }


    function changeSelectedState(item) {
      item.selected = (item.selected === undefined) ? false : item.selected;
      item.selected = !item.selected;

      if (item.coords && item.selected) {
        centerToMap(item);
      }

    }

    function updateBounds() {
      var options = {bounds: self.mapService_.map.getBounds()};
      //self.searchbox.options = options;
    }

    function addTransitLayer() {

      if(!self.transitLayerOn) {
        self.transitLayer = new google.maps.TransitLayer();
        self.transitLayer.setMap(self.mapService_.map);
        self.transitLayerOn = true;
      } else {
        self.transitLayer.setMap(null);
        self.transitLayerOn = false;
      }
    }

    function addTrafficLayer() {
      console.log(self);
      if(!self.trafficLayerOn) {
        self.trafficLayer = new google.maps.TrafficLayer();
        self.trafficLayer.setMap(self.mapService_.map);
        self.trafficLayerOn = true;
      } else {
        self.trafficLayer.setMap(null);
        self.trafficLayerOn = false;
      }
    }

    function loadInitialMap() {
      //TODO: Remove this when center is better handled.
      self.mapService_.map = new google.maps.Map(
        document.getElementById('map_canvas'),
        {center: {
          lat: 40.72800630217342,
          lng: -73.99877832818606
        }, zoom: 14});
      google.maps.event.trigger(self.mapService_.map, 'resize');
 console.log(self.mapService_.map);
      updateBounds();

      // Updates search bounds on moving the map.
      google.maps.event.addListener(self.mapService_.map, 'idle', updateBounds);

      self.createMarkers(itemService.items);


    }

    function searchPlaces(types, keyword, radius) {
      var service = new google.maps.places.PlacesService(self.mapService_.map);
      var center = self.mapService_.map.getCenter();
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
      var service = new google.maps.places.PlacesService(self.mapService_.map);
      var center = self.mapService_.map.getCenter();
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
        var service = new google.maps.places.PlacesService(self.mapService_.map);
        var infoWindow = new google.maps.InfoWindow();

        var center = self.mapService_.map.getCenter();

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


    function createMarker(item) {
      if (!item.coords) { return; }

      var icon;
      if(item.type == 'events') {
        icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=E|FFFF00';
      } else if(item.type == 'places') {
        icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=L|039be5';
      } else {// Person
        icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=P|00FF00';
      }

      var image =  {
        url: icon,
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(20, 32),
        scaledSize:  new google.maps.Size(20, 32),
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
      };


      var marker = new google.maps.Marker({
        map: self.mapService_.map,
        item: item,
        position: {lat: item.coords.latitude, lng: item.coords.longitude},
        icon: image,
        options: {
          'draggable': false,
          'icon': icon
        }
      });

      self.markerToItemKey[item.key] = marker;
      self.markers.push(marker);



      google.maps.event.addListener(
        marker,
        'click',
        function () {
          self.editItem(item, null, -1);
        });

      google.maps.event.addListener(
        marker,
        'mouseover',
        function () {
          //self.highlightItem(item);


        });

      google.maps.event.addListener(
        marker,
        'dragstart',
        function () {

          console.log(this);
          this.item.coords = {
            latitude: this.position.lat(),
            longitude: this.position.lng()
          };

        });
      google.maps.event.addListener(
        marker,
        'dragend',
        function () {
        });



    };

    function createMarkers(places) {
      angular.forEach(places, function (item) {
        if (item.coords) {
          createMarker(item);

        }
      });

    };

    function centerToMap(item) {
      self.map = {
        center: {latitude: item.coords.latitude, longitude: item.coords.longitude}
      };


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
      var service = new google.maps.places.PlacesService(self.mapService_.map);
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


    function togglePeopleList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);
      pending.then(function () {
        $mdSidenav('left').toggle();
      });
    }


    function clearSearchResults() {
      self.items = [];
      clearMarkers();

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
      // self.mapService_.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
      // Bias the SearchBox results towards current map's viewport.
      self.mapService_.map.addListener('bounds_changed', function () {
        searchBox.setBounds(self.mapService_.map.getBounds());
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
            map: self.mapService_.map,
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
        self.mapService_.map.fitBounds(bounds);
      });
    }

    function openMenu($mdOpenMenu, ev) {
      self.originatorEv = ev;
      $mdOpenMenu(ev);
    };

  }

})();
