#! /usr/bin/node

proj4=require('proj4');

proj4.defs([
  [
    'EPSG:3310',
    '+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
  ]
]);

let CEQ=require('./CEQ.js');

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
