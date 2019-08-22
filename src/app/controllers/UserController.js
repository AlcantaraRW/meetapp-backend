import User from '../models/User';

class UserController {
  async store(req, res) {
    const user = await User.create(req.body);

    return res.json(user);
  }

  async update(req, res) {
    const user = await User.findByPk(req.params.id);

    const { id, name, email } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new UserController();
