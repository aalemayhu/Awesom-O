ELECTRON_PACKAGER=./node_modules/.bin/electron-packager
ICON_FILE=assets/icons/mac/icon.icns

install_deps:
	npm install .
	pip install pyjokes

run:
	electron .

package:
	 ${ELECTRON_PACKAGER} --overwrite --icon=${ICON_FILE} .

darwin:
	${ELECTRON_PACKAGER} . --overwrite --platform=darwin --arch=x64 --icon=${ICON_FILE} --prune=true --out=release-builds

purge:
	rm ~/twitch-bot-cache/data.json
