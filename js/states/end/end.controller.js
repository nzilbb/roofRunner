(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.controller('EndController', EndController);

	EndController.$inject = ['$routeParams', 'mode'];
	function EndController($routeParams, mode){
		var vm = this;
		
		function init(){
			window.onbeforeunload = null;
		}
		init();

		vm.submitDisabled = false;

		if(mode == "debug"){
			vm.submitDisabled = true;
		}

		vm.submitUrl = $routeParams.turkSubmitTo + "/mturk/externalSubmit?assignmentId=" + $routeParams.assignmentId + "&score=0";

		//vm.replayClicked = function(){
		//	$location.path('/');
		//}
	}
})()
