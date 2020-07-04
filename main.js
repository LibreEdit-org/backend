var mediaDump = document.getElementById("mediaDump");
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

// Raw uploaded files
var media = [];

// Proxy video, smaller and easier to work with
var proxies = [];

var myProject = createProject();

var player = {
	setTime: function(media, time) {

	},

	drawFrame: function(media, dimension, callback) {
		c.drawImage(media, dimension[0], dimension[1], dimension[2], dimension[3]);
		media.addEventListener('timeupdate', function() {
			callback();
		});
	},
}

var engine = {
	drawFrame: function(type, properties, effects) {
		if (type == "proxy") {

		} else if (type == "video") {

		}
	}
}

var ui = {
	upload: function() {
		getFile(function(file) {
			addSource(file);
		});
	}
}

var test = {
	proxy: function() {
		generateProxyClip({
			video: media[0].element,
			fps: 1/30,
			resolution: [480, 320],
			playbackRate: 2,
		},
		function(time) {console.log(time)},
		function(proxy, time) {console.log(proxy)});
	}
}

function testPlay() {
	const video = media[0].element;
	setInterval(function() {
		player.drawFrame(
			video,
			[0, 0, 480, 300],
			function() {

			}
		);
	}, 1);

	video.play();
}

function addSource(file) {
	var i = 0;
	var type = file.files[i].type.split("/");

	// Create element based off of the type. Works fine, but
	// will need to be changed later on with error handling.
	var mediaElement = document.createElement(type[i]);
	var objectURL = window.URL.createObjectURL(file.files[i]);
	mediaElement.src = objectURL;
	mediaDump.appendChild(mediaElement);

	media.push({
		name: file.name,
		type: type[0],
		fileType: type[1],
		element: mediaElement
	});

	console.log(mediaElement);
}

function getFile(callback) {
	var file = document.createElement("input");
	file.type = "file";
	file.click();

	file.onchange = function() {
		callback(file);
	}
}

// Proxy Clip generator, creates a smaller clip that is easier
// on the cpu to work with.
function generateProxyClip(proxy, loop, callback) {
	proxy.frames = [];

	// Proxy Generator Benchmarks (sec)
	// Timeupdate + canvas: 164.907s
	// 55.917 178
	// Timeupdate: 168.20s
	// Seeked: 57.882s
	// interval: 17.886s good
	// interval half: fast 9s good
	// interval quarter: fast 4s poor

	var then = Date.now();

	var video = proxy.video;
	video.lastTime = 0;
	video.currentTime = 0;
	video.playbackRate = proxy.playbackRate;

	// Background player loop - Tested fastest out of 4 or so methods
	var backgroundLoop = setInterval(function() {
		if (video.currentTime >= video.duration) {
			var now = Date.now();
			callback(proxy, (now - then) / 1000);
			clearInterval(backgroundLoop);
		} else {
			// Don't record frame more than once
			if (video.lastTime != 0 && video.currentTime <= video.lastTime) {
				return;
			}

			video.lastTime = video.currentTime;

			var converter = document.createElement("canvas");
			converter.width = proxy.resolution[0];
			converter.height = proxy.resolution[1];

			converter.getContext("2d").drawImage(
				video,
				0,
				0,
				proxy.resolution[0],
				proxy.resolution[1]
			);

			proxy.frames.push(converter);
			loop(video.currentTime);
		}
	}, proxy.fps * 1000);

	video.play();
}

function createProject() {
	var project = {
		name: "",
		tracks: {
			video: [

			],
			audio: [

			]
		}
	}

	project.tracks.video[0] = {
		type: "video",
		clips: [

		]
	}

	project.tracks.audio[0] = {
		type: "audio",
		clips: [

		]
	}

	return project;
}
