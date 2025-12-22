const express = require("express");
const mysql = require("mysql2");
const config = require("./config");
const app = express();

app.use(express.json());

// ✅ 使用 config.js 创建连接池
const pool = mysql.createPool({
    ...config.db,
    waitForConnections: true,
    queueLimit: 0
});

// ✅ 封装 query
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// ✅ 搜索 SN
app.get("/api/searchSn", async (req, res) => {
    const keyword = req.query.keyword || "";
    if (!keyword) return res.json([]);

    try {
        const rows = await query(
            "SELECT SN FROM  MachineInfo WHERE SN LIKE ? LIMIT 20",
            [`%${keyword}%`]
        );
        res.json(rows.map(r => r.SN));
    } catch (err) {
        console.error("searchSn error:", err);
        res.status(500).json({ error: "server error" });
    }
});

// ✅ 根据 SN 获取详情
app.get("/api/getBySn", async (req, res) => {
    const sn = req.query.sn;
    if (!sn) return res.json({});

    try {
        const rows = await query(
            "SELECT * FROM MachineInfo WHERE SN = ? LIMIT 1",
            [sn]
        );
        res.json(rows[0] || {});
    } catch (err) {
        console.error("getBySn error:", err);
        res.status(500).json({ error: "server error" });
    }
});

app.listen(3000, () => {
    console.log("✅ API running on port 3000");
});
