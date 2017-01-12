var width = $("#webgl").width();
var height = $("#webgl").height();

var camera, scene, renderer, loader;
var controls;

var manager = new THREE.LoadingManager();
var boatgroup = new THREE.Group();
var bateauActuel;
var propulsionActuelle;
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
	loadModel("BateauB.json", 2);
	loadModel("BateauC.json", 5);
	loadModel("Sea.json", 1);
	loadModel("Rames.json", 0.7);
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

	// LOADS THE DEFAULT BOAT
	bateauActuel = assets["BateauA.json"];
	loadPropulsionValues("BateauA");
	offsetBoat = 0.25;

	// LOADS THE SEA MODEL
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
	"BateauA": [ "-", "Rames", "BoatProp12" ],
	"BateauB": [ "-", "BoatProp16", "BoatProp16-PRO" ],
	"BateauC": [ "-", "BoatProp16-PRO", "BoatProp32" ]
}

var boatOffsets = {
	"BateauA":0.25,
	"BateauB":1.5,
	"BateauC":5,
}

var offsetPropulsion = {
	"Rames": { "BateauA": { x:0, y:-0.4, z:0.1}}
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

function loadPropulsionModel(nom)
{
	if(propulsionActuelle)
	{
		boatgroup.remove(propulsionActuelle);
	}

	if(nom != "-")
	{
		propulsionActuelle = assets[nom + ".json"];
		pos = offsetPropulsion[nom][$("#modeleBateau").val()];
		propulsionActuelle.position.set(pos.x, pos.y, pos.z);
		boatgroup.add(propulsionActuelle);
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

$("#propulsion").on("change", function(e) {
	loadPropulsionModel($("#propulsion").val());
});