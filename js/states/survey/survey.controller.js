(function(){

'use strict';

angular.module('RoofRunnerApp')
.controller('SurveyController',SurveyController);

SurveyController.$inject = ['$location', '$http', '$q', 'mode', 'expId', 'workerId'];
function SurveyController($location, $http, $q, mode, expId, workerId){
	var vm = this;
	vm.allSurveys;
	vm.surveyIndex;

	function init(){
		vm.surveyIndex = -1;
		vm.allSurveys = [];

		/*$q.all([getCoreSurvey(), getSupplementarySurveys()]).then(*/
		$q.all([getSupplementarySurveys()]).then(
			function(result){
				/*vm.allSurveys.push(
					/{
						id:0,
						survey:result[0]
					}
				);*/
				//for(var k=0;k<result[1].length;k++){
				for(var k=0;k<result[0].length;k++){
					vm.allSurveys.push(result[0][k]);
				}
				nextSurvey();
			}
		);
	}
	init();

	function nextSurvey(){
		vm.surveyIndex += 1;
		if(vm.surveyIndex >= vm.allSurveys.length){
			//end of surveys
			$location.path('/instructions2');
		}
	}

	function getCoreSurvey(){
		var def = $q.defer();
		$http.get('js/states/survey/coreSurvey.json?d=' + (new Date()).getTime()).then(
			function(result){
				def.resolve(result.data);
			},
			function(error){
				def.reject(error);
			}
		)
		return(def.promise);
	}

	function getSupplementarySurveys(){
		var def = $q.defer();

		$http.get('experiments/' + expId + '/surveys/surveyOrder.json?d=' + (new Date()).getTime())
		.then(function(result){
			var promises = [];
			for(var k=0;k<result.data.length;k++){
				promises.push($http.get('experiments/' + expId + '/surveys/' + result.data[k].survey + '?d=' + (new Date()).getTime()))
			}
			$q.all(promises).then(function(result){
				var returnArray = [];
				for(var k=0;k<result.length;k++){
					returnArray.push(
						{
							id:k+1,
							survey:result[k].data
						}
					);
				}
				def.resolve(returnArray);
			},
			function(error){
				def.reject(error);
			})
		})
		return(def.promise);
	}

	vm.onSubmit = function(surveyForm){
		if(surveyForm.$valid == true){
			var ref = firebase.database().ref().child(expId).child('survey').child(workerId);
			ref.push(vm.allSurveys[vm.surveyIndex].model);
			//console.log(vm.allSurveys[vm.surveyIndex].model);
			nextSurvey();
		}
	}

}

})()
