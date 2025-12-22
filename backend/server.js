const express = require("express");
const mysql = require("mysql2");
const config = require("./config");
const cors = require("cors")

const app = express();

app.use(cors());
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
app.get("/api/sn/search", async (req, res) => {
    const keyword = req.query.keyword || "";
    if (!keyword) return res.json([]);

    try {
        const rows = await query(
            "SELECT SN FROM  server_info WHERE SN LIKE ? LIMIT 20",
            [`%${keyword}%`]
        );
        res.json(rows.map(r => r.SN));
    } catch (err) {
        console.error("searchSn error:", err);
        res.status(500).json({ error: "server error" });
    }
});

// ✅ 根据 SN 获取详情
app.get("/api/sn/detail", async (req, res) => {
    const sn = req.query.sn;
    if (!sn) {
        return res.json({ error: "SN required" });
    }

    try {
        const rows = await query(
            "SELECT * FROM server_info WHERE SN = ? LIMIT 1",
            [sn]
        );
        res.json(rows[0] || {});
    } catch (err) {
        console.error("getBySn error:", err);
        res.status(500).json({ error: "server error" });
    }
});

app.get('/api/sn/:sn', async (req, res) => {
    const sn = req.params.sn;

    if (!sn) {
        return res.json({
            code: 400,
            message: "SN is required"
        });
    }

    try {
        const [rows] = await query(
            "SELECT * FROM server_info WHERE SN = ? LIMIT 1",
            [sn]
        );

        if (rows.length === 0) {
            return res.json({
                code: 404,
                message: "SN 未找到"
            });
        }

        res.json({
            code: 200,
            message: "查询成功",
            data: rows[0]
        });

    } catch (err) {
        console.error("SN 查询错误：", err);

        res.json({
            code: 500,
            message: "服务器错误",
            error: err.message
        });
    }
});


app.listen(3000, () => {
    console.log("✅ API running on port 3000");
});
