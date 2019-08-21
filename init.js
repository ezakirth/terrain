/**
 * @fileoverview init.js - init functions
 * @author Xavier de Boysson
 */

"use strict";
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var totalLoading = 0;
var terrainDepth = 3;
var mapSize = 512;
var sizeRatio = 1;
var gl = null, canvas = null, frustum = null;
var infos = null, actions = null, actionsText = "", infosText = "";

var cnt = 0;

var skybox = null, terrain = null;


var lastUpdateTime = 0, fps = 0;
var airTime = 0;
var tick = 0;
var totalfps = 0;
var counter = 0;
var totalTime = 0;

var mvMatrix = null, pMatrix = null, mvpMatrix = null, oMatrix = null;

var viewPort = 0, width = 0, height = 0;

var seedBuffer = new ArrayBuffer(256);

var programs = null;



var xBuffer = null;
var yBuffer = null;


var vignette = null, xBlur = null, yBlur = null;

  function toggleFullScreen() {
    if (!document.mozFullScreen && !document.webkitFullScreen) {
      if (canvas.mozRequestFullScreen) {
        canvas.mozRequestFullScreen();
      } else {
        canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else {
        document.webkitCancelFullScreen();
      }
    }

  }
  document.addEventListener("keydown", function(e) {
    if (e.keyCode == 13) {
      toggleFullScreen();
    }
  }, false);

window.onresize = function() {
    setup(input.scale);
}

function setup(scale)
{
    width = window.innerWidth/scale; height = window.innerHeight/scale;
    viewPort = width/(2*Math.tan((45*Math.PI/180)/2));

    canvas.width = width; canvas.height = height; 
    canvas.style.width = width*scale + "px"; canvas.style.height = height*scale + "px";
    gl.viewport(0, 0, width, height);
    xBuffer = createFramebuffer();
    yBuffer = createFramebuffer();
            if (xBlur)
            {
                xBlur = new Pass(programs.blurX, xBuffer, 1);
                yBlur = new Pass(programs.blurY, yBuffer, 2);

            }
}

function doAction(action)
{
    if (action == "fullScreen")
        toggleFullScreen();

    if (action == "blur")
    {
        input.wireframe = false;
        input.depthOfField = !input.depthOfField;
    }

    if (action == "wireframe")
    {
        if (!input.depthOfField)
            input.wireframe = !input.wireframe;
    }

    if (action == "morph")
      input.vertexMorphing = !input.vertexMorphing;

    if (action == "autorun")
      input.autoRun = !input.autoRun;


    if (action == "fly")
    {
        input.flying = !input.flying;
        airTime = 0;
    }

    if (action == "fog")
    {
        input.fog = !input.fog;
        if (input.fog)
            terrain.setProgram(programs.terrain);
        else
            terrain.setProgram(programs.terrainNoFog);

    }

    actionsText = "";
    actionsText += '<br/><span onclick=\'doAction("fullScreen");\'>[Toggle Fullscreen]</span>';
	actionsText += '<br/><span onclick=\'doAction("blur");\'>[Depth of Field]</span> -> ' + (input.depthOfField?'on':'off');
	actionsText += '<br/><span onclick=\'doAction("morph");\'>[Vertex morphing]</span> -> ' + (input.vertexMorphing?'on':'off');
	actionsText += '<br/><span onclick=\'doAction("fog");\'>[Fog]</span> -> ' + (input.fog?'on':'off');
	actionsText += '<br/><span onclick=\'doAction("fly");\'>[Fly mode]</span> -> ' + (input.flying?'on':'off');
	actionsText += '<br/><span onclick=\'doAction("autorun");\'>[Autorun mode]</span> -> ' + (input.autoRun?'on':'off');
	if (!input.depthOfField)
	    actionsText += '<br/><span onclick=\'doAction("wireframe");\'>[Wireframe mode]</span> -> ' + (input.wireframe?'on':'off');

    actions.innerHTML = actionsText;
}

function init()
{
    var seedView = new Uint8Array(seedBuffer);
    for (var i = 0; i < 256; i++)
    {
        seedView[i] = Math.floor(Math.random() * 256);
    }

    infos = document.getElementById("infos");
    actions = document.getElementById("actions");

    canvas = document.getElementById("glcanvas");

    doAction();


    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch(e) {}

    if (!gl)
    {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        return;
    }

    setup(input.scale);

//    gl.clearColor(246./255., 233./255., 180./255., 1.);
    gl.clearColor(0, 0, 0, 1.);

    gl.clearDepth(1.0);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable (gl.BLEND);
    gl.blendFunc (gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


    createProgramsFromURIs(gl, {
        programs: [{
            name: 'terrain',
              vsURI: 'shaders/terrain.vert',
              fsURI: 'shaders/terrain.frag'
            }, {
            name: 'terrainNoFog',
              vsURI: 'shaders/terrain.vert',
              fsURI: 'shaders/terrainNoFog.frag'
            }, {
              name: 'skybox',
              vsURI: 'shaders/skybox.vert',
              fsURI: 'shaders/skybox.frag'
            }, {
              name: 'blurX',
              vsURI: 'shaders/blurX.vert',
              fsURI: 'shaders/blurX.frag'
            }, {
              name: 'blurY',
              vsURI: 'shaders/blurY.vert',
              fsURI: 'shaders/blurY.frag'
            }],
        onComplete: function(progs)
        {
            programs = progs;

            initWorkers();

            terrain = new Terrain();
            skybox = new Skybox();

            xBlur = new Pass(programs.blurX, xBuffer, 1);
            yBlur = new Pass(programs.blurY, yBuffer, 2);

            pMatrix = mat4.create();
            oMatrix = mat4.create();
            mvMatrix = mat4.create();
            mvpMatrix = mat4.create();


            input.init();



            renderFrame();


        }
      });

}

var timer = {
    time : new Date(),
    id : "",
    start : function(id)
    {
        Timer.id = id;
        Timer.time = new Date();
    },
    end : function()
    {
        var execTime = new Date() - Timer.time;
        console.log("[" + Timer.id + "] Process time took: " + execTime + "ms");
    }

};

