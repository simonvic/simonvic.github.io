hljs.registerLanguage("giovi", function() {
	const ESCAPE = {
		scope: "string.escape",
		match: /\\u[0-9a-fA-F]{4}|\\[btnfrs"'\\${}]/
	};
	const INTERPOLATION = {
		scope: "subst",
		begin: /\$\{/,
		end: /\}/
	};
	const INTERPOLATED_ID = {
		scope: "subst",
		match: /\$[a-zA-Z][a-zA-Z0-9_]*/
	};
	return {
		name: "Giovi",
		aliases: ["giovi"],
		case_insensitive: false,
		keywords: {
			keyword: [
				"if", "do", "else", "when", "for", "repeat", "break", "skip",
				"return", "default", "self", "function", "tuple", "record",
				"struct", "type", "var", "const", "alias", "import", "module"
			],
			literal: ["true", "false"],
			built_in: ["_out", "_err", "_in"],
			operator: ["not", "and", "or", "in", "is", "as"],
		},
		contains: [
			{
				scope: "comment.documentation",
				begin: /#\{\?/,
				end: /\}#/
			},
			{
				scope: "comment",
				begin: /#\{/,
				end: /\}#/
			},
			{
				scope: "comment.documentation",
				begin: /#\?/,
				end: /$/
			},
			{
				scope: "comment",
				begin: /#/,
				end: /$/
			},
			{
				scope: "string.double",
				begin: /"\{/,
				end: /\}"/,
				contains: [ESCAPE, INTERPOLATION, INTERPOLATED_ID]
			},
			{
				scope: "string.double",
				begin: /"/,
				end: /"/,
				contains: [ESCAPE, INTERPOLATION, INTERPOLATED_ID]
			},
			{
				scope: "string.single",
				begin: /'\{/,
				end: /\}'/,
				contains: [ESCAPE]
			},
			{
				scope: "string.single",
				begin: /'/,
				end: /'/,
				contains: [ESCAPE]
			},
			{
				scope: "type",
				match: /\b(Natural|Int|Real|Text|Void|Bool|Type|Function|Tuple|Record|Struct|Module)\b/
			},
			{
				scope: "number.float",
				match: /\b([0-9][0-9_]*(r|\.[0-9][0-9_]*(e[+-]?[0-9]+)?r?|e[+-]?[0-9]+r?)|0x[0-9a-fA-F][0-9a-fA-F_]*(e[+-]?[0-9]+)?p[+-]?[0-9]+r?)/,
			},
			{
				scope: "number.natural",
				match: /\b([1-9][0-9_]*|0x[0-9a-fA-F][0-9a-fA-F_]*|0b[01][01_]*|0o[0-7][0-7_]*|0)n/
			},
			{
				scope: "number.integer",
				match: /\b([1-9][0-9_]*|0x[0-9a-fA-F][0-9a-fA-F_]*|0b[01][01_]*|0o[0-7][0-7_]*|0)i?/
			},
			{
				scope: "operator",
				match: /->[+\-*\/]?|<-|[+\-*\/]<-|\*\*|&&|\|\|\|?|\{>>?\}|\{<\}|::|<=|>=|~=|=\~|=>|!=|!!|[=!&|+\-*\/%^@<>]/
			},
			{
				scope: "punctuation",
				match: /\.\.|[.,:;()\[\]{}]/
			},
			{
				scope: "title.function",
				match: /\b[a-z][a-zA-Z0-9_]*(?=\s*\()/
			},
			{
				scope: "constant",
				match: /\b[A-Z][A-Z0-9_]*\b/
			},
			{
				scope: "title.class",
				match: /\b[A-Z][a-zA-Z0-9_]+\b/
			},
			{
				scope: "built_in",
				match: /\b_[a-zA-Z0-9_]+\b/
			},
			{
				scope: "variable.language",
				match: /\b_\b/
			}
		]
	};
});

