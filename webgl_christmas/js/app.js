var camera, scene, renderer;
var container, controls;
var tree;

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 400;
	camera.position.y = 100;

	scene = new THREE.Scene();

	// lighting

	var ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 );
	scene.add( ambientLight );

	var pointLight = new THREE.PointLight( 0xffffff, 0.8, 0, 1 );
	pointLight.castShadow = true;
	pointLight.position.y = 500;
	pointLight.position.x = 100;
	//Set up shadow properties for the light
	pointLight.shadow.mapSize.width = 4096; 
	pointLight.shadow.mapSize.height = 4096;
	pointLight.shadow.camera.near = 0.5;   
	pointLight.shadow.camera.far = 2048;
	pointLight.shadow.bias = 0.0001;

	scene.add( pointLight );

	var pointLight2 = new THREE.PointLight( 0xffffff, 0.3, 0, 2 );
	pointLight2.position.y = 100;
	pointLight2.position.x = -500;

	scene.add( pointLight2 );

	// Create a helper outline for the shadow camera
	var helper = new THREE.CameraHelper( pointLight.shadow.camera );
	//scene.add( helper ); //uncomment if needed

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
					object.position.y = - 95;

					// since the object is technically a group of objects, each one needs to cast shadows
					object.traverse( function ( child ) {
            		    child.castShadow = true;
            		    child.receiveShadow = true;
            		} );

            		tree = object;

					scene.add( object );

				}, onProgress, onError )

		} );

    // Set up renderer
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// Add OrbitControls so that we can pan around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 200;
    controls.maxDistance = 450;
    controls.minPolarAngle = Math.PI/4;
    controls.maxPolarAngle = Math.PI/2;

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

	// need to wrap until it loads and variable is assigned to model
	if(tree) {
		tree.rotation.y += 0.0005;
	}

	requestAnimationFrame( animate );
	render();

	controls.update();

}

function render() {

	camera.lookAt( scene.position );
	renderer.render( scene, camera );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}