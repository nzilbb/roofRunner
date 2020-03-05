(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.factory('workerIdService', workerIdService);

	workerIdService.$inject = ['$q', 'modeService', '$route'];
	function workerIdService($q, modeService, $route){
		var workerIdService = {};

		workerIdService.getWorkerId = function(){
			var defer = $q.defer();
			var d = new Date();
			modeService.getMode().then(
				function(result){
					if(result == "debug"){
						defer.resolve("debug");
					} else {
						defer.resolve($route.current.params.workerId);
					}

				}
			)
			return(defer.promise);
		}
		return(workerIdService)
	}


})()
