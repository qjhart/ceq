(function(){
  var b4_to_hex=function(b4) {
    let hex='';
		if (b4 && b4.length > 1) {
			for(let b=0; b<b4.length-1; b+=2) {
				let h=parseInt(b4.charAt(b),8);
				let l=parseInt(b4.charAt(b+1),8);
				let x=(h << 2 | l).toString(16).toUpperCase();
				hex+=x;
				b4=b4.slice(2);
			}
		}
    return[hex,b4];
  };

  var center_to_ceq=function(c) {
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
  };

  var parse=function(ceq) {
    let this_thing={};
		if (typeof ceq == 'object') {
      // Later we can check combine from NE above
			ceq='q:E';
		}
		// parse string
		this_thing.ceq = ceq;

	  function parse_re(ceq) {
		  let re = /^(.*[:/])?(([7EF])|([0123])([0-9,A-F]*)(\.([0-3]*))?)$/i;
		  return ceq.match(re);
	  };

		let ceqp=parse_re(ceq);
		if (! ceqp) return null;
		this_thing.scheme=ceqp[1] || '';
		this_thing.prefix=ceqp[4] || ceqp[2];
		this_thing.hex=ceqp[5];
		this_thing.b4=ceqp[7];
		if (this_thing.prefix==='E') {
			this_thing.quad=null;
		} else {
			this_thing.quad=[(this_thing.prefix & 0x02)?-1:1,(this_thing.prefix & 0x01)?-1:1];
		}
		if (this_thing.b4 && this_thing.b4.length > 1) {
			for(let b=0; b<this_thing.b4.length-1; b+=2) {
				let h=parseInt(this_thing.b4.charAt(b),8);
				let l=parseInt(this_thing.b4.charAt(b+1),8);
				let x=(h << 2 | l).toString(16).toUpperCase();
				this_thing.hex+=x;
				this_thing.b4=this_thing.b4.slice(2);
			}
		}
		this_thing.ceq=this_thing.scheme+this_thing.prefix+this_thing.hex;
		if (this_thing.b4) {
			this_thing.ceq+='.'+this_thing.b4;
		}
    return this_thing;
  };

	var ceq_to_center = function(ceq) {
		let n=10;               // level = pixel width
    let u=0;
		let c=[0,0];

		function add_and_halve(q) {
			c[0] = c[0]<<1 | ((q>>1 ^ 0x1) & 0x1);
			c[1] = c[1]<<1 | ((q ^ 0x1) & 0x1);
			u++;
      console.log(`u:${u},c:${c} q:${q}`);
		}

    let t=parse(ceq);
    if (! t || typeof t.prefix == 'undefined') return [null,null];

		if (t.prefix=='7') return [center,n];
		if (t.prefix=='F') return [null,null];
		if (t.prefix=='E') return [null,null];

    // For prefix
		add_and_halve(parseInt(t.prefix,0));

		if (t.hex) {
			for (var i = 0, l = t.hex; i < l.length; i++) {
				let v=parseInt(t.hex.charAt(i),16);
				add_and_halve(v >> 2);
				add_and_halve(v);
			}
		}
		if (t.b4) {
			for (var i = 0, l = t.b4; i < l.length; i++) {
				let v=parseInt(t.b4.charAt(i),4);
				add_and_halve(v);
			}
		}
    // get direction
    c=[c[0]*t.quad[0]*1000,c[1]*t.quad[1]*1000];
		// Get last nth value
		n+=1
		return [c,n];
	}

module.exports= {
  parse:parse,
  b4_to_hex:b4_to_hex,
  center_to_ceq:center_to_ceq,
  ceq_to_center:ceq_to_center,
};
})();
