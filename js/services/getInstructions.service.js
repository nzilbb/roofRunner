(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.factory('getInstructionsService', getInstructionsService);

	getInstructionsService.$inject = ['$http','SweetAlert'];
	function getInstructionsService($http, SweetAlert){
		var getInstructionsService = {};


		getInstructionsService.getInstructions = function(expId, dataFile){
			var d = new Date();
			var promise = $http.get('experiments/' + expId + "/instructions/" + dataFile + "?d=" + d.getTime());
			promise.error(function(data, status, headers, config){
				SweetAlert.swal({
							title: "Error!",
							text: "Could not get instructions. Please contact the requester for more details.",
							type: "error"
						});
			})
			return(promise);
		}

		return(getInstructionsService)
	}


})()
