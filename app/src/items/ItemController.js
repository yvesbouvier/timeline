(function () {

  angular
    .module('item')
    .controller('ItemController', [
      'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q',
      '$routeParams', '$mdDialog', 'uiGmapGoogleMapApi', 'uiGmapIsReady',
      '$rootScope', ItemController
    ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemController(itemService, $mdSidenav, $mdBottomSheet, $log, $q,
      $routeParams, $mdDialog, uiGmapGoogleMapApi, uiGmapIsReady, $rootScope) {
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

    self.typePage = $routeParams['type'];




    uiGmapGoogleMapApi.then(function(maps) {
      self.loadInitialMap(maps);
    });




    if (self.typePage == 'places') {
      itemService.loadAllItems()
        .then(this.initPlaces)
        .then(
          function (instances) {
            self.instanceMap = instances[0].map;
          }
        );
    } else {
      itemService.loadAllItems()
        .then(function (items) {
          self.items = [].concat(items);
        });
      self.eventsMap = {
        bounds_changed: function (searchBox) {
        }
      };
    }

    function changeSelectedState(item, changeFirst) {

      console.log('changeSelectedState-', item);
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
      self.searchbox.options = options;
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


        });












    }

    function searchPlaces(types) {
      console.log(types);
      var service = new google.maps.places.PlacesService(self.instanceMap);
      var center = self.instanceMap.getCenter();
      console.log(center);
      service.nearbySearch({
        location: {lat: center.lat(), lng: center.lng()},
        types: types,
        radius: 3000,
      }, self.processResults);

    }


    function processResults(results, status, pagination) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      } else {
        self.items = getItemsFromMapsPlaces(results, self.items);

        if (pagination.hasNextPage) {
          var moreButton = document.getElementById('more');

          moreButton.disabled = false;

          moreButton.addEventListener('click', function() {
            moreButton.disabled = true;
            pagination.nextPage();
          });
        }
      }
    }


    function initPlaces(places) {
      self.items = [].concat(places);
      var events = {
        places_changed: function (searchBox) {
          var places = searchBox.getPlaces();
          self.items = getItemsFromMapsPlaces(places, []);
          self.map = {
            center: {latitude: places[0].geometry.location.lat(),
              longitude: places[0].geometry.location.lng()}, zoom: 15};
        }
      };

      self.searchbox = {template: 'searchbox.tpl.html', events: events};



      return uiGmapIsReady.promise(1);

    }

    function centerToMap(item) {
      self.map = {
        center: {latitude: item.coords.latitude, longitude: item.coords.longitude}};
    }

    function getItemsFromMapsPlaces(places, items) {
      for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var item = {
          key: i.toString(),
          name: place['name'],
          type: 'places',
          formatted_address: place['formatted_address'],
          coords: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          },
          options: {
          'draggable': false,
          'icon' : '/assets/icons_map/Map-Marker-Push-Pin-1-Left-Pink-icon-32.png'
          },
          content: null
        };
        if (place.photos) {
          item['image'] = place.photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400});
        }

        var service = new google.maps.places.PlacesService(self.instanceMap);

        var t = function(item) {
          service.getDetails({
            placeId: place.place_id
          }, function (place, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              item['formatted_phone_number'] = place['formatted_phone_number'];
              item['formatted_address'] = place['formatted_address'];
              item['opening_hours'] = place['opening_hours'];
              item['url'] = place['url'];
              item['types'] = place['types'];
            }
          });
        };
        t(item);

        items.push(item);
      }
      return items;
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

  }

})();
