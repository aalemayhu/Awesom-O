ELECTRON_PACKAGER=electron-packager
ICON_FILE=$(shell pwd)/assets/icons/mac/icon.icns

install_deps:
	npm install .
	pip install pyjokes

run:
	electron .

clean:
	-rm -rvf Awesom-O-* release-builds

package: clean
	 ${ELECTRON_PACKAGER} --overwrite --icon=${ICON_FILE} .

all_platforms:
	 ${ELECTRON_PACKAGER} --platform=all --overwrite .

darwin:
	${ELECTRON_PACKAGER} . --overwrite --platform=darwin --arch=x64 --icon=${ICON_FILE} --prune=true --out=release-builds

purge:
	rm ~/twitch-bot-cache/data.json
