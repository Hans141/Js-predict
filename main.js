let model;

//Chay model o tren local
const modelURL = 'http://localhost:5501/model_js_2/model.json';

//Lay cac button/input/div
const preview = document.getElementById("preview");
const predictButton = document.getElementById("predict");
const clearButton = document.getElementById("clear");
const testButton = document.getElementById("test");
const numberOfFiles = document.getElementById("number-of-files");
const fileInput = document.getElementById('file');

//Ham du doan
const predict = async (modelURL) => {
  //Neu chua load duoc model --> thi load
  if (!model) model = await tf.loadGraphModel(modelURL);
  //Chay qua cac file input
  const files = fileInput.files;
  [...files].map(async (img) => {
    let result = getDataRbg()
    console.log('result', result);
    processedImage = tf.tensor3d(result)
    // shape has to be the same as it was for training of the model
    const prediction = model.predict(tf.reshape(processedImage, shape = [-1, 210, 280, 3]));
    const label = prediction.argMax(axis = 1).dataSync()[0];
    renderImageLabel(img, label);
  })
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

const getDataRbg = () => {
  var img = new Image();
  img.crossOrigin = 'anonymous';
  const files = fileInput.files;
  // console.log('files', files);
  img.src = URL.createObjectURL(files[0])
  // img.src = "../../static/UPLOAD/test.png"
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
      input[i][j].push(data[(i * 280 + j) * 4 + 2])
      input[i][j].push(data[(i * 280 + j) * 4 + 1])
      input[i][j].push(data[(i * 280 + j) * 4])
    }
  }
  return input
}
fileInput.addEventListener("change", () => numberOfFiles.innerHTML = "Selected " + fileInput.files.length + " files", false);
predictButton.addEventListener("click", () => predict(modelURL));
clearButton.addEventListener("click", () => preview.innerHTML = "");
