(function(){
  'use strict';

  // Prepare the 'people' module for subsequent registration of controllers and delegates
  angular.module('item', [ 'ngMaterial', 'uiGmapgoogle-maps']).config(function(uiGmapGoogleMapApiProvider) {


    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyAFJjUaUQy574SfQ_i4RBwdloDVhjxOU5I',
      v: '3.X',
      libraries: 'places'
    });

  });

  })();
