/// <reference path='./Int.ts' />
/// <reference path='./POT.ts' />
import {Int, checkIsInt} from "./Int"
import {POT, power} from "./POT"

export namespace CEQ {

  // https://medium.com/@iaincollins/error-handling-in-javascript-a6172ccdf9af
  export class ParseError extends Error {
    constructor(message) {
      super(message)
      this.name = 'ParseError'
      this.message = message
    }
  }

  type ceq = string ;
  export interface ParsedCEQ {
    ceq: string ;
    prefix : string ;
    scheme : string;
    hex : string ;
    b4 : string;
    quad : [ number, number ] ;
  }

  export interface Options {
    min ?: POT ;
    size ?: POT ;  //
//    units ?: enum Unit {'km','m'};
  };

  const DefaultOptions : Options = {
    min : 0.125 as POT,
    size : 1 as POT,
  }

  export function parse(ceq : ceq) : ParsedCEQ {
    let q : ParsedCEQ = {
      ceq:'',
      prefix:'',
      scheme:'',
      hex:'',
      b4:'',
      quad: [0,0]
    };

	  function parse_re(ceq : ceq)  {
      let re : RegExp = /^(.*[:/])?(([7EF])|([012389AB])([0-9,A-F]*)(\.([0-3]*))?)$/i;
		  let m = ceq.match(re);
      if (!m ) {
        let p=new ParseError(`${ceq} not a valid ceq code`);
        //console.error('pe:',p instanceof ParseError)
        throw p;
      }
      return m;
	  };

		let ceqp=parse_re(ceq);
		q.scheme=ceqp[1] || '';
		q.prefix=(ceqp[4] || ceqp[2]).toLowerCase();
		q.hex=(ceqp[5] || '').toLowerCase();
		q.b4=(ceqp[7] || '');
		if (ceqp[4]) {
      let p : number = parseInt(ceqp[4]);
      q.quad=[(p & 0x02)?-1:1,(p & 0x01)?-1:1];
    }
    if (q.b4 && q.b4.length>1) {
      [ q.hex,q.b4 ] = b4_to_hex(q.b4);
		}
		q.ceq=q.scheme+q.prefix+q.hex;
		if (q.b4) {
			q.ceq+='.'+q.b4;
		}
    return q;
  };

  function b4_to_hex(b4 : string ) : [string,string] {
    let hex : string ='';
    while(b4 && b4.length>1) {
			let h=parseInt(b4.charAt(0),8);
			let l=parseInt(b4.charAt(1),8);
			let x=(h << 2 | l).toString(16).toLowerCase();
			hex+=x;
			b4=b4.slice(2);
		}
    return[hex,b4];
  };

  export function isvalid(ceq: string ) : boolean {
    try {
      parse(ceq);
    } catch (e) {
      return false;
    }
    return true;
  }

  export function canonical(ceq : string ) : string {
    return parse(ceq).ceq;
  }

	export function axis(ceq : string) : [ string ,string ]  {
    let t=parse(ceq);

    switch (t.prefix) {
      case '7':
        return ['4','5'];
		  case 'e':
        return [ 'e', 'e' ];
      case 'f':
        return [ 'f', 'f' ];
      default:
        break;
    }
    let p=(parseInt(t.prefix,16)+8).toString(16);
    let x :string = p;
    let y :string = p;
		if (t.hex) {
			for (var i = 0; i < t.hex.length; i++) {
				let v=parseInt(t.hex.charAt(i),16);
        x+=(v & 0b0101).toString(16);
        y+=(v & 0b1010).toString(16);
			}
		}
		if (t.b4) {
			let v=parseInt(t.b4,4);
      x+='.'+(v & 0b01).toString(4);
      y+='.'+(v & 0b10).toString(4);
		}
    return [x.toLowerCase(),y.toLowerCase()];
  }

	export function bounds (ceq : string) : [ [ number , number ], [number, number ] ]  {
    let n : number =10;
    let quad : [ number, number];
    let x : number = 0;
    let y : number = 0;
    let t=parse(ceq);
    if ( ! t )
      return [[ 0,0 ],[0,0]];
    switch(t.prefix) {
      case '4':
        return [ [-(2**n),2**n], [0,0] ];
      case '5':
        return [ [0,0], [-(2**n),2**n] ];
      case '6':
        return [ [0,0], [0,0] ];
      case '7':
        return [ [-(2**n),2**n], [-(2**n),2**n] ];
      case '0':
      case '8':
        quad=[1,1];
        break;
      case '1':
      case '9':
        quad=[1,-1];
        break;
      case '2':
      case 'A':
        quad=[-1,1];
        break;
      case '3':
      case 'B':
        quad=[-1,-1];
        break;
    }
		if (t.hex) {
			for (var i = 0; i < t.hex.length; i++) {
				let v=parseInt(t.hex.charAt(i),16);
        x=x<<2 | (v >> 1 & 0b10) | (v & 0b01)
        y=y<<2 | (v >> 2 & 0b10) | (v >> 1 & 0b01)
        n-=2;
			}
		}
		if (t.b4) {
			let v=parseInt(t.b4,4);
        x=x<<1 | (v & 0b01)
        y=y<<1 | (v >> 1 & 0b01)
        n--;
		}
    return [
      [quad[0]*x*(2**n),quad[0]*(x+1)*(2**n) ],
      [quad[1]*y*(2**n),quad[1]*(y+1)*(2**n) ] ];
  };

export function center_to_ceq(c:[number, number],opt : Options = DefaultOptions ) : string  {

  let { min = DefaultOptions.min } = opt;
  let n_max: number =10;    // 2^10= 1024, size of 0-3
  let prefix: number = 0 ;
  let i: [Int, Int ];   // Quantized center (by minimum CEQ allowed)

  if (c[0]===0 && c[1]===0)
    return('7');

  // Check if out of CA, ie bigger than 2^10
  if ( Math.abs(c[0]) > 1024 || Math.abs(c[1]) > 1024 )
    return('f');

  if (Math.sign(c[0])==-1)
    prefix |=0x2;
  if (Math.sign(c[1])==-1)
    prefix |=0x1;

  let n_min : number = power(min);
  i= [Math.abs(Math.round(c[0]/min)) as Int, Math.abs(Math.round(c[1]/min)) as Int];

  //console.error(`c:${c},i:${i},min:${min}`)
  let n : number =n_max-n_min;

  //console.error(`c:${c},i:${i},check:[${checkIsInt(i[0])},${checkIsInt(i[1])}]`)
  // We only test down to the mininum size.  This needs to be specified
  if ( ! (checkIsInt(i[0]) && checkIsInt(i[1])) )
    return('e')
  // Okay, for the center of any ceq of size 2**n we'll have one/odd 2**(n-1) value,
  // so verify this is true for both values
  while( i[0] != 0 && i[1] != 0 && (i[0] & 0b1) != 0b1) {
    i[0]=i[0]>>1 as Int;
    i[1]=i[1]>>1 as Int;
    n_min++;
  }
  if (i[0] == 0 || (i[1] & 0b1) != 0b1) {
    throw new Error (`point ${c} is not a center point`);
  }
  n_min++;
  let b4 : string ='';
  // We have n levels to add, Oth bit is center, and skipped
  for (let n=n_max-n_min; n>0; n--) {
    let d : string =((i[1]>>n & 0b1) << 1 | (i[0]>>n & 0b1)).toString(4);
    // console.error(`n=${n},i=${i},ib=[${(i[0]).toString(2)},${(i[1]).toString(2)}],ibn=[${(i[0]>>(n-1)).toString(2)},${(i[1]>>(n-1)).toString(2)}],2^n=${2**n},d=${d},b4=${b4}`);
		b4=b4+d;
  }
	let ceq : string = String(prefix);
	if (b4) {
    let hex : string ;
    [hex,b4] = b4_to_hex(b4);
		ceq+=hex;
    if (b4)
      ceq+='.'+b4;
	}
  return ceq;
  };

  //
  export function pt_to_ceq(c:[number, number],opt : Options = DefaultOptions ) : string  {
    let { size = DefaultOptions.size } = opt;
    let n_max: number =10;    // 2^10= 1024, size of 0-3
    let prefix: number = 0 ;
    let i: [Int, Int ];   // Quantized center (by minimum CEQ allowed)

    if (c[0]===0 && c[1]===0)
      return('7');

    // Check if out of CA, ie bigger than 2^10
    if ( Math.abs(c[0]) > 1024 || Math.abs(c[1]) > 1024 )
      return('f');

    if (Math.sign(c[0])==-1)
      prefix |=0x2;
    if (Math.sign(c[1])==-1)
      prefix |=0x1;

    let n_min : number = power(min);
    i= [Math.abs(Math.round(c[0]/min)) as Int, Math.abs(Math.round(c[1]/min)) as Int];

    //console.error(`c:${c},i:${i},min:${min}`)
    let n : number =n_max-n_min;

    //console.error(`c:${c},i:${i},check:[${checkIsInt(i[0])},${checkIsInt(i[1])}]`)
    // We only test down to the mininum size.  This needs to be specified
    if ( ! (checkIsInt(i[0]) && checkIsInt(i[1])) )
      return('e')
    // Okay, for the center of any ceq of size 2**n we'll have one/odd 2**(n-1) value,
    // so verify this is true for both values
    while( i[0] != 0 && i[1] != 0 && (i[0] & 0b1) != 0b1) {
      i[0]=i[0]>>1 as Int;
      i[1]=i[1]>>1 as Int;
      n_min++;
    }
    if (i[0] == 0 || (i[1] & 0b1) != 0b1) {
      throw new Error (`point ${c} is not a center point`);
    }
    n_min++;
    let b4 : string ='';
    // We have n levels to add, Oth bit is center, and skipped
    for (let n=n_max-n_min; n>0; n--) {
      let d : string =((i[1]>>n & 0b1) << 1 | (i[0]>>n & 0b1)).toString(4);
      // console.error(`n=${n},i=${i},ib=[${(i[0]).toString(2)},${(i[1]).toString(2)}],ibn=[${(i[0]>>(n-1)).toString(2)},${(i[1]>>(n-1)).toString(2)}],2^n=${2**n},d=${d},b4=${b4}`);
			b4=b4+d;
    }
		let ceq : string = String(prefix);
		if (b4) {
      let hex : string ;
      [hex,b4] = b4_to_hex(b4);
			ceq+=hex;
      if (b4)
        ceq+='.'+b4;

		}
    return ceq;
  };
}
