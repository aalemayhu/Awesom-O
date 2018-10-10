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

package: clean
	${ELECTRON_PACKAGER} --overwrite --icon=${ICON_FILE} .
	${ELECTRON_INSTALLER_DMG} --icon=${INSTALLER_ICON_FILE} \
	  --background=${BACKGROUND_FILE} Awesom-O-darwin-x64/Awesom-O.app/ dist/Awesom-O

package_linux: clean
	electron-packager . Awesom-O --platform linux --arch x64 --out .
	electron-installer-debian --src Awesom-O-linux-x64/ --dest dist --arch amd64

all_platforms: clean
	${ELECTRON_PACKAGER} --platform=all --overwrite .
	#zip -r -9 dist/Awesom-O-linux-x64.zip Awesom-O-linux-x64
	#zip -r -9 dist/Awesom-O-mas-x64.zip Awesom-O-mas-x64
	zip -r -9 dist/Awesom-O-win32-x64.zip Awesom-O-win32-x64

prerelease: version all_platforms
	githubrelease release ${REPOSITORY} create ${NEW_VERSION} --publish --name "Awesom-o ${NEW_VERSION}" "dist/*"

darwin:
	${ELECTRON_PACKAGER} . --overwrite --platform=darwin --arch=x64 --icon=${ICON_FILE} --prune=true --out=release-builds

purge:
	rm ~/twitch-bot-cache/data.json
