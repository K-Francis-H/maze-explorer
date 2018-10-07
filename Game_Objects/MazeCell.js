//MazeCell.js

function MazeCell(i, j, value, maze){
   this.i = i;
   this.j = j;
   this.value = value;

   //Constants for determining neighbor type
   this.TOP = 0;
   this.BOTTOM = 1;
   this.LEFT = 2;
   this.RIGHT = 3;
   //this.maze = maze;
   //curious if this works
   //should NOTE that maze not handed down to neighbors so they wont recursively reconstruct the array
      this.neighbors = [];
      if( i-2 > 0){//top
         if(wallsIntact(i-2, j, maze)){
            var top = new Object();
            top.i = i-2;
            top.j = j;
            top.value = maze[i-2][j];
            top.type = this.TOP;
            this.neighbors.push(top);
         }
      }
      if( i+2 < maze.length){//bottom
         if(wallsIntact(i+2, j, maze)){
            var bottom = new Object();
            bottom.i = i+2;
            bottom.j = j;
            bottom.value = maze[i+2][j];
            bottom.type = this.BOTTOM;
            this.neighbors.push(bottom);
          }
      }
      if( j-2 > 0){//left
         if(wallsIntact(i, j-2, maze)){
            var left = new Object();
            left.i = i;
            left.j = j-2;
            left.value = maze[i][j-2];
            left.type = this.LEFT;
            this.neighbors.push(left);
         }
      }
      if( j+2 < maze[0].length){//right
         if(wallsIntact(i, j+2, maze)){
            var right = new Object();
            right.i = i;
            right.j = j+2;
            right.value = maze[i][j+2];
            right.type = this.RIGHT;
            this.neighbors.push(right);
         }
      }

}

function wallsIntact(i, j, maze){
   var WALL = -1;
      if(maze[i+1][j] != WALL)
         return false;
      if(maze[i-1][j] != WALL)
         return false;
      if(maze[i][j+1] != WALL)
         return false;
      if(maze[i][j-1] != WALL)
         return false;
      //if it passes the trials
      return true;
}
