## Description

These are my solutions to the various advent of code. I'm not a "code golf" kind of person, so these are just me
enjoying the experience of solving problems, not trying to always find a clever solution or fitting that solution into
as few characters as possible.

I'm trying my best to comment on various aspects, so anyone reading these solutions can learn how I came about them.
Feel free to open up an issue if you'd like me to expand on or clarify any piece of code. I'm always happy to teach :)

## Usage

Log in to https://adventofcode.com and grab the session cookie from your browser's dev console. Once you have it, export
it in your environment:

```
export COOKIE="session=<copied value from browser>"
```

This is needed to be able to get your previously submitted results and download input files.

```
./runner.mts <year> <problem>
```

If you haven't started the problem yet, this will create a file for you to begin your adventing! It caches this too, so
you don't need to fetch every time (or maybe you'd like to solve things in an offline environment).

Otherwise, this script will download inputs, try to parse out examples and results, and run your module. If results were
found in the page description, it will compare them and let you know if you solved it correctly.
