#! /usr/bin/node

proj4=require('proj4');

proj4.defs([
  [
    'EPSG:3310',
    '+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
  ]
]);

// Initializing a class definition
class CEQ {
		static parse(ceq) {
				let re = /^(.*[:/])?(([7EF])|([0123])([0-9,A-F]*)(\.([0-3]*))?)$/i;
				return ceq.match(re);
		}
		// Also a constructor, should be same as below
		static foo(cnl) {
				console.log('foo:'+typeof center_level);
				let level=cnl[1] || 10;
				let center_dis=2**level*1000;
				let lr=[cnl[2][0],cnl[2][1]];

				let b4='';
				for (let i=level; i<=10;i++) {
						console.log('i:'+level+' b4: '+b4,' lr:'+lr);
						b4=((lr[0] & 0x1 ) << 1 | (lr[1] & 0x1)).toString(4)+b4;
						lr[0]>>=1;
						lr[1]>>=1;
				}
				console.log('b4: '+b4,'lr:'+lr);
				if (lr) {
						console.log('center:'+(cnl[2][0]+0.5)*center_dis+','+(cnl[2][1]+0.5)*center_dis)
				}

		}

    constructor(ceq) {
				console.log('typeof:'+typeof ceq);
				if (typeof ceq == 'object') {
						ceq='q:E';
				}
				// parse string
				this.ceq = ceq;
				let ceqp=this.constructor.parse(ceq);
				if (! ceqp) return null;
				this.scheme=ceqp[1];
				this.prefix=ceqp[4] || ceqp[2];
				this.hex=ceqp[5];
				this.b4=ceqp[7];
				if (this.prefix==='E') {
						this.quad=null;
				} else {
						this.quad=[(this.prefix & 0x02)?-1:1,(this.prefix & 0x01)?-1:1];
				}
				if (this.b4 && this.b4.length > 1) {
						for(let b=0; b<this.b4.length-1; b+=2) {
								let h=parseInt(this.b4.charAt(b),8);
								let l=parseInt(this.b4.charAt(b+1),8);
								let x=(h << 2 | l).toString(16).toUpperCase();
								console.log('b:'+b+' x:'+x);
								this.hex+=x;
								this.b4=this.b4.slice(2);
						}
				}
				this.ceq=this.scheme+this.prefix+this.hex;
				if (this.b4) {
						this.ceq+='.'+this.b4;
				}
    }
		center_level() {
				console.log('center_level:',this.prefix);
				let n=10;               // level = pixel width
				let center_dis=2**(n-1)*1000;    // nth level distance to center

				function add_and_halve(q) {
						console.log('q:'+q+' lr pre:'+lr)
						lr[0] = lr[0] << 1 | (( q & 0x2 ) >> 1) ;
						lr[1] = lr[1] <<1  | (q & 0x1) ;
						console.log('q:'+q+' lr post:'+lr)
						center[0] += (q & 0x2)?-center_dis:center_dis;
						center[1] += (q & 0x1)?-center_dis:center_dis;
						console.log("n:",n,"center_dis: ",center_dis," center:",center);
						n-=1;
						center_dis=2**n*1000;
				}

				let center=[0,0];
				let lr=[0,0];

				if (this.prefix=='7') return [center,n,null];
				if (this.prefix=='F') return [null,null,null];
				if (this.prefix=='E') return [null,null,null];

				add_and_halve(parseInt(this.prefix,4));

				if (this.hex) {
						for (var i = 0, l = this.hex; i < l.length; i++) {
								let v=parseInt(this.hex.charAt(i),16);
								add_and_halve(v >> 2);
								add_and_halve(v);
						}
				}
				if (this.b4) {
						for (var i = 0, l = this.b4; i < l.length; i++) {
								let v=parseInt(this.b4.charAt(i),4);
								add_and_halve(v);
						}
						// now pick direction;
				}
				// Get last nth value
				n+=1
				return [center,n,lr];
//				return [[center[0],center[1]],n,lr];
		}
		center() {
				return (this.center_level())[0];
		}
		level() {
				return (this.center_level())[1];
		}
		lr() {
				return (this.center_level())[2];
		}

		endpoints() {
		}

}

CEQ.foo([[0,0],5,[22,20]]);

let test=[
//		'q:7',
//		'q:0',
//		'q:0.0',
//		'q:0.1',
//		'q:0.2',
//		'q:0.3',
//		'q:1',
//		'q:2',
//		'q:3',
		'ceq:0AF.3',
		'ceq:0A.333',
//		'ceq:E',
//		{center:[0,0],level:10}
]

for (i=0;i<test.length;i++) {
		console.log("i:",i," qed:",test[i]);
		let ceq=new CEQ(test[i]);
		let q=ceq.quad;
		console.log(ceq);
		let [center,n,lr]=ceq.center_level();
		console.log("level: "+n);
		console.log("center-size: ",[q[0]*lr[0]*(2**n*1000)+2**(n-1)*1000,
																 q[1]*lr[1]*(2**n*1000)+2**(n-1)*1000]);
		console.log("center: "+center);
		console.log("lr: "+lr);
}

n=10
size=1000*2**n;
center=[0,0];

ne=proj4('EPSG:3310','EPSG:4326',[center[0]+size,center[1]+size]);
nw=proj4('EPSG:3310','EPSG:4326',[center[0]-size,center[1]+size]);
se=proj4('EPSG:3310','EPSG:4326',[center[0]+size,center[1]-size]);
sw=proj4('EPSG:3310','EPSG:4326',[center[0]-size,center[1]-size]);

geojson={
  type:"Topology",
  objects: {
    "ceq.7": {
      id:"ceq.7",
      type:"Polygon",
      properties: {
        name: "ceq.7",
        n:11,
        other: {
          this: "that"
        }
      },
      arcs: [[0,1,2,3]]
    }
  },
  arcs:[ [sw,nw],[nw,ne],[ne,se],[se,sw] ]
};

console.log(JSON.stringify(geojson));
