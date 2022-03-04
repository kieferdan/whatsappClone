import { ClassEvent } from "../utils/ClassEvent";

export class MicrophoneController extends ClassEvent {

    constructor() {

        super();

        this._mimetype = 'audio/webm'

        this._available = false;

        navigator.mediaDevices.getUserMedia({
            audio: true
        }).then(stream => {
            
            this._available = true;

            this._stream = stream;

            this.trigger('ready', this._stream);
        }).catch(err => {
            console.error(err);
        });
    }

    isAvailable() {
        return this._available;
    }

    stop() {
        this._stream.getTracks().forEach(track => {
            track.stop();
        });
    }

    startRecorder() {

        if (this.isAvailable()) {

            this._mediaRecorder = new MediaRecorder(this._stream, {
                mimeType: this._mimetype
            });

            this._recordedChuncks = [];

            this._mediaRecorder.addEventListener('dataavailable', e => {
                if (e.data.size > 0) this._recordedChuncks.push(e.data);
            });

            this._mediaRecorder.addEventListener('stop', e => {

                // blob = binary large object
                let blob = new Blob(this._recordedChuncks, {
                    type: this._mimetype
                });

                let filename = `rec${Date.now()}.webm`;

                let audioContext = new AudioContext();

                let reader = new FileReader();

                reader.onload = e => {

                    audioContext.decodeAudioData(reader.result).then(decode => {

                        let file = new File([blob], filename, {
                        
                            type: this._mimetype,
                            lastModified: Date.now()
                        });

                        this.trigger('recorded', file, decode);
                    });
                };

                reader.readAsArrayBuffer(blob);
            });

            this._mediaRecorder.start();
            this.startTimer();
        }
    }

    stopRecorder() {

        if (this.isAvailable()) {
            
            this._mediaRecorder.stop();
            this.stopTimer();
            this.stop();
        }
    }

    startTimer() {
        let start = Date.now();

        this._recordMicrophoneInterval = setInterval(()=> {
            this.trigger('recordtimer', Date.now() - start);
        }, 100); // 100 = 10x por segundo
    }

    stopTimer() {
        clearInterval(this._recordMicrophoneInterval);
    }
}