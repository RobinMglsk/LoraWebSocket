import Logger from './Logger.js';

export default class LoraWS {
	#websocket;
	#wsUri = 'ws://';
	#logger;

	RECEIVER_MAC_BEGIN = 0;
	RECEIVER_MAC_END = 5;
	SENDER_MAC_BEGIN = 6;
	SENDER_MAC_END = 11;
	PAYLOAD_ID_BEGIN = 12;
	PAYLOAD_ID_END = 13;
	PAYLOAD_LENGTH_BEGIN = 16;
	PAYLOAD_LENGTH_END = 16;
	PAYLOAD_BEGIN = 17;

	static #instance;

	constructor() {
		this.#logger = new Logger();
	}

	set wsUri(address) {
		if (address.substr(0, 5) === 'ws://' || address.substr(0, 6) === 'wss://') {
			this.#wsUri = address;
		} else {
			throw new Error('Address is not a valid websocket address');
		}
	}

	get wsUri() {
		return this.#wsUri;
	}

	get websocketOpen() {
		return this.#websocket && this.#websocket.close;
	}

	connect() {
		if (!this.websocketOpen) {
			this.#logger.debug('Opening websocket');
			this.#websocket = new WebSocket(this.#wsUri);

			this.#websocket.onopen = this.#onOpen.bind(this);
			this.#websocket.onclose = this.#onClose.bind(this);
			this.#websocket.onerror = this.#onError.bind(this);
			this.#websocket.onmessage = this.#onMessage.bind(this);
		} else {
			throw new Error('Websocket already opened');
		}
	}

	disconnect() {
		if (this.websocketOpen) {
			this.#websocket.close();
			this.#websocket = undefined;
		} else {
			this.#websocket = undefined;
			throw new Error('No websocket open');
		}
	}

	send(msg) {
		if (!this.websocketOpen) throw new Error('No websocket open');
		this.#websocket.send(msg);
	}

	#onOpen() {
		this.#logger.debug('Connected to:', this.#wsUri);

		if (typeof this.onOpen === 'function') this.onOpen();
	}

	#onClose(event) {
		this.#logger.debug('Disconnected from:', this.#wsUri);
		this.#websocket = undefined;

		if (typeof this.onClose === 'function') this.onClose(event);
	}

	#onError(event) {
		this.#logger.error('Websocket error');

		if (typeof this.onError === 'function') this.onError(event);
	}

	#onMessage(event) {
		this.#logger.debug('Msg received:', event.data);

		const data = JSON.parse(event.data);
		if (data.payload) {
			const decodedMsg = atob(data.payload);
			const byteNumbers = new Array(decodedMsg.length);
			for (let i = 0; i < decodedMsg.length; i++) {
				byteNumbers[i] = decodedMsg.charCodeAt(i);
			}
			const byteArray = new Uint8Array(byteNumbers);

			const payloadData = {
				senderAddress: this.#getSenderAddress(byteArray),
				receiverAddress: this.#getReceiverAddress(byteArray),
				msgId: this.#getMsgId(byteArray),
				msgLength: this.#getMsgLength(byteArray),
				msg: decodedMsg.substr(this.PAYLOAD_BEGIN),
			};

			payloadData.RSSI = data.RSSI ? data.RSSI : null;

			if (typeof this.onMessage === 'function') {
				this.#logger.debug('Sending payload data to callback:', payloadData);
				this.onMessage(payloadData);
			}
		}
	}

	#getSenderAddress(msg) {
		const macAddress = [];
		for (let i = this.SENDER_MAC_BEGIN; i <= this.SENDER_MAC_END; i++) {
			macAddress.push(msg[i].toString(16));
		}

		return macAddress.reverse().join(':');
	}

	#getReceiverAddress(msg) {
		const macAddress = [];
		for (let i = this.RECEIVER_MAC_BEGIN; i <= this.RECEIVER_MAC_END; i++) {
			macAddress.push(msg[i].toString(16));
		}

		return macAddress.reverse().join(':');
	}

	#getMsgId(msg) {
		let msgId = 0;
		for (let i = this.PAYLOAD_ID_BEGIN; i <= this.PAYLOAD_ID_END; i++) {
			msgId = (msgId << 8) | msg[i];
		}
		return msgId;
	}

	#getMsgLength(msg) {
		let msgLength = 0;
		for (let i = this.PAYLOAD_LENGTH_BEGIN; i <= this.PAYLOAD_LENGTH_END; i++) {
			msgLength = (msgLength << 8) | msg[i];
		}
		return msgLength;
	}

	static getInstance() {
		if (LoraWS.#instance === undefined) {
			LoraWS.#instance = new LoraWS();
		}

		return LoraWS.#instance;
	}
}
