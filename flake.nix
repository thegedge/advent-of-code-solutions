{
  description = "Jason Gedge's solutions to Advent of Code";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem
      (system: nixpkgs.lib.fix (flake:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          callPackage = pkgs.newScope (flake.packages // { inherit callPackage; });
        in
        {
          packages = {
            direnv = pkgs.direnv;
            nix-direnv = pkgs.nix-direnv;

            deno = pkgs.deno;
            nodejs = pkgs.nodejs_23;
            corepack = pkgs.corepack;

            rustc = pkgs.rustc;
          };

          devShell = callPackage ./devShell.nix {
            mkShell = pkgs.mkShellNoCC;
            packages = flake.packages;
          };
        }));
}
