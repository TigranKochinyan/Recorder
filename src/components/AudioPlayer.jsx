import React, { useState, useEffect, useMemo, useRef } from 'react';

function buildWaveHeader(opts) {
    var numFrames = opts?.numFrames || 1;
    var numChannels = opts?.numChannels || 2;
    var sampleRate = opts?.sampleRate || 44100;
    var bytesPerSample = opts?.bytesPerSample || 2;
    var blockAlign = numChannels * bytesPerSample;

    var byteRate = sampleRate * blockAlign;
    var dataSize = numFrames * blockAlign;

    var buffer = new ArrayBuffer(162); // 44
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


export const encodeHeader = (
    dataView,
    bitRate = 64000,
    numberOfChannels = 1,
    numberOfSamples = 1,
    sampleRate = 44100
  ) => {
  const bytesPerSample = bitRate >> 3; // tslint:disable-line:no-bitwise
  /*
   * The maximum size of a RIFF file is 4294967295 bytes and since the header takes up 44 bytes there are 4294967251 bytes left for the
   * data chunk.
   */
  const dataChunkSize = Math.min(numberOfSamples * numberOfChannels * bytesPerSample, 4294967251);

  dataView.setUint32(0, 1380533830); // That's the integer representation of 'RIFF'.
  dataView.setUint32(4, dataChunkSize + 36, true);
  dataView.setUint32(8, 1463899717); // That's the integer representation of 'WAVE'.
  dataView.setUint32(12, 1718449184); // That's the integer representation of 'fmt '.
  dataView.setUint32(16, 16, true);
  dataView.setUint16(20, 1, true);
  dataView.setUint16(22, numberOfChannels, true);
  dataView.setUint32(24, sampleRate, true);
  dataView.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
  dataView.setUint16(32, numberOfChannels * bytesPerSample, true);
  dataView.setUint16(34, bitRate, true);
  dataView.setUint32(36, 1684108385); // That's the integer representation of 'data'.
  dataView.setUint32(40, dataChunkSize, true);
};

function _appendBuffer(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

const ChatInput = () => {

  const fileUrls = useRef([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [blobUrls, setBlobUrls] = useState([]);
  const headerBlob = useRef([]);
  
  
  const testaudio = useRef(null);


  const [isRecording, setIsRecording] = useState(false);

  const hasAudio = useMemo(() => {
    return fileUrls.current;
  })

  const onError = err => {
    console.log('The following error occured: ' + err);
  };

  const onRecording = stream => {
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs="opus"' });
    setMediaRecorder(recorder);

    recorder.onstart = () => {
      console.log('recording started');
      setIsRecording(true);
    };

    recorder.onstop = () => {
      console.log('recording stoped');
      setIsRecording(false);
    };

    recorder.ondataavailable = async e => {
      const isFirstChunk = fileUrls.current.length === 0;

      if (isFirstChunk) {
        const chunk = e.data;
        const chunkBuffer = await chunk.arrayBuffer();
        const chunkHeaderBuffer = chunkBuffer.slice(0, 162);
        headerBlob.current = chunkHeaderBuffer;
        // CHROME MAGIC 177
        // mozzila ~ 130
        // chrome ~ 162

        const blobURL = window.URL.createObjectURL(chunk);

        setBlobUrls([...blobUrls, blobURL]);

        fileUrls.current = [...fileUrls.current, blobURL];
      } else {
        const buffer = await e.data.arrayBuffer();
        const bufferWithHeader = _appendBuffer(headerBlob.current, buffer);

        console.log('header buffer', headerBlob.current);
        console.log('bufferWithHeader', bufferWithHeader);

        const blob = new Blob([bufferWithHeader], { type : 'audio/webm' });
        // {type : 'audio/ogg'} // { 'type' : 'audio/wav' }; { 'type' : 'audio/webm' }
        console.log('blob', blob);
        const blobURL = window.URL.createObjectURL(blob);
        setBlobUrls([...blobUrls, blobURL]);
        fileUrls.current = [...fileUrls.current, blobURL];
      }
    };
  };

  useEffect(() => {
    const hasUserMedia = window.navigator.getUserMedia =
      window.navigator.getUserMedia ||
      window.navigator.mozGetUserMedia ||
      window.navigator.msGetUserMedia ||
      window.navigator.webkitGetUserMedia;

    const constraints = { audio: true };
    navigator.mediaDevices.getUserMedia(constraints).then(onRecording, onError);

  }, []);


  useEffect(() => {
    function getSupportedMimeTypes(media, types, codecs) {
      const isSupported = MediaRecorder.isTypeSupported;
      const supported = [];
      types.forEach((type) => {
        const mimeType = `${media}/${type}`;
        codecs.forEach((codec) => [
            `${mimeType};codecs=${codec}`,
            `${mimeType};codecs=${codec.toUpperCase()}`,
            // /!\ false positive /!\
            // `${mimeType};codecs:${codec}`,
            // `${mimeType};codecs:${codec.toUpperCase()}` 
          ].forEach(variation => {
            if(isSupported(variation))
                supported.push(variation);
        }));
        if (isSupported(mimeType))
          supported.push(mimeType);
      });
      return supported;
    };
    
    // Usage ------------------
    
    const videoTypes = ["webm", "ogg", "mp4", "x-matroska"];
    const audioTypes = ["webm", "ogg", "mp3", "x-matroska"];
    const codecs = ["should-not-be-supported","vp9", "vp9.0", "vp8", "vp8.0", "avc1", "av1", "h265", "h.265", "h264", "h.264", "opus", "pcm", "aac", "mpeg", "mp4a"];
    
    const supportedVideos = getSupportedMimeTypes("video", videoTypes, codecs);
    const supportedAudios = getSupportedMimeTypes("audio", audioTypes, codecs);
    
    console.log('-- Top supported Video : ', supportedVideos[0])
    console.log('-- Top supported Audio : ', supportedAudios[0])
    console.log('-- All supported Videos : ', supportedVideos)
    console.log('-- All supported Audios : ', supportedAudios)
  }, [])

  const startRecording = () => {
    if (mediaRecorder) {
      console.log('start');
      mediaRecorder.start(3000);
    }
  }

  const stopRecording = () => {
    console.log('stop');
    mediaRecorder.stop();
  }

  return (
    <div className="chat-input">
      <h1>Audio recorder</h1>
      <button
        style={{ 
          background: isRecording ? 'red' : 'white',
          color: isRecording ? 'white' : 'black',
        }}
        onClick={startRecording}
      >start</button>   
      
      <button onClick={stopRecording}>stop</button>
      <hr />
      <hr />

      {hasAudio && fileUrls.current.map((item, index) => {
        return (
          <audio key={index} controls src={item} />
        )
      })}


      <br />
      <br />
      <hr />

      {
        testaudio.current && <audio controls src={testaudio.current} />
      }

      
    </div>
  );
};

export default ChatInput;