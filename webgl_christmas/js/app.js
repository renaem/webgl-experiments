var camera, scene, renderer;
var container, controls;
var tree = [];

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 500;

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );

	// lighting

	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.8 );
	scene.add( ambientLight );

	var pointLight = new THREE.PointLight( 0xffffff, 0.5, 0, 2 );
	pointLight.castShadow = true;
	pointLight.position.y = 1000;
	//Set up shadow properties for the light
	pointLight.shadow.mapSize.width = 4096; 
	pointLight.shadow.mapSize.height = 4096;
	pointLight.shadow.camera.near = 0.5;   
	pointLight.shadow.camera.far = 2000;
	pointLight.shadow.bias = 0.01;

	scene.add( pointLight );

	// Create a helper outline for the shadow camera
	var helper = new THREE.CameraHelper( pointLight.shadow.camera );
	scene.add( helper );

	// Model import

	var onProgress = function ( xhr ) {

		if ( xhr.lengthComputable ) {

			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

		}

	};

	var onError = function () { };

	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

	new THREE.MTLLoader()
		.setPath( 'models/' )
		.load( 'tree.mtl', function ( materials ) {

			materials.preload();

			new THREE.OBJLoader()
				.setMaterials( materials )
				.setPath( 'models/' )
				.load( 'tree.obj', function ( object ) {

					object.name = "christmasTree";
					object.castShadow = true;
					object.receiveShadow = true;
					console.log(object);
					object.position.y = - 95;

					// since the object is technically a group of objects, each one needs to cast shadows
					object.traverse( function ( child ) {
            		    child.castShadow = true;
            		    child.receiveShadow = true;
            		    tree.push(child); // add to array
            		} );

					scene.add( object );

				}, onProgress, onError )

		} );

	//Create a plane that receives shadows (but does not cast them)
	var planeGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 32, 32 );
	var planeMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	var plane = new THREE.Mesh( planeGeometry, planeMaterial );
	plane.receiveShadow = true;
	plane.rotation.x = Math.PI / 2;
	plane.position.y = -125;
	scene.add( plane );

    // Set up renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// Add OrbitControls so that we can pan around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add DragControls so that we can drag shit around
    var dragControls = new THREE.DragControls( tree, camera, renderer.domElement );
	dragControls.addEventListener( 'dragstart', function () {
		controls.enabled = false;
	} );
	dragControls.addEventListener( 'dragend', function () {
		controls.enabled = true;
	} );

}

function animate() {

	scene.rotation.y += 0.001;

	requestAnimationFrame( animate );
	render();

	controls.update();

}

function render() {

	camera.lookAt( scene.position );
	renderer.render( scene, camera );

}