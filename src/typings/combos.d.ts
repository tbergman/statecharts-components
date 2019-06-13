declare module "combos" {
  function combos<TSchema, K extends keyof TSchema>(
    input: { [key in K]: TSchema[key] }
  ): Array<{ [key in K]: TSchema[key][0] }>;

  export = combos;
}
