(function () {

  angular
    .module('item')
    .controller('ItemDialogController', [
      'itemService', '$q',
      '$routeParams', '$mdDialog',
      '$rootScope', '$timeout', ItemDialogController
    ]);

  /**
   * Main Controller for the Angular Material Starter App
   * @param $scope
   * @param $mdSidenav
   * @param avatarsService
   * @constructor
   */
  function ItemDialogController(itemService, $q, $routeParams, $mdDialog, $rootScope,
        $timeout) {
    var self = this;
    self.scope_ = $rootScope;
    self.timeout_ = $timeout;
    self.mdDialog_ = $mdDialog;
    self.typePage = $routeParams['type'];
    self.items = [];
    self.markers = [];
    self.radius = 100;
    self.PLACE_TYPES = itemService.PLACE_TYPES;

    // Open menu origin.
    self.originatorEv = null;


    self.initStreetViewTab = function () {

      if (self.item && self.item.coords) {
        var position = {lat: self.item.coords.latitude, lng: self.item.coords.longitude};
        var streetViewService = new google.maps.StreetViewService()
        streetViewService.getPanorama({
          location: position,
          source: google.maps.StreetViewSource.OUTDOOR,
        }, function (streetViewPanoramaData, status) {
          if (status === google.maps.StreetViewStatus.OK) {
            new google.maps.StreetViewPanorama(
              angular.element(document.querySelector('#street-view'))[0],
              {pano: streetViewPanoramaData.location.pano}
            )
          }
        })
      }
    };

    self.hide = function () {
      console.log(self);
      self.mdDialog_.hide();

    };

    self.cancel = function () {
      console.log(self);
      self.mdDialog_.cancel();

    };

    self.answer = function (answer) {
      self.mdDialog_.hide(answer);
    };

    /**
     * Goes to next element
     */
    self.next = function () {
      self.indexItem += 1;
      self.item = self.items[self.indexItem];
      // TODO: Only init if streetview tab is selected.
      self.initStreetViewTab();
    };

    /**
     * Goes to previous element
     */
    self.previous = function () {
      self.indexItem -= 1;
      self.indexItem = self.indexItem > 0 ? self.indexItem: 0;
      self.item = self.items[self.indexItem];
      // TODO: Only init if streetview tab is selected.
      self.initStreetViewTab();
    };

  }

})();
