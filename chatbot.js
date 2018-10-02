/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

    This file is what connects to chat and parses messages as they come along. The chat client connects via a
    Web Socket to Twitch chat. The important part events are onopen and onmessage.
*/

const tmi = require('tmi.js')

function chatClient(options){
  let opts = {
    identity: {
      username: options.username,
      password: options.password
    },
    channels: [
      options.channel
    ]
  }
  return tmi.client(opts);
}

module.exports = chatClient;
