'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'index.html',
      controller: 'IndexCtrl'
    }).
    when('/choose-run', {
      templateUrl: 'choose-run.html',
      controller: 'ChooseRunCtrl'
    }).
    when('/add-run', {
      templateUrl: 'add-run.html',
      controller: 'AddRunCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
