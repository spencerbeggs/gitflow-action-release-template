import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import builtins from "builtin-modules/static";
import { join } from "path";
import license from "rollup-plugin-license";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const { NODE_ENV = "development" } = process.env;
const isProduction = NODE_ENV === "production";
const extensions = [".js", ".jsx", ".ts", ".tsx", ".cjs", ".mjs", ".node"];
export default {
	input: pkg.module,
	output: {
		file: "./dist/index.mjs",
		format: "esm",
		sourcemap: !isProduction,
		exports: "default",
	},
	external: [
		...builtins,
		"@apollo/client/core",
		"@graphql-typed-document-node/core",
		...Object.keys(pkg.dependencies || {}),
	],
	watch: {
		clearScreen: false,
		include: "src/**",
	},
	treeshake: {
		moduleSideEffects: "no-external",
	},
	plugins: [
		isProduction &&
			license({
				sourcemap: true,
				banner: {
					commentStyle: "regular", // The default
					content: {
						file: join(__dirname, "LICENSE"),
						encoding: "utf-8", // Default is utf-8
					},
				},
				thirdParty: {
					includePrivate: true, // Default is false.
					output: {
						file: join(__dirname, "dist", "dependencies.txt"),
						encoding: "utf-8", // Default is utf-8.
					},
				},
			}),
		isProduction &&
			replace({
				"process.env.NODE_ENV": JSON.stringify(NODE_ENV),
				"process.env.GITHUB_TOKEN": null,
				"process.env.APP_ENV": null,
			}),
		babel({ extensions, include: ["src/**/*"], babelHelpers: "bundled" }),
		typescript({
			target: "ES2020",
			module: "CommonJS",
			sourceMap: !isProduction,
			preserveConstEnums: false,
			noEmitOnError: false,
		}),
		resolve({
			rootDir: join(process.cwd(), "../dist"),
			mainFields: ["module", "main"],
			preferBuiltins: true,
		}),
		commonjs({
			extensions,
			transformMixedEsModules: true,
		}),
		json(),
		isProduction &&
			terser({
				format: {
					comments: false,
				},
			}),
	],
};
