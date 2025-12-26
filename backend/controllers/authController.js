const jwt = require('jsonwebtoken');

// 你可以先写死账号密码，后面再接 MySQL
const USER = {
  username: 'admin',
  password: '123456'
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '12h' }
    );

    return res.json({ token });
  }

  res.status(401).json({ message: '账号或密码错误' });
};