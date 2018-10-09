ELECTRON_PACKAGER=electron-packager
ICON_FILE=$(shell pwd)/assets/icons/mac/icon.icns
NEW_VERSION ?=$(shell git describe --tags --dirty)

install_deps:
	npm install .
	pip install pyjokes

run:
	electron .

clean:
	-rm -rvf Awesom-O* release-builds

package: clean
	npm version -f ${NEW_VERSION}
	${ELECTRON_PACKAGER} --overwrite --icon=${ICON_FILE} .

all_platforms:
	 ${ELECTRON_PACKAGER} --platform=all --overwrite .
	 zip -r Awesom-O/Awesom-O-linux-x64 Awesom-O/Awesom-O-linux-x64
	 zip -r Awesom-O/Awesom-O-mas-x64 Awesom-O/Awesom-O-mas-x64
	 zip -r Awesom-O/Awesom-O-win32-x64 Awesom-O/Awesom-O-win32-x64

darwin:
	${ELECTRON_PACKAGER} . --overwrite --platform=darwin --arch=x64 --icon=${ICON_FILE} --prune=true --out=release-builds

purge:
	rm ~/twitch-bot-cache/data.json
