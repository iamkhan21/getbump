const fs = require("node:fs");
const path = require("node:path");

function createUrl(j, type, config) {
	let urlTemplate;

	switch (type) {
		case "local":
			urlTemplate = `http://localhost:3000/${config.scriptName}`;
			break;
		case "dev":
		case "stage": {
			const environmentPrefix = type === "dev" ? "dev-" : "qa-";
			urlTemplate = `https://${environmentPrefix}${config.domain}/${config.host}/${config.scriptName}`;
			break;
		}
		case "prod": {
			const [baseUrl, filePath] = config.prodUrl.split(config.version);
			return j.templateLiteral(
				[
					j.templateElement({ raw: baseUrl, cooked: baseUrl }, false),
					j.templateElement({ raw: filePath, cooked: filePath }, true),
				],
				[
					j.memberExpression(
						j.memberExpression(
							j.identifier("packageJson"),
							j.identifier("microfrontends"),
						),
						j.stringLiteral(config.repo),
						true,
					),
				],
			);
		}
		default:
			throw new Error(`Unknown type: ${type}`);
	}

	return j.stringLiteral(`${config.alias}@${urlTemplate}`);
}

function addMicrofrontend(config) {
	const packageJsonPath = path.resolve(process.cwd(), "package.json");

	// Read package.json
	fs.readFile(packageJsonPath, "utf8", (err, data) => {
		if (err) {
			console.error("Error reading package.json:", err);
			return;
		}

		try {
			const packageJson = JSON.parse(data);

			// Ensure microfrontends object exists
			if (!packageJson.microfrontends) {
				packageJson.microfrontends = {};
			}

			// Add the new microfrontend
			packageJson.microfrontends[config.repo] = config.version;

			// Write the updated package.json back to file
			fs.writeFile(
				packageJsonPath,
				JSON.stringify(packageJson, null, 2),
				"utf8",
				(writeErr) => {
					if (writeErr) {
						console.error("Error writing package.json:", writeErr);
						return;
					}
					console.log(`Microfrontend '${config.repo}' added successfully.`);
				},
			);
		} catch (parseErr) {
			console.error("Error parsing package.json:", parseErr);
		}
	});
}

function parseProductionUrl(url) {
	const pattern = /^(.*?)@https?:\/\/(.*?)\/(.*?)\/(\d+\.\d+\.\d+)\/(.*?\.js)$/;
	const match = url.match(pattern);

	if (match) {
		const [, alias, domain, host, version, scriptName] = match;
		return { alias, domain, host, version, scriptName };
	}

	return null;
}

module.exports = function (fileInfo, api, options) {
	const j = api.jscodeshift;
	const root = j(fileInfo.source);

	const parsedUrl = parseProductionUrl(options.meta.url);

	if (!parsedUrl) {
		throw new Error(`Invalid URL: ${options.meta.url}`);
	}

	const config = {
		...parsedUrl,
		repo: options.meta.repo,
		prodUrl: options.meta.url,
	};

	addMicrofrontend(config);

	for (const env of ["local", "dev", "stage", "prod"]) {
		// biome-ignore lint: forEach is inbuilt method to iterate nodes
		root
			.find(j.ObjectExpression)
			.filter(
				(path) => path.parent.node.key && path.parent.node.key.name === env,
			)
			.forEach((path) => {
				path.value.properties.push(
					j.objectProperty(
						j.identifier(config.alias),
						createUrl(j, env, config),
					),
				);
			});
	}

	return root.toSource();
};
