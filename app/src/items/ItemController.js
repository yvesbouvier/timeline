(function () {

  angular
    .module('item')
    .controller('ItemController', [
      'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams',
      '$mdDialog', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$rootScope', ItemController
    ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemController(itemService, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams,
                          $mdDialog, uiGmapGoogleMapApi, uiGmapIsReady, $rootScope) {
    var self = this;
    // Open menu origin.
    self.originatorEv = null;
    // Functions
    self.editItem = editItem;
    self.addItem = addItem;
    self.openMenu = openMenu;
    self.toggleList = togglePeopleList;
    self.showContactOptions = showContactOptions;
    self.getItemsFromMapsPlaces = getItemsFromMapsPlaces;
    self.initPlaces = initPlaces;
    self.centerToMap = centerToMap;
    self.loadInitialMap = loadInitialMap;
    self.changeSelectedState = changeSelectedState;
    self.scope = $rootScope;

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
      centerToMap(item);
      console.log('changeSelectedState-', item);
      item.selected = (item.selected === undefined)? false: item.selected;
      if(changeFirst) { item.selected = !item.selected; }
      console.log('changeSelectedState', item.selected);
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
        self.scope.$apply();
      }
    }


    function loadInitialMap(maps) {
        self.map = {
        center: {latitude: 34.18150377077659, longitude: -118.592517321875}, zoom: 12};

      uiGmapIsReady.promise()
        .then(function (map_instances) {
          var map2 = map_instances[0].map;            // get map object through array object returned by uiGmapIsReady promise
          console.log(map2.getBounds());


          var bounds = new maps.LatLngBounds(map2.getBounds().getNorthEast(), map2.getBounds().getSouthWest());

          self.searchbox.events = {
            places_changed: function (searchBox) {
              var places = searchBox.getPlaces();
              self.items = getItemsFromMapsPlaces(places);

              self.map = {
                center: {latitude: places[0].geometry.location.lat(), longitude: places[0].geometry.location.lng()}, zoom: 15};
            }
          };

          var center = bounds.getCenter();



          var searchLatLng = new google.maps.LatLng(
            34.18150377077659,
            -118.592517321875);

          var mapOptions = {
            center: searchLatLng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };



          var options = {bounds: map2.getBounds()};


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


        });










    }


    function initPlaces(places) {
      self.items = [].concat(places);
      var events = {
        places_changed: function (searchBox) {
          var places = searchBox.getPlaces();
          self.items = getItemsFromMapsPlaces(places);
        }
      };

      self.searchbox = {template: 'searchbox.tpl.html', events: events};



      return uiGmapIsReady.promise(1);

    }

    function centerToMap(item) {
      self.map = {
        center: {latitude: item.coords.latitude, longitude: item.coords.longitude}};
    }

    function getItemsFromMapsPlaces(places) {
      var items = [];
      for (var i = 0; i < places.length; i++) {
        var place = places[i];
        var item = {
          id: i.toString(),
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

    function editItem(item, ev) {
      $mdDialog.show({
          controller: DialogController,
          controllerAs: 'ctrl',
          templateUrl: './src/items/view/itemDialog.ng',
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

    /**
     * Show the bottom sheet
     */
    function showContactOptions($event) {
      var item = self.selected;
      return $mdBottomSheet.show({
        parent: angular.element(document.getElementById('content')),
        templateUrl: './src/items/view/contactSheet.html',
        controller: ['$mdBottomSheet', ContactPanelController],
        controllerAs: "cp",
        bindToController: true,
        targetEvent: $event
      }).then(function (clickedItem) {
        clickedItem && $log.debug(clickedItem.name + ' clicked!');
      });


    }

    /**
     * Bottom Sheet controller for the Avatar Actions
     */
    function ContactPanelController($mdBottomSheet) {
      this.item = item;
      this.actions = [
        {name: 'Phone', icon: 'phone', icon_url: 'assets/svg/phone.svg'},
        {name: 'Twitter', icon: 'twitter', icon_url: 'assets/svg/twitter.svg'},
        {name: 'Google+', icon: 'google_plus', icon_url: 'assets/svg/google_plus.svg'},
        {name: 'Hangout', icon: 'hangouts', icon_url: 'assets/svg/hangouts.svg'}
      ];
      this.submitContact = function (action) {
        $mdBottomSheet.hide(action);
      };
    }


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
