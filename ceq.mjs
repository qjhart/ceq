#! /usr/bin/node

import proj4 from 'proj4';

proj4.defs([
    [
      'EPSG:3310',
      '+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
    ]
  ]);

import {CEQ} from './CEQ.mjs';

let q={
  F:{center:[512000,1024001] },
	0:{center:[512000,512000],
         pixel_size:1024000,
         n:10
        },
};

//CEQ.foo([[0,0],5,[22,20]]);
let i;

for (i in q) {
  let res=CEQ.fromNE(q[i].center);
  console.log(`i:${i},res:${res}`);
}

let test=[
//		'ceq:7',
	'q:0',
//		'q:0.0',
//		'q:0.1',
//		'q:0.2',
//		'q:0.3',
//		'q:1',
//		'q:2',
//		'q:3',
//		'ceq:0AF.3',
//		'ceq:0A.333',
//		'ceq:E',
//		{center:[0,0],level:10}
]

for (let i=0;i<test.length;i++) {
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

let n=10
let size=1000*2**n;
let center=[0,0];

let ne=proj4('EPSG:3310','EPSG:4326',[center[0]+size,center[1]+size]);
let nw=proj4('EPSG:3310','EPSG:4326',[center[0]-size,center[1]+size]);
let se=proj4('EPSG:3310','EPSG:4326',[center[0]+size,center[1]-size]);
let sw=proj4('EPSG:3310','EPSG:4326',[center[0]-size,center[1]-size]);

let geojson={
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

// console.log(JSON.stringify(geojson));
