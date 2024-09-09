import { randomFromRange } from './utils';

export default function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const level = randomFromRange(1, maxLevel);
    const index = randomFromRange(0, allowedTypes.length - 1);

    yield new allowedTypes[index](level);
  }
}
