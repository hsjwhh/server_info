const snService = require("../services/snService");

// 负责参数校验 + 返回格式

exports.searchSn = async (req, res) => {
    const keyword = req.query.keyword || "";

    if (!keyword) return res.json([]);

    try {
        const list = await snService.search(keyword);
        res.json(list);
    } catch (err) {
        console.error("searchSn error:", err);
        res.status(500).json({ error: "server error" });
    }
};

exports.getSnDetail = async (req, res) => {
    const sn = req.params.sn;

    if (!sn) {
        return res.json({
            code: 400,
            message: "SN is required"
        });
    }

    try {
        const data = await snService.getDetail(sn);

        if (!data) {
            return res.json({
                code: 404,
                message: "SN 未找到"
            });
        }

        res.json({
            code: 200,
            message: "查询成功",
            data
        });

    } catch (err) {
        console.error("SN 查询错误：", err);
        res.json({
            code: 500,
            message: "服务器错误",
            error: err.message
        });
    }
};
