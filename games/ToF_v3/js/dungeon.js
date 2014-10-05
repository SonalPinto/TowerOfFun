//~~~~~~~~~~~~~~~~~~~~
//  Dungeon Mapper
//~~~~~~~~~~~~~~~~~~~~

// Random Plus!
function randPlus (low, high) {
    return Math.floor((Math.random() * (high - low)) + low);
}

// Main Dungeon object
var Dungeon = function() {};
Dungeon.prototype= {
    map: null,
    map_size: null,
    rooms: [],
    stats: null,
    tree: [],
    stack: [],
    gid: 1,
    minRoomSize: 5,
    minSizeFactor: 0.3,

    clear: function() {
        this.map_size = null;
        this.map      = [];
        this.rooms    = [];
        this.corridors =[];
        this.stats    = {};
        this.drooms   = [];
        this.tree    = {};
        this.stack = [];
        this.gid=1;
    },

    generate: function (size) {
        this.clear();
        this.map_size = size;

        // init the map array to null
        for (var x = 0; x < this.map_size; x++) {
            this.map[x] = [];
            for (var y = 0; y < this.map_size; y++) {
                this.map[x][y] = 0;
            }
        }

        // First generate a BSP tree of the dungeon (Kinda looks like fractals)
        // Algo - http://doryen.eptalys.net/articles/bsp-dungeon-generation/
        var X=2;
        var Y=2;
        var W=this.map_size-3;
        var H=this.map_size-3;

        // Root Node
        var rootBox={};
        rootBox.x = X;
        rootBox.y = Y;
        rootBox.w = W;
        rootBox.h = H;

        this.tree[this.gid]=rootBox;
        this.gid++;

        // Build Tree
        this.buildTree(1);

        // Next, build rooms in the leaf nodes of the tree
        for (var nodeID in this.tree){
            var node = this.tree[nodeID];
            if(node.hasOwnProperty("L")){continue;}

            var room = {};
            room.w = randPlus(this.minRoomSize, node.w);
            room.h = randPlus(this.minRoomSize, node.h);
            room.x = node.x + Math.floor((node.w-room.w)/2);
            room.y = node.y + Math.floor((node.h-room.h)/2);

            room.center={};
            room.center.x = Math.floor(room.x + room.w/2);
            room.center.y = Math.floor(room.y + room.h/2);

            room.id=nodeID;
            this.rooms.push(room);
            this.tree[nodeID].hasRoom = nodeID;
        }

        // Assign the rooms to the Map
        for (var i=0; i<this.rooms.length; i++) {
            var r = this.rooms[i];
            console.log("Room: ",[r.x,r.y,r.w,r.h]);
            for (var x = r.x; x<(r.x + r.w) ; x++) {
                for (var y = r.y; y<(r.y + r.h); y++) {
                    this.map[x][y] = 1;
                }
            }
        }

        // Build Corridors
        this.joinRooms();

        // Collect the stats
        this.stats.algo = 'bsp';
        this.stats.rooms = this.rooms.length;
        this.stats.minRoomSize = this.minRoomSize;
        this.stats.splitFactor = this.minSizeFactor;
    },


    // Recursively build the tree
    buildTree: function (root) {
        var X = this.tree[root].x;
        var Y = this.tree[root].y;
        var W = this.tree[root].w;
        var H = this.tree[root].h;
        this.tree[root].center={};
        this.tree[root].center.x = Math.floor(X + W/2);
        this.tree[root].center.y = Math.floor(Y + H/2);

        var ok=0;
        // Select a split - Horizontal((0) or Vertical(1)
        // This allows you to have a valid splitType oppurtunity
        var splitType=1;
        if(this.minSizeFactor*W < this.minRoomSize){
            // no space for splitting vertically, try Horizontal
            splitType = 0;
        } else if (this.minSizeFactor*H < this.minRoomSize){
            // no space for splitting vertically, try Vertical
            splitType = 1;
        } else {
            // random - Both H and V are valid splits
            if(Math.random()>0.5){splitType=0;}
        }

        // generate 2 boxes (child nodes)
        // Ensure minimum size - else quit producing new boxes
        if(splitType) {
            roomSize = this.minSizeFactor*W;
            if(roomSize >= this.minRoomSize){
                var w1 = randPlus(roomSize, (W-roomSize));
                var w2 = W - w1;

                var box1={};
                box1.x = X;
                box1.y = Y;
                box1.w = w1;
                box1.h = H;
                box1.alignment = 'V';

                var box2={};
                box2.x = X+w1;
                box2.y = Y;
                box2.w = w2;
                box2.h = H;
                box2.alignment = 'V';

                ok++;
            }

        } else {
            roomSize = this.minSizeFactor*H;
            if(roomSize >= this.minRoomSize){
                var h1 = randPlus(roomSize, (H-roomSize));
                var h2 = H - h1;

                var box1={};
                box1.x = X;
                box1.y = Y;
                box1.w = W;
                box1.h = h1;
                box1.alignment = 'H';

                var box2={};
                box2.x = X;
                box2.y = Y+h1;
                box2.w = W;
                box2.h = h2;
                box2.alignment = 'H';

                ok++;
            }
        }

        if(ok){
            this.tree[this.gid]=box1;
            this.tree[root].L = this.gid;
            this.gid++;

            this.tree[this.gid]=box2;
            this.tree[root].R = this.gid;
            this.gid++;

            this.stack.push([this.tree[root].L,this.tree[root].R]);

            this.buildTree(this.tree[root].L);
            this.buildTree(this.tree[root].R)
        }
    },

    // Join rooms using corridors
    joinRooms: function () {
        var join;
        while(join=this.stack.pop()){
            var a = join[0];
            var b = join[1];
            // console.log("join: "+[a,b]+" split: "+this.tree[a].alignment);
            // console.log(this.tree[a].center);
            // console.log(this.tree[b].center);
            var x = Math.min(this.tree[a].center.x, this.tree[b].center.x);
            var y = Math.min(this.tree[a].center.y, this.tree[b].center.y);
            var size = randPlus(2,3);
            var w = size;
            var h = size;
            // Vertical corridor
            if(this.tree[a].alignment == 'H'){
                x -= Math.floor(size/2)+1;
                h=Math.abs(this.tree[a].center.y - this.tree[b].center.y);
            } else{
            // Horizontal corridor
                y -= Math.floor(size/2)+1;
                w=Math.abs(this.tree[a].center.x - this.tree[b].center.x);
            }

            // Ensure Legal bounds
            x = x<0 ? 0 : x;
            y = y<0 ? 0 : y;

            // console.log("Corridor: "+[x,y,w,h]);
            for(var i=x; i<x+w; i++){
                for(var j=y; j<y+h; j++){
                    if(this.map[i][j]==0) this.map[i][j]=2;
                }
            }
        }
    },

    print: function () {
        console.log("DUNGEON");
        for (var x = 0; x < this.map_size; x++) {
            var row = x;

            if(x<10){row+='  ';} else {row+=' ';}

            for (var y = 0; y < this.map_size; y++) {
                row += this.map[x][y] + ' ';
            }
            console.debug(row);
        }
    },

    getMap: function () {
        return this.map;
    },

    getRooms: function () {
        return this.rooms;
    },

    getTree: function () {
        return this.tree;
    },

    getStats: function () {
        return this.stats;
    }
};

