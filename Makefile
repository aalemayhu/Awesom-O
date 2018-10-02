run:
	electron .

package:
	./node_modules/.bin/electron-packager --icon assets/icons/Appicon.png.ico  .
