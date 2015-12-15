(function(){

  angular
       .module('item')
       .controller('ItemController', [
          'itemService', '$mdSidenav', '$mdBottomSheet', '$log', '$q', '$routeParams',
          ItemController
       ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemController(itemService, $mdSidenav, $mdBottomSheet, $log, $q, $routeParams) {
      var self = this;
      self.selected = null;
      self.people = [];
      self.places = [];
      self.events = [];
      self.selectItem = selectItem;
      self.toggleList = togglePeopleList;
      self.showContactOptions = showContactOptions;
      self.typePage = $routeParams['type'];
      // Load all registered users


      if (self.typePage == 'events') {
          itemService.
              loadAllEvents()
              .then(function (events) {
                  self.items = [].concat(events);
                  self.selected = self.items[0];
              });
      } else if (self.typePage == 'places') {
              itemService.loadAllPlaces()
                  .then(function (places) {
                      self.items = [].concat(places);
                      self.selected = self.items[0];
                  });
      } else if (self.typePage == 'people') {
              itemService.loadAllPeople()
                  .then(function (people) {
                      self.items = [].concat(people);
                      self.selected = self.items[0];
                  });
      }



    // *********************************
    // Internal methods
    // *********************************

    /**
     * First hide the bottomsheet IF visible, then
     * hide or Show the 'left' sideNav area
     */
    function togglePeopleList() {
      var pending = $mdBottomSheet.hide() || $q.when(true);

      pending.then(function(){
        $mdSidenav('left').toggle();
      });
    }

    /**
     * Select the current avatars
     * @param menuId
     */
    function selectItem ( item ) {
      self.selected = angular.isNumber(item) ? $scope.items[item] : item;
    }

    /**
     * Show the bottom sheet
     */
    function showContactOptions($event) {
        var item = self.selected;

        return $mdBottomSheet.show({
          parent: angular.element(document.getElementById('content')),
          templateUrl: './src/items/view/contactSheet.html',
          controller: [ '$mdBottomSheet', ContactPanelController],
          controllerAs: "cp",
          bindToController : true,
          targetEvent: $event
        }).then(function(clickedItem) {
          clickedItem && $log.debug( clickedItem.name + ' clicked!');
        });

        /**
         * Bottom Sheet controller for the Avatar Actions
         */
        function ContactPanelController( $mdBottomSheet ) {
          this.item = item;
          this.actions = [
            { name: 'Phone'       , icon: 'phone'       , icon_url: 'assets/svg/phone.svg'},
            { name: 'Twitter'     , icon: 'twitter'     , icon_url: 'assets/svg/twitter.svg'},
            { name: 'Google+'     , icon: 'google_plus' , icon_url: 'assets/svg/google_plus.svg'},
            { name: 'Hangout'     , icon: 'hangouts'    , icon_url: 'assets/svg/hangouts.svg'}
          ];
          this.submitContact = function(action) {
            $mdBottomSheet.hide(action);
          };
        }
    }

  }

})();
