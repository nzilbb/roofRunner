(function(){

'use strict';

angular.module('RoofRunnerApp')
.factory('shuffleService', shuffleService);

//shuffleService.$inject = ['$rootScope', '$q','SweetAlert', '$timeout'];
function shuffleService(){
	var shuffleService = {};

	shuffleService.shuffleArray = function(array){
		var m = array.length, t, i;

		// While there remain elements to shuffle
		while (m) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);

			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}

		return array;
	}

	return shuffleService;
}

})();
