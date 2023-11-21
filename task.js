import { json, lines } from "mrm-core";

export default function () {
	// ES6 arrow functions and template literals
	const updatePackageJson = (packageJson) => {
		packageJson
			.merge({
				scripts: {
					start: "node app.js",
				},
			})
			.save();
	};

	// Read and modify package.json using ES6 features
	const packageJson = json("package.json");
	updatePackageJson(packageJson);

	// Additional task logic
	// ...
}
