var width = $("#webgl").width();
var height = $("#webgl").height();

var camera, scene, renderer, loader;
var controls;

var manager = new THREE.LoadingManager();
var boatgroup = new THREE.Group();
var bateauActuel;
var offsetBoat;

manager.onStart = function()
{
	$("#appStatus").html("Chargement en cours ...");
}

manager.onLoad = function()
{
	$("#appStatus").html("Personnalisez votre bateau");
	init();
}

function loadModel(name, scale)
{
	Q.fcall()
	loader.load(name, function(geom, mats) { 
		meshloaded = new THREE.Mesh(geom, new THREE.MultiMaterial( mats ));
		meshloaded.scale.set(scale,scale,scale);
		meshloaded.updateMatrix();
		assets[name] = meshloaded;
		done = true;
	});	
}

var assets = [];
function loadassets()
{
	loader = new THREE.JSONLoader(manager);

	loadModel("BateauA.json", 1);
	loadModel("BateauC.json", 5);
	loadModel("Sea.json", 1);
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
	loadPropulsionValues("BateauA");

	offsetBoat = 0.25;
	var mer = assets["Sea.json"];
	scene.add(mer);
	mer.position.y = -2;
	mer.scale.x = 5;
	mer.scale.z = 5;
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

var systemePropulsion = {
	"BateauA": [ "-", "Rames", "V12" ],
	"BateauB": [ "-", "V16", "V16-PRO" ],
	"BateauC": [ "-", "V16-PRO", "V32" ]
}

var boatOffsets = {
	"BateauA":0.25,
	"BateauB":1,
	"BateauC":5,
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

function changeColorBoat(index, val)
{
	var r = parseInt(val.substring(1,3),16)/255;
	var g = parseInt(val.substring(3,5),16)/255;
	var b = parseInt(val.substring(5,7),16)/255;
	var colorFinal = { 'r':r, 'g':g, 'b':b};
	bateauActuel.material.materials[index].color = colorFinal;
}

function loadPropulsionValues(nom)
{
	$("#propulsion").empty();
	for(modele in systemePropulsion[nom])
	{
		$("#propulsion").append("<option value=\""+systemePropulsion[nom][modele]+"\">"+systemePropulsion[nom][modele]+"</option>");
	}
}


$("#modeleBateau").on("change", function(e) {

	var nom = $("#modeleBateau").val();
	// Change the current boat on the group
	boatgroup.remove(bateauActuel);
	bateauActuel = assets[nom + ".json"];
	boatgroup.add(bateauActuel);

	// Change the propulsion values
	loadPropulsionValues(nom);

	// Change the boat offset
	offsetBoat = boatOffsets[nom];

});

$("#couleurPrimaire").on("change", function(e) {
	changeColorBoat(0,$("#couleurPrimaire").val());
});

$("#couleurSecondaire").on("change", function(e) {
	changeColorBoat(1,$("#couleurSecondaire").val());
});