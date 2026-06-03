export interface CircularFixture {
  name: string;
  self?: CircularFixture;
}

export function createCircularFixture(): CircularFixture {
  const value: CircularFixture = { name: "root" };
  value.self = value;
  return value;
}

