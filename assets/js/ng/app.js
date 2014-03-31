(function () {
	'use strict';
	angular.module('todomvcApp', ['sails.io']).config(['$locationProvider', '$logProvider',
		function ($locationProvider, $logProvider) {
			$locationProvider.html5Mode(true);
			$logProvider.debugEnabled(true);
		}]);
}());