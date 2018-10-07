//SkyBox.js
//uses tex2d not texCube
function SkyBox(gl, scale){
   
   var FSIZE = Float32Array.BYTES_PER_ELEMENT;
   this.images = new Array(6);
   this.textures = [];
   //0 - posX
   //1 - negX
   //2 - posY
   //3 - negY
   //4 - posZ
   //5 - negZ
   for(var i=0; i < 6; i++)
      this.textures[i] = gl.createTexture();

   var s = 500; //scale
   this.vertexBuffers = new Array(6); 
   //NOTE coords flipped upside down to avoid gl.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
   //posX
   this.vertexBuffers[0] = new Float32Array([
      s,  s,  s, 1.0, 0.0,
      s,  s, -s, 0.0, 0.0,
      s, -s,  s, 1.0, 1.0,
      s, -s, -s, 0.0, 1.0]);
   //negX problem...
   this.vertexBuffers[1] = new Float32Array([  
      -s,  s,  s, 0.0, 0.0,
      -s,  s, -s, 1.0, 0.0,
      -s, -s,  s, 0.0, 1.0,
      -s, -s, -s, 1.0, 1.0]);
   //posY
   this.vertexBuffers[2] = new Float32Array([
     -s, s,  s, 0.0, 0.0,
      s, s,  s, 1.0, 0.0,
     -s, s, -s, 0.0, 1.0,
      s, s, -s, 1.0, 1.0]);
   //negY
   this.vertexBuffers[3] = new Float32Array([
     -s, -s,  s, 0.0, 1.0,
      s, -s,  s, 1.0, 1.0,
     -s, -s, -s, 0.0, 0.0,
      s, -s, -s, 1.0, 0.0]);
   //posZ
   this.vertexBuffers[4] = new Float32Array([
     -s,  s, s, 1.0, 0.0,
      s,  s, s, 0.0, 0.0,
     -s, -s, s, 1.0, 1.0,
      s, -s, s, 0.0, 1.0]);
   //negZ
   this.vertexBuffers[5] = new Float32Array([
     -s,  s, -s, 0.0, 0.0,
      s,  s, -s, 1.0, 0.0,
     -s, -s, -s, 0.0, 1.0,
      s, -s, -s, 1.0, 1.0]); 

   this.setTexture = function(gl, face, imgPath){
      //TODO add pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //flips the image's y axis so it makes sense when lining up the s, t coords
      var img = new Image();
      img.crossOrigin = "anonymous"; /*gives us permission to load from our own server*/
      var index = this.getTextureIndex(face);
      var textures = this.textures;
      //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //can be used but... slows down
      img.onload = function(){
         gl.bindTexture(gl.TEXTURE_2D, textures[index]);
         //send image data
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
         //params
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         //unbind
         gl.bindTexture(gl.TEXTURE_2D, null);
      }
      img.src = imgPath;
   }
         
   this.getTextureIndex = function(face){
      switch(face){
         case 'posX': return 0;
         case 'negX': return 1;
         case 'posY': return 2;
         case 'negY': return 3;
         case 'posZ': return 4;
         case 'negZ': return 5;
         default: console.log("Invalid face name in getTextureIndex()");
                  return -1;
      }
   }

   this.draw = function(gl, program){

      for(var i=0; i < 6; i++){
         gl.uniformMatrix4fv(program.u_Model, gl.FALSE, getIdentity4());//uses KFH-Utilities.js function getIdentity4()
         gl.uniformMatrix4fv(program.u_View, gl.FALSE, player.cam.View);
         gl.uniformMatrix4fv(program.u_Projection, gl.FALSE, player.cam.Projection);

         gl.activeTexture(gl.TEXTURE0);
         //console.log(this.textures[i]);
         gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
         gl.uniform1i(program.u_Sampler, 0);
         
         if(this.vbo == undefined || this.vbo == null)
            this.vbo = gl.createBuffer();
         gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
         gl.bufferData(gl.ARRAY_BUFFER, this.vertexBuffers[i], gl.STATIC_DRAW);



         //var a_Position = gl.getAttribLocation(program, 'a_Position');
         gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
         gl.enableVertexAttribArray(program.a_Position);
         //var a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
         gl.vertexAttribPointer(program.a_TexCoord, 2, gl.FLOAT, gl.FALSE, FSIZE*5, FSIZE*3);
         gl.enableVertexAttribArray(program.a_TexCoord);

         gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
  }
       
}       
