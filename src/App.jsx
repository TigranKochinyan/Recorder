import AudioPlayer from './components/AudioPlayer';
import './App.css';


// if (navigator.getUserMedia) {
//   console.log('getUserMedia supported.');

//   var constraints = { audio: true };
//   var chunks = [];

//   const handleStartRecording = () => {
//     mediaRecorder.start();
//     console.log(mediaRecorder.state);
//     console.log("recorder started");
//   };

//   var onSuccess = function(stream) {
//     var mediaRecorder = new MediaRecorder(stream);

//     // visualize(stream);

//     // record.onclick = function() {
//     //   mediaRecorder.start();
//     //   console.log(mediaRecorder.state);
//     //   console.log("recorder started");
//     //   record.style.background = "red";
//     //   record.style.color = "black";
//     // }

//     stop.onclick = function() {
//       mediaRecorder.stop();
//       console.log(mediaRecorder.state);
//       console.log("recorder stopped");
//       record.style.background = "";
//       record.style.color = "";
//       // mediaRecorder.requestData();
//     }

//     mediaRecorder.onstop = function(e) {
//       console.log("data available after MediaRecorder.stop() called.");

//       var clipName = prompt('Enter a name for your sound clip');

//       var clipContainer = document.createElement('article');
//       var clipLabel = document.createElement('p');
//       var audio = document.createElement('audio');
//       var deleteButton = document.createElement('button');

//       clipContainer.classList.add('clip');
//       audio.setAttribute('controls', '');
//       deleteButton.innerHTML = "Delete";
//       // clipLabel.innerHTML = clipName;

//       clipContainer.appendChild(audio);
//       clipContainer.appendChild(clipLabel);
//       clipContainer.appendChild(deleteButton);
//       // soundClips.appendChild(clipContainer);

//       audio.controls = true;
//       var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
//       chunks = [];
//       var audioURL = window.URL.createObjectURL(blob);
//       audio.src = audioURL;
//       console.log("recorder stopped");

//       deleteButton.onclick = function(e) {
//         const evtTgt = e.target;
//         evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
//       }
//     }

//     mediaRecorder.ondataavailable = function(e) {
//       chunks.push(e.data);
//     }
//   }

//   var onError = function(err) {
//     console.log('The following error occured: ' + err);
//   }

//   // @ts-ignore
//   navigator.getUserMedia(constraints, onSuccess, onError);
// } else {
//    console.log('getUserMedia not supported on your browser!');
// }



function App() {


  return (
    <div className="App">
      react

      <AudioPlayer />

      <section className="main-controls">

        <div id="buttons">
          {/* <button onClick={handleStartRecording} className="record">Record</button>
          <button className="stop">Stop</button> */}
        </div>
      </section>

      <section className="sound-clips">


      </section>

    </div>
  );
}

export default App;
