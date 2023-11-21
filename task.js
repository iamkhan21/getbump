const { lines, json } = require("mrm-core");

module.exports = function () {
	// ES6 arrow functions and template literals
	const updatePackageJson = (packageJson) => {
		packageJson
			.merge({
				microfrontends: {},
			})
			.save();
	};

	// Read and modify package.json using ES6 features
	const packageJson = json("package.json");
	updatePackageJson(packageJson);

	// Additional task logic
	// ...
};
