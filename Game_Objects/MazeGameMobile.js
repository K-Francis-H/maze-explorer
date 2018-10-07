//MazeGame.js
/*TODO
-Add other algorithms (Recursive Backtracker makes difficult mazes)
-Add options
  -modes: Story Mode, AI Race??
  -no walls -> fall to death instead of collision
  -jumping (w/no walls)
-Add better collision detection
  -sliding
-Audio
  -music (upbeat fast paced for time attack, slow deep for infinity maze)
-Win screen
  -quotes or phrases
-Make Entry and Exit unique Colors DONE

-Touch control 
  -for Firefox, Android DONE
  
*/

/*function getRandom(min, max, isInt){
   if( isInt == null || !isInt) 
      return Math.random() * (max - min) + min;
   else
      return Math.floor(Math.random() * (max - min+1) + min);
}*/
var FOG_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_Model;\n' +
  'uniform mat4 u_View;\n' +
  'uniform mat4 u_Projection;\n' +
  'uniform vec4 u_Eye;\n' +     // Position of eye point (world coordinates)
  'uniform vec4 u_Color;\n'+
  'varying vec4 v_Color;\n' +
  'varying float v_Dist;\n' +
  'void main() {\n' +
  '  mat4 mvp = u_Projection * u_View * u_Model;\n' +
  '  gl_Position = mvp * a_Position ;\n' +
  '  v_Color = u_Color;\n' +
     // Calculate the distance to each vertex from eye point
  '  v_Dist = distance(u_View * a_Position, u_Eye);//gl_Position.w;//distance(u_Model * a_Position, u_Eye);\n' +
  '}\n';

// Fragment shader program
var FOG_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_FogColor;\n' + // Color of Fog
  'uniform vec2 u_FogDist;\n' +  // Distance of Fog (starting point, end point)
  'varying vec4 v_Color;\n' +
  'varying float v_Dist;\n' +
  'void main() {\n' +
  '  float fogFactor = ((2.0 - v_Dist)/(2.0-0.5));//exp2( -density * density * z * z * LOG2);\n'+
  '  fogFactor = clamp(fogFactor, 0.0, 1.0);\n'+
  '  gl_FragColor = mix( vec4(0,0,0,1.0), v_Color, fogFactor);//vec4(color, 0.2);\n' +
  '}\n';

//Fog & Texture Vertex Shader program
var FOG_TEX_VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec2 a_TexCoord;\n'+
  'uniform mat4 u_Model;\n' +
  'uniform mat4 u_View;\n' +
  'uniform mat4 u_Projection;\n' +
  'uniform vec4 u_Eye;\n' +     // Position of eye point (world coordinates)
  'uniform vec4 u_Color;\n'+
  'varying vec2 v_TexCoord;\n'+
  'varying vec4 v_Color;\n' +
  'varying float v_Dist;\n' +
  'void main() {\n' +
  '  mat4 mvp = u_Projection * u_View * u_Model;\n' +
  '  gl_Position = mvp * a_Position ;\n' +
  '  v_Color = u_Color;\n' +
  '  vec4 eye = u_Eye;\n'+
  '  v_TexCoord = a_TexCoord;\n'+
     // Calculate the distance to each vertex from eye point
  '  v_Dist = distance(u_View * a_Position, u_Eye);//gl_Position.w;//distance(u_Model * a_Position, u_Eye);\n' +
  '}\n'; 

var FOG_TEX_FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'uniform vec3 u_FogColor;\n' +
  'uniform vec2 u_FogDist;\n'+
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n'+
  'varying float v_Dist;\n'+
  'void main() {\n' +
  '  //gl_FragColor = vec4(1,0,0,1);//texture2D(u_Sampler, v_TexCoord);\n'+
  '  vec4 texColor = texture2D(u_Sampler, v_TexCoord);// + vec4(1.0, 0.34, 0.45, 1.0);\n' +
  '  float fogFactor = ((2.0 - v_Dist)/(2.0-0.5));\n'+
  '  fogFactor = clamp(fogFactor, 0.0, 1.0);\n'+
  '  gl_FragColor = mix( vec4(u_FogColor, 1.0), texColor, fogFactor);\n'+
  '}\n';

// Texture Vertex shader program
var TEXTURE_VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_Model;\n' +
  'uniform mat4 u_View;\n' +
  'uniform mat4 u_Projection;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  mat4 mvp = u_Projection * u_View * u_Model;\n' +
  '  gl_Position =  mvp * a_Position ;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Texture Fragment shader program
var TEXTURE_FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);// + vec4(1.0, 0.34, 0.45, 1.0);\n' +
  '}\n';

//No-Texture Vertex Shader
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_Model;\n' +
  'uniform mat4 u_View;\n' +
  'uniform mat4 u_Projection;\n' +
  'uniform vec4 u_Color;\n'+
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  mat4 mvp = u_Projection * u_View * u_Model;\n' +
  '  gl_Position =  mvp * a_Position ;\n' +
  '  v_Color =  u_Color;\n' +
  '}\n';

// No-Texture Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '     gl_FragColor = v_Color;\n' +
  '  //gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);\n' +
  '}\n';

//globals
var loopCtl; //holds handle to setInterval 
var numRows;
var numCols; 
var mazeCtl; //controls maze generator/renderer
var skybox;  //holds
//var walls;   //boolean
var gl;
var textureProgram;
var noTextureProgram;
var fogProgram;
var fogTexProgram;
var player;
var slideCtl;

var textureStore;


var GAME_MODE = null; //container for used game mode

var timeAttackMode = new Object();
var numBackgrounds = 7;
timeAttackMode.randBackground = getRandom(0, numBackgrounds-1, true);
timeAttackMode.randWalls = getRandom(0, 1, true);
timeAttackMode.fog = getRandom(0,5,true);
timeAttackMode.time = 0;
timeAttackMode.hasBestTime = false
timeAttackMode.bestTime = 0;
timeAttackMode.timer = null; //a setInterval return object

var zenMode = new Object();
var numBackgrounds = 7;
var numTex = 5;
zenMode.randBackground = getRandom(0, numBackgrounds-1, true);
zenMode.randWalls = getRandom(0, 1, true);
zenMode.isTextured = getRandom(0, 1, true);
zenMode.fog = getRandom(0,1,true);


         

//CONSTANTS
var FPS = 24;

var gameMode = 1;

//onload
window.onload = function(){
     //display game-container so that the window width is computed
     document.getElementById("game-container").style.display="block";

     var canvas = document.getElementById("canvas");
     var container = document.getElementById("mid");
     containerStyle = window.getComputedStyle(container);
     var conWidth = new Number(containerStyle.width.replace("px", ""));
     var conHeight = new Number(containerStyle.height.replace("px", ""));
     var rawWidth = window.innerWidth;
     var rawHeight = window.innerHeight;
      if(window.innerWidth > window.innerHeight){//landscape
         var rawHeight = window.innerHeight;
         var rawWidth = window.innerWidth;
         //var dimensions = 0.8 * rawWidth; 
         canvas.width = conWidth;//0.55*rawWidth;
         canvas.height = conWidth*0.65;//canvas.width*0.5;
         //twoDCanvas.width = conWidth;//0.55*rawWidth;
         //twoDCanvas.height = conWidth*0.65;//twoDCanvas.width*0.5
      }
      else{//portrait TODO changes aspect ratio need to reset camera
         var rawHeight = window.innerHeight;
         var rawWidth = window.innerWidth;
         canvas.width = conWidth;
         canvas.height = 0.45*rawHeight;
         //twoDCanvas.width = conWidth;
         //twoDCanvas.height = 0.45*rawHeight;
      }

   //hide game-container again
   document.getElementById("game-container").style.display="none";

   //WebGL init stuff
   var canvas = document.getElementById("canvas");
   //var twoDCanvas = document.getElementById("2dCanvas");
   //slideCtl = twoDCanvas.getContext("2d");
   //slideCtl.canvas = twoDCanvas;



   //get webGL
   try{
       gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
   }catch(e){}
   //tell user if unavailable
   if(!gl){
      console.log("WebGL failed or unavailable...");
      //var ctx = twoDCanvas.getContext("2d");
      //ctx.font = "30px Arial";
      //ctx.fillText("WebGL has failed or is unavailable :(", 0, canvas.height/2);
      return; //abort main()
   }

   //if webGL worked

   //enable desired fetures
   gl.enable(gl.DEPTH_TEST); //now have to clear DEPTH_BUFFER_BIT each frame

   //COMPILE AND LINK SHADER PROGRAMS
   
   //FOG shader
   console.log("compiling fog program");
   fogProgram = compileShaderProgram(gl, FOG_VSHADER_SOURCE, FOG_FSHADER_SOURCE);
   //FOG uniforms
   fogProgram.u_Model = gl.getUniformLocation(fogProgram, 'u_Model');
   if(fogProgram.u_Model == null){console.log("failed to init fogProgram.u_Model");}
   fogProgram.u_View = gl.getUniformLocation(fogProgram, 'u_View');
   if(fogProgram.u_View == null){console.log("failed to init fogProgram.u_View");}
   fogProgram.u_Projection = gl.getUniformLocation(fogProgram, 'u_Projection');
   if(fogProgram.u_Projection == null){console.log("failed to init fogProgram.u_Projection");}
   fogProgram.u_Eye = gl.getUniformLocation(fogProgram, 'u_Eye');
   if(fogProgram.u_Eye == null){console.log("failed to init fogProgram.u_Eye");}
   //FOG attribs
   fogProgram.a_Position = gl.getAttribLocation(fogProgram, 'a_Position');
   if(fogProgram.a_Position == null){console.log("failed to init fogProgram.a_Position");}   
   fogProgram.a_Color = gl.getAttribLocation(fogProgram, 'a_Color');
   if(fogProgram.a_Color == null){console.log("failed to init fogProgram.a_Color");} 

   //FOG TEX shader
   console.log("compiling fog texture program");
   fogTexProgram = compileShaderProgram(gl, FOG_TEX_VSHADER_SOURCE, FOG_TEX_FSHADER_SOURCE);
   //FOG TEX Uniforms
   fogTexProgram.u_Model = gl.getUniformLocation(fogTexProgram, 'u_Model');
   if(fogTexProgram.u_Model == null){console.log("failed to init fogTexProgram.u_Model");}
   fogTexProgram.u_View = gl.getUniformLocation(fogTexProgram, 'u_View');
   if(fogTexProgram.u_View == null){console.log("failed to init fogTexProgram.u_View");}
   fogTexProgram.u_Projection = gl.getUniformLocation(fogTexProgram, 'u_Projection');
   if(fogTexProgram.u_Projection == null){console.log("failed to init fogTexProgram.u_Projection");}
   fogTexProgram.u_Eye = gl.getUniformLocation(fogTexProgram, 'u_Eye');
   if(fogTexProgram.u_Eye == null){console.log("failed to init fogTexProgram.u_Eye");}
   fogTexProgram.u_Sampler = gl.getUniformLocation(fogTexProgram, 'u_Sampler');
   if(fogTexProgram.u_Sampler == null){console.log("failed to init fogTexProgram.u_Sampler");}
   fogTexProgram.u_FogColor = gl.getUniformLocation(fogTexProgram, 'u_FogColor');
   if(fogTexProgram.u_FogColor == null){console.log("failed to init fogTexProgram.u_FogColor");}
   //FOG TEX attribs
   fogTexProgram.a_Position = gl.getAttribLocation(fogTexProgram, 'a_Position');
   if(fogTexProgram.a_Position == null){console.log("failed to init fogTexProgram.a_Position");}   
   fogTexProgram.a_Color = gl.getAttribLocation(fogTexProgram, 'a_Color');
   if(fogTexProgram.a_Color == null){console.log("failed to init fogTexProgram.a_Color");}
   fogTexProgram.a_TexCoord = gl.getAttribLocation(fogTexProgram, 'a_TexCoord');
   if(fogTexProgram.a_TexCoord == null){console.log("failed to init fogTexProgram.a_TexCoord");}
 
   //NO-TEXTURE shader
   console.log("compiling no texture program");
   noTextureProgram = compileShaderProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
   //NO-TEXTURE uniforms
   noTextureProgram.u_Model = gl.getUniformLocation(noTextureProgram, 'u_Model');
   if(noTextureProgram.u_Model == null){console.log("failed to init noTextureProgram.u_Model");}
   noTextureProgram.u_View = gl.getUniformLocation(noTextureProgram, 'u_View');
   if(noTextureProgram.u_View == null){console.log("failed to init noTextureProgram.u_View");}
   noTextureProgram.u_Projection = gl.getUniformLocation(noTextureProgram, 'u_Projection');
   if(noTextureProgram.u_Projection == null){console.log("failed to init noTextureProgram.u_Projection");}
   noTextureProgram.u_Color = gl.getUniformLocation(noTextureProgram, 'u_Color');
   if(noTextureProgram.u_Color == null){console.log("failed to init noTextureProgram.u_Color");}
   //NO-TEXTURE attribs
   noTextureProgram.a_Position = gl.getAttribLocation(noTextureProgram, 'a_Position');
   if(noTextureProgram.a_Position == null){console.log("failed to init noTextureProgram.a_Position");}   
   noTextureProgram.a_Color = gl.getAttribLocation(noTextureProgram, 'a_Color');
   if(noTextureProgram.a_Color == null){console.log("failed to init noTextureProgram.a_Color");} 

   //TEXTURE shader
   console.log("compiling texture program");
   textureProgram = compileShaderProgram(gl, TEXTURE_VSHADER_SOURCE, TEXTURE_FSHADER_SOURCE);
   //TEXTURE uniforms
   textureProgram.u_Model = gl.getUniformLocation(textureProgram, 'u_Model');
   if(textureProgram.u_Model == null){console.log("failed to init textureProgram.u_Model");}
   textureProgram.u_View = gl.getUniformLocation(textureProgram, 'u_View');
   if(textureProgram.u_View == null){console.log("failed to init textureProgram.u_View");}
   textureProgram.u_Projection = gl.getUniformLocation(textureProgram, 'u_Projection');
   if(textureProgram.u_Projection == null){console.log("failed to init textureProgram.u_Projection");}
   textureProgram.u_Sampler = gl.getUniformLocation(textureProgram, 'u_Sampler');
   if(textureProgram.u_Sampler == null){console.log("failed to init textureProgram.u_Sampler");}
   //TEXTURE attribs
   textureProgram.a_Position = gl.getAttribLocation(textureProgram, 'a_Position');
   if(textureProgram.a_Position == null){console.log("failed to init textureProgram.a_Position");}
   textureProgram.a_TexCoord = gl.getAttribLocation(textureProgram, 'a_TexCoord');
   if(textureProgram.a_TexCoord == null){console.log("failed to init textureProgram.a_TexCoord");}

   //init skyboxes
   var dir = 'Textures/above_sea/'; //TODO put these pics in there and stuff...
   skybox = new SkyBox(gl);
   skybox.setTexture(gl, 'posX', dir+'Above_Sea_PosX.jpg');
   skybox.setTexture(gl, 'negX', dir+'Above_Sea_NegX.jpg');
   skybox.setTexture(gl, 'posY', dir+'Above_Sea_PosY.jpg');
   skybox.setTexture(gl, 'negY', dir+'Above_Sea_NegY.jpg');
   skybox.setTexture(gl, 'posZ', dir+'Above_Sea_PosZ.jpg');
   skybox.setTexture(gl, 'negZ', dir+'Above_Sea_NegZ.jpg');

   //setTimeouts used to slow the flood of picture loads otherwise an overloaded FFOS phone will dump my textures
   setTimeout(function(){
      dir = 'Textures/star/';
      hopebox = new SkyBox(gl);
      hopebox.setTexture(gl, 'posX', dir+'star_NegX.png');
      hopebox.setTexture(gl, 'negX', dir+'star_PosX.png');
      hopebox.setTexture(gl, 'posY', dir+'star_PosY.png');
      hopebox.setTexture(gl, 'negY', dir+'star_NegY.png');
      hopebox.setTexture(gl, 'posZ', dir+'star_NegZ.png');
      hopebox.setTexture(gl, 'negZ', dir+'star_PosZ.png');
      clearTimeout(this);
   }, 100);

   setTimeout(function(){
      nightbox = new SkyBox(gl);
      nightbox.setTexture(gl, 'posX', 'Textures/night.png');
      nightbox.setTexture(gl, 'negX', 'Textures/night.png');
      nightbox.setTexture(gl, 'posY', 'Textures/night.png');
      nightbox.setTexture(gl, 'negY', 'Textures/night.png');
      nightbox.setTexture(gl, 'posZ', 'Textures/night.png');
      nightbox.setTexture(gl, 'negZ', 'Textures/night.png');
      clearTimeout(this);
   }, 150);

   setTimeout(function(){
      dir = 'Textures/storm/';
      stormbox = new SkyBox(gl);
      stormbox.setTexture(gl, 'posX', dir+'storm_NegX.png');
      stormbox.setTexture(gl, 'negX', dir+'storm_PosX.png');
      stormbox.setTexture(gl, 'posY', dir+'storm_PosY.png');
      stormbox.setTexture(gl, 'negY', dir+'storm_NegX.png');
      stormbox.setTexture(gl, 'posZ', dir+'storm_NegZ.png');
      stormbox.setTexture(gl, 'negZ', dir+'storm_PosZ.png');
      clearTimeout(this);
   }, 200);

   setTimeout(function(){
      dir = 'Textures/stratosphere/';
      stratobox = new SkyBox(gl);
      stratobox.setTexture(gl, 'posX', dir+'stratosphere_right.jpg');
      stratobox.setTexture(gl, 'negX', dir+'stratosphere_left.jpg');
      stratobox.setTexture(gl, 'posY', dir+'stratosphere_top.jpg');
      stratobox.setTexture(gl, 'posZ', dir+'stratosphere_back.jpg');
      stratobox.setTexture(gl, 'negZ', dir+'stratosphere_front.jpg');
      clearTimeout(this);
   }, 250);

   setTimeout(function(){
      dir = 'Textures/space1/';
      spacebox1 = new SkyBox(gl);
      spacebox1.setTexture(gl, 'posX', dir+'jajspace1_right.jpg');
      spacebox1.setTexture(gl, 'negX', dir+'jajspace1_left.jpg');
      spacebox1.setTexture(gl, 'posY', dir+'jajspace1_top.jpg');
      spacebox1.setTexture(gl, 'posZ', dir+'jajspace1_back.jpg');
      spacebox1.setTexture(gl, 'negZ', dir+'jajspace1_front.jpg');
      clearTimeout(this);
    }, 300);
  
   setTimeout(function(){
      dir = 'Textures/sunrise/';
      risebox = new SkyBox(gl);
      risebox.setTexture(gl, 'posX', dir+'sunrise_negX.png');
      risebox.setTexture(gl, 'negX', dir+'sunrise_posX.png');
      risebox.setTexture(gl, 'posY', dir+'sunrise_posY.png');
      risebox.setTexture(gl, 'negY', dir+'sunrise_negY.png');
      risebox.setTexture(gl, 'posZ', dir+'sunrise_negZ.png');
      risebox.setTexture(gl, 'negZ', dir+'sunrise_posZ.png');
      clearTimeout(this);
   }, 350);

   //init texture store 5 Textures
   textureStore = new Array();
   textureStore[0] = { //brick textures
      'floor' : 'gl-seamless-brick-01.jpg',//Public Domain
      'wall'  : 'bricks1-512.jpg'}; //Public Domain
   textureStore[1] = { //hedge textures
      'floor' : 'gl-seamless-brick-01.jpg', //Public Domain
      'wall'  : 'hedge_ivy.png'}; //TODO thanks too Lamoot of opengameart.org
   textureStore[2] = { //mossy textures
      'floor' : 'Shanandra_Moss_Tile.jpeg', //TODO Shanandra -no thanks neccessary just non-commercial
      'wall'  : 'mossyrock7.jpg'};//TODO has watermark may be copyright infringement
   textureStore[3] = { //lava textures
      'floor' : '5Z4_LavaColdDraftFLAT.jpg', //from sketch places... Public Domain
      'wall'  : 'Simple_Lava_Texture_Seamless_Magma.jpg'}; //Public Domain
   textureStore[4] = { //moss brick textures
      'floor' : 'Shanandra_Moss_Tile.jpeg',
      'wall'  : 'Shanandra_Old_Brick.png'};

//button listeners (landscape)
var lb = document.getElementById("left_button_landscape");
lb.onmousedown = function(event){event.preventDefault();lb.src="Textures/buttons/left_arrow_pressed.png";player.turnLeft = true;};
lb.onmouseup = function(event){event.preventDefault();lb.src="Textures/buttons/left_arrow_unpressed.png";player.turnLeft = false;};
lb.ontouchstart = function(event){event.preventDefault();lb.src="Textures/buttons/left_arrow_pressed.png";player.turnLeft = true;};
lb.ontouchend = function(event){event.preventDefault();lb.src="Textures/buttons/left_arrow_unpressed.png";player.turnLeft = false;};
/*lb.onmouseleave = lb.ontouchend;
lb.ontouchmove = function(event){
   event.preventDefault();
   var touch = event.changedTouches[0];
   var x = touch.clientX;
   var y = touch.clientY;
   var img = event.target;//.getBoundingRect();
   console.log("cLeft: "+img.x+" cRight: "+img.x+img.width+" cTop: "+img.y+" cBottom: "+img.y+img.height+" x: "+x+" y: "+y);
   console.log(img.x+img.width);
   if( x < img.x || x > img.x+img.width || y < img.y || y > img.y+img.height){ //if touch location is beyond button, shut it down
      console.log(true);
      lb.src="Textures/buttons/left_arrow_unpressed.png";
      player.turnLeft = false;
   }
};*/
  

var rb = document.getElementById("right_button_landscape");
rb.onmousedown = function(event){event.preventDefault();rb.src="Textures/buttons/right_arrow_pressed.png";player.turnRight = true;};
rb.onmouseup = function(event){event.preventDefault();rb.src="Textures/buttons/right_arrow_unpressed.png";player.turnRight = false;};
rb.ontouchstart = function(event){event.preventDefault();rb.src="Textures/buttons/right_arrow_pressed.png";player.turnRight = true;};
rb.ontouchend = function(event){event.preventDefault();rb.src="Textures/buttons/right_arrow_unpressed.png";player.turnRight = false;};
//rb.ontouchmove = lb.ontouchmove; 

var ub = document.getElementById("up_button_landscape");
ub.onmousedown = function(event){event.preventDefault();ub.src="Textures/buttons/up_arrow_pressed.png";player.moveForward = true;};
ub.onmouseup = function(event){event.preventDefault();ub.src="Textures/buttons/up_arrow_unpressed.png";player.moveForward = false;};
ub.ontouchstart = function(event){event.preventDefault();ub.src="Textures/buttons/up_arrow_pressed.png";player.moveForward = true;};
ub.ontouchend = function(event){event.preventDefault();ub.src="Textures/buttons/up_arrow_unpressed.png";player.moveForward = false;};
//ub.ontouchmove = lb.ontouchmove; 

var db = document.getElementById("down_button_landscape");
db.onmousedown = function(event){event.preventDefault();db.src="Textures/buttons/down_arrow_pressed.png";player.moveBackward = true;};
db.onmouseup = function(event){event.preventDefault();db.src="Textures/buttons/down_arrow_unpressed.png";player.moveBackward = false;};
db.ontouchstart = function(event){event.preventDefault();db.src="Textures/buttons/down_arrow_pressed.png";player.moveBackward = true;};
db.ontouchend = function(event){event.preventDefault();db.src="Textures/buttons/down_arrow_unpressed.png";player.moveBackward = false;};
//db.ontouchmove = lb.ontouchmove; 

//portrait buttons
var lbp = document.getElementById("left_button_portrait");
lbp.onmousedown = function(event){event.preventDefault();lbp.src="Textures/buttons/left_arrow_pressed.png"; player.turnLeft = true;};
lbp.onmouseup = function(event){event.preventDefault();lbp.src="Textures/buttons/left_arrow_unpressed.png"; player.turnLeft = false;};
lbp.ontouchstart = function(event){event.preventDefault();lbp.src="Textures/buttons/left_arrow_pressed.png"; player.turnLeft = true;};
lbp.ontouchend = function(event){event.preventDefault();lbp.src="Textures/buttons/left_arrow_unpressed.png"; player.turnLeft = false;};
//lbp.ontouchmove = lb.ontouchmove;

var rbp = document.getElementById("right_button_portrait");
rbp.onmousedown = function(event){event.preventDefault();rbp.src="Textures/buttons/right_arrow_pressed.png"; player.turnRight = true;};
rbp.onmouseup = function(event){event.preventDefault();rbp.src="Textures/buttons/right_arrow_unpressed.png"; player.turnRight = false;};
rbp.ontouchstart = function(event){event.preventDefault();rbp.src="Textures/buttons/right_arrow_pressed.png"; player.turnRight = true;};
rbp.ontouchend = function(event){event.preventDefault();rbp.src="Textures/buttons/right_arrow_unpressed.png"; player.turnRight = false;};
//rbp.ontouchmove = lb.ontouchmove;

var ubp = document.getElementById("up_button_portrait");
ubp.onmousedown = function(event){event.preventDefault();ubp.src="Textures/buttons/up_arrow_pressed.png"; player.moveForward = true;};
ubp.onmouseup = function(event){event.preventDefault();ubp.src="Textures/buttons/up_arrow_unpressed.png"; player.moveForward = false;};
ubp.ontouchstart = function(event){event.preventDefault();ubp.src="Textures/buttons/up_arrow_pressed.png"; player.moveForward = true;};
ubp.ontouchend = function(event){event.preventDefault();ubp.src="Textures/buttons/up_arrow_unpressed.png"; player.moveForward = false;}; 
//ubp.ontouchmove = lb.ontouchmove;

var dbp = document.getElementById("down_button_portrait");
dbp.onmousedown = function(event){event.preventDefault();dbp.src="Textures/buttons/down_arrow_pressed.png"; player.moveBackward = true;};
dbp.onmouseup = function(event){event.preventDefault();dbp.src="Textures/buttons/down_arrow_unpressed.png"; player.moveBackward = false;};
dbp.ontouchstart = function(event){event.preventDefault();dbp.src="Textures/buttons/down_arrow_pressed.png"; player.moveBackward = true;};
dbp.ontouchend = function(event){event.preventDefault();dbp.src="Textures/buttons/down_arrow_unpressed.png"; player.moveBackward = false;};
//dbp.ontouchmove = lb.ontouchmove;

  //set cancel and menu buttons
  document.getElementById("cancel-options-button").onclick = function(){
     document.getElementById("options-container").style.display="none";
     document.getElementById("game-container").style.display="block";
  };

  document.getElementById("game-options-button").onclick = function(){
     document.getElementById("game-container").style.display="none";
     document.getElementById("options-container").style.display="block";
  };

  //set inc and dec buttons
  document.getElementById("row-dec-button").onclick = function(){
     var min = 1;
     //var max = 50;
     var rows = document.getElementById("rows");
     var current = new Number(rows.innerHTML);
     if(current - 1 >= min)
        rows.innerHTML = current - 1;
  }
  document.getElementById("row-inc-button").onclick = function(){
     var max = 50;
     var rows = document.getElementById("rows");
     var current = new Number(rows.innerHTML);
     if(current + 1 <= max)
        rows.innerHTML = current + 1;
  }
  document.getElementById("col-dec-button").onclick = function(){
     var min = 1;
     var cols = document.getElementById("cols");
     var current = new Number(cols.innerHTML);
     if(current - 1 >= min)
        cols.innerHTML = current - 1;
  }
  document.getElementById("col-inc-button").onclick = function(){
    var max = 50;
    var cols = document.getElementById("cols");
    var current = new Number(cols.innerHTML);
    if(current + 1 <= max)
       cols.innerHTML = current + 1;
  }
        

  //set listener for row column sizes
  document.getElementById("updateRows-Cols").addEventListener("click", function(){

         //hide options
         document.getElementById("options-container").style.display="none";
         //show game
         document.getElementById("game-container").style.display="block";

         if(loopCtl !== null)//clear interval if already started (else FPS speeds up)
            clearInterval(loopCtl);
         numRows = document.getElementById("rows").innerHTML;
         numCols = document.getElementById("cols").innerHTML;

         if(document.getElementById("zenMode").checked){
            gameMode = 1;
         }
         else{//timeAttackMode
            gameMode = 2;
            //console.log("Time Attack Mode initiated");
	    timeAttackMode.time = 0;
            timeAttackMode.backColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
            timeAttackMode.floorColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
	    document.getElementById("timer").innerHTML="";
            document.getElementById("best").innerHTML="";
            document.getElementById("timer").style.visibility="visible";
            document.getElementById("best").style.visibility="visible";
            if(timeAttackMode.timer !== null)
              clearInterval(timeAttackMode.timer);//clear timer if it already exisits
         }

   //create maze controller
   mazeCtl = new Maze(numRows, numCols);

   //set event listeners
   document.addEventListener( 'keydown', keyDown);
   document.addEventListener( 'keyup',  keyUp);

   //create camera
   var eye = new Vector3(mazeCtl.entryRow+0.5, 0.5, 1.5);
   var look = new Vector3(mazeCtl.entryRow+0.5, 0.5, 100);
   var up = new Vector3(0,1,0);
   player = new MazePlayer(eye, look, up);
   //perspective projection
   player.cam.setShape(70, canvas.clientWidth/canvas.clientHeight, 0.125, 1000);
   //fun fun... player.cam.setFrustum(-0.5, 0.5, -0.5, 0.5, 1/64, 100);



   //set loop in motion
 if(gameMode === 1){ //zen mode
      if(zenMode.isTextured){
         zenMode.texIndex = getRandom(0, numTex-1, true);
         mazeCtl.setFloorTexture(gl, 'Textures/'+textureStore[zenMode.texIndex].floor);
         mazeCtl.setWallTexture(gl, 'Textures/'+textureStore[zenMode.texIndex].wall);
      }
      else{ //not textured
            zenMode.backColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
            zenMode.floorColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
      } 
      loopCtl = setInterval(gameLoop, 1000/FPS);
   }
   else{ //gameMode === 2 (timeAttack)
      //pre loop stuff
      //TODO timeattack only.... timeAttackCountdown();
   }

   //screen resizer
   window.onresize = function(){

     var canvas = document.getElementById("canvas");
     //var twoDCanvas = document.getElementById("2dCanvas");
     /*NOTE this is only valid in portraitToLandscape.html will not work with Maze.html*/
     var container = document.getElementById("mid");
     containerStyle = window.getComputedStyle(container);
     var conWidth = new Number(containerStyle.width.replace("px", "")); //these come in as strings with px attached
     var conHeight = new Number(containerStyle.height.replace("px", ""));
     var rawWidth = window.innerWidth;
     var rawHeight = window.innerHeight;

      if(window.innerWidth > window.innerHeight){//landscape
         var rawHeight = window.innerHeight;
         var rawWidth = window.innerWidth;
         //var dimensions = 0.8 * rawWidth; 
         canvas.width = conWidth;//0.55*rawWidth;
         canvas.height = conWidth*0.65;//canvas.width*0.5;
         //twoDCanvas.width = conWidth;//0.55*rawWidth;
         //twoDCanvas.height = conWidth*0.65;//twoDCanvas.width*0.5
      }
      else{//portrait TODO changes aspect ratio need to reset camera
         var rawHeight = window.innerHeight;
         var rawWidth = window.innerWidth;
         canvas.width = conWidth;
         canvas.height = 0.45*rawHeight;
         //twoDCanvas.width = conWidth;
         //twoDCanvas.height = 0.45*rawHeight;
      }

      //reset viewport
      gl.viewport(0,0,canvas.clientWidth, canvas.clientHeight);
   };

   //BUG this fixes a weird bug where the button handlers are left unattached...
   window.onresize();

   });//end window.onload
}

/*NOTE These are unneccesarry for zen mode so they are left commented out here
function timeAttackCountdown(){
  console.log("here2");
  slideCtl.fillStyle="#000000"; //set to black
  slideCtl.fillRect(0, 0, slideCtl.canvas.width, slideCtl.canvas.height);
  slideCtl.fillStyle="#FFFFFF";
  slideCtl.count = 3;
  //slideCtl.fillText( "GO!", slideCtl.canvas.width, slideCtl.canvas.height);
  slideCtl.screenTimer = setInterval(countDown, 1000);

  slideCtl.canvas.style.zIndex="1";
  slideCtl.timer = setTimeout(setSlideToBack, 5000);//wait 5 seconds
  //clearInterval(screenTimer);
}

function timeAttackCounter(){
   //slideCtl.clearRect(0, 0, slideCtl.canvas.width, slideCtl.canvas.height);
   //slideCtl.fillStyle="#FFFFFF";
   timeAttackMode.time += 1;
   var mins = Math.floor(timeAttackMode.time/60);
   var seconds = Math.floor(timeAttackMode.time - (mins*60) );
   if(seconds < 10)
      document.getElementById("timer").innerHTML = "Time: "+mins+":0"+seconds;
   else
      document.getElementById("timer").innerHTML = "Time: "+mins+":"+seconds;

   if( timeAttackMode.hasBestTime === false)
      document.getElementById("best").innerHTML = "";
   else{
      var bestMins = Math.floor(timeAttackMode.bestTime/60);
      var bestSeconds = Math.floor(timeAttackMode.bestTime - (bestMins*60) );
      if(bestSeconds < 10)
         document.getElementById("best").innerHTML = "Best: "+bestMins+":0"+bestSeconds;
      else
         document.getElementById("best").innerHTML = "Best: "+bestMins+":"+bestSeconds;
   }
   //slideCtl.fillText( "Time: "+mins+":"+seconds, 0, 0);
}*/

//works for time-attack and zen modes
function gameLoop(){
   //TODO if player cant move use parallel vectors to advance their position regardless, way down the road
   if(player.moveForward && player.canMoveForward(mazeCtl))
      player.cam.slide(0,0,-0.1);//change 1 to movespeed
   if(player.moveBackward && player.canMoveBackward(mazeCtl))
      player.cam.slide(0,0,0.1);
   if(player.turnRight)
      player.cam.FPSyaw(5);
   if(player.turnLeft)
      player.cam.FPSyaw(-5);

   //win condition
   if(mazeCtl.maze[Math.floor(player.cam.eye.x)][Math.floor(player.cam.eye.z)] == mazeCtl.EXIT){
      //consider adding special intro animation to give bird's eye view then zoom to entry
      mazeCtl = new Maze(numRows, numCols);
      var eye = new Vector3(mazeCtl.entryRow+0.5, 0.5, 1.5);
      var look = new Vector3(mazeCtl.entryRow+0.5, 0.5, 100);
      var up = new Vector3(0,1,0); 
      player = new MazePlayer(eye, look, up);
   player.cam.setShape(70, canvas.clientWidth/canvas.clientHeight, 0.125, 1000);
      if( gameMode === 1 ){
         zenMode.randBackground = getRandom(0,numBackgrounds-1, true);
         zenMode.isTextured = getRandom(0, numTex-1, true);
         if(zenMode.isTextured){
            zenMode.texIndex = getRandom(0, numTex-1, true);
            mazeCtl.setFloorTexture(gl, 'Textures/'+textureStore[zenMode.texIndex].floor);
            mazeCtl.setWallTexture(gl, 'Textures/'+textureStore[zenMode.texIndex].wall);
            //console.log("textures: floor: "+textureStore[zenMode.texIndex].floor+" wall: "+textureStore[zenMode.texIndex].wall);
         }
         else{ //not textured
               zenMode.backColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
               zenMode.floorColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
         }
         zenMode.randWalls = getRandom(0,1, true);
         zenMode.fog = getRandom(0,5,true);
      }
      else{ //gameMode === TIME_ATTACK
         timeAttackMode.randBackground = getRandom(0, numBackgrounds-1, true);
         timeAttackMode.randWalls = getRandom(0,1, true);
         timeAttackMode.fog = getRandom(0,5, true);
         timeAttackMode.backColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
         timeAttackMode.floorColor = new Vector3(getRandom(0,1), getRandom(0,1), getRandom(0,1));
         if( timeAttackMode.hasBestTime === false){
            timeAttackMode.bestTime = timeAttackMode.time;
            timeAttackMode.hasBestTime = true;
         }
         else if(timeAttackMode.time < timeAttackMode.bestTime)
            timeAttackMode.bestTime = timeAttackMode.time;
         timeAttackMode.timer = clearInterval(timeAttackMode.timer);
         document.getElementById("timer").innerHTML = "Time : 0:00";
         timeAttackMode.time = 0;
         timeAttackMode.timer = setInterval(timeAttackCounter, 1000);
      }
   }

  //clear screen
  gl.clearColor(0,0,0,1.0);//gl.clearColor(0.0,0.0,0.0,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  if(gameMode === 1)
     mode = zenMode;
  else
     mode = timeAttackMode;

  if(mode.fog < 3){//no fog
    //draw skybox
    gl.useProgram(textureProgram);
    gl.program = textureProgram;
    switch(mode.randBackground){
        case 0: skybox.draw(gl, textureProgram); break;
        case 1: nightbox.draw(gl, textureProgram); break;
        case 2: hopebox.draw(gl, textureProgram); break;
        case 3: stratobox.draw(gl, textureProgram); break;
        case 4: spacebox1.draw(gl, textureProgram); break;
        case 5: stormbox.draw(gl, textureProgram); break;
        default: risebox.draw(gl, textureProgram); break;
        //case 6: joebox.draw(gl, textureProgram);break;
     } 
     //draw maze
     if(zenMode.isTextured){
        gl.useProgram(textureProgram);
        gl.program = textureProgram;
        gl.uniformMatrix4fv(textureProgram.u_Model, gl.FALSE, getIdentity4());
        gl.uniformMatrix4fv(textureProgram.u_View, gl.FALSE, player.cam.View);
        gl.uniformMatrix4fv(textureProgram.u_Projection, gl.FALSE, player.cam.Projection);
        if(zenMode.randWalls === 0)
           mazeCtl.drawTexture(gl, false);
        else
           mazeCtl.drawTexture(gl, true);
     }
     else{ //no texture
        gl.useProgram(noTextureProgram);
        gl.program = noTextureProgram;
        gl.uniformMatrix4fv(noTextureProgram.u_Model, gl.FALSE, getIdentity4());//uses KFH-Utilities.js function getIdentity4()
        gl.uniformMatrix4fv(noTextureProgram.u_View, gl.FALSE, player.cam.View);
        gl.uniformMatrix4fv(noTextureProgram.u_Projection, gl.FALSE, player.cam.Projection);
        if(zenMode.randWalls === 0)
           mazeCtl.drawTriangles(gl, mode.floorColor, false);
        else
           mazeCtl.drawTriangles(gl, mode.floorColor, true, mode.backColor);
     }
  }
  else{//yes fog
      if(zenMode.isTextured){
         gl.useProgram(fogTexProgram);
         gl.program = fogTexProgram;
         if(textureStore[zenMode.texIndex].wall === "Simple_Lava_Texture_Seamless_Magma.jpg"){//set to volcanic glow fog
            gl.clearColor(0.3, 0.01, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform3f(fogTexProgram.u_FogColor, 0.3, 0.01, 0 );
         }
         else //just use regular black fog
            gl.uniform3f(fogTexProgram.u_FogColor, 0, 0, 0);
         //console.log("fog and texture");
         gl.uniformMatrix4fv(fogTexProgram.u_Model, gl.FALSE, getIdentity4());
         gl.uniformMatrix4fv(fogTexProgram.u_View, gl.FALSE, player.cam.View);
         gl.uniformMatrix4fv(fogTexProgram.u_Projection, gl.FALSE, player.cam.Projection);
         //gl.uniform3f(fogTexProgram.u_Eye, player.cam.eye.x, player.cam.eye.y, player.cam.eye.z);
         mazeCtl.drawTexture(gl, true);
      }
      else{ //no background, just fog and maze
        gl.useProgram(fogProgram);
        gl.program = fogProgram;
        gl.uniformMatrix4fv(fogProgram.u_Model, gl.FALSE, getIdentity4());//uses KFH-Utilities.js function getIdentity4()
        gl.uniformMatrix4fv(fogProgram.u_View, gl.FALSE, player.cam.View);
        gl.uniformMatrix4fv(fogProgram.u_Projection, gl.FALSE, player.cam.Projection);
        gl.uniform3f(fogProgram.u_Eye, player.cam.eye.x, player.cam.eye.y, player.cam.eye.z);
        mazeCtl.drawTriangles(gl, mode.floorColor, true, mode.backColor);
      }
   }
}

function keyDown(event){
    event = event || window.event;

    if (event.keyCode == 38 || event.keyCode == 87) {
        // up arrow
        player.moveForward = true;
    }
    else if (event.keyCode == 40 || event.keyCode == 83) {
        // down arrow
        player.moveBackward = true;
    }
    else if (event.keyCode == 37 || event.keyCode == 65){
        //leftArrow
        player.turnLeft = true;
    }
    else if(event.keyCode == 39 || event.keyCode == 68){
        //rightArrow
        player.turnRight = true;
    }
}

function keyUp(event){
   event = event || window.event;
    if (event.keyCode == 38 || event.keyCode == 87) {
        // up arrow
        player.moveForward = false;
    }
    else if (event.keyCode == 40 || event.keyCode == 83) {
        // down arrow
        player.moveBackward = false;
    }
    else if (event.keyCode == 37 || event.keyCode == 65){
        //leftArrow
        player.turnLeft = false;
    }
    else if(event.keyCode == 39 || event.keyCode == 68){
        //rightArrow
        player.turnRight = false;
    }
}  
