(function(){

	function Wave() {}
	Wave.prototype = {
		init: function(world) {
			this.geometry = new THREE.BoxGeometry( 1, 1, 1 );
			this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			this.three_element = new THREE.Mesh(this.geometry, this.material);
			this.register_animation_callbacks(world);
		},
		get_three_element: function() {
			return this.three_element;
		},
		register_animation_callbacks: function(world) {
			var _this = this;
			world.register_animation_callback(function callbackRotate(){
				_this.three_element.rotation.x += 0.01;
				_this.three_element.rotation.y += 0.01;
			});
		}
	}

	function World() {}
	World.prototype = {
		init: function() {
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(
				75,
				window.innerWidth / window.innerHeight,
				0.1,
				1000
			);
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(this.renderer.domElement);
			this.callbacks = [];
		},
		start: function() {
			var _this = this,
			render = function() {
				requestAnimationFrame(render);
				for (var i = 0; i < _this.callbacks.length; i++) {
					_this.callbacks[i]();
				}
				_this.renderer.render(_this.scene, _this.camera);
			};
			render();
		},
		add: function(obj) {
			this.scene.add(obj);
		},
		move_camera: function(x, y, z) {
			if (x !== undefined) {
				this.camera.position.x = x;
			}
			if (y !== undefined) {
				this.camera.position.y = y;
			}
			if (z !== undefined) {
				this.camera.position.z = z;
			}
		},
		register_animation_callback: function(callback /* , position */) {
			this.callbacks.push(callback);
		}
	}

	window.onload = function() {
		var world = new World(),
		wave = new Wave();
		world.init();
		wave.init(world);
		world.add(wave.get_three_element());
		world.move_camera(undefined, undefined, 5);
		world.start();
	}

})();