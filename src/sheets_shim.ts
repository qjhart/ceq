function xy_to_ceq(x:number, y:number) : string {
	return CEQ.center_to_ceq([x,y])
}

function b4_to_hex(b4 : string ) : [string,string] {
   return [ CEQ.b4_to_hex(b4) ];
}

function parse(ceq: string) : CEQ.ParsedCEQ {
   return CEQ.parse(ceq)
}

function center(ceq : string) : Array[number] {
    var c=CEQ.center(ceq);
    Logger.log(c[0])
    return ([[c[0][0],c[0][1],c[1]]]);
  }

function parse(ceq : string ) : Array[string] {
  var p=CEQ.parse(ceq);
  return p.ceq;
}

function is_valid_ceq(ceq : string) : boolean {
//   var re = /^(.*[:/])?(([7EF])|([0123])([0-9,A-F]*)(\.([0-3]*))?)$/i;
   //var re = new RegExp('^(.*[:/])?(([7EF])|([0123])([0-9,A-F]*)(\.([0-3]*))?)$', 'i');
//   var m=ceq.match(re);
  let m = CEQ.parse(ceq);
   if ( m ) {
   return true
   } else {
   return false
   }
}
