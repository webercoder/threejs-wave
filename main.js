(function(){

	function Wave() {}
	Wave.prototype = {
		init: function(world) {
			var line;
			this.world = world;
			this.lines = [];
			this.create_line();
			this.add_new_lines();
			this.register_animation_callbacks(world);
		},
		create_line: function() {
			var x = 5,
			line_count = this.lines.length,
			y,
			z = 0;
			y = 2 * Math.sin(0.1 * line_count);
			this.lines.push({
				added: false,
				obj: this.create_line_object(x, y, z)
			});
		},
		create_line_object: function(x, y, z) {
			var geometry = new THREE.Geometry(),
			material,
			line;
			geometry.vertices.push(new THREE.Vector3(-1 * x, y, z));
			geometry.vertices.push(new THREE.Vector3(x, y, z));
			geometry.verticesNeedUpdate = true;
			material = new THREE.MeshBasicMaterial({color: 0xffffff});
			line = new THREE.Line(geometry, material);
			line.dynamic = true;
			return line;
		},
		add_new_lines: function() {
			for (var i = 0; i < this.lines.length; i++) {
				if (! this.lines[i].added) {
					this.world.scene.add(this.lines[i].obj);
					this.lines[i].added = true;
				}
			}
			return this.three_element;
		},
		register_animation_callbacks: function(world) {
			var _this = this;
			world.register_animation_callback(function callbackLines() {
				for (var i = 0; i < _this.lines.length; i++) {
					var vertices = _this.lines[i].obj.geometry.vertices;
					for (var j = 0; j < vertices.length; j++) {
						vertices[j].z -= 1;
					}
					_this.lines[i].obj.geometry.verticesNeedUpdate = true;
				}
				_this.create_line();
				_this.add_new_lines();
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
		world.move_camera(undefined, undefined, 3.5);
		world.start();
	}

})();