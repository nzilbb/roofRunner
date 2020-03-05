(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.factory('modeService', modeService);

	modeService.$inject = ['$http', 'SweetAlert', '$q', 'expIdService'];
	function modeService($http, SweetAlert, $q, expIdService){
		var modeService = {};

		//modeService.mode;

		modeService.getMode = function(){
			var defer = $q.defer();
			var d = new Date();
			expIdService.getExpId().then(
				function(result){
					var promise = $http.get('experiments/' + result + '/experimentInfo.json?' + d.getTime());
					promise.then(function(result){
						//modeService.mode = result.data.mode;
						defer.resolve(result.data.mode);
						//console.log(modeService.mode);
					})
					promise.error(function(data, status, headers, config){
						defer.reject();
						SweetAlert.swal({
									title: "Error!",
									text: "Could not get experiment info. Please contact the requester for more details.",
									type: "error"
								});
					})
				}
			)



			return(defer.promise);
		}



		return(modeService)
	}


})()
