import Character from '../Character';

describe('Character', () => {
	test('shoul throw when class Character is created', () => {
		expect(() => {
			const character = new Character();
		}).toThrow();
	});
});