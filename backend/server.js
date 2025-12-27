const express = require("express");
const cors = require("cors")
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const snRouter = require("./routes/sn");

// 非常干净，只负责启动 + 中间件 + 挂载路由

const app = express();

app.use(cors());
app.use(express.json());

// 登录路由 
app.use('/api/auth', authRoutes);

// 挂载 SN 查询路由（受权限保护）
app.use("/api/sn", authMiddleware, snRouter);

app.listen(3000, () => {
    console.log("✅ API running on port 3000");
});
