angular
    .module('starterApp', ['ngMaterial', 'ngRoute', 'item', 'uiGmapgoogle-maps'])
    .config(function($mdThemingProvider, $mdIconProvider, $routeProvider, uiGmapGoogleMapApiProvider){

        $mdIconProvider
            .defaultIconSet("./assets/svg/avatars.svg", 128)
            .icon("menu"       , "./assets/svg/menu.svg"        , 24)
            .icon("share"      , "./assets/svg/share.svg"       , 24)
            .icon("google_plus", "./assets/svg/google_plus.svg" , 512)
            .icon("hangouts"   , "./assets/svg/hangouts.svg"    , 512)
            .icon("twitter"    , "./assets/svg/twitter.svg"     , 512)
            .icon("phone"      , "./assets/svg/phone.svg"       , 512);
        $mdIconProvider.defaultFontSet('material-icons-extended');
        $mdThemingProvider.theme('default');

        $routeProvider.
        when('/item/:type', {
            templateUrl: '/src/items/view/main.ng',
            controller: 'ItemController'});

        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyAFJjUaUQy574SfQ_i4RBwdloDVhjxOU5I',
            v: '3.X',
            libraries: 'places'
        });

});


