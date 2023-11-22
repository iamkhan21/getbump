const fs = require("node:fs");
const path = require("node:path");

function splitString(str) {
	const regex = /^(.*\/)(\d+\.\d+\.\d+)(\/.*\.js)$/;
	const match = str.match(regex);

	if (match) {
		return {
			baseUrl: match[1],
			version: match[2],
			filePath: match[3],
		};
	}
	return null;
}

function getRequirePathConst(j) {
	return j.variableDeclaration("const", [
		j.variableDeclarator(
			j.identifier("path"),
			j.callExpression(j.identifier("require"), [j.literal("node:path")]),
		),
	]);
}

function getRequirePackageJsonConst(j) {
	return j.variableDeclaration("const", [
		j.variableDeclarator(
			j.identifier("packageJson"),
			j.callExpression(j.identifier("require"), [
				j.callExpression(
					j.memberExpression(j.identifier("path"), j.identifier("resolve")),
					[
						j.callExpression(j.identifier("process.cwd"), []),
						j.literal("package.json"),
					],
				),
			]),
		),
	]);
}

function isAlreadyModified(root, j) {
	const prodObject = root
		.find(j.ObjectExpression)
		.filter(
			(path) => path.parent.node.key && path.parent.node.key.name === "prod",
		);
	return prodObject.find(j.TemplateLiteral).size() > 0;
}

function addRequireStatements(root, j) {
	const requirePath = getRequirePathConst(j);
	const requirePackageJson = getRequirePackageJsonConst(j);

	root.find(j.Program).get("body", 0).insertBefore(requirePath);
	root.find(j.VariableDeclaration).at(0).insertAfter(requirePackageJson);
}

async function transformProdObject(j, root, microfrontends) {
	const prodObject = root
		.find(j.ObjectExpression)
		.filter(
			(path) => path.parent.node.key && path.parent.node.key.name === "prod",
		);

	const paths = prodObject.find(j.Property);

	for (const path of paths) {
		const key = path.node.key.name;
		const { baseUrl, version, filePath } = splitString(path.node.value.value);
		microfrontends[key] = version;
		path.node.value = j.templateLiteral(
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
					j.stringLiteral(key),
					true,
				),
			],
		);
	}
}

function updatePackageJson(microfrontends) {
	const packageJsonPath = path.resolve(process.cwd(), "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	packageJson.microfrontends = microfrontends;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

module.exports = async function transformer(file, api) {
	const j = api.jscodeshift;
	const root = j(file.source);

	if (isAlreadyModified(root, j)) {
		throw new Error("File already modified. Skipping transformation.");
	} else {
		const microfrontends = {};

		addRequireStatements(root, j);
		await transformProdObject(j, root, microfrontends);
		updatePackageJson(microfrontends);
		return root.toSource();
	}
};
