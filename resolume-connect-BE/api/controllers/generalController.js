const { handleError } = require("../lib/errorHandling");
const constantConfig = require("../../config/constantConfig");
const axios = require("axios");
const fs = require("fs");
const { getApiUrl } = require("../utils/utils");

module.exports.connectCheck = async (req, res) => {
  try {
    const { ip } = req.body;
    const response = await axios.get(`http://${ip}:8080/api/v1/product`);
    if (response.data.name !== "Arena") {
      return res.status(403).json({ message: "Invalid IP" });
    }

    await fs.writeFileSync(
      "./host.json",
      JSON.stringify({
        ip: `http://${ip}:8080/api/v1`,
        imageIp: `http://${ip}:8080`,
      }),
      {
        encoding: "utf8",
      }
    );

    res.status(200).json({ status: "ok", message: "Connected Succesfully" });
  } catch (err) {
    handleError("error", err, "");
    return res.status(constantConfig.FORBIDDEN_CODE).json({
      status: constantConfig.ERROR,
      message: "Invalid IP",
    });
  }
};

module.exports.getClips = async (req, res) => {
  try {
    const clips = [];
    const apiUrl = await getApiUrl();
    const getClips = await axios.get(apiUrl.ip + "/composition");
    for (let layer of getClips.data.layers) {
      for (let clip of layer.clips) {
        if (clip.video == null) continue;
        clips.push({
          id: clip.id,
          name: clip.name.value,
          fileInfo: clip.video.fileinfo,
          thumbnail: {
            id: clip.thumbnail.id,
            path: `${apiUrl.imageIp}${clip.thumbnail.path}`,
          },
        });
      }
    }

    res.status(200).json({ status: "ok", clips });
  } catch (err) {
    handleError("error", err, "");
    return res.status(constantConfig.FORBIDDEN_CODE).json({
      status: constantConfig.ERROR,
      message: constantConfig.INTERNAL_SERVER_ERROR,
    });
  }
};
