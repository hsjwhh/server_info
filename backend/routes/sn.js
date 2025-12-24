const express = require("express");
const router = express.Router();
const snController = require("../controllers/snController")

// 只负责 URL， 不写逻辑
// 搜索 SN （自动补全）
router.get("/",snController.searchSn);

// SN 详情
router.get("/:sn", snController.getSnDetail);

module.exports = router;