//Maze.js
//TODO
//add texture support and choosable colors
//setTexture(), setColor(), drawTextured(), drawMixed()
//also allow them to be rendered together!
function Maze(rows, cols){
   //CONSTANTS
   this.WIREFRAME = 1;
   this.TRIANGLE = 0;
   this.TEXTURE = 3;


   this.numRows = rows; //conditional assignment needs to be odd

   this.numCols = cols; //conditional assignment needs to be odd
   //for now just set entryRow, exitRow randomly regardless of input

   this.entryRow = getOddRandom(1, this.numRows*2);
   this.exitRow  = getOddRandom(1, this.numRows*2);
      //console.log("entry "+this.entryRow+" exit "+this.exitRow);

   //texture stuff
   this.useTexture = false;
   this.wallTex;
   this.floorTex;
   //rendering vars
   this.floorVertices = null;
   this.wallVertices = null;
   //constant for walls in 2d array
   this.WALL = -1;
   this.SPACE = -2;
   this.ENTRY = -3;
   this.EXIT = -4;

   //check method for DFS algorithm
   //function allWallsIntact(){
   this.wallsIntact =  function(i, j){
      if(this.maze[i+1][j] != this.WALL)
         return false;
      if(this.maze[i-1][j] != this.WALL)
         return false;
      if(this.maze[i][j+1] != this.WALL)
         return false;
      if(this.maze[i][j-1] != this.WALL)
         return false;
      //if it passes the trials
      return true;
   }
   
   this.maze = new Array((this.numRows*2)+1); //because of walls and need for oddness
   for(var i=0; i < this.maze.length; i++){
      this.maze[i] = new Array((this.numCols*2)+1);
   }

   //now fill in maze
   var cellIndex = 0;//will end at this.numRows * this.numCols

   
   for(var i=0; i < this.maze.length; i++){
      for(var j=0; j < this.maze[i].length; j++){
         if( i % 2 == 0)//if even row
            this.maze[i][j] = this.WALL; //set to wall
         else if( j % 2 == 1) //if odd col index & odd row
            this.maze[i][j] = cellIndex++;
         else //even col odd row
            this.maze[i][j] = this.WALL;
         //console.log("A"+i+" "+j+" = "+ this.maze[i][j]);
       }
    }

   //DFS algorithm to gen maze
   var cellStack = [];
   var totalCells = this.numRows*this.numCols;
   var i = getOddRandom(0, this.numRows*2);
   var j = getOddRandom(0, this.numCols*2);
      //console.log("currentCell i:"+i+" j:"+j);//" value:"+currentCell.value);
   var currentCell = new MazeCell(i, j, this.maze[i][j], this.maze);
   //console.log("currentCell i:"+i+" j:"+j+" value:"+currentCell.value);
   //console.log("top n: "+currentCell.neighbors[0]);
   //console.log("bottom n: "+currentCell.neighbors[1]);
   //console.log("left n: "+currentCell.neighbors[2]);
   //console.log("right n: "+currentCell.neighbors[3]);
   var neighbors = [];
   var visitedCells = 1;

   while(visitedCells < totalCells){
      //check current cell and find neighbors with all walls intact
      //console.log("num Neighbors = "+currentCell.neighbors.length);
      if(currentCell.neighbors.length >= 1){
         var choice = getRandom(0, currentCell.neighbors.length-1, true);
         //console.log(choice)
         var chosenNeighbor = currentCell.neighbors[choice];
         //console.log("chosenNeighbor: "+chosenNeighbor.value);
         switch(chosenNeighbor.type){
            case currentCell.TOP:
               this.maze[currentCell.i-1][currentCell.j] = this.SPACE;
               break;
            case currentCell.BOTTOM:
               this.maze[currentCell.i+1][currentCell.j] = this.SPACE;
               break;
            case currentCell.LEFT:
               this.maze[currentCell.i][currentCell.j-1] = this.SPACE;
               break;
            default: //currentCell.RIGHT
               this.maze[currentCell.i][currentCell.j+1] = this.SPACE;
               break;
         }
         //push currentCell to stack
         cellStack.push(currentCell);
         //set currentCell to chosenNeighbor
         currentCell = new MazeCell(chosenNeighbor.i, chosenNeighbor.j, chosenNeighbor.value, this.maze);
         visitedCells++;
         //console.log("visitedCells: "+visitedCells);
      }
      else{//pop stack
         //old data in the stack update cell from i and j
         var oldCell = cellStack.pop();
         currentCell = new MazeCell(oldCell.i, oldCell.j, oldCell.value, this.maze);
      }
   }
   //Now add entry and exit
   //this.maze[this.entryRow][0] = this.ENTRY;
   this.maze[this.exitRow][this.maze[0].length-1] = this.EXIT;

   //DEBUG PRINT    
   /*for(var i=0; i < this.maze.length; i++){
      for(var j=0; j < this.maze[i].length; j++){
         console.log("A"+i+" "+j+" = "+ this.maze[i][j]);
       }
    }*/


    //when rendering
    //render floor where this.maze[i][j] != 0;

    //NO WALLS RENDERING
    this.drawWireFrame = function(gl, isWalled){
       if(this.floorVertices == null || this.wallVertices == null){
          this.floorVertices = new Float32Array(0);
          this.wallVertices = new Float32Array(0);
          for(var i=0; i < this.maze.length; i++){
             for(var j=0; j < this.maze[0].length; j++){
                if( this.maze[i][j] != this.WALL){
                 /* var verts = new Float32Array([//12 because there are 4 sets of vetices each with three components
                     i, 0, j,    i+1, 0, j,
                     i+1, 0, j+1, i, 0, j+1,
                     //just for lines here
                     i+1, 0, j+1, i+1, 0, j,
                     i,   0, j,    i, 0, j+1]); */
                                    var verts = new Float32Array([//12 because there are 4 sets of vetices each with three components
                     i, 0, j,   i, 0, j+1,   i+1, 0, j,
                     i, 0, j+1, i+1, 0, j,   i+1, 0, j+1]); 
                  this.floorVertices = Float32Concat(this.floorVertices, verts);
                }
                else if(isWalled == true){//DISORIENTING MAYBE MAKE FOR SUPER DIFFICULTY
                  var cube = new Cube(i+0.5, 0.5, j+0.5, this.WIREFRAME);
                  this.wallVertices = Float32Concat(this.wallVertices, cube.vertices);
                }//end else
            }//end for
          }//end for
       }//end if
      

      //draw walls
      gl.uniform4f(u_Color, 0.5, 0.5, 0.5, 1);//red
      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.wallVertices, gl.STATIC_DRAW);
      var a_Position =  gl.getAttribLocation(gl.program, 'a_Position'); 
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, gl.FALSE, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      gl.drawArrays(gl.LINES, 0, this.wallVertices.length/3); //dont forget its length not just vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      //draw floor
      var u_Color = gl.getUniformLocation(gl.program, 'u_Color');
      gl.uniform4f(u_Color,  0.5, 0.5, 0.5, 1);//red
      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.floorVertices, gl.STATIC_DRAW);
      var a_Position =  gl.getAttribLocation(gl.program, 'a_Position'); 
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, gl.FALSE, 0, 0);
      gl.enableVertexAttribArray(a_Position);
      gl.drawArrays(gl.TRIANGLES, 0, this.floorVertices.length/3); //dont forget its length not just vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, null); 

   }//end function

   //TODO need to adjust colors exactly, allow passing of wall and floor colors
   this.drawTriangles = function(gl, floorColor, isWalled, wallColor){
       if(this.floorVertices == null || this.wallVertices == null){
          this.floorVertices = new Float32Array(0);
          this.wallVertices = new Float32Array(0);
          for(var i=0; i < this.maze.length; i++){
             for(var j=0; j < this.maze[0].length; j++){
                if( this.maze[i][j] != this.WALL && this.maze[i][j] != this.EXIT){
                  var verts = new Float32Array([//12 because there are 4 sets of vetices each with three components
                     i, 0, j,   i, 0, j+1,   i+1, 0, j,
                     i, 0, j+1, i+1, 0, j,   i+1, 0, j+1]); 
                  this.floorVertices = Float32Concat(this.floorVertices, verts);
                }
                else if(isWalled == true && this.maze[i][j] != this.EXIT){//DISORIENTING MAYBE MAKE FOR SUPER DIFFICULTY
                  var cube = new Cube(i+0.5, 0.5, j+0.5, this.TRIANGLE);
                  this.wallVertices = Float32Concat(this.wallVertices, cube.vertices);
                }//end else
            }//end for
          }//end for
       }//end if

      //TODO Need to have texture coords buffer and vertex attribute
      /* if(this.useTexture){
         gl.activeTexture(gl.TEXTURE0);
         //console.log(this.textures[i]);
         gl.bindTexture(gl.TEXTURE_2D, this.wallTex);
         gl.uniform1i(gl.program.u_Sampler, 0);
       }*/

       var i = this.exitRow;
       var j = this.maze[0].length-1;
       var exit = new Float32Array([i, 0, j,   i, 0, j+1, i+1, 0, j,
                                    i, 0, j+1, i+1, 0, j, i+1, 0, j+1]);
       //draw exit
       var u_Color = gl.getUniformLocation(gl.program, 'u_Color'); 
       gl.uniform4f(u_Color, 1,1,1,1); //exit is white
       var vbo = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
       gl.bufferData(gl.ARRAY_BUFFER, exit, gl.STATIC_DRAW);
       var a_Position =  gl.getAttribLocation(gl.program, 'a_Position');
       gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, gl.FALSE, 0, 0);
       gl.enableVertexAttribArray(a_Position);
       gl.drawArrays(gl.TRIANGLES, 0, exit.length/3);
       gl.bindBuffer(gl.ARRAY_BUFFER, null);
      //draw floor

      gl.uniform4f(u_Color,  floorColor.x, floorColor.y, floorColor.z, 1.0);//1.0);//0.246, 0.512, 0.629, 1.0);//red
      var vbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, this.floorVertices, gl.STATIC_DRAW);
 
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, gl.FALSE, 0, 0);
      //gl.enableVertexAttribArray(a_Position);
      gl.drawArrays(gl.TRIANGLES, 0, this.floorVertices.length/3); //dont forget its length not just vertices
      gl.bindBuffer(gl.ARRAY_BUFFER, null); 

      //draw walls
      if(isWalled){
         gl.uniform4f(u_Color, wallColor.x, wallColor.y, wallColor.z, 1.0);//1.0);//0, 1, 0, 1);//green
         var vbo = gl.createBuffer();
         gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
         gl.bufferData(gl.ARRAY_BUFFER, this.wallVertices, gl.STATIC_DRAW);
         //var a_Position =  gl.getAttribLocation(gl.program, 'a_Position'); 
         gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, gl.FALSE, 0, 0);
         //gl.enableVertexAttribArray(a_Position);
         gl.drawArrays(gl.TRIANGLES, 0, this.wallVertices.length/3); //dont forget its length not just vertices
         gl.bindBuffer(gl.ARRAY_BUFFER, null);
      }
   }//end function

   this.setWallTexture = function(gl, imgPath){
      this.useTexture = true;
      this.wallTex = gl.createTexture();
      var wallTex = this.wallTex;//so wallTex stays in scope
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function(){
         gl.activeTexture(gl.TEXTURE2);
         gl.bindTexture(gl.TEXTURE_2D, wallTex);
         //send image data
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
         //params
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
         //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
         //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         //unbind
         gl.bindTexture(gl.TEXTURE_2D, null);
      }
      img.src = imgPath;
   }
   this.setFloorTexture = function(gl, imgPath){
      this.useTexture = true;
      this.floorTex = gl.createTexture();
      var floorTex = this.floorTex;//so floorTex stays in scope
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function(){
         //alert(floorTex);
         //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
         gl.activeTexture(gl.TEXTURE1);
         gl.bindTexture(gl.TEXTURE_2D, floorTex);
         //send image data
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
         //params
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); 
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
         //unbind
         gl.bindTexture(gl.TEXTURE_2D, null);
         //alert("image loaded");
      }
      img.src = imgPath;
   }

   this.drawTexture = function(gl, isWalled){
       if(this.floorVertices == null || this.wallVertices == null){// || this.floorTexCoords == null){
          this.floorVertices = new Array();
          this.wallVertices = new Array();//new Float32Array(0);
          //this.floorTexCoords = new Float32Array(0);
          for(var i=0; i < this.maze.length; i++){
             for(var j=0; j < this.maze[0].length; j++){
                if( this.maze[i][j] != this.WALL && this.maze[i][j] != this.EXIT){
                  var verts = new Float32Array([//12 because there are 4 sets of vetices each with three components
                     i,   0, j,    0.0, 0.0,  
                     i,   0, j+1,  0.0, 1.0,  
                     i+1, 0, j,    1.0, 0.0,
                     i+1, 0, j+1,  1.0, 1.0]); 
                  //var ftex = new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0]);
                  this.floorVertices.push(verts);// = Float32Concat(this.floorVertices, verts);
                  //this.floorTexCoords = Float32Concat(this.floorVertices, ftex);
                }
                else if(isWalled == true && this.maze[i][j] != this.EXIT){//DISORIENTING MAYBE MAKE FOR SUPER DIFFICULTY
                  //var cube = new Cube(i+0.5, 0.5, j+0.5, this.TEXTURE);
                  this.wallVertices.push(new Cube(i+0.5, 0.5, j+0.5, this.TEXTURE));// = Float32Concat(this.wallVertices, cube.vertices);
                }//end else
            }//end for
          }//end for
          //console.log(this.floorVertices);
       }//end if


       var i = this.exitRow;
       var j = this.maze[0].length-1;
       var exit = new Float32Array([i, 0, j,   i, 0, j+1, i+1, 0, j,
                                    i, 0, j+1, i+1, 0, j, i+1, 0, j+1]);
       //draw exit
       gl.useProgram(noTextureProgram);
       gl.uniformMatrix4fv(noTextureProgram.u_Model, gl.FALSE, getIdentity4());
       gl.uniformMatrix4fv(noTextureProgram.u_View, gl.FALSE, player.cam.View);
       gl.uniformMatrix4fv(noTextureProgram.u_Projection, gl.FALSE, player.cam.Projection);
       //gl.program = noTextureProgram;
       
       //var u_Color = gl.getUniformLocation(noTextureProgram, 'u_Color'); //TODO sketchy!!!!! need to keep shaders in an object
       gl.uniform4f(noTextureProgram.u_Color, 1,1,1,1); //exit is white
         if(this.vbo == undefined || this.vbo == null)
            this.vbo = gl.createBuffer();
       //var vbo = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo);
       gl.bufferData(gl.ARRAY_BUFFER, exit, gl.STATIC_DRAW);
       var a_Position =  gl.getAttribLocation(gl.program, 'a_Position');
       gl.vertexAttribPointer(noTextureProgram.a_Position, 3, gl.FLOAT, gl.FALSE, 0, 0);
       gl.enableVertexAttribArray(noTextureProgram.a_Position);
       gl.drawArrays(gl.TRIANGLES, 0, exit.length/3);
       gl.bindBuffer(gl.ARRAY_BUFFER, null);

       //switch back to texture //TODO must know if there is fog or not...

       //solution chnage useProgram above then switch back to gl.program before calling function gl.program needs to be the correct one
       //gl.useProgram(textureProgram); //TODO sketchy...
       //gl.program = textureProgram;
       gl.useProgram(gl.program);
//set uniforms
         gl.uniformMatrix4fv(gl.program.u_Model, gl.FALSE, getIdentity4());//uses KFH-Utilities.js function getIdentity4()
         gl.uniformMatrix4fv(gl.program.u_View, gl.FALSE, player.cam.View);
         gl.uniformMatrix4fv(gl.program.u_Projection, gl.FALSE, player.cam.Projection);
         gl.uniform3f(gl.program.u_Eye, player.cam.eye.x, player.cam.eye.y, player.cam.eye.z); 
       //draw floor
         gl.activeTexture(gl.TEXTURE1);
         //console.log(this.textures[i]);
         gl.bindTexture(gl.TEXTURE_2D, this.floorTex);
         gl.uniform1i(gl.program.u_Sampler, 1);

         for(var i=0; i < this.floorVertices.length; i++){
         if(this.vbo == undefined || this.vbo == null)
            this.vbo = gl.createBuffer();
         gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
         gl.bufferData(gl.ARRAY_BUFFER, this.floorVertices[i], gl.STATIC_DRAW);

         var FSIZE = this.floorVertices[i].BYTES_PER_ELEMENT;

         //var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
         gl.vertexAttribPointer(gl.program.a_Position, 3, gl.FLOAT, false, FSIZE*5, 0);
         gl.enableVertexAttribArray(gl.program.a_Position);

         //var texBuf = gl.createBuffer();
         //gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
         //gl.bufferData(gl.ARRAY_BUFFER, this.floorTexCoords, gl.STATIC_DRAW);
         //var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
         gl.vertexAttribPointer(gl.program.a_TexCoord, 2, gl.FLOAT, gl.FALSE, FSIZE*5, FSIZE*3);
         gl.enableVertexAttribArray(gl.program.a_TexCoord);
//alert(this.floorVertices[i].length/3
         gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.floorVertices[i].length/5);
         gl.bindBuffer(gl.ARRAY_BUFFER, null);
         }//end for draw loop

         //alert("obj: "+this.wallVertices[0]+" "+this.wallVertices[0].faces[0]);
         
        //draw walls
        if(isWalled){
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, this.wallTex);
            gl.uniform1i(gl.program.u_Sampler, 2);
            for(var i=0; i < this.wallVertices.length; i++){
               for(var j=0; j < 4/*this.wallVertices[0].faces.length*/; j++){
                  gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
                  gl.bufferData(gl.ARRAY_BUFFER, this.wallVertices[i].faces[j], gl.STATIC_DRAW);
                  
                  var FSIZE = this.wallVertices[i].faces[j].BYTES_PER_ELEMENT;

                  gl.vertexAttribPointer(gl.program.a_Position, 3, gl.FLOAT, false, FSIZE*5, 0);
                  gl.enableVertexAttribArray(gl.program.a_Position);

                  gl.vertexAttribPointer(gl.program.a_TexCoord, 2, gl.FLOAT, gl.FALSE, FSIZE*5, FSIZE*3);
                  gl.enableVertexAttribArray(gl.program.a_TexCoord);
 
                  gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.wallVertices[i].faces[j].length/5);
              }//end for j
           }//end for i
        }//end draw walls
}//end darw texture

       
}
