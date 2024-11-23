import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";

export default [
	{
		name: "app/files-to-lint",
		files: ["**/*.{ts,mts,tsx,vue}"],
	},

	{
		name: "app/files-to-ignore",
		ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**"],
	},

	...pluginVue.configs["flat/essential"],
	...vueTsEslintConfig(),

	// force to add comma
	{
		name: "app/force-comma",
		rules: {
			"comma-dangle": ["error", "always-multiline"],
		},
	},

	// force to add semicolon
	{
		name: "app/force-semicolon",
		rules: {
			semi: ["error", "always"],
		},
	},
];
