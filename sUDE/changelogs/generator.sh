#!/bin/bash

verbosity=0

##
# Generate changelogs
# @param xml changelog file
# @param targets "github discord steam"
# @return md changelog file
function generate() {
	local xmlFile=$1
	local targets=$2
	local count=$(xmllint "$xmlFile" --xpath "count(//changelog)")
	for i in $(seq $count); do
		local xmlChangelog=$(xmllint "$xmlFile" --xpath "//changelog[position()=last()]")
		for target in $targets; do
			case "$target" in
				github) generate_github "$xmlChangelog" ;;
				discord) generate_discord "$xmlChangelog" ;;
				steam) generate_steam "$xmlChangelog" ;;
			esac
		done
		break
	done
}

##
# Generate a single changelog for discord
# @param xml changelog
# @param md changelog
function generate_github() {
	:
	# printf "%s\n%s\n" "github" "$1"
}

##
# Generate a single changelog for discord
# @param xml changelog
# @param md changelog
function generate_discord() {
	local xml=$1
	local mod=$(discord_parseMod "$xml")
	local tag=$(discord_parseTag "$xml")
	local type=$(discord_parseType "$xml")
	local date=$(discord_parseDate "$xml")
	local preamble=$(discord_parsePreamble "$xml")
	local changes=$(discord_parseChanges "$xml")
	printf "%s\n" "
> $mod | $tag | $type | $date
$preamble
$changes
"
}

function discord_parseMod() {
	local mod=$(xmllint --xpath "/changelog/mod/text()" - <<< "$1")
	case "$mod" in
		sFramework) printf "%s" "#s_framework" ;;
		sVisual) printf "%s" "#s_visual" ;;
		sGunplay) printf "%s" "#s_gunplay" ;;
		*) printf "%s" "$mod" ;;
	esac
}

function discord_parseTag() {
	local tag=$(xmllint --xpath "/changelog/tag/text()" - <<< "$1")
	printf "%s" "**$tag**"
}

function discord_parseType() {
	local type=$(xmllint --xpath "/changelog/type/text()" - <<< "$1")
	case "${type,,}" in
		major) printf "%s" "**Major**" ;;
		minor) printf "%s" "minor" ;;
		hotfix) printf "%s" "__hotfix__" ;;
		*) printf "%s" "$type"
	esac
}

function discord_parseDate() {
	local date=$(xmllint --xpath "/changelog/date/text()" - <<< "$1")
	local epoch=$(date --date "$date" +%s)
	printf "%s" "<t:$epoch:R>"
}

function discord_parsePreamble() {
	local preamble=$(xmllint --xpath "/changelog/preamble" - <<< "$1")
	preamble=$(toMarkdown "$preamble")
	preamble=$(xmllint --xpath "/preamble/text()" - <<< "$preamble")
	printf "%s" "$preamble"
}

function discord_parseChanges() {
	local changes=$(xmllint --xpath "/changelog/changes" - <<< "$1")
	changes=$(toMarkdown "$changes")
	changes=$(xmllint --xpath "/*/text()" - <<< "$changes")
	printf "%s" "$changes"
}

function toMarkdown() {
	local text=$1
	text=$(sed 's|^\t*||g' - <<< "$text") # incidental indents
	text=$(sed -z 's|\n||g' - <<< "$text") # newline
	text=$(sed 's|<b>\(.*\)</b>|**\1**|g' - <<< "$text") # bold
	text=$(sed 's|<i>\(.*\)</i>|*\1*|g' - <<< "$text") # italic
	text=$(sed 's|<u>\(.*\)</u>|__\1__|g' - <<< "$text") # underline
	# text=$(sed 's|<br\s*/>|\n|g' - <<< "$text") # newline
	printf "%s" "$text"
}

##
# Generate a single changelog for discord
# @param xml changelog
# @param md changelog
function generate_steam() {
	:
	# printf "%s\n%s\n" "steam" "$1"
}

OPTIONS=(
	"h,help            --Print this page and exit"
	"v,verbose         --Be verbose. Can be repeated for more verbosity"
	"g,github          --Generate changelogs for github"
	"d,discord         --Generate changelogs for discord"
	"s,steam           --Generate changelogs for steam"
	"i,input:xml       --Input changelogs file. Default: ./changelogs.xml"
	"o,output-dir:dir  --Specify output directory. Default: ./generated"
)
_OPTIONS=$(declare -p OPTIONS)

function printUsage() {
	mangen \
		--name "${0##*/}" \
		--options "$_OPTIONS" \
		--command-width 25 \
		--description-width 50 \
		--new-line-indent 4
}

function setupLaunchParameters() {
	local parsedArgs=$(getopt -n "${0##*/}" -o $(mangen -so "$_OPTIONS") --long $(mangen -lo "$_OPTIONS") -- "$@")
	if [ "$?" != "0" ]; then
		printUsage
		exit 1
	fi
	eval set -- "$parsedArgs"
	while true; do
		case $1 in
			-h | --help) printUsage; exit 1 ;;
			-v | --verbose) ((verbosity++)) ;;
            -g | --github) TARGETS+=" github" ;; 
            -d | --discord) TARGETS+=" discord" ;;
            -s | --steam) TARGETS+=" steam" ;; 
			--)
				shift
				break
				;;
			*)
				printUsage
				echo "Invalid option: $1"
				exit 1
				;;
		esac
		shift #go to next arg
	done

}
setupLaunchParameters "$@"

: ${OUTPUT_DIR:=generated}
: ${INPUT:=changelogs.xml}
: ${TARGETS:=github discord steam}

mkdir -p "$OUTPUT_DIR"
generate "$INPUT" "$TARGETS"

