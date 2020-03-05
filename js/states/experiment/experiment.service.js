(function(){

'use strict';

angular.module('RoofRunnerApp')
.factory('experimentService', experimentService);

experimentService.$inject = ['$q'];
function experimentService($q){
	var experimentService = {};

	experimentService.interlocutor;
	experimentService.hero;

	var roof;
	var stage
	var interlocutor_x;
	var interlocutor_y;
	var background0;
	var background1;
	var background2;
	var background3;
	var background2Tween;
	var background3Tween;

	experimentService.init = function(canvasId){
		stage = new createjs.Stage(canvasId);
		background0 = new createjs.Bitmap("assets/night_background.png");
		background1 = new createjs.Bitmap("assets/bg_layer1.png");
		background2 = new createjs.Bitmap("assets/bg_layer2.png");
		background3 = new createjs.Bitmap("assets/bg_layer3.png");

		roof = new createjs.Bitmap("assets/roofs.png");
		roof.x=-400;
		roof.y=400;

		var heroSpritesheet = new createjs.SpriteSheet({images: ["assets/chicken.png"], frames: [[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[268,0,268,315,0,136.05,153],[268,0,268,315,0,136.05,153],[268,0,268,315,0,136.05,153],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[268,0,268,315,0,136.05,153],[268,0,268,315,0,136.05,153],[268,0,268,315,0,136.05,153],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[0,0,268,321,0,136.05,163],[536,0,278,321,0,141.05,163],[0,321,270,321,0,137.05,163],[270,321,246,321,0,125.05000000000001,163],[516,321,244,321,0,124.05000000000001,163],[760,321,246,321,0,125.05000000000001,163],[0,642,270,321,0,137.05,163],[270,642,278,321,0,141.05,163],[0,0,268,321,0,136.05,163]],  animations: {takeoff:[0,8, 'fly'], land:[9,17, 'stand'], fly:[18,25], stand:[26,26]}});
		experimentService.hero = new createjs.Sprite(heroSpritesheet);
		experimentService.hero.gotoAndStop("stand");
		experimentService.hero.x=100;
		experimentService.hero.y=260;

		stage.addChild(background0);
		stage.addChild(background1);
		stage.addChild(background2);
		stage.addChild(background3);
		stage.addChild(roof);
		stage.addChild(experimentService.hero);

		//add white rectangle to top right of canvas for status/progress indicator
		var rect = new createjs.Shape();
		rect.graphics.beginFill("#F8F8F8").drawRect(0, 0, 150, 20);
		stage.addChild(rect);

		//var statusBackground = new createjs.Graphics();
		//statusBackground.beginFill("white");
		//statusBackground.drawRect(0,0,100, 20);
		//stage.addChild(statusBackground);

		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener("tick", stage);
	}

	experimentService.setInterlocutor = function(path){
		experimentService.interlocutor = {};

		if(path!=null){
			experimentService.interlocutor = new createjs.Bitmap(path);
			experimentService.interlocutor.image.onload = function(){
				var height = experimentService.interlocutor.image.height;
				var width = experimentService.interlocutor.image.width;
				interlocutor_y = 414 - height;
				interlocutor_x = 800 - width;
				experimentService.interlocutor.x = interlocutor_x;
				experimentService.interlocutor.y = interlocutor_y;
				//interlocutor fades in
				experimentService.interlocutor.alpha = 0
				createjs.Tween.get(experimentService.interlocutor, {loop: false})
					.to({alpha:1}, 100, createjs.Ease.none);
				stage.addChild(experimentService.interlocutor);
			}
		}
	}


	experimentService.jump = function(){
		experimentService.hero.gotoAndPlay("takeoff");
		var def = $q.defer();
		//hero jumps
		createjs.Tween.get(experimentService.hero, {loop: false})
			.wait(200)
			.to({y: 100, x: 200}, 500, createjs.Ease.quadOut)
			.wait(500)
			.to({y: 260, x: 100}, 500, createjs.Ease.quadOut)
			.call(function(){
				experimentService.hero.gotoAndPlay("land");
				def.resolve("jump completed");
			});

		//interlocutor fades
		createjs.Tween.get(experimentService.interlocutor, {loop: false})
			.to({alpha:0}, 100, createjs.Ease.none);

		//roof slides back
		createjs.Tween.get(roof, {loop: false})
			.wait(500)
			.to({x: -1430}, 800, createjs.Ease.quadOut)
			.to({x: -400}, 0, createjs.Ease.none);

		//background slides back
		background2Tween = createjs.Tween.get(background2)
			.wait(500)
			.to({x: background2.x-20}, 500, createjs.Ease.none)
			.call(function(){
				if(background2.x <= -800){
					background2.x =0
				}
			});
		background3Tween = createjs.Tween.get(background3)
			.wait(500)
			.to({x: background3.x-100}, 500, createjs.Ease.none)
			.call(function(){
				if(background3.x <= -800){
					background3.x =0
				}
			});

		return def.promise;
	}

	experimentService.fall = function(){
		var def = $q.defer();

		//interlocutor bumps hero off roof
		createjs.Tween.get(experimentService.interlocutor, {loop: false})
			.to({x:-200}, 500, createjs.Ease.quadOut)
			.wait(1000)
			.to({x:interlocutor_x, alpha:0}, 0, createjs.Ease.none);

		//hero falls off roof
		createjs.Tween.get(experimentService.hero, {loop: false})
			.wait(200)
			.to({y: 800}, 500, createjs.Ease.backInOut)
			.wait(500)
			.to({y: 260, x: 100}, 500, createjs.Ease.backOut)
			.call(function(){
				def.resolve("fall complete");
			});

		//roof regresses
		createjs.Tween.get(roof, {loop: false})
		.wait(500)
			.to({x: -1430}, 0, createjs.Ease.quadOut)
			.to({x: -400}, 800, createjs.Ease.none);

		//background regresses
		if(background2.x >= 0){
			background2.x = -800
		}
		if(background3.x >= 0){
			background3.x = -800
		}
		background2Tween = createjs.Tween.get(background2)
			.wait(500)
			.to({x: background2.x+20}, 500, createjs.Ease.none);
		background3Tween = createjs.Tween.get(background3)
			.wait(500)
			.to({x: background3.x+100}, 500, createjs.Ease.none);

		return def.promise;
	}

	experimentService.night = function(){
		background0.alpha = 0.8;
		background1.alpha = 0;
		background2.alpha = 0;
		background3.alpha = 0;
	}

	experimentService.day = function(){
		background0.alpha = 0;
		background1.alpha = 1;
		background2.alpha = 1;
		background3.alpha = 1;
	}

	return experimentService;
}

})();
