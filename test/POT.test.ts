/// <reference types="jest" />

import {POT, checkIsPOT, assertAsPOT} from '../src/POT';

test("Math.log2", () =>{
  expect(Math.log2(8)).toBe(3);
});

test("checkIsPOT", () =>{
  expect(checkIsPOT(8)).toBe(true);
});


test("assertAsPOT", () =>{
  expect(assertAsPOT(8)).toBe(8);
  expect(assertAsPOT(8)).toBe(8 as POT);
  expect(()=>{assertAsPOT(9)}).toThrow(Error);
});

test("power", () =>{
  expect(assertAsPOT(8)).toBe(8);
  expect(assertAsPOT(8)).toBe(8 as POT);
});
