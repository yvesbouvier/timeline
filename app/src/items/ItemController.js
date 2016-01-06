(function () {

  angular
    .module('item')
    .controller('ItemController', [
      'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
      '$routeParams', '$mdDialog', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
      '$rootScope', '$timeout', ItemController
    ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemController(itemService, $mdSidenav, $mdBottomSheet, $log, $q,
      $routeParams, $mdDialog, uiGmapGoogleMapApi, uiGmapIsReady, $rootScope, $timeout) {
    var self = this;
    // Open menu origin.
    self.originatorEv = null;
    // Functions
    self.editItem = editItem;
    self.addItem = addItem;
    self.openMenu = openMenu;
    self.toggleList = togglePeopleList;
    self.getItemsFromMapsPlaces = getItemsFromMapsPlaces;
    self.initPlaces = initPlaces;
    self.centerToMap = centerToMap;
    self.loadInitialMap = loadInitialMap;
    self.changeSelectedState = changeSelectedState;
    self.scope_ = $rootScope;
    self.updateBounds = updateBounds;
    self.processResults = processResults;
    self.searchPlaces = searchPlaces;
    self.search = search;
    self.initAutocomplete = initAutocomplete;

    self.timeout = $timeout;
    self.typePage = $routeParams['type'];


    self.placeTypes = itemService.place_types;


    uiGmapGoogleMapApi.then(function(maps) {
      self.loadInitialMap(maps);
    });






    function changeSelectedState(item, changeFirst) {
      item.selected = (item.selected === undefined)? false: item.selected;
      if(changeFirst) { item.selected = !item.selected; }
      if (item.coords && item.selected) {
        centerToMap(item);
      }
       if(item.options) {
         if (item.selected) {
           item.options = {
             'draggable': true,
             'icon': '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Azure-icon-32.png'
           };
         } else {
           item.options = {
             'draggable': false,
             'icon': '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png'
           };
         }


      }
      //self.items[index] = item;
      if(changeFirst) {
        self.scope_.$apply();
      }
    }

    function updateBounds() {
      var options = {bounds: self.instanceMap.getBounds()};
      //self.searchbox.options = options;
    }

    function loadInitialMap(maps) {
        self.map = {
        center: {latitude: 34.18150377077659, longitude: -118.592517321875}, zoom: 16};

      uiGmapIsReady.promise()
        .then(function (map_instances) {

          self.instanceMap = map_instances[0].map;
          updateBounds();
          // Updates search bounds on moving the map.
          maps.event.addListener(self.instanceMap, 'idle', updateBounds);
          self.initAutocomplete();
          itemService.loadAllItems()
                .then(function(items) {
                  self.items = items;

                  if (self.typePage == 'places') {
                    self.initPlaces(self.items);
                  }
                });
        });













    }

    function searchPlaces(types, keyword, radius) {
      console.log(types);
      var service = new google.maps.places.PlacesService(self.instanceMap);
      var center = self.instanceMap.getCenter();
      service.nearbySearch({
        location: {lat: center.lat(), lng: center.lng()},
        types: types,
        keyword: keyword,
        radius: radius,
      }, self.processResults);

    }


    function distanceBetween(origin, destination, item) {
      var deferred = $q.defer();
      var originLatLng = new google.maps.LatLng(origin.lat, origin.lng);
      var destinationLatLng = new google.maps.LatLng(destination.lat, destination.lng);
      var service = new google.maps.DistanceMatrixService;
      service.getDistanceMatrix({
        origins: [originLatLng],
        destinations: [destinationLatLng],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, function(response, status) {

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
        var service = new google.maps.places.PlacesService(self.instanceMap);
        var infoWindow = new google.maps.InfoWindow();

        var center = self.instanceMap.getCenter();

        self.items = getItemsFromMapsPlaces(results, self.items);
        for (var i=0; i < self.items.length; i++) {
          console.log('create');
          createMarker(self.items[i]);
          if(self.items[i].coords) {
            distanceBetween({
              lat: self.items[i].coords.latitude,
              lng: self.items[i].coords.longitude
            }, {lat: center.lat(), lng: center.lng()}, self.items[i]).then(
              function(output) {
                var resp = output[0];
                var item = output[1];
                console.log(resp, item);
            }, function(resp) {
                console.error(resp);
            })
          }
        }



        if (pagination.hasNextPage) {
          var moreButton = document.getElementById('more');

          moreButton.disabled = false;

          moreButton.addEventListener('click', function() {
            moreButton.disabled = true;
            pagination.nextPage();
          });
        }

        self.scope_.$apply();
      }
    }


    function createMarker(item) {
      if(item.coords) {
        var marker = new google.maps.Marker({
          map: self.instanceMap,
          position: {lat: item.coords.latitude, lng: item.coords.longitude},
          icon: {
            url: 'http://maps.gstatic.com/mapfiles/circle.png',
            anchor: new google.maps.Point(20, 20),
            scaledSize: new google.maps.Size(10, 17)
          },
          original: item.original
        });

        google.maps.event.addListener(marker, 'click', function() {
          //infoWindow.setContent(item.name);
          //infoWindow.open(self.instanceMap, this);
          self.editItem(item, null, -1);
        });
      }
    }

    function initPlaces(places) {

      for (var i=0; i < places.length; i++) {
        console.log(places[i]);
        createMarker(places[i]);
      }

    };

    function centerToMap(item) {
      self.map = {
        center: {latitude: item.coords.latitude, longitude: item.coords.longitude}};
    }

    function createPlace(place) {
      console.log(place);
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
          'icon' : '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png'
        },
        content: null,
        original: place
      };
      if (place.photos) {
        item['image'] = place.photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400});
      }
      return item;
    }

    function getItemsFromMapsPlaces(places, items) {
      var newItems = items;
      var service = new google.maps.places.PlacesService(self.instanceMap);
      for (var i = 0; i < places.length; i++) {


        newItems.push(createPlace(places[i]));
        /**
        self.timeout(function(item, place_id, i) {

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
      console.log(newItems);
      //self.items = newItems;
      return newItems;
    }






    function togglePeopleList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);
      pending.then(function () {
        $mdSidenav('left').toggle();
      });
    }

    function editItem(item, ev, index) {
      $mdDialog.show({
          controller: DialogController,
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

    function addItem(ev, typePage) {
      var item = {};
      itemService[typePage].push({});
      self.items = itemService[typePage];
      editItem(self.items[self.items.length - 1], ev);
    }

    function openMenu($mdOpenMenu, ev) {
      self.originatorEv = ev;
      $mdOpenMenu(ev);
    };

    function DialogController($scope, $mdDialog) {

      $scope.initStreetViewTab = function() {

        if($scope.ctrl.item && $scope.ctrl.item.coords) {
          var position = {lat: $scope.ctrl.item.coords.latitude, lng: $scope.ctrl.item.coords.longitude};
          var streetViewService = new google.maps.StreetViewService()
          streetViewService.getPanorama({
            location: position,
            source: google.maps.StreetViewSource.OUTDOOR,
          }, function (streetViewPanoramaData, status) {
            console.log(status);
            if (status === google.maps.StreetViewStatus.OK) {
              new google.maps.StreetViewPanorama(
                  angular.element(document.querySelector('#street-view'))[0],
                  { pano: streetViewPanoramaData.location.pano }
              )
            }
          })
        }
      };

      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };
      $scope.next = function (answer) {
        $scope.ctrl.indexItem += 1;
        $scope.ctrl.item = self.items[$scope.ctrl.indexItem];
        // TODO: Only init if streetview tab is selected.
        $scope.initStreetViewTab();
      };
      $scope.previous = function (answer) {
        $scope.ctrl.indexItem -= 1;
        $scope.ctrl.item = self.items[$scope.ctrl.indexItem];
        // TODO: Only init if streetview tab is selected.
        $scope.initStreetViewTab();
      };

    }

    function clearSearchResults() {
      self.items = [];
    }

    // This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

    function initAutocomplete() {

      //TODO: Use the material autocomplete instead. http://stackoverflow.com/questions/30274617/google-maps-autocomplete-with-material-design
      // Create the search box and link it to the UI element.
      var input = document.getElementById('search-box');
      var searchBox = new google.maps.places.SearchBox(input);
      //self.instanceMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      self.instanceMap.addListener('bounds_changed', function() {
        searchBox.setBounds(self.instanceMap.getBounds());
      });

      var markers = [];
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
          return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
          marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
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

  }

})();
