const express = require("express");
const cors = require("cors")
const snRouter = require("./routes/sn");

// 非常干净，只负责启动 + 中间件 + 挂在路由

const app = express();

app.use(cors());
app.use(express.json());

// 挂载 SN 路由
app.use("/api/sn", snRouter);

app.listen(3000, () => {
    console.log("✅ API running on port 3000");
});
