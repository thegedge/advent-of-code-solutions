// This is adopted from 17.js
use std::fs;

struct Shape {
    w: usize,
    h: usize,
    mask: [i32; 4],
}

const SHAPES: [Shape; 5] = [
    Shape {
        w: 4,
        h: 1,
        mask: [0b11110000, 0b00000000, 0b00000000, 0b00000000],
    },
    Shape {
        w: 3,
        h: 3,
        mask: [0b01000000, 0b11100000, 0b01000000, 0b00000000],
    },
    Shape {
        w: 3,
        h: 3,
        mask: [0b00100000, 0b00100000, 0b11100000, 0b00000000],
    },
    Shape {
        w: 1,
        h: 4,
        mask: [0b10000000, 0b10000000, 0b10000000, 0b10000000],
    },
    Shape {
        w: 2,
        h: 2,
        mask: [0b11000000, 0b11000000, 0b00000000, 0b00000000],
    },
];

const MAP_WIDTH: usize = 7;

fn is_bit_set(v: i32, n: i32) -> bool {
    return (v & (1 << (7 - n))) != 0;
}

fn shape_in_bounds(shape: &Shape, x: i32) -> bool {
    return x >= 0 && (x as usize) + shape.w <= MAP_WIDTH;
}

struct Map {
    lo: usize,
    length: usize,
    data: Vec<i32>,
}

impl Map {
    fn new() -> Map {
        let length = 500;
        return Map {
            lo: 0,
            length,
            data: vec![0xff; length],
        };
    }

    fn unshift(&mut self, value: i32) {
        self.lo = (self.lo + self.length - 1) % self.length;
        self.data[self.lo] = value;
    }

    fn test(&self, shape: &Shape, x: i32, y: i32) -> bool {
        // Small optimization: go in reverse, because we're likely to intersect on the bottom
        return shape.mask.iter().enumerate().any(|(row, mask)| {
            let index = y + (row as i32);
            return index >= 0 && ((mask >> x) & self.get(index as usize)) != 0;
        });
    }

    fn get(&self, row: usize) -> i32 {
        let mut index = self.lo + row;
        if index >= self.length {
            index -= self.length
        }

        return self.data[index];
    }

    fn set(&mut self, shape: &Shape, x: i32, y: i32) {
        let row = y as usize;
        self.data[(self.lo + row + 0) % self.length] |= shape.mask[0] >> x;
        self.data[(self.lo + row + 1) % self.length] |= shape.mask[1] >> x;
        self.data[(self.lo + row + 2) % self.length] |= shape.mask[2] >> x;
        self.data[(self.lo + row + 3) % self.length] |= shape.mask[3] >> x;
    }

    fn dump(&self, maybe_shape: Option<&Shape>, x: i32, y: i32) {
        let mut strings: Vec<String> = Vec::new();
        if y < 0 {
            for _ in y..0 {
                strings.push(".".repeat(MAP_WIDTH));
            }
        }

        let mut index = self.lo;
        for _ in 0..self.length {
            let bitmask = self.data[index];
            strings.push(
                (0..MAP_WIDTH)
                    .map(|v| {
                        if is_bit_set(bitmask, v as i32) {
                            "#"
                        } else {
                            "."
                        }
                    })
                    .collect(),
            );
            index = (index + 1) % self.length;
        }

        if let Some(shape) = maybe_shape {
            let sy = y.max(0) as usize;
            shape.mask.iter().enumerate().for_each(|(row, bitmask)| {
                (0..MAP_WIDTH).enumerate().for_each(|(col, v)| {
                    if is_bit_set(bitmask >> x, v as i32) {
                        // let s = strings[sy + row];
                        // strings[sy + row] = s.substring(0, col) + "@" + s.substring(col + 1);
                        strings[(sy + row) as usize].replace_range(col..col + 1, "@");
                    }
                });
            });
        }

        println!("{}\n", strings.join("\n"));
    }
}

struct Simulator {
    deltas: Vec<i32>,
    delta_index: usize,
    height: i32,
    map: Map,
    start: i32,
    x: i32,
    y: i32,
}

impl Simulator {
    fn new(group: &str) -> Simulator {
        let deltas: Vec<i32> = group
            .chars()
            .map(|v| if v == '<' { -1 } else { 1 })
            .collect();

        return Simulator {
            deltas,
            delta_index: 0,
            height: 0,
            map: Map::new(),
            start: 3,
            x: 0,
            y: 0,
        };
    }

    fn simulate_empty_space(&mut self, shape: &Shape) {
        // First few spaces we won't intersect the map, so just update x
        let mut x = 2;
        let mut delta_index = self.delta_index;

        for _y in 0..self.start {
            // self.map.dump(Some(shape), x, -3 - (shape.h as i32) + _y);
            let new_x = x + self.deltas[delta_index];
            if shape_in_bounds(shape, new_x) {
                x = new_x;
            }

            delta_index = if delta_index + 1 == self.deltas.len() {
                0
            } else {
                delta_index + 1
            };
        }

        self.x = x;
        self.delta_index = delta_index;
    }

    fn simulate_other_space(&mut self, shape: &Shape) {
        let shape_h = shape.h as i32;
        let mut x = self.x;
        let mut y = -shape_h;
        let mut delta_index = self.delta_index;

        while y + shape_h <= self.height {
            let new_x = x + self.deltas[delta_index];
            if shape_in_bounds(shape, new_x) && !self.map.test(shape, new_x, y) {
                x = new_x;
            }

            // Important this is here, before we potentially break below
            delta_index = if delta_index + 1 == self.deltas.len() {
                0
            } else {
                delta_index + 1
            };

            // If we're still in the empty space where we started, don't do the intersection
            if self.map.test(shape, x, y + 1) {
                break;
            }

            y += 1;
        }

        self.x = x;
        self.y = y;
        self.delta_index = delta_index;
    }

    fn update_map(&mut self) {
        while self.y < 0 {
            self.map.unshift(0);
            self.height += 1;
            self.y += 1
        }
    }

    fn run(&mut self, mut n: usize) -> i32 {
        while n > 0 {
            let mut rock = 0;
            while rock < SHAPES.len() && n > 0 {
                let shape = &SHAPES[rock];
                self.simulate_empty_space(shape);
                self.simulate_other_space(shape);
                self.update_map();
                self.map.set(shape, self.x, self.y);
                n -= 1;
                rock += 1;
            }
        }

        // self.map.dump(None, self.x, self.y);
        return self.height;
    }
}

fn main() {
    let data = fs::read_to_string("./17.in").expect("Should have been able to read the file");

    // Part 1
    data.lines()
        .map(|group| Simulator::new(group).run(2022))
        .for_each(|v| println!("{}", v));

    // Part 2
    data.lines()
        .map(|group| Simulator::new(group).run(1_000_000_000_000))
        .for_each(|v| println!("{}", v));
}
