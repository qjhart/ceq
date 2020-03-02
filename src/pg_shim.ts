\set package CEQ
\set js `cat CEQ.js`

create type ParsedCEQ as (
  ceq text,
  prefix text ,
  scheme text,
  hex text,
  b4 text,
  quad : [ number, number ],
);


create or replace function center_to_ceq(x integer, y integer)
RETURNS text as $$
return CEQ.center_to_ceq(
	return CEQ.center_to_ceq([x,y])
}
$$ LANGUAGE plv8 IMMUTABLE STRICT;

create or replace  function b4_to_hex(b4 text)
RETURNS text[2] as $$
   return CEQ.b4_to_hex(b4)
$$ LANGUAGE plv8 IMMUTABLE STRICT;

create or replace function parse
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

CREATE OR REPLACE FUNCTION fft
(in et float[])
RETURNS fft_t AS $$
return fft.fft(et);
$$ LANGUAGE plv8 IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION ifft
(e float[],d float[],n integer)
RETURNS float[] AS $$
return fft.ifft(e,d,n);
$$ LANGUAGE plv8 IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION et
(e float[],d float[],day float)
RETURNS float AS $$
return fft.et(e,d,day);
$$ LANGUAGE plv8 IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION cum_et
(e float[],d float[],day integer)
RETURNS float AS $$
return fft.cum_et(e,d,day);
$$ LANGUAGE plv8 IMMUTABLE STRICT;


CREATE or replace function init_injector(prefix text,js text)
RETURNS TEXT
LANGUAGE PLPGSQL AS $PL$
begin
EXECUTE FORMAT($FORMAT$
CREATE OR REPLACE FUNCTION require_%1$s() RETURNS VOID AS $INIT_FUNCTION$
%1=%2$s
$INIT_FUNCTION$ LANGUAGE plv8 IMMUTABLE STRICT;
$FORMAT$,prefix,js);
return 'require_'||prefix;
end
$PL$;


select init_injector(:'package',:'js');
drop function init_injector(prefix text,js text);
