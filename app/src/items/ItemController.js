(function () {

  angular
    .module('item')
    .controller('ItemController', [
      'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams',
      '$mdDialog', 'uiGmapGoogleMapApi', 'uiGmapIsReady', ItemController
    ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemController(itemService, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams,
                          $mdDialog, uiGmapGoogleMapApi, uiGmapIsReady) {
    var self = this;
    // Open menu origin.
    self.originatorEv = null;
    // Functions
    self.editItem = editItem;
    self.addItem = addItem;
    self.openMenu = openMenu;
    self.toggleList = togglePeopleList;
    self.getMarkersFromItems = getMarkersFromItems;
    self.getItemsFromMapsPlaces = getItemsFromMapsPlaces;
    self.initPlaces = initPlaces;

    self.typePage = $routeParams['type'];

    if (self.typePage == 'events') {
      itemService.
        loadAllEvents()
        .then(function (events) {
          self.items = [].concat(events);
        });
    } else if (self.typePage == 'places') {
      itemService.loadAllPlaces()
        .then(this.initPlaces)
        .then(
          function (instances) {
            self.instanceMap = instances[0].map;
          }
        );
    } else if (self.typePage == 'people') {
      itemService.loadAllPeople()
        .then(function (people) {
          self.items = [].concat(people);
        });
    }


    function initPlaces(places) {
      self.items = [].concat(places);
      self.markers = self.getMarkersFromItems(self.items);
      var events = {
        places_changed: function (searchBox) {
          var places = searchBox.getPlaces();
          self.items = getItemsFromMapsPlaces(places);
          // Set markers
          self.markers = self.getMarkersFromItems(self.items);
          console.log(self.markers);
        }
      };

      self.searchbox = {template: 'searchbox.tpl.html', events: events};

      uiGmapGoogleMapApi.then(function (maps) {
        var bounds = new maps.LatLngBounds(
          new maps.LatLng(37.4054511, -121.2402224),
          new maps.LatLng(37.4052011, -121.2402204)
        );

        var options = {bounds: bounds};

        self.searchbox.events = {
          places_changed: function (searchBox) {
            var places = searchBox.getPlaces();
            console.log(searchBox);
            self.items = getItemsFromMapsPlaces(places);
            self.markers = self.getMarkersFromItems(self.items);

            self.map = {center: {latitude: places[0].geometry.location.lat(), longitude: places[0].geometry.location.lng()}, zoom: 8};



          }
        };

        var center = bounds.getCenter();
        self.map = {center: {latitude: center.lat(), longitude: center.lng()}, zoom: 8};

        self.eventsMap = {
          bounds_changed: function (searchBox) {

            if (self.instanceMap) {
              var options = {bounds: self.instanceMap.getBounds()};
              self.searchbox.options = options;
            }
          }
        };
        self.searchbox.options = options;

        // Map is ready to display.
        self.displayMap = true;
        // Set markers
        self.markers = self.getMarkersFromItems(self.items);
      });

      return uiGmapIsReady.promise(1);

    }


    function getItemsFromMapsPlaces(places) {
      var items = [];
      console.log(places);
      for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var item = {
          name: place['name'],
          formatted_address: place['formatted_address'],
          coords: {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          },
          content: null
        };
        if (place.photos) {
          item['image'] = place.photos[0].getUrl({'maxWidth': 400, 'maxHeight': 400});
        }
        items.push(item);
      }
      return items;
    }

    function getMarkersFromItems(items) {
      var markers = [];
      for (var i = 0; i < items.length; i++) {
        var marker = items[i]['coords'];
        marker['id'] = i.toString();
        markers.push(marker);
      }
      return markers;
    }


    function togglePeopleList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);
      pending.then(function () {
        $mdSidenav('left').toggle();
      });
    }

    function editItem(item, ev) {
      $mdDialog.show({
          controller: DialogController,
          controllerAs: 'ctrl',
          templateUrl: './src/items/view/itemDialog.html',
          parent: angular.element(document.body),
          locals: {parent: itemService, item: item},
          targetEvent: ev,
          bindToController: true,
          clickOutsideToClose: true
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
      $scope.hide = function () {
        $mdDialog.hide();
      };
      $scope.cancel = function () {
        $mdDialog.cancel();
      };
      $scope.answer = function (answer) {
        $mdDialog.hide(answer);
      };
    }

  }

})();
