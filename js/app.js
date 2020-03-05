angular.module('RoofRunnerApp', ['firebase', 'ngRoute', 'oitozero.ngSweetAlert', 'formlyBootstrap', 'ngSanitize', 'ngResource'])
.config(RouterConfig)
.run(firebaseConfig);

RouterConfig.$inject = ['$routeProvider'];
function RouterConfig($routeProvider){
	var universalResolves = {
		"mode":['modeService', function(modeService){
			return(modeService.getMode());
		}],
		"expId":['expIdService', function(expIdService){
			return(expIdService.getExpId());
		}],
		"workerId":['workerIdService', function(workerIdService){
			return(workerIdService.getWorkerId());
		}]
	};


	var customRouteProvider = angular.extend({}, $routeProvider, {
		when: function(path, route) {
				route.resolve = (route.resolve) ? route.resolve : {};
				angular.extend(route.resolve, universalResolves);
				$routeProvider.when(path, route);
				return this;
			}
	});

	customRouteProvider
		.when('/', {
				templateUrl: 'js/states/instructions/instructions.html',
				controller: 'InstructionsController',
				controllerAs : 'instructionsCtrl',
				resolve:{
					instructionsFile: function(){
						return "instructions1.json";
					}
				}
			}
		)
		.when('/consent', {
				templateUrl: 'js/states/consent/consent.html',
				controller: 'ConsentController',
				controllerAs : 'consentCtrl'
			}
		)
		.when('/survey', {
				templateUrl: 'js/states/survey/survey.html',
				controller: 'SurveyController',
				controllerAs : 'surveyCtrl'
			}
		)
		.when('/instructions2', {
				templateUrl: 'js/states/instructions/instructions.html',
				controller: 'InstructionsController',
				controllerAs : 'instructionsCtrl',
				resolve:{
					instructionsFile: function(){
						return "instructions2.json";
					}
				}
			}
		)
		.when('/experiment', {
				templateUrl: 'js/states/experiment/experiment.html',
				controller: 'ExperimentController',
				controllerAs : 'experimentCtrl'
			}
		)
		.when('/postGameQuestionnaire', {
				templateUrl: 'js/states/postGameQuestionnaire/postGameQuestionnaire.html',
				controller: 'PostGameQuestionnaireController',
				controllerAs : 'postGameQuestionnaireCtrl'
			}
		)
		.when('/end', {
				templateUrl: 'js/states/end/end.html',
				controller: 'EndController',
				controllerAs: 'endCtrl',
			}
		);
}

firebaseConfig.$inject = ['$http'];
function firebaseConfig($http){
	var d = new Date();
	$http.get('js/firebaseConfig.json?' + d.getTime())
	.then(function(firebaseConfigData){
		var config = {
			apiKey: firebaseConfigData.data.apiKey,
			databaseURL: firebaseConfigData.data.databaseURL
		};
		firebase.initializeApp(config);
	})
}
