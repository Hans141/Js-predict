let model;

//Chay model o tren local
const modelURL = 'model_js_4/model.json';
// console.log(tf.setBackend(""))
//Lay cac button/input/div
const preview = document.getElementById("preview");
// const predictButton = document.getElementById("predict");
// const clearButton = document.getElementById("clear");
const snapButton = document.getElementById("snap");
const numberOfFiles = document.getElementById("number-of-files");
const fileInput = document.getElementById('file');
const message = document.getElementById('message');
const timeMessage = document.getElementById('timeMessage');
const loadingMessage = document.getElementsByClassName("loading")[0]
let cameraOptions = []
const timer = ms => new Promise(res => setTimeout(res, ms))

//Ham du doan
const predict = async () => {

  //Chay qua cac file input
  const files = fileInput.files;
  let result = await getDataRbg()
  processedImage = await tf.tensor3d(result)
  const prediction = model.predict(tf.reshape(processedImage, shape = [-1, 210, 280, 3]));
  const label = prediction.argMax(axis = 1).dataSync()[0];
  renderImageLabel(files[0], label);
};

const renderImageLabel = (img, label) => {
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML += `<div class="image-block">
                                      <img src="${reader.result}" class="image-block_loaded" id="source"/>
                                       <h2 class="image-block__label">${label}</h2>
                              </div>`;

  };
  reader.readAsDataURL(img);
};

const getDataRbg = async () => {
  var img = new Image();
  img.crossOrigin = 'anonymous';
  const files = fileInput.files;
  img.src = await URL.createObjectURL(files[0])
  var canvas2 = document.getElementById('canvas2');
  var ctx2 = canvas2.getContext('2d');
  img.onload = function () {
    ctx2.drawImage(img, 0, 0, 280, 210);
    img.style.display = 'none';
  };
  let pixel = ctx2.getImageData(0, 0, 280, 210);
  let data = pixel.data
  return arrayToRgbArray(data)
}
let arrayToRgbArray = (data) => {
  let input = []
  for (let i = 0; i < 210; i++) {
    input.push([])
    for (let j = 0; j < 280; j++) {
      input[i].push([])
      input[i][j].push(data[(i * 280 + j) * 4])
      input[i][j].push(data[(i * 280 + j) * 4 + 1])
      input[i][j].push(data[(i * 280 + j) * 4 + 2])
    }
  }
  return input
}
const initModel = async () => {
  console.log("run");
  if (!model) model = await tf.loadGraphModel(modelURL);
  console.log('model', model);
}
const handleConnectCamera = async () => {
  let devices = await navigator.mediaDevices.enumerateDevices()
  let videoDevices = devices.filter(
    device => device.kind == "videoinput"
  );
  if (videoDevices.length == 0) {
    console.log("no device")
  }
  else {
    console.log('videoDevices', videoDevices)
    videoDevices.map(device => {
      cameraOptions.push({
        label: device.label,
        value: device.deviceId,
      });
    });
  }
}
const setupCamera = async () => {
  let video1 = document.getElementById("videoElement1");
  navigator.permissions
    .query({ name: "camera" })
    .then(permissionObj => {
      if (permissionObj.state == "denied") {
        console.log("no permissions")
      }
    })
    .catch(error => {
      console.log("Got error :", error);
    });
  if (video1) {
    console.log('cameraOptions', cameraOptions)
    let deviceId = cameraOptions[0].value;
    if (cameraOptions[0].label == "Snap Camera") {
      deviceId = cameraOptions[1].value ? cameraOptions.length > 1 : ""
    }
    const stream1 = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: deviceId },
    });
    video1.srcObject = stream1;
  }
}
const snapshot = async () => {
  let video = document.getElementById("videoElement1");
  let canvas = document.getElementById("canvas1");
  let context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, 280, 210);
  let pixel = context.getImageData(0, 0, 280, 210);
  let data = pixel.data
  let result = arrayToRgbArray(data)
  const before = Date.now();
  console.log('result', result)
  processedImage = await tf.tensor3d(result)
  const prediction = await model.predict(tf.reshape(processedImage, shape = [-1, 210, 280, 3]));
  const after = Date.now();
  console.log(`${after - before}ms`);
  timeMessage.innerHTML = `Model processing time ${after - before}ms`
  const label = prediction.argMax(axis = 1).dataSync()[0];
  message.innerHTML = `${label}: ${messageModel[label]} `
  console.log('label', label)


}
const runModelFisrt = async () => {
  console.log('first', first)
  const prediction = await model.predict(tf.reshape(first, shape = [-1, 210, 280, 3]));
  console.log('prediction', prediction)
}
const main = async () => {
  initModel().then(() => {
    loadingMessage.classList.add("d-none")

    runModelFisrt().then(() => {
      snapButton.classList.remove("d-none")
    })

  })
  await handleConnectCamera()
  setupCamera()
}

tf.setBackend("webgl").then(async () => {
  main()
})
// fileInput.addEventListener("change", () => numberOfFiles.innerHTML = "Selected " + fileInput.files.length + " files", false);
// predictButton.addEventListener("click", () => predict(modelURL));
snapButton.addEventListener("click", () => snapshot());
// clearButton.addEventListener("click", () => preview.innerHTML = "");
