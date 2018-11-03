# ceq
CEQ /kek/ California Environmental Quadtree

## Ordering 


_ | W | E 
 --- | --- | --
**N** | 2 | 3
**S** | 0 | 1

_ | W | E 
 --- | --- | --
**N** | 2 | 3
**S** | 0 | 1


## Prefix Codes
The very first Hex term is used 

ceq:0 = NE Quadrant
ceq:1 = NW Quadrant
ceq:2 = SW Quadrant
ceq:3 = SE Quadrant
ceq:7 = All Quadrant
ceq:F = Out of California
ceq:E = Error

## ARKS


bits  | Hex | size [km] | valid | Example
--- | --- | --- | --- | ---
 4  | 1 | When F = 2048 Otherwise 1024 | F,0,1,2,3
 8  | 3 | 256 | ceq:0


## Decoding 

## Creating TOPOJSON

You can create a topojson file 

``` bash
ceq --topojson --to=output_file.json
```

## Creating GEOJSON

You can create a geojson file 

``` bash
ceq --geojson --from=input_file [--to=output_file.json] [--include=CEQ] 
```

## Linked data

ceq:F
