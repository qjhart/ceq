// Initializing a class definition

export class CEQ {
		static parse(ceq) {
				let re = /^(.*[:/])?(([7EF])|([0123])([0-9,A-F]*)(\.([0-3]*))?)$/i;
				return ceq.match(re);
		}
	// Also a constructor, should be same as below
  static b4_to_hex(b4) {
    let hex='';
		if (b4 && b4.length > 1) {
			for(let b=0; b<b4.length-1; b+=2) {
				let h=parseInt(b4.charAt(b),8);
				let l=parseInt(b4.charAt(b+1),8);
				let x=(h << 2 | l).toString(16).toUpperCase();
				console.log('b:'+b+' x:'+x);
				hex+=x;
				b4=b4.slice(2);
			}
		}
    return[hex,b4];
  }

  static center_to_ceq(c) {
    let n_max=11;
    let n;
    let prefix=0;

    if (c[0]===0 && c[1]===0)
      return('7');

    if (Math.sign(c[1])==-1)
      prefix |=0x2;
    if (Math.sign(c[0])==-1)
      prefix |=0x1;

    let n_min=0;
    let min=2**n_min*1000;
    let i=[Math.abs(Math.round(c[0]/min)),Math.abs(Math.round(c[1]/min))];

    if (Math.sign(c[0])*i[0]*min != c[0] || Math.sign(c[1])*i[1]*min != c[1])
      return('E');

    n=n_max-n_min-1;

    // Check if out of CA, ie bigger than 2^10
    let rat=[i[0]>>n,i[1]>>n];
    let rat_t=(rat[0] || rat[1]);

    console.log(`n=${n},c=${c},i=${i} rat=${rat} rat_t=${rat_t}`);

    if (rat_t)
      return('F');

    let b4='';
    for (--n; n>0; n--) {
      let d=((i[0]>>n ^ 0x1) << 1 | (i[1]>>n ^ 0x1)).toString(4);
      i=[i[0] & ~(0x1<<n) ,i[1] & ~(0x1<<n)];
      if ((i[0] | i[1]) == 0) // You have reached the size
        break;
			b4=b4+d;
      console.log(`n=${n},i=${i},2^n=${2**n},d=${d},b4=${b4}`);
    }
		let ceq=prefix;
		if (b4) {
      let hex;
      [hex,b4] = this.b4_to_hex(b4);
			ceq+=hex;
      if (b4)
        ceq+='.'+b4;
		}
    return ceq;
  }

  constructor(ceq) {
  console.log('typeof:'+typeof ceq);
		if (typeof ceq == 'object') {
      // Later we can check combine from NE above
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
}
