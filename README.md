This is the semi-annual release channel for Validana. For the latest version contact us via info@coinversable.com.

About Validana.io
=================

Validana is a high performance decentralized data storage and processing environment for governments, educational institutes and businesses based on **blockchain technology**. Our permissioned approach allows the speed and flexibility of traditional systems whilst enabling organizations and individuals to independently verify transactions and processes. Validana is 100% open-source and released under the AGPLv3 license.

Validana is already in use in many business to business blockchain applications and has been under active development since early 2017 by the Dutch company [Coinversable](https://coinversable.com). After a lot of testing and tweaking all Validana source code was fully open-sourced in June 2018.


Please visit [https://validana.io](https://validana.io) for more information.

For **commercial support**, licensing options or any inquiries about what Validana can do for your business please contact us directly via info@coinversable.com.

How it works
============
Validana was developed specifically for business to business, educational and government applications where a trusted context exists but the need for transparency and verifiability arises. 

Validana can best be compared to a permissioned blockchain with a single miner which we call the [**validana-processor**](https://github.com/coinversable/validana-processor). When you configure a Validana environment you can choose who you want to allow to participate as [**validana-node**](https://github.com/coinversable/validana-node), from the entire world to just a select group of individuals. Nodes connect to each other and obtain a full copy of the transaction history to independently verify all transactions and the transaction logic within the network. Each transaction is securely signed at their origin by the [**validana-client**](https://github.com/coinversable/validana-client). The client locally signs the transaction and communicates the payload to the [**validana-server**](https://github.com/coinversable/validana-server) over a secure WebSocket or REST connection. The server sends the signed payload to the processor, which in turn will execute the corresponding **Smart Contracts** and either accept or reject the transaction. The server will listen for transaction status changes and notify the client on success or failure. By default the processor will process all pending transactions every 5 seconds. Each action the processor takes can be independently verified by the nodes. Validana's hybrid blockchain approach allows for very fast block creation and validation, processing hundreds of transactions within 5 second block-time without energy consuming consensus algorithms.

All Validana packages and smart contracts are entirely written in Typescript / Javascript which makes code re-use a key feature of Validana. The [**validana-core**](https://github.com/coinversable/validana-core) package for instance contains common code between the node and the processor. Validana makes extensive use of technologies which are well known in the web development community such as Typescript, Promises, Node.js, REST and WebSockets. Validana is easy to understand and easy to implement for developers with experience related to web development.


The Validana Client (This package)
==================================
The Validana Client repository contains components needed for interacting with the Validana Server through a WebSocket. It is not meant to be run standalone, but for convenience a html file is included to demo basic functions. It can either be installed as an npm package (dependency: "validana-client":"git+ssh://git@github.com:Coinversable/validana-client.git", also suitable for Node.js) or bundle.js can be included as script on the webpage, in which case everything will be available under window.Validana. The Validana Client assumes an es6 compatible environment. In case es5 needs to be supported polyfills should be used, however transpiling is not needed.

Setup Development environment
-----------------------------
1. Install Node.js if you want to extend it as a server application. (https://nodejs.org/en/download/)
2. Install yarn (https://yarnpkg.com/en/docs/install)

Setup Validana Client
---------------------
1. Make sure the development environment is setup.
2. Clone the project with git.
3. Navigate to project root.
4. Run `yarn install`
5. (Optional) Run `yarn link validana-client` if you also have Validana Client linked.

Build Validana Client
---------------------
1. Make sure the project is setup.
2. Navigate to project root.
3. Run `yarn build`