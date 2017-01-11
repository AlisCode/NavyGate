var width = $("#webgl").width();
var height = $("#webgl").height();

var camera, scene, renderer, loader;
var controls;

var manager = new THREE.LoadingManager();
var boatgroup = new THREE.Group();
var bateauActuel;

var offsetBoat;

manager.onLoad = function()
{
	init();
}

function loadModel(name)
{
	Q.fcall()
	loader.load(name, function(geom, mats) { 
		meshloaded = new THREE.Mesh(geom, new THREE.MultiMaterial( mats ));
		meshloaded.updateMatrix();
		assets[name] = meshloaded;
		done = true;
	});	
}

var assets = [];
function loadassets()
{
	loader = new THREE.JSONLoader(manager);

	loadModel("BateauA.json");
	loadModel("BateauC.json");
	loadModel("Sea.json");
}

function init()
{
	// CREATES THE CAMERA, THE SCENE, THE RENDERER
	camera = new THREE.PerspectiveCamera(70, width/height, 1, 1000 );
	scene = new THREE.Scene();
	

	// CAMERA DEFAULT POSITION
	camera.position.x = 10;
	camera.position.y = 10;
	camera.position.z = 10;
	camera.lookAt(scene.position);

	// Renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.setClearColor(0x90CAF9, 1);

	// LAUNCH THE CONTROLS
	controls = new THREE.OrbitControls( camera , renderer.domElement);

	// LOADS THE MODEL
	
	bateauActuel = assets["BateauA.json"];
	offsetBoat = 0.25;
	var mer = assets["Sea.json"];
	scene.add(mer);
	mer.position.y = -2;
	mer.scale.x = 3;
	mer.scale.z = 3;
	mer.scale.y = 1.5;

	boatgroup.add(bateauActuel);
	scene.add(boatgroup);

	// ADDS A LIGHT
	var light = new THREE.AmbientLight(0xffffff);
	var skylight = new THREE.HemisphereLight( 0x0000ff, 0x000000, 0.6 ); 
	var sunlight = new THREE.DirectionalLight(0xFFFFFF, 0.6);
	sunlight.position.set(0,1,0);

    scene.add(light);
    scene.add(skylight);
    scene.add(sunlight);

	// SETS THE RENDERER
	$("#webgl").append(renderer.domElement);

	animate();
}

function animate()
{
	requestAnimationFrame(animate);


	animateBoat();
	controls.update();
	renderer.render(scene, camera);
}


var goingUp = true;
var yBoat = 0;
var minYBoat = -0.4;
var maxYBoat = 0.2;
var movementPerFrame = 0.01;
function animateBoat()
{
	if(goingUp)
	{
		yBoat += movementPerFrame;
	}
	else
	{
		yBoat -= movementPerFrame;
	}

	if(yBoat < minYBoat)
	{
		goingUp = true;
	}
	if(yBoat > maxYBoat)
	{
		goingUp = false;
	}

	boatgroup.position.y = yBoat + offsetBoat;
}

loadassets();


$("#modeleBateau").on("change", function(e) {

	boatgroup.remove(bateauActuel);
	bateauActuel = assets[$("#modeleBateau").val() + ".json"];
	boatgroup.add(bateauActuel);
});

$("#couleurPlastique").on("change", function(e) {

	console.log();
	var color = $("#couleurPlastique").val();
	var r = parseInt(color.substring(1,3),16)/255;
	var g = parseInt(color.substring(3,5),16)/255;
	var b = parseInt(color.substring(5,7),16)/255;
	var colorFinal = { 'r':r, 'g':g, 'b':b};
	bateauActuel.material.materials[0].color = colorFinal;
	console.log(bateauActuel.material.materials[0].color);

});