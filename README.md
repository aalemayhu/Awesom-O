# Awesom-o

A Twitch bot to receive chat messages as native notifications on macOS.

This app was mostly built live on [Twitch][c]. Hour long videos available on
[YouTube][0].

## Releases

Builds for Windows, Linux and macOS are availble, please visit the [release
page][1].

## Running locally

    make install_deps
    make run

or

	git clone https://github.com/scanf/Awesom-o /tmp/Awesom-o && \
	npm install /tmp/Awesom-o && \
	electron /tmp/Awesom-o

## Features

The bot supports adding user defined commands which could be values like your
Twitter profile URL or text files to show what music is currently being played.

## Screenshots

![Commands](Screenshots/commands.png)
![Configure](Screenshots/configure.png)
![New command](Screenshots/new-command.png)

## License

[CC0 1.0 (Public Domain)](LICENSE.md)

[c]: https://www.twitch.tv/ccscanf
[0]: https://www.youtube.com/playlist?list=PL6ETvzpSGtt3XnmnBtmAldrpGA0lK6uAG
[1]: https://github.com/scanf/Awesom-o/releases
