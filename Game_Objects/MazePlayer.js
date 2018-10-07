//MazePlayer.js

function MazePlayer(pos, look, up){

   this.cam = new Camera(pos, look, up);
   //movement booleans
   this.turnRight = false;
   this.turnLeft = false;
   this.moveForward = false;
   this.moveBackward = false;
   
   this.canMoveForward = function(mazeCtl){
      var futurePos = this.getFuturePosition(0, 0, -0.1);
      if(mazeCtl.maze[Math.floor(futurePos.x)][Math.floor(futurePos.z)] == mazeCtl.WALL)
         return false;
      else
         return true;
   }

   this.canMoveBackward = function(mazeCtl){
      var futurePos = this.getFuturePosition(0, 0, 0.1);
      if(mazeCtl.maze[Math.floor(futurePos.x)][Math.floor(futurePos.z)] == mazeCtl.WALL)
         return false;
      else
         return true;
   }

   this.getFuturePosition = function(delU, delV, delN){

    var x = this.cam.eye.x + (delU * this.cam.u.x) + (delV * this.cam.v.x) + (delN * this.cam.n.x);
    var y = this.cam.eye.y + (delU * this.cam.u.y) + (delV * this.cam.v.y) + (delN * this.cam.n.y);
    var z = this.cam.eye.z + (delU * this.cam.u.z) + (delV * this.cam.v.z) + (delN * this.cam.n.z);

    return new Vector3(x, y, z);
   }
}

