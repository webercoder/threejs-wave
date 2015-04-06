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
			world.register_animation_callback(function callbackRotate(){
				this.three_element.rotation.x += 0.1;
				this.three_element.rotation.y += 0.1;
			});
		}
	}

	function World(container) {
		this.container = container;
		this.container_width = container.clientWidth;
		this.container_height = container.clientHeight;
	}
	World.prototype = {
		init: function() {
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(
				75,
				this.container_width / this.container_height,
				0.1,
				1000
			);
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(this.container_width, this.container_height);
			this.container.appendChild(this.renderer.domElement);
			this.callbacks = [];
		},
		start: function() {
			var render = function () {
				requestAnimationFrame(render);
				for (var i = 0; i < this.callbacks.length; i++) {
					this.callbacks[i]();
				}
				renderer.render(scene, camera);
			};
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

		var world = new World(document.body),
		wave = new Wave();

		world.init();
		wave.init();
		world.add(wave.get_three_element());

	}

})();