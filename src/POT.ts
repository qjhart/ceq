// https://spin.atomicobject.com/2018/11/05/using-an-int-type-in-typescript/
//export type POT = number & { __int__: void };
export type POT = number & { __pot__: void };
export const power = (num: number): number => {
  try {
    if (checkIsPOT(num)) {
      return Math.log2(num)
    }
  } catch (err) {
    throw new Error(`Invalid POT value ${num}`)
  }
};

export const checkIsPOT = (n: number) : n is POT => {
  if (n==0)
    return false;
   return (Math.ceil(Math.log2(n)) == Math.floor(Math.log2(n)));
};

export const assertAsPOT = (num: number): POT => {
  try {
    if (checkIsPOT(num)) {
      return num;
    }
  } catch (err) {
    throw new Error(`Invalid POT value (error): ${num}`);
  }

  throw new Error(`Invalid POT value: ${num}`);
};
