/**
 * @depends ../core/AudioletNode.js
 */

var Delay = new Class({
    Extends: AudioletNode,
    initialize: function(audiolet, maximumDelayTime, delayTime) {
        AudioletNode.prototype.initialize.apply(this, [audiolet, 2, 1]);
        this.linkNumberOfOutputChannels(0, 0);
        this.maximumDelayTime = maximumDelayTime;
        this.delayTime = new AudioletParameter(this, 1, delayTime || 1);
        var bufferSize = maximumDelayTime * this.audiolet.device.sampleRate;
        this.buffers = [];
        this.readWriteIndex = 0;
    },

    generate: function(inputBuffers, outputBuffers) {
        var inputBuffer = inputBuffers[0];
        var outputBuffer = outputBuffers[0];

        if (inputBuffer.isEmpty) {
            outputBuffer.isEmpty = true;
            return;
        }

        // Local processing variables
        var maximumDelayTime = this.maximumDelayTime;
        var sampleRate = this.audiolet.device.sampleRate;

        var delayTimeParameter = this.delayTime;
        var delayTime, delayTimeChannel;
        if (delayTimeParameter.isStatic()) {
            delayTime = Math.floor(delayTimeParameter.getValue() * sampleRate);
        }
        else {
            delayTimeChannel = delayTimeParameter.getChannel();
        }

        var buffers = this.buffers;
        var readWriteIndex = this.readWriteIndex;

        var inputChannels = [];
        var outputChannels = [];
        var numberOfChannels = inputBuffer.numberOfChannels;
        for (var i = 0; i < numberOfChannels; i++) {
            inputChannels.push(inputBuffer.getChannelData(i));
            outputChannels.push(outputBuffer.getChannelData(i));
            // Create buffer for channel if it doesn't already exist
            if (i >= buffers.length) {
                var bufferSize = maximumDelayTime * sampleRate;
                buffers.push(new Float32Array(bufferSize));
            }
        }


        var bufferLength = inputBuffer.length;
        for (var i = 0; i < bufferLength; i++) {
            if (delayTimeChannel) {
                delayTime = Math.floor(delayTimeChannel[i] * sampleRate);
            }

            for (var j = 0; j < numberOfChannels; j++) {
                var inputChannel = inputChannels[j];
                var outputChannel = outputChannels[j];
                var buffer = buffers[j];
                outputChannel[i] = buffer[readWriteIndex];
                buffer[readWriteIndex] = inputChannel[i];
            }

            readWriteIndex += 1;
            if (readWriteIndex >= delayTime) {
                readWriteIndex = 0;
            }
        }
        this.readWriteIndex = readWriteIndex;
    },

    toString: function() {
        return 'Delay';
    }
});

