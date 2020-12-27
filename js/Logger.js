export default class Logger {

    outputEl = document.getElementById('logger');

    #debug = true;

	constructor(debug = true) {}

	debug(...msg) {
        if(!this.#debug) return;
        this.#log('debug', ...msg);
        this.#output('debug', ...msg);
    }

	log(...msg) {
        this.#log('log', ...msg);
        this.#output('log', ...msg);
    }

    info(...msg) {
        this.#log('info', ...msg);
        this.#output('info', ...msg);
    }

    warning(...msg) {
        this.#log('warning', ...msg);
        this.#output('warning', ...msg);
    }
    
	error(...msg) {
		this.#log('error', ...msg);
		this.#output('error', ...msg);
	}

	#log(level, ...msg) {
		switch (level) {
			case 'debug':
				console.debug(...msg);
				break;
			case 'error':
				console.error(...msg);
				break;
			case 'warning':
				console.warn(...msg);
				break;
			case 'info':
				console.info(...msg);
				break;
			default:
				console.log(...msg);
				break;
		}
    }
    
    #output(level, ...msg){
        if(!this.outputEl) return;

        const log = `${Date.now()}: [${level}] ${msg.join(' ')}\n`;
        this.outputEl.innerText = log+this.outputEl.innerText;
    }
}
