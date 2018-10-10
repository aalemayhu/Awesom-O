ELECTRON_PACKAGER=electron-packager
ELECTRON_INSTALLER_DMG=electron-installer-dmg
BACKGROUND_FILE=$(shell pwd)/assets/background.png
ICON_FILE=$(shell pwd)/assets/icons/mac/icon.icns
INSTALLER_ICON_FILE=$(shell pwd)/assets/icons/png/48x48.png
NEW_VERSION ?=$(shell git describe --tags --dirty)
REPOSITORY=scanf/awesom-o

install_deps:
	npm install .
	pip install pyjokes

run:
	electron .

clean:
	-rm -rvf Awesom-O* 
	-rm -rvf release-builds 
	-rm -rvf dist 
	-rm *.zip
	mkdir -pv dist

version:
	npm version -f ${NEW_VERSION}

macOS: 
	${ELECTRON_PACKAGER} --icon=${ICON_FILE} . Awesom-O --platform darwin --arch x64 --out .
	${ELECTRON_INSTALLER_DMG} --icon=${INSTALLER_ICON_FILE} \
	  --background=${BACKGROUND_FILE} Awesom-O-darwin-x64/Awesom-O.app/ Awesom-O

linux: 
	electron-packager . Awesom-O --platform linux --arch x64 --out .
	electron-installer-debian --src Awesom-O-linux-x64/ --dest . --arch amd64

windows: 
	electron-packager . Awesom-O --platform win32 --arch x64 --out .

all_platforms: clean linux windows macOS
	zip -9 dist/Awesom-O_0.0.7_amd64.deb.zip Awesom-O_0.0.7_amd64.deb
	zip -9 dist/Awesom-O.dmg.zip Awesom-O.dmg
	zip -r -9 dist/Awesom-O-win32-x64.zip Awesom-O-win32-x64

prerelease: version all_platforms
	githubrelease release ${REPOSITORY} create ${NEW_VERSION} --publish --name "Awesom-o ${NEW_VERSION}" "dist/*"

darwin:
	${ELECTRON_PACKAGER} . --overwrite --platform=darwin --arch=x64 --icon=${ICON_FILE} --prune=true --out=release-builds

purge:
	rm ~/twitch-bot-cache/data.json
