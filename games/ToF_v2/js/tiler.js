// tiler.js

// Tile Library
// This stores the tile indices for the sprite sheet
// Allows independance from sprite sheet ordering, as we now only have to edit the library
// instead of the tileMapTranslate function
var tileLibrary = {
	wall: {
		front: 0,
		flat: 1,
	},
	room: 2,
	corridor: 3,
	blank: 4
};


// This assigns the Dungeon Map to the tileMap
// Indices are picked as per spriteSheet
// The first sprite on the sheet will be 0, the second 1, third - 2 and so on
// The map[i][j] has only 3 values
// 0 = non-walkable
// 1 = walkable Room
// 2 = walkable Corridor 
// These are then translated into various sprites indices based on location and neighbours
// using the tileLibrary
var tileMapTranslate = function (map) {
	var spriteMap=[];
	var i,j,tile;
	var N,S,E,W,NE,NW,SE,SW;
	var map_size = map.length;

	//Blank the spriteMap
	for (i=0; i<map_size; i++) {
		spriteMap[i]=[];
		for(j=0; j<map_size; j++) {
			spriteMap[i][j] = tileLibrary.blank;
		}
	}

	// Go through every map coordinate - First Pass
	// The dungeon only has relevant data between (1,1) & (mapSize-2, mapSize-2)
	// check dungeon.js
	// First Pass
	for (i=1; i<map_size-1; i++) {
		for(j=1; j<map_size-1; j++) {
			tile = map[i][j];
			//Some helper vars
			N = map[i][j-1];
			S = map[i][j+1];
			E = map[i+1][j];
			W = map[i-1][j];
			NE = map[i+1][j-1];
			NW = map[i-1][j-1];
			SE = map[i+1][j+1];
			SW = map[i-1][j+1];

			// Wall tile
			if(tile==0) {	
				if(S!=0 || N!=0){
					// top wall
					// bottom wall
					spriteMap[i][j] = tileLibrary.wall.front;
				} else if(E!=0 || W!=0 || SE!=0 || SW!=0){
					// left wall
					// right right wall
					// top-left corner
					// top-right corner
					spriteMap[i][j] = tileLibrary.wall.flat;
				} else if(NE!=0 || NW!=0){
					// bottom-left corner
					// bottom-right corner
					spriteMap[i][j] = tileLibrary.wall.front;
				}

			} else {
				// Room Tiles
				if(tile==1) {
					spriteMap[i][j] = tileLibrary.room;
				}

				// Corridor Tiles
				if(tile==2) {
					spriteMap[i][j] = tileLibrary.corridor;
				}
			}
		}	
	}

	// Second Pass
	for (i=1; i<map_size-1; i++) {
		for(j=1; j<map_size-1; j++) {
			tile = spriteMap[i][j];
			//Some helper vars
			N = spriteMap[i][j-1];
			S = spriteMap[i][j+1];
			E = spriteMap[i+1][j];
			W = spriteMap[i-1][j];
			NE = spriteMap[i+1][j-1];
			NW = spriteMap[i-1][j-1];
			SE = spriteMap[i+1][j+1];
			SW = spriteMap[i-1][j+1];

			// Join the walls
			if(tile==tileLibrary.wall.front && S==tileLibrary.wall.flat ){
				spriteMap[i][j]=tileLibrary.wall.flat;
			} else if(tile==tileLibrary.wall.front && S==tileLibrary.wall.front){
				spriteMap[i][j]=tileLibrary.wall.flat;
			}
		}
	}
	
	// return the filled up spriteMap
	return spriteMap;
}

