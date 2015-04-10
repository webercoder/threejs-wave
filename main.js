(function(){

	var ColorHelper = (function() {
		function random_non_black() {
			return Math.random() * (256 - 20) + 20;
		}
		// http://stackoverflow.com/a/5624139/210827
		function rgb_to_hex(r, g, b) {
			var val = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
			return parseInt(val, 16);
		}
		return {
			random_color: function() {
				return rgb_to_hex(
					0,
					0,
					random_non_black()
				)
			}
		}
	})();

	function Wave() {}
	Wave.prototype = {
		init: function(world) {
			var line;
			this.world = world;
			this.lines = [];
			this.create_line();
			this.add_new_lines();
			this.total_lines_created = 0;
			this.register_animation_callbacks(world);
		},
		create_line: function() {
			var x = 5,
			y,
			z = 0;
			if (this.lines.length > 300) {
				var removed = this.lines.shift();
				this.world.scene.remove(removed.obj);
				delete removed;
			}
			y = Math.sin(0.05 * this.total_lines_created);
			this.lines.push({
				added: false,
				obj: this.create_line_object(x, y, z)
			});
			this.total_lines_created++;
		},
		create_line_object: function(x, y, z) {
			var geometry = new THREE.Geometry(),
			material,
			line;
			geometry.vertices.push(new THREE.Vector3(-1 * x, y, z));
			geometry.vertices.push(new THREE.Vector3(x, y, z));
			geometry.verticesNeedUpdate = true;
			material = new THREE.MeshBasicMaterial({color: ColorHelper.random_color()});
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
						vertices[j].z -= 0.02;
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
			this.setup_camera_controls();
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
		move_camera: function(args) {
			if ('x' in args) {
				this.camera.position.x += args.x;
			}
			if ('y' in args) {
				this.camera.position.y += args.y;
			}
			if ('z' in args) {
				this.camera.position.z += args.z;
			}
			console.log("New coordinates", this.camera.position);
		},
		register_animation_callback: function(callback /* , position */) {
			this.callbacks.push(callback);
		},
		setup_camera_controls: function() {
			var _this = this;
			document.addEventListener(
				"keydown",
				function(e) {
					e.preventDefault();
					var key_code = e.which || e.keyCode;
					switch (key_code) {
						case 87: // w
						case 38: // up
							_this.move_camera({z: 0.5});
							break;
						case 83: // s
						case 40: //down
							_this.move_camera({z: -0.5});
							break;
						case 65: // a
						case 37: // left
							_this.move_camera({x: -0.5});
							break;
						case 68: // d
						case 39: // right
							_this.move_camera({x: 0.5});
							break;
					}
				}, 
				false
			);
			function get_current_position() {
				// http://stackoverflow.com/a/7790764/210827
				var dot, eventDoc, doc, body, pageX, pageY;
				event = event || window.event;
				if (event.pageX == null && event.clientX != null) {
					eventDoc = (event.target && event.target.ownerDocument) || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
					event.pageX = event.clientX +
					(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
					(doc && doc.clientLeft || body && body.clientLeft || 0);
					event.pageY = event.clientY +
					(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
					(doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
				// End http://stackoverflow.com/a/7790764/210827
				return {
					x: event.pageX,
					y: event.pageY
				};
			}
			var down = false;
			document.addEventListener(
				"mousedown",
				function(e) {
					down = true;
					_this.last_position = get_current_position();
				},
				false
			);
			document.addEventListener(
				"mouseup",
				function(e) {
					down = false;
					_this.last_position = undefined;
				},
				false
			);
			document.addEventListener(
				"mousemove",
				function(e) {
					if (down && "last_position" in _this) {
						current_position = get_current_position();
						var x = _this.camera.position.x,
						z = _this.camera.position.z,
						delta_x = 10 * ((_this.last_position.x - current_position.x) / window.innerWidth),
						delta_y = 10 * ((current_position.y - _this.last_position.y) / window.innerHeight);
						_this.move_camera({
							"x": delta_x,
							"y": delta_y
						});
						_this.last_position = current_position;
					}
				},
				false
			);
		}
	}

	window.onload = function() {
		var world = new World(),
		wave = new Wave();
		world.init();
		wave.init(world);
		world.move_camera({z: 3.5});
		world.start();
	}

})();