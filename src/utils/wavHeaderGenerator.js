const sampleRate = 44100;
const bitDepth = 16;

// audioFile << "fmt ";
//     writeToFile(audioFile, 16, 4); // Size
//     writeToFile(audioFile, 1, 2); // Compression code
//     writeToFile(audioFile, 1, 2); // Number of channels
//     writeToFile(audioFile, sampleRate, 4); // Sample rate
//     writeToFile(audioFile, sampleRate * bitDepth / 8, 4 ); // Byte rate
//     writeToFile(audioFile, bitDepth / 8, 2); // Block align
//     writeToFile(audioFile, bitDepth, 2); // Bit depth


function buildWaveHeader(opts) {
    var numFrames = opts?.numFrames || 1;
    var numChannels = opts?.numChannels || 2;
    var sampleRate = opts?.sampleRate || 44100;
    var bytesPerSample = opts?.bytesPerSample || 2;
    var blockAlign = numChannels * bytesPerSample;

    var byteRate = sampleRate * blockAlign;
    var dataSize = numFrames * blockAlign;

    var buffer = new ArrayBuffer(162);
    var dv = new DataView(buffer);

    var p = 0;

    function writeString(s) {
        for (var i = 0; i < s.length; i++) {
            dv.setUint8(p + i, s.charCodeAt(i));
        }
        p += s.length;
    }

    function writeUint32(d) {
        dv.setUint32(p, d, true);
        p += 4;
    }

    function writeUint16(d) {
        dv.setUint16(p, d, true);
        p += 2;
    }

    writeString('RIFF');              // ChunkID
    writeUint32(dataSize + 36);       // ChunkSize
    writeString('WAVE');              // Format
    writeString('fmt ');              // Subchunk1ID
    writeUint32(16);                  // Subchunk1Size
    writeUint16(1);                   // AudioFormat
    writeUint16(numChannels);         // NumChannels
    writeUint32(sampleRate);          // SampleRate
    writeUint32(byteRate);            // ByteRate
    writeUint16(blockAlign);          // BlockAlign
    writeUint16(bytesPerSample * 8);  // BitsPerSample
    writeString('data');              // Subchunk2ID
    writeUint32(dataSize);            // Subchunk2Size

    return buffer;
}