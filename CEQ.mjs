// Initializing a class definition

export class CEQ {
		static parse(ceq) {
				let re = /^(.*[:/])?(([7EF])|([0123])([0-9,A-F]*)(\.([0-3]*))?)$/i;
				return ceq.match(re);
		}
		// Also a constructor, should be same as below
  static fromNE(ne,level) {
    let n=10;
    let prefix=0;
		let center_dis=2**n*1000;    // nth level distance to center
    let rat=[ne[0]/center_dis,ne[1]/center_dis];
    if (Math.abs(rat[0]) > 1 || Math.abs(rat[1]) > 1)
      return('q:F');
    if (rat[0]>0)
      prefix |= 0x2;
    if (rat[1]>0)
      prefix |= 0x1;

    console.log(`prefix:${prefix},rat=${rat},n=${n},center_dis=${center_dis}`);

    return('q:E');
  }


  static foo(cnl) {
		console.log('foo:'+typeof cnl);
		let level=cnl[1] || 10;
		let center_dis=2**level*1000;
		let lr=[cnl[2][0],cnl[2][1]];

		let b4='';
		for (let i=level; i<=10;i++) {
			console.log(`i:${i} b4:${b4} lr:${lr}`);
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

	endpoints() {
	}

}
