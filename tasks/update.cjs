const fs = require("node:fs");
const path = require("node:path");

module.exports = function (fileInfo, api, options) {
	// Configuration mapping old names to new names
	const nameMapping = options.correctNames || {};

	if (Object.keys(nameMapping).length === 0) {
		throw new Error("No name mapping provided");
	}

	// Read and parse package.json
	const packageJsonPath = path.resolve(process.cwd(), "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

	// Update microfrontends keys in package.json
	for (const oldKey of Object.keys(nameMapping)) {
		if (packageJson.microfrontends?.[oldKey]) {
			const version = packageJson.microfrontends[oldKey];

			delete packageJson.microfrontends[oldKey];

			packageJson.microfrontends[nameMapping[oldKey]] = version;
		}
	}

	// Write the updated package.json back to the file
	fs.writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJson, null, 2),
		"utf8",
	);

	const j = api.jscodeshift;
	const root = j(fileInfo.source);

	// Traverse the AST to find the relevant MemberExpressions
	// biome-ignore lint: forEach is inbuilt method to iterate nodes
	root
		.find(j.MemberExpression, {
			object: {
				name: "packageJson",
			},
			property: {
				name: "microfrontends",
			},
		})
		.forEach((path) => {
			// Check if the parent is a MemberExpression and the property is a Literal
			const parentPath = path.parentPath;
			if (
				parentPath.value.type === "MemberExpression" &&
				parentPath.value.property.type === "Literal"
			) {
				const oldKey = parentPath.value.property.value;
				// Replace the old key with the new key, if it's in the nameMapping
				if (nameMapping[oldKey]) {
					parentPath.value.property.value = nameMapping[oldKey];
				}
			}
		});

	return root.toSource({ quote: "single" });
};
