(function(){
	'use strict';

	angular.module('RoofRunnerApp')
	.controller('InstructionsController', InstructionsController);

	InstructionsController.$inject = ['$http', '$location', 'SweetAlert', 'expId', 'getInstructionsService', 'instructionsFile'];
	function InstructionsController($http, $location, SweetAlert, expId, getInstructionsService, instructionsFile){
		var vm = this;
		vm.instructions = [];
		vm.instructionsIndex = 0;
		vm.title = "";
		vm.currentInstructions = [];
		vm.expId = expId;

		function init(){
			//get instructions
			var promise = getInstructionsService.getInstructions(expId, instructionsFile);
			promise.then(function(result) {
				vm.instructions = result.data;
				console.log(vm.instructions);
				vm.instructionsIndex = 0;
				vm.title = vm.instructions[vm.instructionsIndex].title;
				vm.currentInstructions = vm.instructions[vm.instructionsIndex].instructions;
			});
		}
		init();


		vm.prevClicked = function(){
			vm.instructionsIndex -=1;
			if(vm.instructionsIndex < 0){
				vm.instructionsIndex = 0;
			}
			vm.title = vm.instructions[vm.instructionsIndex].title
			vm.currentInstructions = vm.instructions[vm.instructionsIndex].instructions;
		}

		vm.nextClicked = function(){
			vm.instructionsIndex +=1;
			if(vm.instructionsIndex >= vm.instructions.length){
				vm.instructionsIndex = vm.instructions.length - 1;
				if($location.path() == "/"){
					$location.path('/consent');
				} else {
					$location.path('/experiment');
				}

			} else {
				vm.title = vm.instructions[vm.instructionsIndex].title
				vm.currentInstructions = vm.instructions[vm.instructionsIndex].instructions;
			}
		}
	}
})()
