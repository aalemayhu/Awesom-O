/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

    This file is what connects to chat and parses messages as they come along. The chat client connects via a
    Web Socket to Twitch chat. The important part events are onopen and onmessage.
*/

var chatClient = function chatClient(options){
  console.log('chatClient()');
    this.username = options.username;
    this.password = options.password;
    this.channel = options.channel;

    this.server = 'irc-ws.chat.twitch.tv';
    this.port = 443;
}

chatClient.prototype.open = function open(){
  console.log('.open');
    this.webSocket = new WebSocket('wss://' + this.server + ':' + this.port + '/', 'irc');

    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
    this.webSocket.onopen = this.onOpen.bind(this);
};

chatClient.prototype.onError = function onError(message){
    console.log('Error: ' + message);
};

/* This is an example of a leaderboard scoring system. When someone sends a message to chat, we store
   that value in local storage. It will show up when you click Populate Leaderboard in the UI.
*/
chatClient.prototype.onMessage = function onMessage(message){
  console.log("onMessage() ->"+message);
    if(message !== null){
        console.log('Got message: '+message);
        var parsed = this.parseMessage(message.data);
        if(parsed !== null){
            if(parsed.command === "PRIVMSG") {
              // TODO: load this from the configuration
              if (parsed.username !== "ccscanf") {
                alert("@"+parsed.username+"> "+parsed.message);
              }
                userPoints = localStorage.getItem(parsed.username);

                if(userPoints === null){
                    localStorage.setItem(parsed.username, 10);
                }
                else {
                    localStorage.setItem(parsed.username, parseFloat(userPoints) + 0.25);
                }
            } else if(parsed.command === "PING") {
                this.webSocket.send("PONG :" + parsed.message);
            }
        }
    }
};

chatClient.prototype.onOpen = function onOpen(){
  console.log('.onOpen()');
    var socket = this.webSocket;

    if (socket !== null && socket.readyState === 1) {
        console.log('Connecting and authenticating...');

        socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        socket.send('PASS ' + this.password);
        socket.send('NICK ' + this.username);
        socket.send('JOIN ' + this.channel);
    }
};

chatClient.prototype.onClose = function onClose(){
    console.log('Disconnected from the chat server.');
};

chatClient.prototype.close = function close(){
  console.log('.close()');
    if(this.webSocket){
        this.webSocket.close();
    }
};

/* This is an example of an IRC message with tags. I split it across
multiple lines for readability. The spaces at the beginning of each line are
intentional to show where each set of information is parsed. */

//@badges=global_mod/1,turbo/1;color=#0D4200;display-name=TWITCH_UserNaME;emotes=25:0-4,12-16/1902:6-10;mod=0;room-id=1337;subscriber=0;turbo=1;user-id=1337;user-type=global_mod
// :twitch_username!twitch_username@twitch_username.tmi.twitch.tv
// PRIVMSG
// #channel
// :Kappa Keepo Kappa

chatClient.prototype.parseMessage = function parseMessage(rawMessage) {
    var parsedMessage = {
        message: null,
        tags: null,
        command: null,
        original: rawMessage,
        channel: null,
        username: null
    };

    if(rawMessage[0] === '@'){
        var tagIndex = rawMessage.indexOf(' '),
        userIndex = rawMessage.indexOf(' ', tagIndex + 1),
        commandIndex = rawMessage.indexOf(' ', userIndex + 1),
        channelIndex = rawMessage.indexOf(' ', commandIndex + 1),
        messageIndex = rawMessage.indexOf(':', channelIndex + 1);

        parsedMessage.tags = rawMessage.slice(0, tagIndex);
        parsedMessage.username = rawMessage.slice(tagIndex + 2, rawMessage.indexOf('!'));
        parsedMessage.command = rawMessage.slice(userIndex + 1, commandIndex);
        parsedMessage.channel = rawMessage.slice(commandIndex + 1, channelIndex);
        parsedMessage.message = rawMessage.slice(messageIndex + 1);
    } else if(rawMessage.startsWith("PING")) {
        parsedMessage.command = "PING";
        parsedMessage.message = rawMessage.split(":")[1];
    }

    return parsedMessage;
}

module.chatClient = chatClient;
