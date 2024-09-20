const themes = {
	prairie: 'prairie',
	desert: 'desert',
	arctic: 'arctic',
	mountain: 'mountain',
};

Object.defineProperty(themes, Symbol.iterator, {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function* () {
		yield this.prairie;
		yield this.desert;
		yield this.arctic;
		yield this.mountain;
	},
});

export default themes;