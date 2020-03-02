/// <reference types="jest" />

const fn = () => 'foo';

test("const fn test", () =>{
  expect(fn()).toBe("foo");
});
