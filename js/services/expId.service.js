(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.factory('expIdService', expIdService);

	expIdService.$inject = ['$route','SweetAlert', '$q'];
	function expIdService($route, SweetAlert, $q){
		var expIdService = {};

		expIdService.getExpId = function(){
			var def = $q.defer();
			if($route.current.params.expId == null || $route.current.params.expId == ''){//make sure URL parameter exists
				SweetAlert.swal({
							title: "Error!",
							text: "No experiment ID specified. Please contact the requester for more details.",
							type: "error"
						});
				def.reject('expId missing from URL');
			} else {
				def.resolve($route.current.params.expId);
			}
			return(def.promise);
		}

		return(expIdService)
	}


})()
