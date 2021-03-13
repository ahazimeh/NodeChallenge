const express = require("express");
const axios = require("axios");
const { error } = require("jquery");
const app = express();
var cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var path = require("path");
app.use(express.static(path.join(__dirname, "/public")));
var fs = require("fs");
const { response } = require("express");
// ! extract these to .env file
// const clientId = "6bf7e36ed4914f349a1e3ae6fff609a9";
// const clientSecret = "cd2046defae649069188bbd8e6d9a9e7";
// const appId = "26a9377b4ef0455d960620021392571e";
// const token =
//   "00626a9377b4ef0455d960620021392571eIACIA4nWQyl8zC1ZkboHftqClfaCnhxyERtvCp2Z0K05W4amEDYAAAAAEAAdwi3RbYlEYAEAAQDmiERg";
const clientId = "068681ab14704901bd83f5aa4f031739";
const clientSecret = "bf643f1bb5974168aeac3fd83d7f6bbb";
let appId = "ad935ccafb4145ffb4dcd7bbc8095c38";
let token =
  "006ad935ccafb4145ffb4dcd7bbc8095c38IAAabTN4CP/V/MpF7QtooV/1a4OTvQSd0R3yCItUv+yCu7PZyAsAAAAAEADqgOQ9PNxMYAEAAQBZ3Exg";
let channelName = "test channel";
let myres = "",
  mysid = "";
console.log(`${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`);
app.post("/test", (req, res) => {
  // console.log(req.params);
  console.log(req.body);
  appId = req.body.appid;
  token = req.body.token;
  channelName = req.body.channel;
  console.log("a", appId);
  console.log("a", token);
  console.log("a", channelName);
  res.send("Agora Cloud Recording Server");
});

app.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  fs.readFile("./index.html", null, function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write("File Not Found!");
    } else {
      res.write(data);
    }
    res.end();
  });
  // res.send("hi");
});
app.post("/acquire", async (req, res) => {
  const Authorization = `Basic ${Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64")}`;
  console.log(Authorization);
  let acquire;
  console.log(req.body);
  try {
    acquire = await axios.post(
      `https://api.agora.io/v1/apps/${appId}/cloud_recording/acquire`,
      {
        // cname: req.body.channel,
        // uid: req.body.uid,
        cname: channelName,
        uid: "45687",
        clientRequest: {
          resourceExpiredHour: 24,
        },
      },
      { headers: { Authorization } }
    );
  } catch (e) {
    // console.log(e);
    return res.send(e);
  }
  myres = acquire.data;

  res.send(acquire.data);
});

app.post("/start", async (req, res) => {
  const Authorization = `Basic ${Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64")}`;
  const appID = appId;
  // const resource = req.body.resource;
  const resource = myres.resourceId;

  // const mode = req.body.mode;
  const mode = "mix";
  console.log(req.body);
  console.log(`${resource}`);
  let start;
  try {
    start = await axios.post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
      {
        // cname: req.body.channel,
        // uid: req.body.uid,
        cname: channelName,
        uid: "45687",
        clientRequest: {
          token: token,
          recordingConfig: {
            maxIdleTime: 30,
            streamTypes: 2,
            channelType: 0,
            videoStreamType: 0,
            transcodingConfig: {
              height: 640,
              width: 360,
              bitrate: 500,
              fps: 15,
              mixedVideoLayout: 1,
              backgroundColor: "#FFFFFF",
            },
          },
          subscribeVideoUids: ["2544499789", "3519953550"],
          subscribeAudioUids: ["2544499789", "3519953550"],
          recordingFileConfig: {
            avFileType: ["hls"],
          },
          storageConfig: {
            vendor: 1,
            region: 13,
            bucket: "testbucket11209",
            accessKey: "AKIAW7ERLPPVFKR5R3OC",
            secretKey: "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",
            fileNamePrefix: ["directory1", "directory2"],
          },
        },
      },
      {
        headers: { Authorization },
      }
    );
  } catch (e) {
    return res.send(e);
  }
  mysid = start.data;
  res.send(start.data);
});

app.post("/stop", async (req, res) => {
  const Authorization = `Basic ${Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64")}`;
  const appID = appId;
  console.log(req.body);
  // const resource = req.body.resource;
  const resource = myres.resourceId;
  // const sid = req.body.sid;
  const sid = mysid.sid;

  // const mode = req.body.mode;
  const mode = "mix";
  console.log("sidStop", sid);
  console.log("resource", resource);
  console.log("mode", mode);
  let stop;
  try {
    stop = await axios.post(
      `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
      {
        cname: channelName,
        uid: "45687",
        clientRequest: {},
      },
      { headers: { Authorization } }
    );
  } catch (e) {
    return res.send(e);
  }
  // res.send(stop.data);
  res.send(stop.data);
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Agora Cloud Recording Server listening at Port ${port}`)
);
