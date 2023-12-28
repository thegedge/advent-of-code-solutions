export const tee = <T>(v: T): T => {
  console.log(v);
  return v;
};

export const nonNil = <T>(v: T | null | undefined): v is T => {
  return v != null;
};
